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
Route.on('/forgot').render('forgot')
Route.post('/forgot', 'AuthController.forgot')
Route.on('/login').render('login')
Route.post('/login', 'AuthController.login')
Route.get('/logout', 'AuthController.logout')
Route.on('/signup').render('signup')
Route.post('/signup', 'AuthController.signup')

// Account
Route.get('/account/edit', 'AccountController.edit')
Route.post('/account/edit', 'AccountController.update')
Route.get('/account/delete', 'AccountController.showDelete')
Route.post('/account/delete', 'AccountController.destroy')
Route.get('/account/password', 'AccountController.showPassword')
Route.post('/account/password', 'AccountController.updatePassword')

// Profile
Route.get('/:username', 'ProfileController.show')
Route.get('/:username/edit', 'ProfileController.edit')
Route.post('/:username/edit', 'ProfileController.update')
Route.get('/:username/followers', 'ProfileController.followers')
Route.get('/:username/following', 'ProfileController.following')
