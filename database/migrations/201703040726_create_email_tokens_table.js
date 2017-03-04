'use strict'

const Schema = use('Schema')

class EmailTokensSchema extends Schema {

  up () {
    this.create('email_tokens', (table) => {
      table.uuid('id').primary().index()
      table.uuid('user_id').references('id').inTable('users').notNullable().onDelete('CASCADE')
      table.string('email', 254).notNullable()
      table.string('token', 40).notNullable().unique()
      table.boolean('confirmed').notNullable().defaultTo(false)
      table.boolean('expired').notNullable().defaultTo(false)
      table.timestamps()
    })
  }

  down () {
    this.drop('email_tokens')
  }

}

module.exports = EmailTokensSchema
