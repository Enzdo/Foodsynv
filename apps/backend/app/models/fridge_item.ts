import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Family from '#models/family'
import User from '#models/user'

export default class FridgeItem extends BaseModel {
  static table = 'fridge_inventory'

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

  @column.date()
  declare expirationDate: DateTime | null

  @column.date()
  declare purchaseDate: DateTime | null

  @column()
  declare storageLocation: 'fridge' | 'freezer' | 'pantry'

  @column()
  declare addedByUserId: number | null

  @column()
  declare isConsumed: boolean

  @column.dateTime()
  declare consumedAt: DateTime | null

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

  /**
   * Calculate days until expiration
   */
  get daysUntilExpiration(): number | null {
    if (!this.expirationDate) return null
    const today = DateTime.now().startOf('day')
    const expDate = this.expirationDate.startOf('day')
    return Math.floor(expDate.diff(today, 'days').days)
  }

  serialize() {
    return {
      id: this.id,
      familyId: this.familyId,
      name: this.customName,
      quantity: this.quantity,
      unit: this.unit,
      expirationDate: this.expirationDate?.toISODate(),
      purchaseDate: this.purchaseDate?.toISODate(),
      storageLocation: this.storageLocation,
      isConsumed: this.isConsumed,
      notes: this.notes,
      emoji: '🍽️',
      daysUntilExpiration: this.daysUntilExpiration,
      createdAt: this.createdAt?.toISO(),
      updatedAt: this.updatedAt?.toISO(),
    }
  }
}
