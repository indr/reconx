'use strict'

class ProfilesController {
  * index (request, response) {
    yield response.sendView('welcome')
  }
}

module.exports = ProfilesController
