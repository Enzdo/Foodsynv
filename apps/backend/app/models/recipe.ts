import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Family from '#models/family'
import User from '#models/user'

export default class Recipe extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare familyId: number | null

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare imageUrl: string | null

  @column()
  declare prepTimeMinutes: number | null

  @column()
  declare cookTimeMinutes: number | null

  @column()
  declare servings: number | null

  @column()
  declare difficulty: 'easy' | 'medium' | 'hard'

  @column({
    prepare: (value: any) => JSON.stringify(value),
    consume: (value: any) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare ingredients: { name: string; quantity: string; unit?: string }[]

  @column({
    prepare: (value: any) => JSON.stringify(value),
    consume: (value: any) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare instructions: string[]

  @column({
    prepare: (value: any) => JSON.stringify(value),
    consume: (value: any) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare tags: string[] | null

  @column()
  declare sourceUrl: string | null

  @column()
  declare isAiGenerated: boolean

  @column()
  declare createdByUserId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Family)
  declare family: BelongsTo<typeof Family>

  @belongsTo(() => User, { foreignKey: 'createdByUserId' })
  declare createdBy: BelongsTo<typeof User>

  /**
   * Total time in minutes
   */
  get totalTime(): number | null {
    if (!this.prepTimeMinutes && !this.cookTimeMinutes) return null
    return (this.prepTimeMinutes || 0) + (this.cookTimeMinutes || 0)
  }

  serialize() {
    return {
      id: this.id,
      familyId: this.familyId,
      title: this.title,
      description: this.description,
      imageUrl: this.imageUrl,
      prepTimeMinutes: this.prepTimeMinutes,
      cookTimeMinutes: this.cookTimeMinutes,
      totalTime: this.totalTime,
      servings: this.servings,
      difficulty: this.difficulty,
      ingredients: this.ingredients || [],
      instructions: this.instructions || [],
      tags: this.tags || [],
      sourceUrl: this.sourceUrl,
      isAiGenerated: this.isAiGenerated,
      createdByUserId: this.createdByUserId,
      createdAt: this.createdAt?.toISO(),
      updatedAt: this.updatedAt?.toISO(),
    }
  }
}
