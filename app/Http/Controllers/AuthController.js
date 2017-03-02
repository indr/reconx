'use strict'

const uuid = require('node-uuid')
const passgen = require('pass-gen')

const Hash = use('Hash')
const User = use('App/Model/User')
const Validator = use('Validator')

class AuthController {

  * delete (request, response) {
    const data = request.only('password')

    const rules = { password: 'required' }
    const validation = yield Validator.validate(data, rules)

    if (validation.fails()) {
      yield request.with({ errors: validation.messages() }).flash()
      response.redirect('back')
      return;
    }

    const email = request.currentUser.email
    yield request.auth.validate(email, data.password)
    yield request.auth.logout()
    yield request.currentUser.delete()

    yield request
      .with({ success: 'Account successfully deleted.' })
      .flash();

    yield response.redirect('/')
  }

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
    login = yield request.auth.attempt(data.identifier, data.password)
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
    yield request.auth.logout();

    yield request
      .with({ success: 'Successfully logged out.' })
      .flash();

    response.redirect('/');
  }

  * update (request, response) {
    const user = request.currentUser
    const data = request.only('username', 'password', 'confirm')

    const rules = {
      username: 'required|min:2|alpha_numeric|unique:users'
    }

    const validation = yield Validator.validate(data, rules)

    if (validation.fails()) {
      yield request.withOnly('username').andWith({ errors: validation.messages() }).flash()
      response.redirect('back')
      return
    }

    user.username = data.username
    yield user.save()

    yield request.with({ success: 'Account successfully updated.' }).flash()
    response.redirect('back')
  }

  * setPassword (request, response) {
    const user = request.currentUser
    const data = request.only('password', 'confirmation')

    const rules = {
      password: 'required|min:8',
      confirmation: 'required_if:password|same:password'
    }

    const validation = yield Validator.validate(data, rules)

    if (validation.fails()) {
      yield request.with({ errors: validation.messages() }).flash()
      response.redirect('back')
      return
    }

    user.password = yield Hash.make(data.password)
    yield user.save()

    yield request.with({ success: 'Password successfully updated.' }).flash()
    yield response.redirect('back')
  }

  * signup (request, response) {
    const data = request.only('username', 'email')

    const rules = {
      username: 'required|min:2|alpha_numeric|unique:users',
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
