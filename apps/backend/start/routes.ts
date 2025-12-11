/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/
router.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/
router.group(() => {
  /*
  |--------------------------------------------------------------------------
  | Auth Routes (Public)
  |--------------------------------------------------------------------------
  */
  router.post('/auth/register', '#controllers/auth_controller.register')
  router.post('/auth/login', '#controllers/auth_controller.login')

  /*
  |--------------------------------------------------------------------------
  | Auth Routes (Protected)
  |--------------------------------------------------------------------------
  */
  router.group(() => {
    router.post('/auth/logout', '#controllers/auth_controller.logout')
    router.get('/auth/me', '#controllers/auth_controller.me')
    router.post('/auth/refresh', '#controllers/auth_controller.refresh')
  }).use(middleware.auth())

  /*
  |--------------------------------------------------------------------------
  | Protected Routes
  |--------------------------------------------------------------------------
  */
  router.group(() => {
    // User routes
    router.get('/users/me', '#controllers/auth_controller.me')
    
    // Family routes
    router.get('/families', '#controllers/families_controller.index')
    router.post('/families', '#controllers/families_controller.store')
    router.post('/families/join', '#controllers/families_controller.join')
    router.get('/families/:id', '#controllers/families_controller.show')
    router.delete('/families/:id/leave', '#controllers/families_controller.leave')
    router.put('/families/:id/preferences', '#controllers/families_controller.updatePreferences')
    
    // Fridge inventory routes
    router.get('/fridge', '#controllers/fridge_controller.index')
    router.get('/fridge/expiring', '#controllers/fridge_controller.expiring')
    router.post('/fridge', '#controllers/fridge_controller.store')
    router.put('/fridge/:id', '#controllers/fridge_controller.update')
    router.delete('/fridge/:id', '#controllers/fridge_controller.destroy')
    router.post('/fridge/:id/consume', '#controllers/fridge_controller.consume')
    
    // Shopping list routes
    router.get('/shopping', '#controllers/shopping_controller.index')
    router.post('/shopping', '#controllers/shopping_controller.store')
    router.put('/shopping/:id', '#controllers/shopping_controller.update')
    router.delete('/shopping/:id', '#controllers/shopping_controller.destroy')
    router.post('/shopping/:id/toggle', '#controllers/shopping_controller.toggle')
    router.delete('/shopping/clear-purchased', '#controllers/shopping_controller.clearPurchased')
    
    // Recipes routes
    router.get('/recipes', '#controllers/recipes_controller.index')
    router.get('/recipes/suggestions', '#controllers/recipes_controller.suggestions')
    router.get('/recipes/family', '#controllers/recipes_controller.familyRecipes')
    router.post('/recipes/family', '#controllers/recipes_controller.createFamilyRecipe')
    router.put('/recipes/family/:id', '#controllers/recipes_controller.updateFamilyRecipe')
    router.delete('/recipes/family/:id', '#controllers/recipes_controller.deleteFamilyRecipe')
    router.get('/recipes/:id', '#controllers/recipes_controller.show')

    // Receipt scanning
    router.post('/receipts/scan', '#controllers/receipt_controller.scan')
  }).use(middleware.auth())
  
}).prefix('/api/v1')
