'use strict'

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

    yield response.redirect('/')
  }

  * logout (request, response) {
    yield response.sendView('logout')
  }

  * signup (request, response) {
    const data = request.only('username', 'email')

    const rules = {
      username: 'required',
      email: 'required|email'
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

    yield request
      .with({ success: 'Successfully signed up. Email with instructions has been sent.' })
      .flash()
    response.redirect('/login')
  }
}

module.exports = AuthController
