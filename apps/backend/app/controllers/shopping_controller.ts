import type { HttpContext } from '@adonisjs/core/http'
import ShoppingItem from '#models/shopping_item'
import FamilyMember from '#models/family_member'
import vine, { errors } from '@vinejs/vine'
import { DateTime } from 'luxon'

const createItemSchema = vine.object({
  familyId: vine.number(),
  name: vine.string().minLength(1).maxLength(200),
  quantity: vine.number().min(1).optional(),
  unit: vine.string().maxLength(50).optional(),
  priority: vine.enum(['low', 'medium', 'high']).optional(),
  notes: vine.string().maxLength(500).optional(),
})

const updateItemSchema = vine.object({
  name: vine.string().minLength(1).maxLength(200).optional(),
  quantity: vine.number().min(1).optional(),
  unit: vine.string().maxLength(50).optional(),
  priority: vine.enum(['low', 'medium', 'high']).optional(),
  notes: vine.string().maxLength(500).optional(),
  isPurchased: vine.boolean().optional(),
})

export default class ShoppingController {
  /**
   * Get shopping list for a family
   * GET /api/v1/shopping?familyId=X
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

    const items = await ShoppingItem.query()
      .where('familyId', familyId)
      .orderBy('isPurchased', 'asc')
      .orderByRaw("CASE WHEN priority = 'high' THEN 1 WHEN priority = 'medium' THEN 2 ELSE 3 END")
      .orderBy('createdAt', 'desc')

    return response.ok({
      items: items.map(item => item.serialize()),
    })
  }

  /**
   * Add item to shopping list
   * POST /api/v1/shopping
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    
    let data: {
      familyId: number
      name: string
      quantity?: number
      unit?: string
      priority?: 'low' | 'medium' | 'high'
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

    const item = await ShoppingItem.create({
      familyId: data.familyId,
      customName: data.name,
      quantity: data.quantity || 1,
      unit: data.unit,
      priority: data.priority || 'medium',
      notes: data.notes,
      addedByUserId: user.id,
      isPurchased: false,
    })

    return response.created({
      message: 'Article ajouté à la liste',
      item: item.serialize(),
    })
  }

  /**
   * Update shopping item
   * PUT /api/v1/shopping/:id
   */
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const itemId = params.id
    
    const item = await ShoppingItem.find(itemId)
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
      priority?: 'low' | 'medium' | 'high'
      notes?: string
      isPurchased?: boolean
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
    if (data.priority !== undefined) item.priority = data.priority
    if (data.notes !== undefined) item.notes = data.notes
    if (data.isPurchased !== undefined) {
      item.isPurchased = data.isPurchased
      if (data.isPurchased) {
        item.purchasedByUserId = user.id
        item.purchasedAt = DateTime.now()
      } else {
        item.purchasedByUserId = null
        item.purchasedAt = null
      }
    }

    await item.save()

    return response.ok({
      message: 'Article mis à jour',
      item: item.serialize(),
    })
  }

  /**
   * Delete shopping item
   * DELETE /api/v1/shopping/:id
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const itemId = params.id
    
    const item = await ShoppingItem.find(itemId)
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
   * Toggle purchased status
   * POST /api/v1/shopping/:id/toggle
   */
  async toggle({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const itemId = params.id
    
    const item = await ShoppingItem.find(itemId)
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

    item.isPurchased = !item.isPurchased
    if (item.isPurchased) {
      item.purchasedByUserId = user.id
      item.purchasedAt = DateTime.now()
    } else {
      item.purchasedByUserId = null
      item.purchasedAt = null
    }

    await item.save()

    return response.ok({
      message: item.isPurchased ? 'Article acheté' : 'Article non acheté',
      item: item.serialize(),
    })
  }

  /**
   * Clear purchased items
   * DELETE /api/v1/shopping/clear-purchased?familyId=X
   */
  async clearPurchased({ auth, request, response }: HttpContext) {
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

    await ShoppingItem.query()
      .where('familyId', familyId)
      .where('isPurchased', true)
      .delete()

    return response.ok({
      message: 'Articles achetés supprimés',
    })
  }
}
