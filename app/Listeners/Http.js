'use strict'

const Env = use('Env')
const Youch = use('youch')
const Http = exports = module.exports = {}

const View = use('View')
const markdown = require('nunjucks-markdown')
const showdown = require('showdown')

/**
 * handle errors occured during a Http request.
 *
 * @param  {Object} error
 * @param  {Object} request
 * @param  {Object} response
 */
Http.handleError = function * (error, request, response) {
  const status = error.status || 500

  /**
   * DEVELOPMENT REPORTER
   */
  if (Env.get('NODE_ENV') === 'development') {
    const youch = new Youch(error, request.request)
    const type = request.accepts('json', 'html')
    const formatMethod = type === 'json' ? 'toJSON' : 'toHTML'
    const formattedErrors = yield youch[ formatMethod ]()
    response.status(status).send(formattedErrors)
    return
  }

  /**
   * PRODUCTION REPORTER
   */
  console.error(error.stack)
  yield response.status(status).sendView('errors/index', { error })
}

/**
 * listener for Http.start event, emitted after
 * starting http server.
 */
Http.onStart = function () {

  markdown.register(View.viewsEnv, function (text) {
    const converter = new showdown.Converter()
    converter.setFlavor('github')
    converter.setOption('ghMentionsLink', '/{u}')
    converter.setOption('encodeEmails', true)
    return converter.makeHtml(text)
  });
}


