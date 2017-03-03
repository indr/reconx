'use strict'

const Lucid = use('Lucid')

class Follow extends Lucid {

  /**
   * The user that follows a profile/user
   */
  follower () {
    return this.belongsTo('App/Model/User', 'id', 'follower_user_id')
  }

  /**
   * The user/profile that is followed
   */
  followed () {
    return this.belongsTo('App/Model/User', 'id', 'followed_user_id')
  }

}

module.exports = Follow
