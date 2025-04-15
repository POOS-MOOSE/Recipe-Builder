import { Router } from 'express';
import {
  saveMealPlan,
  loadMealPlans,
  getMealPlanById,
  updateMealPlan,
  deleteMealPlan
} from '../controllers/recipe/mealPlanControl';
import checkBearerToken from '../middlewares/check-bearer-token';
import errorHandler from '../middlewares/error-handler';

const router = Router();

// GET all meal plans (with authentication)
router.get('/meal-plans', [checkBearerToken], loadMealPlans, errorHandler);

// GET single meal plan by ID (with authentication)
router.get('/meal-plans/:id', [checkBearerToken], getMealPlanById, errorHandler);

// POST new meal plan (with authentication)
router.post('/meal-plans', [checkBearerToken], saveMealPlan, errorHandler);

// PUT/update meal plan (with authentication)
router.put('/meal-plans/:id', [checkBearerToken], updateMealPlan, errorHandler);

// DELETE meal plan (with authentication)
router.delete('/meal-plans/:id', [checkBearerToken], deleteMealPlan, errorHandler);

export default router;
