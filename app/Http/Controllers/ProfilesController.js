'use strict'

const uuid = require('node-uuid')

const Follow = use('App/Model/Follow')
const User = use('App/Model/User')

class ProfilesController {
  * index (request, response) {
    const profiles = yield User.query().orderBy('updated_at', 'desc').fetch()
    yield response.sendView('welcome', { profiles: profiles.toJSON() })
  }

  * follow (request, response) {
    const followerId = request.currentUser.id
    const followedId = request.param('followed')

    yield Follow.findOrCreate(
      { follower_user_id: followerId, followed_user_id: followedId },
      { id: uuid.v4(), follower_user_id: followerId, followed_user_id: followedId }
    )

    response.ok({})
  }

  * unfollow (request, response) {
    const followerId = request.currentUser.id
    const followedId = request.param('followed')

    const follow = yield Follow.query()
      .where('follower_user_id', followerId)
      .where('followed_user_id', followedId)
      .first()

    if (follow != null) {
      yield follow.delete()
    }

    response.ok({})
  }
}

module.exports = ProfilesController
