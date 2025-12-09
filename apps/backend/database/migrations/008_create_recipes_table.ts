import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'recipes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('title', 200).notNullable()
      table.text('description').nullable()
      table.string('image_url', 500).nullable()
      table.integer('prep_time_minutes').nullable()
      table.integer('cook_time_minutes').nullable()
      table.integer('servings').nullable()
      table.enum('difficulty', ['easy', 'medium', 'hard']).defaultTo('medium')
      table.json('ingredients').nullable()
      table.json('instructions').nullable()
      table.json('tags').nullable()
      table.string('source_url', 500).nullable()
      table.boolean('is_ai_generated').defaultTo(false)
      table.integer('created_by_user_id').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
