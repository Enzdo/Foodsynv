import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'consumption_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('family_id').unsigned().references('id').inTable('families').onDelete('CASCADE')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable()
      table.integer('fridge_inventory_id').unsigned().references('id').inTable('fridge_inventory').onDelete('SET NULL').nullable()
      table.string('item_name', 200).notNullable()
      table.enum('action', ['consumed', 'wasted', 'donated', 'expired']).notNullable()
      table.integer('quantity').defaultTo(1)
      table.decimal('estimated_value', 10, 2).nullable()
      table.text('notes').nullable()
      table.timestamp('logged_at').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
