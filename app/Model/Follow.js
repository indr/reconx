'use strict'

const Lucid = use('Lucid')

class Follow extends Lucid {

  follower () {
    return this.belongsTo('App/Model/User', 'id', 'follower_user_id')
  }

  followed () {
    return this.belongsTo('App/Model/User', 'id', 'followed_user_id')
  }

}

module.exports = Follow
