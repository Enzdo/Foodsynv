import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fridge_inventory'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('emoji', 10).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('emoji')
    })
  }
}
