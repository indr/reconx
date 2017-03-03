'use strict'

const Schema = use('Schema')

class FollowsTableSchema extends Schema {

  up () {
    this.create('follows', table => {
      table.uuid('id').primary().index()
      table.timestamps()
      table.uuid('follower_user_id').references('id').inTable('users')
      table.uuid('followed_user_id').references('id').inTable('users')
    })
  }

  down () {
    this.drop('follows')
  }

}

module.exports = FollowsTableSchema
