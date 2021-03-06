'use strict'

const Lucid = use('Lucid')
const Hash = use('Hash')

class User extends Lucid {

  static boot () {
    super.boot()

    /**
     * Hashing password before storing to the
     * database.
     */
    this.addHook('beforeCreate', function * (next) {
      this.password = yield Hash.make(this.password)
      yield next
    })
  }

  static get computed () {
    return [ 'fullName', 'url' ]
  }

  apiTokens () {
    return this.hasMany('App/Model/Token')
  }

  emailTokens () {
    return this.hasMany('App/Model/EmailToken')
  }

  getFullName () {
    return this.name ? this.name : this.username;
  }

  getUrl () {
    return `/${this.username}`;
  }

  following () {
    return this.hasMany('App/Model/Follow', 'id', 'follower_user_id')
  }

  followers () {
    return this.hasMany('App/Model/Follow', 'id', 'followed_user_id')
  }

}

module.exports = User
