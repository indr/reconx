'use strict'

const Env = use('Env')
const Hash = use('Hash')
const Mail = use('Mail')
const Validator = use('Validator')

const EmailToken = use('App/Model/EmailToken')
const Exceptions = use('App/Exceptions')

class AccountController {

  * activate (request, response) {

    const token = request.param('token')
    const emailToken = (yield EmailToken.query().where('token', token).fetch()).first()
    if (!emailToken) {
      throw new Exceptions.ModelNotFoundException('token-not-found')
    }

    if (request.method() == 'POST') {
      const user = yield emailToken.user().fetch()
      if (emailToken.confirm()) {
        user.confirmed = true

        yield user.save()
        yield emailToken.save()

        yield request.with({ success: 'Account successfully activated.' }).flash();
        response.redirect('/login')
        return
      }
    }

    yield response.sendView('account/activate', { token })
  }

  * edit (request, response) {
    yield response.sendView('account/edit')
  }

  * update (request, response) {
    const user = request.currentUser
    const data = request.only('username')

    const rules = {}
    if (user.username != data.username) {
      rules.username = [ 'required', 'min:2', 'regex:^[a-za-z0-9\-_]+$', 'unique:users' ]
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

  * showPassword (request, response) {
    yield response.sendView('account/password')
  }

  * updatePassword (request, response) {
    const user = request.currentUser
    const data = request.only('old_password', 'new_password', 'confirmation')

    const rules = {
      old_password: 'required',
      new_password: 'required|min:8',
      confirmation: 'required_if:password|same:new_password'
    }

    const validation = yield Validator.validate(data, rules)

    if (validation.fails()) {
      yield request.with({ errors: validation.messages() }).flash()
      response.redirect('back')
      return
    }

    try {
      yield request.auth.validate(user.email, data.old_password)
    } catch (ex) {
      if (ex.name == 'PasswordMisMatchException') {
        yield request.with({ error: ex.message }).flash()
        response.redirect('back')
        return
      }
      throw ex
    }

    user.password = yield Hash.make(data.new_password)
    yield user.save()

    yield request.with({ success: 'Password successfully updated.' }).flash()
    yield response.redirect('/account/edit')
  }

  * showDelete (request, response) {
    yield response.sendView('account/delete')
  }

  * destroy (request, response) {
    const data = request.only('password')

    const rules = { password: 'required' }
    const validation = yield Validator.validate(data, rules)

    if (validation.fails()) {
      yield request.with({ errors: validation.messages() }).flash()
      response.redirect('back')
      return
    }

    const email = request.currentUser.email
    try {
      yield request.auth.validate(email, data.password)
      yield request.auth.logout()
      yield request.currentUser.delete()

      const model = {
        base_url: Env.get('BASE_URL')
      }
      yield Mail.send([ null, 'emails.account-deleted' ], model, (message) => {
        message.to(email)
        message.from(Env.get('MAIL_FROM_EMAIL'), Env.get('MAIL_FROM_NAME'))
        message.subject('Account deleted')
      })

      yield request
        .with({ success: 'Account successfully deleted.' })
        .flash()

      yield response.redirect('/')
    } catch (ex) {
      if (ex.name == 'PasswordMisMatchException') {
        yield request.with({ error: ex.message }).flash()
        response.redirect('back')
        return
      }
      throw ex
    }
  }

}

module.exports = AccountController
