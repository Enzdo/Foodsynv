import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Family from '#models/family'
import User from '#models/user'

export default class ShoppingItem extends BaseModel {
  static table = 'shopping_list'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare familyId: number

  @column()
  declare foodItemId: number | null

  @column()
  declare customName: string | null

  @column()
  declare quantity: number

  @column()
  declare unit: string | null

  @column()
  declare isPurchased: boolean

  @column()
  declare addedByUserId: number | null

  @column()
  declare purchasedByUserId: number | null

  @column.dateTime()
  declare purchasedAt: DateTime | null

  @column()
  declare priority: 'low' | 'medium' | 'high'

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Family)
  declare family: BelongsTo<typeof Family>

  @belongsTo(() => User, { foreignKey: 'addedByUserId' })
  declare addedBy: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'purchasedByUserId' })
  declare purchasedBy: BelongsTo<typeof User>

  serialize() {
    return {
      id: this.id,
      familyId: this.familyId,
      name: this.customName,
      quantity: this.quantity,
      unit: this.unit,
      isPurchased: this.isPurchased,
      priority: this.priority,
      notes: this.notes,
      createdAt: this.createdAt?.toISO(),
      updatedAt: this.updatedAt?.toISO(),
    }
  }
}
