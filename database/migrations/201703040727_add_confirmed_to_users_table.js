'use strict'

const Schema = use('Schema')

class AddConfirmedToUserSchema extends Schema {

  up () {
    this.table('users', (table) => {
      table.boolean('confirmed').notNullable().defaultsTo(false)
    })
  }

  down () {
    this.table('users', (table) => {
      table.dropColumn('confirmed')
    })
  }

}

module.exports = AddConfirmedToUserSchema
