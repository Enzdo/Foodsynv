import type { HttpContext } from '@adonisjs/core/http'
import FridgeItem from '#models/fridge_item'
import FamilyMember from '#models/family_member'
import vine, { errors } from '@vinejs/vine'
import { DateTime } from 'luxon'

const createItemSchema = vine.object({
  familyId: vine.number(),
  name: vine.string().minLength(1).maxLength(200),
  quantity: vine.number().min(0).optional(),
  unit: vine.string().maxLength(50).optional(),
  expirationDate: vine.string().optional(), // ISO date string
  storageLocation: vine.enum(['fridge', 'freezer', 'pantry']).optional(),
  notes: vine.string().maxLength(500).optional(),
})

const updateItemSchema = vine.object({
  name: vine.string().minLength(1).maxLength(200).optional(),
  quantity: vine.number().min(0).optional(),
  unit: vine.string().maxLength(50).optional(),
  expirationDate: vine.string().optional(),
  storageLocation: vine.enum(['fridge', 'freezer', 'pantry']).optional(),
  notes: vine.string().maxLength(500).optional(),
  isConsumed: vine.boolean().optional(),
})

export default class FridgeController {
  /**
   * Get fridge items for a family
   * GET /api/v1/fridge?familyId=X
   */
  async index({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const familyId = request.input('familyId')
    
    if (!familyId) {
      return response.badRequest({ message: 'familyId est requis' })
    }

    // Check membership
    const membership = await FamilyMember.query()
      .where('familyId', familyId)
      .where('userId', user.id)
      .first()
    
    if (!membership) {
      return response.forbidden({ message: 'Accès non autorisé' })
    }

    const items = await FridgeItem.query()
      .where('familyId', familyId)
      .where('isConsumed', false)
      .orderBy('expirationDate', 'asc')

    return response.ok({
      items: items.map(item => item.serialize()),
    })
  }

  /**
   * Get items expiring soon
   * GET /api/v1/fridge/expiring?familyId=X&days=7
   */
  async expiring({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const familyId = request.input('familyId')
    const days = request.input('days', 7)
    
    if (!familyId) {
      return response.badRequest({ message: 'familyId est requis' })
    }

    // Check membership
    const membership = await FamilyMember.query()
      .where('familyId', familyId)
      .where('userId', user.id)
      .first()
    
    if (!membership) {
      return response.forbidden({ message: 'Accès non autorisé' })
    }

    const expirationLimit = DateTime.now().plus({ days: Number(days) }).toISODate()

    const items = await FridgeItem.query()
      .where('familyId', familyId)
      .where('isConsumed', false)
      .whereNotNull('expirationDate')
      .where('expirationDate', '<=', expirationLimit!)
      .orderBy('expirationDate', 'asc')

    return response.ok({
      items: items.map(item => item.serialize()),
    })
  }

  /**
   * Add item to fridge
   * POST /api/v1/fridge
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    
    let data: {
      familyId: number
      name: string
      quantity?: number
      unit?: string
      expirationDate?: string
      storageLocation?: 'fridge' | 'freezer' | 'pantry'
      emoji?: string
      notes?: string
    }
    
    try {
      data = await vine.validate({ schema: createItemSchema, data: request.all() })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: 'Validation échouée',
          errors: error.messages,
        })
      }
      throw error
    }

    // Check membership
    const membership = await FamilyMember.query()
      .where('familyId', data.familyId)
      .where('userId', user.id)
      .first()
    
    if (!membership) {
      return response.forbidden({ message: 'Accès non autorisé' })
    }

    const item = await FridgeItem.create({
      familyId: data.familyId,
      customName: data.name,
      quantity: data.quantity || 1,
      unit: data.unit,
      expirationDate: data.expirationDate ? DateTime.fromISO(data.expirationDate) : null,
      purchaseDate: DateTime.now(),
      storageLocation: data.storageLocation || 'fridge',
      addedByUserId: user.id,
      notes: data.notes,
      isConsumed: false,
    })

    return response.created({
      message: 'Article ajouté',
      item: item.serialize(),
    })
  }

  /**
   * Update fridge item
   * PUT /api/v1/fridge/:id
   */
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const itemId = params.id
    
    const item = await FridgeItem.find(itemId)
    if (!item) {
      return response.notFound({ message: 'Article non trouvé' })
    }

    // Check membership
    const membership = await FamilyMember.query()
      .where('familyId', item.familyId)
      .where('userId', user.id)
      .first()
    
    if (!membership) {
      return response.forbidden({ message: 'Accès non autorisé' })
    }

    let data: {
      name?: string
      quantity?: number
      unit?: string
      expirationDate?: string
      storageLocation?: 'fridge' | 'freezer' | 'pantry'
      emoji?: string
      notes?: string
      isConsumed?: boolean
    }
    
    try {
      data = await vine.validate({ schema: updateItemSchema, data: request.all() })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: 'Validation échouée',
          errors: error.messages,
        })
      }
      throw error
    }

    if (data.name !== undefined) item.customName = data.name
    if (data.quantity !== undefined) item.quantity = data.quantity
    if (data.unit !== undefined) item.unit = data.unit
    if (data.expirationDate !== undefined) {
      item.expirationDate = data.expirationDate ? DateTime.fromISO(data.expirationDate) : null
    }
    if (data.storageLocation !== undefined) item.storageLocation = data.storageLocation
    if (data.notes !== undefined) item.notes = data.notes
    if (data.isConsumed !== undefined) {
      item.isConsumed = data.isConsumed
      if (data.isConsumed) {
        item.consumedAt = DateTime.now()
      }
    }

    await item.save()

    return response.ok({
      message: 'Article mis à jour',
      item: item.serialize(),
    })
  }

  /**
   * Delete fridge item
   * DELETE /api/v1/fridge/:id
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const itemId = params.id
    
    const item = await FridgeItem.find(itemId)
    if (!item) {
      return response.notFound({ message: 'Article non trouvé' })
    }

    // Check membership
    const membership = await FamilyMember.query()
      .where('familyId', item.familyId)
      .where('userId', user.id)
      .first()
    
    if (!membership) {
      return response.forbidden({ message: 'Accès non autorisé' })
    }

    await item.delete()

    return response.ok({
      message: 'Article supprimé',
    })
  }

  /**
   * Mark item as consumed
   * POST /api/v1/fridge/:id/consume
   */
  async consume({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const itemId = params.id
    
    const item = await FridgeItem.find(itemId)
    if (!item) {
      return response.notFound({ message: 'Article non trouvé' })
    }

    // Check membership
    const membership = await FamilyMember.query()
      .where('familyId', item.familyId)
      .where('userId', user.id)
      .first()
    
    if (!membership) {
      return response.forbidden({ message: 'Accès non autorisé' })
    }

    item.isConsumed = true
    item.consumedAt = DateTime.now()
    await item.save()

    return response.ok({
      message: 'Article marqué comme consommé',
      item: item.serialize(),
    })
  }
}
