'use strict'

const uuid = require('node-uuid')
const passgen = require('pass-gen')

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
      yield request
        .with({ errors: [ { message: ex.message } ] })
        .flash()

      response.redirect('back')
      return;
    }

    if (!login) {
      yield request
        .withOnly('identifier')
        .andWith({ errors: [ { message: 'Invalid username or password' } ] })
        .flash()

      response.redirect('back')
      return
    }

    yield response.redirect('/')
  }

  * logout (request, response) {
    yield response.sendView('logout')
  }

  * signup (request, response) {
    const data = request.only('username', 'email')

    const rules = {
      username: 'required|unique:users',
      email: 'required|email|unique:users'
    }

    const validation = yield Validator.validate(data, rules)

    if (validation.fails()) {
      const messages = validation.messages();
      console.log(messages)
      yield request
        .withOnly('username', 'email')
        .andWith({ errors: validation.messages() })
        .flash()

      response.redirect('back')
      return
    }

    data.password = AuthController.makePassword()
    try {
      yield User.create({
        id: uuid.v4(),
        username: data.username,
        email: data.email,
        password: data.password,
      })
    } catch (ex) {
      yield request
        .with({ errors: [ { message: ex.message } ] })
        .flash()

      response.redirect('back')
      return;
    }

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
