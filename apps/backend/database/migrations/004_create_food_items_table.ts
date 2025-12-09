import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'food_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name', 200).notNullable()
      table.string('barcode', 50).nullable().index()
      table.string('category', 100).nullable()
      table.string('brand', 100).nullable()
      table.string('image_url', 500).nullable()
      table.integer('default_shelf_life_days').nullable()
      table.json('nutritional_info').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
