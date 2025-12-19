import env from '#start/env'

export type NutritionGoal = 'lose_weight' | 'maintain' | 'gain_muscle'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type Gender = 'male' | 'female' | 'other'

export interface UserProfile {
  weight: number // kg
  height: number // cm
  age: number
  gender: Gender
  activityLevel: ActivityLevel
  goal: NutritionGoal
}

export interface FridgeIngredient {
  name: string
  quantity: number
  unit: string | null
  expirationDate: string | null
}

export interface MealSuggestion {
  name: string
  emoji: string
  type: 'lunch' | 'dinner'
  calories: number
  proteins: number // grams
  carbs: number // grams
  fats: number // grams
  ingredients: string[]
  instructions: string[]
  prepTime: number // minutes
  difficulty: 'easy' | 'medium' | 'hard'
  tips: string
}

export interface NutritionAnalysis {
  dailyCalorieTarget: number
  dailyProteinTarget: number
  dailyCarbsTarget: number
  dailyFatsTarget: number
  bmi: number
  bmiCategory: string
  recommendations: string[]
  lunchSuggestions: MealSuggestion[]
  dinnerSuggestions: MealSuggestion[]
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

export default class NutritionService {
  private apiKey = env.get('OPENAI_API_KEY')
  private apiUrl = 'https://api.openai.com/v1/chat/completions'

  /**
   * Calculate BMR using Mifflin-St Jeor equation
   */
  private calculateBMR(profile: UserProfile): number {
    const { weight, height, age, gender } = profile
    
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161
    }
  }

