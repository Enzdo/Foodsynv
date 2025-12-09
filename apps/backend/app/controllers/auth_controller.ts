import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import vine, { errors } from '@vinejs/vine'

// Validation schemas
const registerSchema = vine.object({
  email: vine.string().email().toLowerCase(),
  password: vine.string().minLength(8).maxLength(100),
  firstName: vine.string().minLength(2).maxLength(100),
  lastName: vine.string().minLength(2).maxLength(100),
})

const loginSchema = vine.object({
  email: vine.string().email().toLowerCase(),
  password: vine.string(),
})

export default class AuthController {
  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  async register({ request, response }: HttpContext) {
    let data: { email: string; password: string; firstName: string; lastName: string }
    
    try {
      data = await vine.validate({ schema: registerSchema, data: request.all() })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: 'Validation échouée',
          errors: error.messages,
        })
      }
      throw error
    }

    // Check if user already exists
    const existingUser = await User.findBy('email', data.email)
    if (existingUser) {
      return response.conflict({
        message: 'Un compte avec cet email existe déjà',
      })
    }

    // Create user
    const user = await User.create({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'member',
      isActive: true,
    })

    // Generate access token
    const token = await User.accessTokens.create(user, ['*'], {
      name: 'auth_token',
      expiresIn: '30 days',
    })

    return response.created({
      message: 'Inscription réussie',
      user: user.serialize(),
      token: {
        type: 'bearer',
        value: token.value!.release(),
        expiresAt: token.expiresAt?.toISOString(),
      },
    })
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  async login({ request, response }: HttpContext) {
    let loginData: { email: string; password: string }
    
    try {
      loginData = await vine.validate({ schema: loginSchema, data: request.all() })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: 'Validation échouée',
          errors: error.messages,
        })
      }
      throw error
    }
    
    const { email, password } = loginData

    // Verify credentials
    const user = await User.verifyCredentials(email, password)

    if (!user.isActive) {
      return response.forbidden({
        message: 'Votre compte a été désactivé',
      })
    }

    // Generate access token
    const token = await User.accessTokens.create(user, ['*'], {
      name: 'auth_token',
      expiresIn: '30 days',
    })

    return response.ok({
      message: 'Connexion réussie',
      user: user.serialize(),
      token: {
        type: 'bearer',
        value: token.value!.release(),
        expiresAt: token.expiresAt?.toISOString(),
      },
    })
  }

  /**
   * Logout user (revoke current token)
   * POST /api/v1/auth/logout
   */
  async logout({ auth, response }: HttpContext) {
    const user = auth.user!
    const token = auth.user?.currentAccessToken

    if (token) {
      await User.accessTokens.delete(user, token.identifier)
    }

    return response.ok({
      message: 'Déconnexion réussie',
    })
  }

  /**
   * Get current authenticated user
   * GET /api/v1/auth/me
   */
  async me({ auth, response }: HttpContext) {
    const user = auth.user!

    return response.ok({
      user: user.serialize(),
    })
  }

  /**
   * Refresh token
   * POST /api/v1/auth/refresh
   */
  async refresh({ auth, response }: HttpContext) {
    const user = auth.user!
    const currentToken = auth.user?.currentAccessToken

    // Revoke current token
    if (currentToken) {
      await User.accessTokens.delete(user, currentToken.identifier)
    }

    // Generate new token
    const newToken = await User.accessTokens.create(user, ['*'], {
      name: 'auth_token',
      expiresIn: '30 days',
    })

    return response.ok({
      message: 'Token renouvelé',
      token: {
        type: 'bearer',
        value: newToken.value!.release(),
        expiresAt: newToken.expiresAt?.toISOString(),
      },
    })
  }
}
