'use strict'

const moment = require('moment')
const uuid = require('node-uuid')

const Exceptions = use('App/Exceptions')
const Lucid = use('Lucid')

class EmailToken extends Lucid {

  static boot () {
    super.boot()
    this.addHook('beforeCreate', function * (next) {
      this.id = uuid.v4()
      this.token = uuid.v4()
      yield next
    })
    this.addHook('afterCreate', 'EmailToken.expirePreviousTokens')
  }

  user () {
    return this.belongsTo('App/Model/User')
  }

  confirm () {
    if (this.confirmed) {
      throw new Exceptions.ValidationException('email-token-already-confirmed')
    }
    if (this.expired || moment().subtract(2, 'days').isAfter(this.created_at)) {
      throw new Exceptions.ValidationException('email-token-expired')
    }
    this.confirmed = true
    return true
  }

}

module.exports = EmailToken
