import type { HttpContext } from '@adonisjs/core/http'
import NutritionService from '#services/nutrition_service'
import FridgeItem from '#models/fridge_item'
import FamilyMember from '#models/family_member'
import vine, { errors } from '@vinejs/vine'

const updateProfileSchema = vine.object({
  weight: vine.number().min(20).max(300),
  height: vine.number().min(100).max(250),
  age: vine.number().min(10).max(120),
  gender: vine.enum(['male', 'female', 'other']),
  activityLevel: vine.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal: vine.enum(['lose_weight', 'maintain', 'gain_muscle']),
})

const analyzeSchema = vine.object({
  familyId: vine.number(),
})

export default class NutritionController {
  private nutritionService: NutritionService

  constructor() {
    this.nutritionService = new NutritionService()
  }

  /**
   * Update user's biometric profile
   * PUT /api/v1/nutrition/profile
   */
  async updateProfile({ auth, request, response }: HttpContext) {
    const user = auth.user!

    let data: {
      weight: number
      height: number
      age: number
      gender: 'male' | 'female' | 'other'
      activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
      goal: 'lose_weight' | 'maintain' | 'gain_muscle'
    }

    try {
      data = await vine.validate({ schema: updateProfileSchema, data: request.all() })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: 'Validation échouée',
          errors: error.messages,
        })
      }
      throw error
    }

    user.weight = data.weight
    user.height = data.height
    user.age = data.age
    user.gender = data.gender
    user.activityLevel = data.activityLevel
    user.goal = data.goal

    await user.save()

    return response.ok({
      message: 'Profil nutritionnel mis à jour',
      user: user.serialize(),
    })
  }

  /**
   * Get user's nutrition profile
   * GET /api/v1/nutrition/profile
   */
  async getProfile({ auth, response }: HttpContext) {
    const user = auth.user!

    const hasProfile = user.weight && user.height && user.age && user.gender && user.activityLevel && user.goal

    return response.ok({
      hasProfile: !!hasProfile,
      profile: hasProfile ? {
        weight: user.weight,
        height: user.height,
        age: user.age,
        gender: user.gender,
        activityLevel: user.activityLevel,
        goal: user.goal,
      } : null,
    })
  }

  /**
   * Analyze nutrition needs and get meal suggestions
   * POST /api/v1/nutrition/analyze
   */
  async analyze({ auth, request, response }: HttpContext) {
    const user = auth.user!

    let data: { familyId: number }
    try {
      data = await vine.validate({ schema: analyzeSchema, data: request.all() })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: 'Validation échouée',
          errors: error.messages,
        })
      }
      throw error
    }

    // Check if user has a complete profile
    if (!user.weight || !user.height || !user.age || !user.gender || !user.activityLevel || !user.goal) {
      return response.badRequest({
        message: 'Veuillez compléter votre profil nutritionnel avant de demander une analyse',
        code: 'INCOMPLETE_PROFILE',
      })
    }

    // Check family membership
    const membership = await FamilyMember.query()
      .where('familyId', data.familyId)
      .where('userId', user.id)
      .first()

    if (!membership) {
      return response.forbidden({ message: 'Accès non autorisé à cette famille' })
    }

    // Get fridge items
    const fridgeItems = await FridgeItem.query()
      .where('familyId', data.familyId)
      .where('isConsumed', false)
      .orderBy('expirationDate', 'asc')

    const ingredients = fridgeItems.map(item => ({
      name: item.customName || 'Inconnu',
      quantity: item.quantity,
      unit: item.unit,
      expirationDate: item.expirationDate?.toISODate() || null,
    }))

    try {
      const analysis = await this.nutritionService.analyzeAndSuggest(
        {
          weight: user.weight,
          height: user.height,
          age: user.age,
          gender: user.gender,
          activityLevel: user.activityLevel,
          goal: user.goal,
        },
        ingredients
      )

      return response.ok({
        message: 'Analyse nutritionnelle générée',
        analysis,
        fridgeItemCount: fridgeItems.length,
      })
    } catch (error: any) {
      console.error('Nutrition analysis error:', error)
      return response.internalServerError({
        message: error.message || 'Erreur lors de l\'analyse nutritionnelle',
      })
    }
  }
}
