import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AlterQuantityToDecimalInFridgeInventory extends BaseSchema {
  protected tableName = 'fridge_inventory'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      // Passer la quantité en décimal avec 2 décimales (ex: 4.50 L, 0.80 kg)
      table.decimal('quantity', 8, 2).alter()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      // Revenir à un entier si besoin (comportement précédent)
      table.integer('quantity').alter()
    })
  }
}