  /**
   * Calculate TDEE (Total Daily Energy Expenditure)
   */
  private calculateTDEE(profile: UserProfile): number {
    const bmr = this.calculateBMR(profile)
    const activityMultipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    }
    return Math.round(bmr * activityMultipliers[profile.activityLevel])
  }

  /**
   * Calculate daily calorie target based on goal
   */
  private calculateCalorieTarget(profile: UserProfile): number {
    const tdee = this.calculateTDEE(profile)
    
    switch (profile.goal) {
      case 'lose_weight':
        return Math.round(tdee * 0.8) // 20% deficit
      case 'gain_muscle':
        return Math.round(tdee * 1.1) // 10% surplus
      default:
        return tdee
    }
  }

  /**
   * Calculate macronutrient targets
   */
  private calculateMacros(calorieTarget: number, goal: NutritionGoal) {
    let proteinRatio: number, carbsRatio: number, fatsRatio: number

    switch (goal) {
      case 'lose_weight':
        proteinRatio = 0.35 // Higher protein for satiety
        carbsRatio = 0.35
        fatsRatio = 0.30
        break
      case 'gain_muscle':
        proteinRatio = 0.30
        carbsRatio = 0.45
        fatsRatio = 0.25
        break
      default:
        proteinRatio = 0.25
        carbsRatio = 0.50
        fatsRatio = 0.25
    }

    return {
      proteins: Math.round((calorieTarget * proteinRatio) / 4), // 4 cal/g
      carbs: Math.round((calorieTarget * carbsRatio) / 4), // 4 cal/g
      fats: Math.round((calorieTarget * fatsRatio) / 9), // 9 cal/g
    }
  }

  /**
   * Calculate BMI
   */
  private calculateBMI(weight: number, height: number): { bmi: number; category: string } {
    const heightInMeters = height / 100
    const bmi = weight / (heightInMeters * heightInMeters)
    
    let category: string
    if (bmi < 18.5) category = 'Insuffisance pondérale'
    else if (bmi < 25) category = 'Poids normal'
    else if (bmi < 30) category = 'Surpoids'
    else category = 'Obésité'

    return { bmi: Math.round(bmi * 10) / 10, category }
  }

  /**
   * Generate meal suggestions using GPT-4o
   */
  async generateMealSuggestions(
    profile: UserProfile,
    ingredients: FridgeIngredient[],
    calorieTarget: number,
    macros: { proteins: number; carbs: number; fats: number }
  ): Promise<{ lunch: MealSuggestion[]; dinner: MealSuggestion[] }> {
    const ingredientsList = ingredients
      .map(i => `${i.name} (${i.quantity} ${i.unit || 'unité(s)'}${i.expirationDate ? `, expire le ${i.expirationDate}` : ''})`)
      .join('\n')

    const goalText = {
      lose_weight: 'perdre du poids (déficit calorique, riche en protéines, faible en glucides raffinés)',
      maintain: 'maintenir son poids (alimentation équilibrée)',
      gain_muscle: 'prendre du muscle (surplus calorique, riche en protéines et glucides complexes)',
    }[profile.goal]

    const prompt = `Tu es un nutritionniste expert. Génère des suggestions de repas personnalisées.

PROFIL UTILISATEUR:
- Poids: ${profile.weight} kg
- Taille: ${profile.height} cm
- Âge: ${profile.age} ans
- Sexe: ${profile.gender === 'male' ? 'Homme' : 'Femme'}
- Niveau d'activité: ${profile.activityLevel}
- Objectif: ${goalText}

OBJECTIFS NUTRITIONNELS JOURNALIERS:
- Calories: ${calorieTarget} kcal
- Protéines: ${macros.proteins}g
- Glucides: ${macros.carbs}g
- Lipides: ${macros.fats}g

INGRÉDIENTS DISPONIBLES DANS LE FRIGO:
${ingredientsList || 'Aucun ingrédient spécifié'}

INSTRUCTIONS:
1. Propose 3 recettes pour le DÉJEUNER et 3 recettes pour le DÎNER
2. Chaque repas doit représenter environ 35-40% des besoins journaliers
3. Priorise les ingrédients qui expirent bientôt
4. Adapte les portions et les recettes à l'objectif de l'utilisateur
5. Sois créatif mais réaliste avec les ingrédients disponibles

Retourne UNIQUEMENT un JSON valide (sans markdown) avec cette structure:
{
  "lunch": [
    {
      "name": "Nom du plat",
      "emoji": "🍽️",
      "type": "lunch",
      "calories": 500,
      "proteins": 30,
      "carbs": 50,
      "fats": 15,
      "ingredients": ["ingrédient 1", "ingrédient 2"],
      "instructions": ["étape 1", "étape 2"],
      "prepTime": 20,
      "difficulty": "easy",
      "tips": "Conseil nutritionnel adapté à l'objectif"
    }
  ],
  "dinner": [...]
}`

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'Tu es un nutritionniste expert qui génère des suggestions de repas personnalisées en JSON. Réponds uniquement en JSON valide sans markdown.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 3000,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenAI API Error:', errorText)
        throw new Error(`Erreur API OpenAI: ${response.statusText}`)
      }

      const data = (await response.json()) as OpenAIResponse

      if (!data.choices || data.choices.length === 0) {
        throw new Error('Pas de réponse de l\'IA')
      }

      const content = data.choices[0].message.content || '{}'
      const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim()
      
      return JSON.parse(jsonStr)
    } catch (error) {
      console.error('Error generating meal suggestions:', error)
      throw new Error('Impossible de générer les suggestions de repas. Veuillez réessayer.')
    }
  }

  /**
   * Main method: Analyze nutrition needs and generate meal suggestions
   */
  async analyzeAndSuggest(
    profile: UserProfile,
    ingredients: FridgeIngredient[]
  ): Promise<NutritionAnalysis> {
    // Calculate nutritional targets
    const calorieTarget = this.calculateCalorieTarget(profile)
    const macros = this.calculateMacros(calorieTarget, profile.goal)
    const { bmi, category: bmiCategory } = this.calculateBMI(profile.weight, profile.height)

    // Generate recommendations based on goal
    const recommendations = this.generateRecommendations(profile, bmi)

    // Generate meal suggestions with GPT
    const { lunch, dinner } = await this.generateMealSuggestions(
      profile,
      ingredients,
      calorieTarget,
      macros
    )

    return {
      dailyCalorieTarget: calorieTarget,
      dailyProteinTarget: macros.proteins,
      dailyCarbsTarget: macros.carbs,
      dailyFatsTarget: macros.fats,
      bmi,
      bmiCategory,
      recommendations,
      lunchSuggestions: lunch,
      dinnerSuggestions: dinner,
    }
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(profile: UserProfile, bmi: number): string[] {
    const recommendations: string[] = []

    if (profile.goal === 'lose_weight') {
      recommendations.push('🥗 Privilégiez les légumes verts à chaque repas pour augmenter la satiété')
      recommendations.push('💧 Buvez au moins 2L d\'eau par jour pour optimiser le métabolisme')
      recommendations.push('🍗 Consommez des protéines maigres à chaque repas pour préserver la masse musculaire')
      if (bmi > 25) {
        recommendations.push('🚶 Visez 10 000 pas par jour pour augmenter votre dépense énergétique')
      }
    } else if (profile.goal === 'gain_muscle') {
      recommendations.push('🥩 Répartissez vos protéines sur 4-5 repas pour optimiser la synthèse musculaire')
      recommendations.push('🍚 Consommez des glucides complexes avant et après l\'entraînement')
      recommendations.push('😴 Dormez 7-8h par nuit pour favoriser la récupération')
    } else {
      recommendations.push('⚖️ Maintenez un équilibre entre protéines, glucides et lipides')
      recommendations.push('🌈 Variez les couleurs dans votre assiette pour diversifier les nutriments')
    }

    recommendations.push('⏰ Évitez de manger 2-3h avant le coucher pour une meilleure digestion')

    return recommendations
  }
}
