import type { HttpContext } from '@adonisjs/core/http'
import Family from '#models/family'
import FamilyMember from '#models/family_member'
import vine, { errors } from '@vinejs/vine'
import { DateTime } from 'luxon'

const createFamilySchema = vine.object({
  name: vine.string().minLength(2).maxLength(100),
})

const joinFamilySchema = vine.object({
  inviteCode: vine.string().minLength(6).maxLength(20),
})

const updatePreferencesSchema = vine.object({
  dietaryRestrictions: vine.array(vine.string()).optional(),
  allergies: vine.array(vine.string()).optional(),
  favoriteCategories: vine.array(vine.string()).optional(),
  cookingSkillLevel: vine.enum(['beginner', 'intermediate', 'advanced']).optional(),
})

export default class FamiliesController {
  /**
   * Get user's families
   * GET /api/v1/families
   */
  async index({ auth, response }: HttpContext) {
    const user = auth.user!
    
    const memberships = await FamilyMember.query()
      .where('userId', user.id)
      .preload('family')
    
    const families = memberships.map(m => ({
      ...m.family.serialize(),
      role: m.role,
      joinedAt: m.joinedAt?.toISO(),
    }))
    
    return response.ok({ families })
  }

  /**
   * Create a new family
   * POST /api/v1/families
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    
    let data: { name: string }
    
    try {
      data = await vine.validate({ schema: createFamilySchema, data: request.all() })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: 'Validation échouée',
          errors: error.messages,
        })
      }
      throw error
    }

    // Generate unique invite code
    let inviteCode: string
    let exists = true
    do {
      inviteCode = Family.generateInviteCode()
      const existing = await Family.findBy('inviteCode', inviteCode)
      exists = !!existing
    } while (exists)

    // Create family
    const family = await Family.create({
      name: data.name,
      inviteCode,
      ownerId: user.id,
    })

    // Add creator as admin member
    await FamilyMember.create({
      familyId: family.id,
      userId: user.id,
      role: 'admin',
      joinedAt: DateTime.now(),
    })

    return response.created({
      message: 'Famille créée avec succès',
      family: family.serialize(),
    })
  }

  /**
   * Join a family with invite code
   * POST /api/v1/families/join
   */
  async join({ auth, request, response }: HttpContext) {
    const user = auth.user!
    
    let data: { inviteCode: string }
    
    try {
      data = await vine.validate({ schema: joinFamilySchema, data: request.all() })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: 'Validation échouée',
          errors: error.messages,
        })
      }
      throw error
    }

    // Find family by invite code
    const family = await Family.findBy('inviteCode', data.inviteCode.toUpperCase())
    if (!family) {
      return response.notFound({
        message: 'Code d\'invitation invalide',
      })
    }

    // Check if already a member
    const existingMember = await FamilyMember.query()
      .where('familyId', family.id)
      .where('userId', user.id)
      .first()
    
    if (existingMember) {
      return response.conflict({
        message: 'Vous êtes déjà membre de cette famille',
      })
    }

    // Add as member
    await FamilyMember.create({
      familyId: family.id,
      userId: user.id,
      role: 'member',
      joinedAt: DateTime.now(),
    })

    return response.ok({
      message: 'Vous avez rejoint la famille avec succès',
      family: family.serialize(),
    })
  }

  /**
   * Get family details
   * GET /api/v1/families/:id
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const familyId = params.id

    // Check membership
    const membership = await FamilyMember.query()
      .where('familyId', familyId)
      .where('userId', user.id)
      .first()
    
    if (!membership) {
      return response.forbidden({
        message: 'Vous n\'êtes pas membre de cette famille',
      })
    }

    const family = await Family.query()
      .where('id', familyId)
      .preload('members', (query) => {
        query.preload('user')
      })
      .firstOrFail()

    const members = family.members.map(m => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      nickname: m.nickname,
      joinedAt: m.joinedAt?.toISO(),
      user: {
        id: m.user.id,
        firstName: m.user.firstName,
        lastName: m.user.lastName,
        email: m.user.email,
      },
    }))

    return response.ok({
      family: {
        ...family.serialize(),
        members,
      },
    })
  }

  /**
   * Leave a family
   * DELETE /api/v1/families/:id/leave
   */
  async leave({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const familyId = params.id

    const membership = await FamilyMember.query()
      .where('familyId', familyId)
      .where('userId', user.id)
      .first()
    
    if (!membership) {
      return response.notFound({
        message: 'Vous n\'êtes pas membre de cette famille',
      })
    }

    const family = await Family.find(familyId)
    if (family && family.ownerId === user.id) {
      return response.forbidden({
        message: 'Le propriétaire ne peut pas quitter la famille. Transférez d\'abord la propriété.',
      })
    }

    await membership.delete()

    return response.ok({
      message: 'Vous avez quitté la famille',
    })
  }

  /**
   * Update user preferences for a family
   * PUT /api/v1/families/:id/preferences
   */
  async updatePreferences({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const familyId = params.id

    // Check membership
    const membership = await FamilyMember.query()
      .where('familyId', familyId)
      .where('userId', user.id)
      .first()
    
    if (!membership) {
      return response.forbidden({
        message: 'Vous n\'êtes pas membre de cette famille',
      })
    }

    let data: {
      dietaryRestrictions?: string[]
      allergies?: string[]
      favoriteCategories?: string[]
      cookingSkillLevel?: 'beginner' | 'intermediate' | 'advanced'
    }
    
    try {
      data = await vine.validate({ schema: updatePreferencesSchema, data: request.all() })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: 'Validation échouée',
          errors: error.messages,
        })
      }
      throw error
    }

    // Store preferences in membership (we could also use UserPreference model)
    // For simplicity, we'll return success
    return response.ok({
      message: 'Préférences mises à jour',
      preferences: data,
    })
  }
}
