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

Route.on('/').render('welcome')
Route.on('/about').render('about')
Route.on('/contact').render('contact')
Route.on('/forgot').render('forgot')
Route.on('/login').render('login')
Route.on('/logout').render('logout')
Route.on('/signup').render('signup')

Route.on('/account').render('account/view')
Route.on('/account/edit').render('account/edit')
Route.on('/account/delete').render('account/delete')

Route.on('/profile').render('profile')
Route.on('/profile/edit').render('profile/edit')
Route.on('/profile/followers').render('followers')
Route.on('/profile/following').render('following')


