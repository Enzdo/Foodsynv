import type { HttpContext } from '@adonisjs/core/http'
import FridgeItem from '#models/fridge_item'
import FamilyMember from '#models/family_member'
import Recipe from '#models/recipe'
import vine, { errors } from '@vinejs/vine'

const createRecipeSchema = vine.object({
  familyId: vine.number(),
  title: vine.string().minLength(1).maxLength(200),
  description: vine.string().maxLength(1000).optional(),
  prepTimeMinutes: vine.number().min(0).optional(),
  cookTimeMinutes: vine.number().min(0).optional(),
  servings: vine.number().min(1).optional(),
  difficulty: vine.enum(['easy', 'medium', 'hard']).optional(),
  ingredients: vine.array(vine.object({
    name: vine.string().minLength(1),
    quantity: vine.string(),
    unit: vine.string().optional(),
  })),
  instructions: vine.array(vine.string().minLength(1)),
  tags: vine.array(vine.string()).optional(),
})

const updateRecipeSchema = vine.object({
  title: vine.string().minLength(1).maxLength(200).optional(),
  description: vine.string().maxLength(1000).optional(),
  prepTimeMinutes: vine.number().min(0).optional(),
  cookTimeMinutes: vine.number().min(0).optional(),
  servings: vine.number().min(1).optional(),
  difficulty: vine.enum(['easy', 'medium', 'hard']).optional(),
  ingredients: vine.array(vine.object({
    name: vine.string().minLength(1),
    quantity: vine.string(),
    unit: vine.string().optional(),
  })).optional(),
  instructions: vine.array(vine.string().minLength(1)).optional(),
  tags: vine.array(vine.string()).optional(),
})

// Simple recipe database for suggestions
const RECIPES = [
  {
    id: 1,
    name: 'Omelette au fromage',
    emoji: '🍳',
    ingredients: ['oeufs', 'fromage', 'beurre'],
    time: 10,
    difficulty: 'easy',
    servings: 2,
    instructions: [
      'Battre les oeufs dans un bol',
      'Faire fondre le beurre dans une poêle',
      'Verser les oeufs et ajouter le fromage râpé',
      'Plier l\'omelette et servir',
    ],
  },
  {
    id: 2,
    name: 'Pâtes au fromage',
    emoji: '🍝',
    ingredients: ['pâtes', 'fromage', 'beurre', 'lait'],
    time: 20,
    difficulty: 'easy',
    servings: 4,
    instructions: [
      'Cuire les pâtes selon les instructions',
      'Faire fondre le beurre avec le lait',
      'Ajouter le fromage râpé',
      'Mélanger avec les pâtes',
    ],
  },
  {
    id: 3,
    name: 'Salade composée',
    emoji: '🥗',
    ingredients: ['salade', 'tomates', 'concombre', 'oeufs'],
    time: 15,
    difficulty: 'easy',
    servings: 2,
    instructions: [
      'Laver et couper les légumes',
      'Cuire les oeufs durs',
      'Assembler la salade',
      'Assaisonner selon vos goûts',
    ],
  },
  {
    id: 4,
    name: 'Croque-monsieur',
    emoji: '🥪',
    ingredients: ['pain', 'jambon', 'fromage', 'beurre'],
    time: 15,
    difficulty: 'easy',
    servings: 2,
    instructions: [
      'Beurrer les tranches de pain',
      'Ajouter le jambon et le fromage',
      'Faire griller au four ou à la poêle',
    ],
  },
  {
    id: 5,
    name: 'Soupe de légumes',
    emoji: '🍲',
    ingredients: ['carottes', 'pommes de terre', 'poireaux', 'oignon'],
    time: 45,
    difficulty: 'medium',
    servings: 6,
    instructions: [
      'Éplucher et couper les légumes',
      'Faire revenir l\'oignon',
      'Ajouter les légumes et couvrir d\'eau',
      'Cuire 30 minutes et mixer',
    ],
  },
  {
    id: 6,
    name: 'Poulet rôti',
    emoji: '🍗',
    ingredients: ['poulet', 'pommes de terre', 'herbes', 'ail'],
    time: 90,
    difficulty: 'medium',
    servings: 4,
    instructions: [
      'Préchauffer le four à 200°C',
      'Assaisonner le poulet avec les herbes et l\'ail',
      'Disposer les pommes de terre autour',
      'Cuire 1h30 en arrosant régulièrement',
    ],
  },
  {
    id: 7,
    name: 'Smoothie aux fruits',
    emoji: '🥤',
    ingredients: ['banane', 'fraises', 'lait', 'yaourt'],
    time: 5,
    difficulty: 'easy',
    servings: 2,
    instructions: [
      'Mettre tous les ingrédients dans un blender',
      'Mixer jusqu\'à obtenir une texture lisse',
      'Servir frais',
    ],
  },
  {
    id: 8,
    name: 'Quiche lorraine',
    emoji: '🥧',
    ingredients: ['pâte brisée', 'lardons', 'oeufs', 'crème', 'fromage'],
    time: 50,
    difficulty: 'medium',
    servings: 6,
    instructions: [
      'Préchauffer le four à 180°C',
      'Étaler la pâte dans un moule',
      'Faire revenir les lardons',
      'Mélanger oeufs, crème et fromage',
      'Verser sur la pâte et cuire 35 minutes',
    ],
  },
]

