import { RequestHandler } from 'express';
import Recipe from '../../models/recipeModel';
import joi from '../../utils/joi';
import path from 'path';
import fs from 'fs';

const saveRecipe: RequestHandler = async (req, res, next) => {
  try {
    console.log("Attempting to save recipe");
    
    // Get the user ID from the auth token
    const userId = req.auth?.uid;
    
    if (!userId) {
      return next({
        statusCode: 401,
        message: 'Authentication required to save recipe'
      });
    }
    
    // Validate the incoming recipe data
    const validationError = await joi.validate(
      {
        name: joi.instance.string().required(),
        ingredients: joi.instance.array().items(
          joi.instance.object({
            name: joi.instance.string().required(),
            quantity: joi.instance.string().required(),
            walmartProductId: joi.instance.string().optional(),
            image: joi.instance.string().optional(),
            price: joi.instance.number().optional(),
            currency: joi.instance.string().optional()
          })
        ).required(),
        instructions: joi.instance.string().required()
      },
      req.body
    );

    if (validationError) {
      return next(validationError);
    }

    // Create a new recipe instance with possible image ID from multipart form handling
    const recipe = new Recipe({
      ...req.body,
      imageId: req.imageId || req.body.imageId, // Use the imageId from multer or from the request body
      createdBy: userId, // Set creator to the authenticated user
      dateCreated: new Date()
    });
    
    // Save the recipe to the database
    await recipe.save();
    
    console.log("Recipe saved successfully:", recipe._id);
    res.status(201).json({
      message: 'Recipe saved successfully',
      data: recipe
    });
  } catch (error) {
    console.error("Error saving recipe:", error);
    next({
      statusCode: 400,
      message: 'Failed to save recipe',
      details: error instanceof Error ? error.message : 'Invalid recipe data'
    });
  }
};

