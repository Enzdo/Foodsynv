import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'scans'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('family_id').unsigned().references('id').inTable('families').onDelete('CASCADE')
      table.enum('scan_type', ['receipt', 'fridge_photo', 'barcode', 'expiration_date']).notNullable()
      table.string('image_url', 500).nullable()
      table.json('raw_result').nullable()
      table.json('parsed_items').nullable()
      table.enum('status', ['pending', 'processing', 'completed', 'failed']).defaultTo('pending')
      table.text('error_message').nullable()
      table.timestamp('processed_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
