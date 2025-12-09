import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'families'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('member_count').defaultTo(1)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('member_count')
    })
  }
}