const loadRecipe: RequestHandler = async (req, res, next) => {
  try {
    // Get the user ID from the auth token
    const userId = req.auth?.uid;
    
    if (!userId) {
      return next({
        statusCode: 401,
        message: 'Authentication required to view recipes'
      });
    }

    // Find recipes created by this user
    const recipes = await Recipe.find({ createdBy: userId });
    
    console.log(`Found ${recipes.length} recipes for user ${userId}`);
    
    res.status(200).json({
      message: 'Recipes loaded successfully',
      data: recipes
    });
  } catch (error) {
    console.error("Error loading recipes:", error);
    next({
      statusCode: 500,
      message: 'Failed to load recipes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

const getRecipeById: RequestHandler = async (req, res, next) => {
  try {
    // Get the user ID from the auth token
    const userId = req.auth?.uid;
    
    if (!userId) {
      return next({
        statusCode: 401,
        message: 'Authentication required to view recipe'
      });
    }

    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return next({
        statusCode: 404,
        message: 'Recipe not found'
      });
    }
    
    // Ensure the user owns this recipe
    if (recipe.createdBy !== userId) {
      return next({
        statusCode: 403,
        message: 'Access denied: You can only view your own recipes'
      });
    }
    
    res.status(200).json({
      message: 'Recipe loaded successfully',
      data: recipe
    });
  } catch (error) {
    console.error("Error getting recipe:", error);
    next({
      statusCode: 500,
      message: 'Failed to get recipe',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

const updateRecipe: RequestHandler = async (req, res, next) => {
  try {
    // Get the user ID from the auth token
    const userId = req.auth?.uid;
    
    if (!userId) {
      return next({
        statusCode: 401,
        message: 'Authentication required to update recipe'
      });
    }
    
    // First check if the recipe exists and belongs to the user
    const existingRecipe = await Recipe.findById(req.params.id);
    
    if (!existingRecipe) {
      return next({
        statusCode: 404,
        message: 'Recipe not found'
      });
    }
    
    // Ensure the user owns this recipe
    if (existingRecipe.createdBy !== userId) {
      return next({
        statusCode: 403,
        message: 'Access denied: You can only update your own recipes'
      });
    }
    
    // Validate the incoming recipe data
    const validationError = await joi.validate(
      {
        name: joi.instance.string().required(),
        ingredients: joi.instance.array().items(
          joi.instance.object({
            name: joi.instance.string().required(),
            quantity: joi.instance.string().required(),
            walmartProductId: joi.instance.string().optional(),
            image: joi.instance.string().optional(),
            price: joi.instance.number().optional(),
            currency: joi.instance.string().optional()
          })
        ).required(),
        instructions: joi.instance.string().required()
      },
      req.body
    );

    if (validationError) {
      return next(validationError);
    }
    
    // Check if there's a new image - if so, delete the old one if it exists
    if (req.imageId && existingRecipe.imageId) {
      try {
        // Use path.resolve for consistent path resolution across systems
        const uploadDir = path.resolve(__dirname, '../../../uploads/imgs');
        console.log('Looking for old image to replace in directory:', uploadDir);
        // Find all files that match the image ID pattern (to handle different extensions)
        const files = fs.readdirSync(uploadDir);
        const oldImageFile = files.find(file => file.startsWith(existingRecipe.imageId || ''));
        
        if (oldImageFile) {
          fs.unlinkSync(path.join(uploadDir, oldImageFile));
          console.log(`Deleted old image file: ${oldImageFile}`);
        }
      } catch (error) {
        console.error('Error deleting old image file:', error);
        // Continue with update even if file deletion fails
      }
    }
    
    // Update the recipe
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        imageId: req.imageId || req.body.imageId, // Use the imageId from multer or from the request body
        createdBy: userId // Keep the original creator
      },
      { new: true }
    );
    
    console.log("Recipe updated successfully:", updatedRecipe?._id);
    
    res.status(200).json({
      message: 'Recipe updated successfully',
      data: updatedRecipe
    });
  } catch (error) {
    console.error("Error updating recipe:", error);
    next({
      statusCode: 500,
      message: 'Failed to update recipe',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Image retrieval handler
const getRecipeImage: RequestHandler = async (req, res, next) => {
  try {
    const { imageId } = req.params;
    console.log('Retrieving image with ID:', imageId);
    
    if (!imageId) {
      return next({
        statusCode: 400,
        message: 'Image ID is required'
      });
    }
    
    // Use path.resolve for consistent path resolution across systems
    const uploadDir = path.resolve(__dirname, '../../../uploads/imgs');
    console.log('Looking for image in directory:', uploadDir);
    
    // Check if directory exists
    if (!fs.existsSync(uploadDir)) {
      console.error('Upload directory does not exist, creating it...');
      fs.mkdirSync(uploadDir, { recursive: true });
      return next({
        statusCode: 404,
        message: 'Image directory not found, created now but no images exist yet'
      });
    }
    
    // Find the file that matches the image ID pattern
    const files = fs.readdirSync(uploadDir);
    console.log('Files in directory:', files);
    
    const imageFile = files.find(file => file.startsWith(imageId));
    console.log('Matching image file:', imageFile || 'none found');
    
    if (!imageFile) {
      return next({
        statusCode: 404,
        message: 'Image not found'
      });
    }
    
    const fullImagePath = path.join(uploadDir, imageFile);
    console.log('Sending file:', fullImagePath);
    
    // Send the file
    return res.sendFile(fullImagePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        next({
          statusCode: 500,
          message: 'Failed to send file',
          details: err.message
        });
      } else {
        console.log('File sent successfully');
      }
    });
  } catch (error) {
    console.error('Error retrieving image:', error);
    return next({
      statusCode: 500,
      message: 'Failed to retrieve image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

const deleteRecipe: RequestHandler = async (req, res, next) => {
  try {
    // Get the user ID from the auth token
    const userId = req.auth?.uid;
    
    if (!userId) {
      return next({
        statusCode: 401,
        message: 'Authentication required to delete recipe'
      });
    }
    
    // First check if the recipe exists and belongs to the user
    const existingRecipe = await Recipe.findById(req.params.id);
    
    if (!existingRecipe) {
      return next({
        statusCode: 404,
        message: 'Recipe not found'
      });
    }
    
    // Ensure the user owns this recipe
    if (existingRecipe.createdBy !== userId) {
      return next({
        statusCode: 403,
        message: 'Access denied: You can only delete your own recipes'
      });
    }
    
    // If recipe has an image, delete it from the filesystem
    if (existingRecipe.imageId) {
      try {
        // Use path.resolve for consistent path resolution across systems
        const uploadDir = path.resolve(__dirname, '../../../uploads/imgs');
        console.log('Looking for image to delete in directory:', uploadDir);
        // Find all files that match the image ID pattern (to handle different extensions)
        const files = fs.readdirSync(uploadDir);
        const imageFile = files.find(file => file.startsWith(existingRecipe.imageId || ''));
        
        if (imageFile) {
          fs.unlinkSync(path.join(uploadDir, imageFile));
          console.log(`Deleted image file: ${imageFile}`);
        }
      } catch (error) {
        console.error('Error deleting image file:', error);
        // Continue with recipe deletion even if file deletion fails
      }
    }
    
    // Delete the recipe
    await Recipe.deleteOne({ _id: req.params.id });
    
    console.log("Recipe deleted successfully:", req.params.id);
    
    res.status(200).json({
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    next({
      statusCode: 500,
      message: 'Failed to delete recipe',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export { saveRecipe, loadRecipe, getRecipeById, updateRecipe, deleteRecipe, getRecipeImage };