export default class RecipesController {
  /**
   * Get recipe suggestions based on fridge contents
   * GET /api/v1/recipes/suggestions?familyId=X
   */
  async suggestions({ auth, request, response }: HttpContext) {
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

    // Get fridge items
    const fridgeItems = await FridgeItem.query()
      .where('familyId', familyId)
      .where('isConsumed', false)

    const fridgeIngredients = fridgeItems
      .map(item => item.customName?.toLowerCase() || '')
      .filter(name => name.length > 0)

    // Score recipes based on matching ingredients
    const scoredRecipes = RECIPES.map(recipe => {
      const matchingIngredients = recipe.ingredients.filter(ingredient =>
        fridgeIngredients.some(fridgeItem =>
          fridgeItem.includes(ingredient.toLowerCase()) ||
          ingredient.toLowerCase().includes(fridgeItem)
        )
      )
      
      return {
        ...recipe,
        matchingIngredients,
        matchCount: matchingIngredients.length,
        matchPercentage: Math.round((matchingIngredients.length / recipe.ingredients.length) * 100),
        missingIngredients: recipe.ingredients.filter(i => !matchingIngredients.includes(i)),
      }
    })

    // Sort by match percentage, then by match count
    const suggestions = scoredRecipes
      .filter(r => r.matchCount > 0)
      .sort((a, b) => {
        if (b.matchPercentage !== a.matchPercentage) {
          return b.matchPercentage - a.matchPercentage
        }
        return b.matchCount - a.matchCount
      })
      .slice(0, 10)

    return response.ok({
      suggestions,
      fridgeItemCount: fridgeItems.length,
    })
  }

  /**
   * Get all recipes
   * GET /api/v1/recipes
   */
  async index({ response }: HttpContext) {
    return response.ok({
      recipes: RECIPES,
    })
  }

  /**
   * Get recipe by ID (from static list)
   * GET /api/v1/recipes/:id
   */
  async show({ params, response }: HttpContext) {
    const recipe = RECIPES.find(r => r.id === Number(params.id))
    
    if (!recipe) {
      return response.notFound({ message: 'Recette non trouvée' })
    }

    return response.ok({ recipe })
  }

  /**
   * Get family recipes
   * GET /api/v1/recipes/family?familyId=X
   */
  async familyRecipes({ auth, request, response }: HttpContext) {
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

    const recipes = await Recipe.query()
      .where('familyId', familyId)
      .orderBy('createdAt', 'desc')

    return response.ok({
      recipes: recipes.map(r => r.serialize()),
    })
  }

  /**
   * Create a family recipe
   * POST /api/v1/recipes/family
   */
  async createFamilyRecipe({ auth, request, response }: HttpContext) {
    const user = auth.user!

    let data: any
    try {
      data = await vine.validate({ schema: createRecipeSchema, data: request.all() })
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

    const recipe = await Recipe.create({
      familyId: data.familyId,
      title: data.title,
      description: data.description,
      prepTimeMinutes: data.prepTimeMinutes,
      cookTimeMinutes: data.cookTimeMinutes,
      servings: data.servings || 4,
      difficulty: data.difficulty || 'medium',
      ingredients: data.ingredients,
      instructions: data.instructions,
      tags: data.tags || [],
      createdByUserId: user.id,
      isAiGenerated: false,
    })

    return response.created({
      message: 'Recette créée',
      recipe: recipe.serialize(),
    })
  }

  /**
   * Update a family recipe
   * PUT /api/v1/recipes/family/:id
   */
  async updateFamilyRecipe({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const recipeId = params.id

    const recipe = await Recipe.find(recipeId)
    if (!recipe) {
      return response.notFound({ message: 'Recette non trouvée' })
    }

    // Check membership
    const membership = await FamilyMember.query()
      .where('familyId', recipe.familyId!)
      .where('userId', user.id)
      .first()
    
    if (!membership) {
      return response.forbidden({ message: 'Accès non autorisé' })
    }

    let data: any
    try {
      data = await vine.validate({ schema: updateRecipeSchema, data: request.all() })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: 'Validation échouée',
          errors: error.messages,
        })
      }
      throw error
    }

    if (data.title !== undefined) recipe.title = data.title
    if (data.description !== undefined) recipe.description = data.description
    if (data.prepTimeMinutes !== undefined) recipe.prepTimeMinutes = data.prepTimeMinutes
    if (data.cookTimeMinutes !== undefined) recipe.cookTimeMinutes = data.cookTimeMinutes
    if (data.servings !== undefined) recipe.servings = data.servings
    if (data.difficulty !== undefined) recipe.difficulty = data.difficulty
    if (data.ingredients !== undefined) recipe.ingredients = data.ingredients
    if (data.instructions !== undefined) recipe.instructions = data.instructions
    if (data.tags !== undefined) recipe.tags = data.tags

    await recipe.save()

    return response.ok({
      message: 'Recette mise à jour',
      recipe: recipe.serialize(),
    })
  }

  /**
   * Delete a family recipe
   * DELETE /api/v1/recipes/family/:id
   */
  async deleteFamilyRecipe({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const recipeId = params.id

    const recipe = await Recipe.find(recipeId)
    if (!recipe) {
      return response.notFound({ message: 'Recette non trouvée' })
    }

    // Check membership
    const membership = await FamilyMember.query()
      .where('familyId', recipe.familyId!)
      .where('userId', user.id)
      .first()
    
    if (!membership) {
      return response.forbidden({ message: 'Accès non autorisé' })
    }

    await recipe.delete()

    return response.ok({
      message: 'Recette supprimée',
    })
  }
}
