import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fridge_inventory'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('family_id').unsigned().references('id').inTable('families').onDelete('CASCADE')
      table.integer('food_item_id').unsigned().references('id').inTable('food_items').onDelete('SET NULL').nullable()
      table.string('custom_name', 200).nullable()
      table.integer('quantity').defaultTo(1)
      table.string('unit', 50).nullable()
      table.date('expiration_date').nullable()
      table.date('purchase_date').nullable()
      table.enum('storage_location', ['fridge', 'freezer', 'pantry']).defaultTo('fridge')
      table.integer('added_by_user_id').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable()
      table.boolean('is_consumed').defaultTo(false)
      table.timestamp('consumed_at').nullable()
      table.text('notes').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
