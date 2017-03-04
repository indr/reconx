'use strict'

const uuid = require('node-uuid')

const EmailToken = exports = module.exports = {}

EmailToken.expirePreviousTokens = function * (next) {
  let EmailToken = use('App/Model/EmailToken')

  const previousEmailTokens = yield EmailToken.query().where('user_id', this.user_id)
    .andWhere('id', '!=', this.id)
    .andWhere('expired', false).andWhere('confirmed', false).fetch()
  for (var each of previousEmailTokens) {
    each.expired = true
    yield each.save()
  }

  yield next
}
