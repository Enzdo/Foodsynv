import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('weight', 5, 2).nullable() // Weight in kg (e.g., 90.50)
      table.decimal('height', 5, 2).nullable() // Height in cm (e.g., 180.00)
      table.enum('gender', ['male', 'female', 'other']).nullable()
      table.integer('age').nullable()
      table.enum('activity_level', ['sedentary', 'light', 'moderate', 'active', 'very_active']).nullable()
      table.enum('goal', ['lose_weight', 'maintain', 'gain_muscle']).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('weight')
      table.dropColumn('height')
      table.dropColumn('gender')
      table.dropColumn('age')
      table.dropColumn('activity_level')
      table.dropColumn('goal')
    })
  }
}
