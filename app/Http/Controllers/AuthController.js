'use strict'

const uuid = require('node-uuid')
const passgen = require('pass-gen')

const Env = use('Env')
const Hash = use('Hash')
const Mail = use('Mail')
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

    const user = (yield User.query().where('email', data.email).fetch()).first()
    if (!user) {
      // throw new Exceptions.ModelNotFoundException('email-not-found')
      yield request.withOnly('email').andWith({ error: 'Email not found.' }).flash()
      response.redirect('back')
      return
    }

    const model = {
      base_url: Env.get('BASE_URL'),
      email_token: 'emailToken'
    }
    yield Mail.send([ null, 'emails.reset-password' ], model, (message) => {
      message.to(user.email)
      message.from(Env.get('MAIL_FROM_EMAIL'), Env.get('MAIL_FROM_NAME'))
      message.subject('Reset password')
    })

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
    const user = yield User.create({
      id: uuid.v4(),
      username: data.username,
      email: data.email,
      password: data.password,
    })

    const model = {
      base_url: Env.get('BASE_URL'),
      email_token: 'emailToken'
    }
    yield Mail.send([ null, 'emails.account-activation' ], model, (message) => {
      message.to(user.email)
      message.from(Env.get('MAIL_FROM_EMAIL'), Env.get('MAIL_FROM_NAME'))
      message.subject('Confirm your new account')
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
