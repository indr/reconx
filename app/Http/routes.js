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

Route.on('/forgot').render('forgot')
Route.post('/forgot', 'AuthController.forgot')
Route.on('/login').render('login')
Route.post('/login', 'AuthController.login')
Route.get('/logout', 'AuthController.logout')
Route.on('/signup').render('signup')
Route.post('/signup', 'AuthController.signup')

Route.on('/account/edit').render('account/edit')
Route.post('/account/edit', 'AuthController.update')
Route.on('/account/delete').render('account/delete')
Route.post('/account/delete', 'AuthController.delete')
Route.on('/account/password').render('account/password')
Route.post('/account/password', 'AuthController.setPassword')

Route.on('/profile').render('profile')
Route.on('/profile/edit').render('profile/edit')
Route.on('/profile/followers').render('followers')
Route.on('/profile/following').render('following')


