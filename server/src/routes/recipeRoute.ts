import { Router } from 'express';
import {
  saveRecipe,
  loadRecipe,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getRecipeImage
} from '../controllers/recipe/recipeControl';
import { upload } from '../utils/imageUpload';
import extractRecipeData from '../middlewares/extract-recipe-data';
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

// POST new recipe with image upload (with authentication)
router.post('/recipes/with-image', [checkBearerToken], upload.single('image'), extractRecipeData, saveRecipe, errorHandler);

// PUT/update recipe (with authentication)
router.put('/recipes/:id', [checkBearerToken], updateRecipe, errorHandler);

// PUT/update recipe with image upload (with authentication)
router.put('/recipes/:id/with-image', [checkBearerToken], upload.single('image'), extractRecipeData, updateRecipe, errorHandler);

// DELETE recipe (with authentication)
router.delete('/recipes/:id', [checkBearerToken], deleteRecipe, errorHandler);

// GET product search (with authentication)
router.get('/products/search', [checkBearerToken], searchProductsHandler, errorHandler);

// GET recipe image (no authentication required)
// Using a more specific path to avoid client-side routing conflicts
router.get('/image-content/:imageId', getRecipeImage, errorHandler);

export default router;
