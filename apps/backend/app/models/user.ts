import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare avatarUrl: string | null

  @column()
  declare role: 'admin' | 'member'

  @column()
  declare isActive: boolean

  @column()
  declare weight: number | null

  @column()
  declare height: number | null

  @column()
  declare gender: 'male' | 'female' | 'other' | null

  @column()
  declare age: number | null

  @column()
  declare activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null

  @column()
  declare goal: 'lose_weight' | 'maintain' | 'gain_muscle' | null

  @column.dateTime()
  declare emailVerifiedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /**
   * Access tokens provider for API authentication
   */
  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '30 days',
    prefix: 'oat_',
    table: 'auth_access_tokens',
    type: 'auth_token',
    tokenSecretLength: 40,
  })

  /**
   * Get full name
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  /**
   * Serialize user for API response
   */
  serialize() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      avatarUrl: this.avatarUrl,
      role: this.role,
      isActive: this.isActive,
      weight: this.weight,
      height: this.height,
      gender: this.gender,
      age: this.age,
      activityLevel: this.activityLevel,
      goal: this.goal,
      emailVerifiedAt: this.emailVerifiedAt?.toISO(),
      createdAt: this.createdAt.toISO(),
      updatedAt: this.updatedAt.toISO(),
    }
  }
}
