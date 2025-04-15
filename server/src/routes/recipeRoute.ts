import { Router } from 'express';
import {
  saveRecipe,
  loadRecipe,
  getRecipeById,
  updateRecipe,
  deleteRecipe
} from '../controllers/recipe/recipeControl';
import { searchProductsHandler } from '../controllers/recipe/productSearch';
import checkBearerToken from '../middlewares/check-bearer-token';
import errorHandler from '../middlewares/error-handler';

const router = Router();

// GET all recipes (with authentication)
router.get('/recipes', [checkBearerToken], loadRecipe, errorHandler);

// GET single recipe by ID (with authentication)
router.get('/recipes/:id', [checkBearerToken], getRecipeById, errorHandler);

// POST new recipe (with authentication)
router.post('/recipes', [checkBearerToken], saveRecipe, errorHandler);

// PUT/update recipe (with authentication)
router.put('/recipes/:id', [checkBearerToken], updateRecipe, errorHandler);

// DELETE recipe (with authentication)
router.delete('/recipes/:id', [checkBearerToken], deleteRecipe, errorHandler);

// GET product search (with authentication)
router.get('/products/search', [checkBearerToken], searchProductsHandler, errorHandler);

export default router;
