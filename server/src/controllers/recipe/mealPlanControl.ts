import { RequestHandler } from 'express';
import MealPlan from '../../models/mealPlanModel';
import joi from '../../utils/joi';

// Create a new meal plan
const saveMealPlan: RequestHandler = async (req, res, next) => {
  try {
    console.log("Attempting to save meal plan");
    
    // Get the user ID from the auth token
    const userId = req.auth?.uid;
    
    if (!userId) {
      return next({
        statusCode: 401,
        message: 'Authentication required to save meal plan'
      });
    }
    
    // Validate the incoming meal plan data
    const validationError = await joi.validate(
      {
        title: joi.instance.string().required(),
        recipeIds: joi.instance.array().items(
          joi.instance.string().required()
        ).required()
      },
      req.body
    );

    if (validationError) {
      return next(validationError);
    }

    // Create a new meal plan instance
    const mealPlan = new MealPlan({
      ...req.body,
      createdBy: userId, // Set creator to the authenticated user
      dateCreated: new Date()
    });
    
    // Save the meal plan to the database
    await mealPlan.save();
    
    console.log("Meal plan saved successfully:", mealPlan._id);
    res.status(201).json({
      message: 'Meal plan saved successfully',
      data: mealPlan
    });
  } catch (error) {
    console.error("Error saving meal plan:", error);
    next({
      statusCode: 500,
      message: 'Failed to save meal plan'
    });
  }
};

// Get all meal plans for the authenticated user
const loadMealPlans: RequestHandler = async (req, res, next) => {
  try {
    // Get the user ID from the auth token
    const userId = req.auth?.uid;
    
    if (!userId) {
      return next({
        statusCode: 401,
        message: 'Authentication required to load meal plans'
      });
    }
    
    // Find all meal plans for this user
    const mealPlans = await MealPlan.find({ createdBy: userId }).populate('recipeIds');
    
    console.log(`Found ${mealPlans.length} meal plans for user ${userId}`);
    res.status(200).json({
      message: 'Meal plans retrieved successfully',
      data: mealPlans
    });
  } catch (error) {
    console.error("Error loading meal plans:", error);
    next({
      statusCode: 500,
      message: 'Failed to load meal plans'
    });
  }
};

// Get a single meal plan by ID
const getMealPlanById: RequestHandler = async (req, res, next) => {
  try {
    // Get the user ID from the auth token
    const userId = req.auth?.uid;
    
    if (!userId) {
      return next({
        statusCode: 401,
        message: 'Authentication required to get meal plan'
      });
    }
    
    // Find the meal plan by ID
    const mealPlan = await MealPlan.findById(req.params.id).populate('recipeIds');
    
    if (!mealPlan) {
      return next({
        statusCode: 404,
        message: 'Meal plan not found'
      });
    }
    
    // Ensure the user owns this meal plan
    if (mealPlan.createdBy !== userId) {
      return next({
        statusCode: 403,
        message: 'Access denied: You can only view your own meal plans'
      });
    }
    
    res.status(200).json({
      message: 'Meal plan retrieved successfully',
      data: mealPlan
    });
  } catch (error) {
    console.error("Error getting meal plan:", error);
    next({
      statusCode: 500,
      message: 'Failed to get meal plan'
    });
  }
};

// Update a meal plan
const updateMealPlan: RequestHandler = async (req, res, next) => {
  try {
    // Get the user ID from the auth token
    const userId = req.auth?.uid;
    
    if (!userId) {
      return next({
        statusCode: 401,
        message: 'Authentication required to update meal plan'
      });
    }
    
    // First check if the meal plan exists and belongs to the user
    const existingMealPlan = await MealPlan.findById(req.params.id);
    
    if (!existingMealPlan) {
      return next({
        statusCode: 404,
        message: 'Meal plan not found'
      });
    }
    
    // Ensure the user owns this meal plan
    if (existingMealPlan.createdBy !== userId) {
      return next({
        statusCode: 403,
        message: 'Access denied: You can only update your own meal plans'
      });
    }
    
    // Validate the incoming meal plan data
    const validationError = await joi.validate(
      {
        title: joi.instance.string().required(),
        recipeIds: joi.instance.array().items(
          joi.instance.string().required()
        ).required()
      },
      req.body
    );

    if (validationError) {
      return next(validationError);
    }
    
    // Update the meal plan
    const updatedMealPlan = await MealPlan.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title: req.body.title,
          recipeIds: req.body.recipeIds
        }
      },
      { new: true }
    ).populate('recipeIds');
    
    res.status(200).json({
      message: 'Meal plan updated successfully',
      data: updatedMealPlan
    });
  } catch (error) {
    console.error("Error updating meal plan:", error);
    next({
      statusCode: 500,
      message: 'Failed to update meal plan'
    });
  }
};

// Delete a meal plan
const deleteMealPlan: RequestHandler = async (req, res, next) => {
  try {
    // Get the user ID from the auth token
    const userId = req.auth?.uid;
    
    if (!userId) {
      return next({
        statusCode: 401,
        message: 'Authentication required to delete meal plan'
      });
    }
    
    // First check if the meal plan exists and belongs to the user
    const existingMealPlan = await MealPlan.findById(req.params.id);
    
    if (!existingMealPlan) {
      return next({
        statusCode: 404,
        message: 'Meal plan not found'
      });
    }
    
    // Ensure the user owns this meal plan
    if (existingMealPlan.createdBy !== userId) {
      return next({
        statusCode: 403,
        message: 'Access denied: You can only delete your own meal plans'
      });
    }
    
    // Delete the meal plan
    await MealPlan.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      message: 'Meal plan deleted successfully'
    });
  } catch (error) {
    console.error("Error deleting meal plan:", error);
    next({
      statusCode: 500,
      message: 'Failed to delete meal plan'
    });
  }
};

export { saveMealPlan, loadMealPlans, getMealPlanById, updateMealPlan, deleteMealPlan };
