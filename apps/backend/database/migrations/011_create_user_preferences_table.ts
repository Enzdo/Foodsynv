import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_preferences'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').unique()
      table.json('dietary_restrictions').nullable() // vegetarian, vegan, gluten-free, etc.
      table.json('allergies').nullable()
      table.json('favorite_cuisines').nullable()
      table.json('disliked_ingredients').nullable()
      table.boolean('notifications_enabled').defaultTo(true)
      table.boolean('expiration_alerts').defaultTo(true)
      table.integer('expiration_alert_days').defaultTo(3)
      table.boolean('shopping_reminders').defaultTo(true)
      table.boolean('promo_alerts').defaultTo(true)
      table.string('language', 10).defaultTo('fr')
      table.string('timezone', 50).defaultTo('Europe/Paris')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
