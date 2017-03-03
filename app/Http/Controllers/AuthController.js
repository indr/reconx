'use strict'

const uuid = require('node-uuid')
const passgen = require('pass-gen')

const Hash = use('Hash')
const User = use('App/Model/User')
const Validator = use('Validator')

class AuthController {

  * forgot (request, response) {
    const data = request.only('email')

    const rules = { email: 'required|email' }
    const validation = yield Validator.validate(data, rules)

    if (validation.fails()) {
      yield request
        .withOnly('email')
        .andWith({ errors: validation.messages() })
        .flash()

      response.redirect('back')
      return
    }

    yield request
      .with({ success: 'Email with instructions has been sent.' })
      .flash()

    response.redirect('/login')
  }

  * login (request, response) {
    const data = request.only('identifier', 'password')

    const rules = {
      identifier: 'required',
      password: 'required'
    }

    const validation = yield Validator.validate(data, rules)

    if (validation.fails()) {
      yield request
        .withOnly('identifier')
        .andWith({ errors: validation.messages() })
        .flash()

      response.redirect('back')
      return
    }

    let login = null;
    try {
      login = yield request.auth.attempt(data.identifier, data.password)
    } catch (ex) {
      if (ex.name == 'PasswordMisMatchException') {
        login = null
      } else if (ex.name == 'UserNotFoundException') {
        login = null
      } else {
        throw ex
      }
    }

    if (!login) {
      yield request
        .withOnly('identifier')
        .andWith({ error: 'Invalid username or password' })
        .flash()

      response.redirect('back')
      return
    }

    yield response.redirect('/')
  }

  * logout (request, response) {
    yield request.auth.logout();

    yield request
      .with({ success: 'Successfully logged out.' })
      .flash();

    response.redirect('/');
  }

  * signup (request, response) {
    const data = request.only('username', 'email')

    const rules = {
      username: [ 'required', 'min:2', 'regex:^[a-za-z0-9\-_]+$', 'unique:users' ],
      email: 'required|email|unique:users'
    }

    const validation = yield Validator.validate(data, rules)

    if (validation.fails()) {
      yield request
        .withOnly('username', 'email')
        .andWith({ errors: validation.messages() })
        .flash()

      response.redirect('back')
      return
    }

    data.password = AuthController.makePassword()
    yield User.create({
      id: uuid.v4(),
      username: data.username,
      email: data.email,
      password: data.password,
    })

    yield request
      .with({ success: 'Successfully signed up. Email with instructions has been sent. Password: ' + data.password })
      .flash()

    response.redirect('/login')
  }

  static makePassword () {
    return passgen({ ascii: true, ASCII: true, numbers: true, length: 12 })
  }
}

module.exports = AuthController
