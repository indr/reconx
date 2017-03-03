'use strict'

const User = use('App/Model/User')

class ProfilesController {
  * index (request, response) {
    const profiles = yield User.query().orderBy('updated_at', 'desc').fetch()
    yield response.sendView('welcome', { profiles: profiles.toJSON() })
  }
}

module.exports = ProfilesController
