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

      table.string('name', 80).nullable()
      table.string('shortDescription', 254).nullable()
      table.text('longDescription')
    })
  }

  down () {
    this.drop('users')
  }

}

module.exports = UsersTableSchema
