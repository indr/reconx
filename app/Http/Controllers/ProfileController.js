'use strict'

const NE = require('node-exceptions')
const User = use('App/Model/User')

class ProfileController {

  * show (request, response) {
    const profile = yield this.findProfile(request)
    yield response.sendView('profile/show', {
      profile,
      canEdit: request.currentUser && profile.id == request.currentUser.id
    })
  }

  * edit (request, response) {
    const user = request.currentUser
    const profile = yield this.findProfile(request)

    if (user.id != profile.id) {
      throw new NE.HttpException(`Login Failure`, 401)
    }
    profile.name = profile.getFullName()
    yield response.sendView('profile/edit', { profile, data: profile })
  }

  * update (request, response) {
    const user = request.currentUser
    const profile = yield this.findProfile(request)
    const data = request.only('name', 'shortDescription', 'longDescription')

    if (user.id != profile.id) {
      throw new NE.HttpException(`Login Failure`, 401)
    }

    profile.name = data.name
    profile.shortDescription = data.shortDescription
    profile.longDescription = data.longDescription

    yield profile.save();

    yield request.with({ success: 'Profile successfully updated.' }).flash()

    response.redirect(user.getUrl())
  }

  * followers (request, response) {
    const profile = yield this.findProfile(request)
    yield response.sendView('profile/followers', { profile })
  }

  * following (request, response) {
    const profile = yield this.findProfile(request)
    yield response.sendView('profile/following', { profile })
  }

  * findProfile (request) {

    const username = request.param('username')

    if (username.indexOf('/') >= 0) {
      throw new NE.HttpException(`Route not found ${request.url()}`, 404)
    }

    const user = yield User.query().where('username', username).first()

    if (user == null) {
      throw new NE.HttpException(`Route not found ${request.url()}`, 404)
    }

    return user
  }
}

module.exports = ProfileController
