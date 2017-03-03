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

  getFullName () {
    return this.name ? this.name : this.username;
  }

  getUrl () {
    return `/${this.username}`;
  }
}

module.exports = User
