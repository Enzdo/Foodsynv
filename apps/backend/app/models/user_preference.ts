import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class UserPreference extends BaseModel {
  static table = 'user_preferences'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare dietaryRestrictions: string | null // JSON array: ['vegetarian', 'gluten-free', etc.]

  @column()
  declare allergies: string | null // JSON array: ['nuts', 'dairy', etc.]

  @column()
  declare favoriteCategories: string | null // JSON array: ['italian', 'asian', etc.]

  @column()
  declare householdSize: number

  @column()
  declare cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  serialize() {
    return {
      id: this.id,
      userId: this.userId,
      dietaryRestrictions: this.dietaryRestrictions ? JSON.parse(this.dietaryRestrictions) : [],
      allergies: this.allergies ? JSON.parse(this.allergies) : [],
      favoriteCategories: this.favoriteCategories ? JSON.parse(this.favoriteCategories) : [],
      householdSize: this.householdSize,
      cookingSkillLevel: this.cookingSkillLevel,
      createdAt: this.createdAt?.toISO(),
      updatedAt: this.updatedAt?.toISO(),
    }
  }
}
