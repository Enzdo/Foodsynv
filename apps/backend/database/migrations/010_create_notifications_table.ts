import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('family_id').unsigned().references('id').inTable('families').onDelete('CASCADE').nullable()
      table.enum('type', ['expiration_warning', 'low_stock', 'shopping_reminder', 'recipe_suggestion', 'promo_alert', 'family_invite', 'general']).notNullable()
      table.string('title', 200).notNullable()
      table.text('message').nullable()
      table.json('data').nullable()
      table.boolean('is_read').defaultTo(false)
      table.timestamp('read_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
