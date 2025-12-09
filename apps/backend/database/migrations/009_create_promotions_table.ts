import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'promotions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('store_name', 200).notNullable()
      table.string('product_name', 200).notNullable()
      table.decimal('original_price', 10, 2).nullable()
      table.decimal('promo_price', 10, 2).notNullable()
      table.integer('discount_percentage').nullable()
      table.date('start_date').nullable()
      table.date('end_date').nullable()
      table.string('image_url', 500).nullable()
      table.string('store_location', 500).nullable()
      table.decimal('latitude', 10, 8).nullable()
      table.decimal('longitude', 11, 8).nullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
