'use strict'

const uuid = require('node-uuid')

const Env = use('Env')
const Hash = use('Hash')
const Mail = use('Mail')
const Validator = use('Validator')

const EmailToken = use('App/Model/EmailToken')
const User = use('App/Model/User')

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

    const emailToken = yield user.emailTokens().create({ email: user.email })

    const model = {
      base_url: Env.get('BASE_URL'),
      email_token: emailToken.token
    }
    yield Mail.send([ null, 'emails.reset-password' ], model, (message) => {
      message.to(user.email)
      message.from(Env.get('MAIL_FROM_EMAIL'), Env.get('MAIL_FROM_NAME'))
      message.subject('Reset password')
    })

    yield response.sendView('auth/forgot-done', { success: 'Email with instructions has been sent.' })
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

    let user
    try {
      user = yield request.auth.validate(data.identifier, data.password, true)
    } catch (UserNotFoundException) {
      yield request.withOnly('identifier').andWith({ error: 'Invalid username or password.' }).flash()
      response.redirect('back')
      return
    }

    if (!user.confirmed) {
      yield request.withOnly('identifier').andWith({ error: 'Account has not been confirmed.' }).flash()
      response.redirect('back')
      return
    }

    let login = yield request.auth.login(user)
    if (!login) {
      yield request.withOnly('identifier').andWith({ error: 'Invalid username or password.' }).flash()
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

  * setPassword (request, response) {

    const token = request.param('token')
    const emailToken = (yield EmailToken.query().where('token', token).fetch()).first()
    if (!emailToken) {
      throw new Exceptions.ModelNotFoundException('token-not-found')
    }

    if (request.method() == 'POST') {
      const user = yield emailToken.user().fetch()
      const data = request.only('old_password', 'new_password', 'confirmation')

      const rules = {
        new_password: 'required|min:8',
        confirmation: 'required_if:password|same:new_password'
      }

      const validation = yield Validator.validate(data, rules)

      if (validation.fails()) {
        yield request.with({ errors: validation.messages() }).flash()
        response.redirect('back')
        return
      }

      if (emailToken.confirm()) {
        user.password = yield Hash.make(data.new_password)

        yield user.save()
        yield emailToken.save()

        yield request.with({ success: 'Password successfully updated.' }).flash();
        response.redirect('/login')
        return
      }
    }

    yield response.sendView('auth/set-password', { token })
  }

  * signup (request, response) {
    const data = request.only('username', 'email', 'password', 'confirmation')

    const rules = {
      username: [ 'required', 'min:2', 'regex:^[a-zA-Z0-9\._]+$', 'unique:users' ],
      email: 'required|email|unique:users',
      password: 'required|min:8',
      confirmation: 'required_if:password|same:password'
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

    const user = yield User.create({
      id: uuid.v4(),
      username: data.username,
      email: data.email,
      password: data.password,
    })

    const emailToken = yield user.emailTokens().create({ email: user.email })

    const model = {
      base_url: Env.get('BASE_URL'),
      email_token: emailToken.token
    }
    yield Mail.send([ null, 'emails.account-activation' ], model, (message) => {
      message.to(user.email)
      message.from(Env.get('MAIL_FROM_EMAIL'), Env.get('MAIL_FROM_NAME'))
      message.subject('Confirm your new account')
    })

    yield response.sendView('auth/signup-done', { success: 'Successfully signed up. Email with instructions has been sent.' })
  }

}

module.exports = AuthController
