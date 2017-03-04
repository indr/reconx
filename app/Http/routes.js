'use strict'

/*
 |--------------------------------------------------------------------------
 | Router
 |--------------------------------------------------------------------------
 |
 | AdonisJs Router helps you in defining urls and their actions. It supports
 | all major HTTP conventions to keep your routes file descriptive and
 | clean.
 |
 | @example
 | Route.get('/user', 'UserController.index')
 | Route.post('/user', 'UserController.store')
 | Route.resource('user', 'UserController')
 */

const Route = use('Route')

Route.get('/', 'ProfilesController.index')
Route.on('/about').render('about')
Route.on('/contact').render('contact')

// Auth
Route.group('auth-routes', () => {
  Route.on('/forgot').render('auth/forgot')
  Route.post('/forgot', 'AuthController.forgot')
  Route.on('/login').render('auth/login')
  Route.post('/login', 'AuthController.login')
  Route.get('/logout', 'AuthController.logout')
  Route.post('/account/password-reset/:token', 'AuthController.setPassword')
  Route.get('/account/password-reset/:token', 'AuthController.setPassword')
  Route.on('/signup').render('auth/signup')
  Route.post('/signup', 'AuthController.signup')
  Route.post('/account/activate/:token', 'AccountController.activate')
  Route.get('/account/activate/:token', 'AccountController.activate')
})

// Account
Route.group('account-auth-routes', () => {
  Route.get('/account/edit', 'AccountController.edit')
  Route.post('/account/edit', 'AccountController.update')
  Route.get('/account/delete', 'AccountController.showDelete')
  Route.post('/account/delete', 'AccountController.destroy')
  Route.get('/account/password', 'AccountController.showPassword')
  Route.post('/account/password', 'AccountController.updatePassword')
}).middleware('auth')

// Profile
Route.get('/:username', 'ProfileController.show')
Route.get('/:username/edit', 'ProfileController.edit').middleware('auth')
Route.post('/:username/edit', 'ProfileController.update').middleware('auth')
Route.get('/:username/followers', 'ProfileController.followers')
Route.get('/:username/following', 'ProfileController.following')

Route.post('/api/profiles/:follower/follows/:followed', 'ProfilesController.follow').middleware('auth')
Route.delete('/api/profiles/:follower/follows/:followed', 'ProfilesController.unfollow').middleware('auth')
