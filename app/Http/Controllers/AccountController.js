'use strict'

const Hash = use('Hash')
const Validator = use('Validator')

class AccountController {

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
      return;
    }

    const email = request.currentUser.email
    try {
      yield request.auth.validate(email, data.password)
      yield request.auth.logout()
      yield request.currentUser.delete()

      yield request
        .with({ success: 'Account successfully deleted.' })
        .flash();

      yield response.redirect('/')
    } catch (ex) {
      if (ex.name == 'PasswordMisMatchException') {
        yield request.with({ error: ex.message }).flash()
        response.redirect('back')
        return
      }
      throw ex;
    }
  }

}

module.exports = AccountController
