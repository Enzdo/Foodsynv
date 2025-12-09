import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Family from '#models/family'

export default class FamilyMember extends BaseModel {
  static table = 'family_members'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare familyId: number

  @column()
  declare userId: number

  @column()
  declare role: 'admin' | 'member' | 'child'

  @column()
  declare nickname: string | null

  @column.dateTime()
  declare joinedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Family)
  declare family: BelongsTo<typeof Family>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  serialize() {
    return {
      id: this.id,
      familyId: this.familyId,
      userId: this.userId,
      role: this.role,
      nickname: this.nickname,
      joinedAt: this.joinedAt?.toISO(),
      createdAt: this.createdAt?.toISO(),
      updatedAt: this.updatedAt?.toISO(),
    }
  }
}
