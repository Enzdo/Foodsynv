import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import FamilyMember from '#models/family_member'
import FridgeItem from '#models/fridge_item'
import ShoppingItem from '#models/shopping_item'

export default class Family extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare inviteCode: string

  @column()
  declare ownerId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'ownerId' })
  declare owner: BelongsTo<typeof User>

  @hasMany(() => FamilyMember)
  declare members: HasMany<typeof FamilyMember>

  @hasMany(() => FridgeItem)
  declare fridgeItems: HasMany<typeof FridgeItem>

  @hasMany(() => ShoppingItem)
  declare shoppingItems: HasMany<typeof ShoppingItem>

  /**
   * Generate a unique invite code
   */
  static generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      inviteCode: this.inviteCode,
      ownerId: this.ownerId,
      createdAt: this.createdAt?.toISO(),
      updatedAt: this.updatedAt?.toISO(),
    }
  }
}
