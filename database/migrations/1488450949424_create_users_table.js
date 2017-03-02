'use strict'

const Schema = use('Schema')

class UsersTableSchema extends Schema {

  up () {
    this.create('users', table => {
      table.uuid('id').primary().index()
      table.timestamps()
      table.string('username', 80).notNullable().unique()
      table.string('email', 254).notNullable().unique()
      table.string('password', 60).notNullable()
    })
  }

  down () {
    this.drop('users')
  }

}

module.exports = UsersTableSchema
