import { RequestHandler } from 'express';

/**
 * Middleware to extract recipe data from FormData requests
 * This parses the JSON string in the 'recipe' field of multipart form data
 * and adds it to the request body
 */
const extractRecipeData: RequestHandler = (req, res, next) => {
  try {
    console.log('Processing multipart request...');
    console.log('Request body:', req.body);
    console.log('Image uploaded:', req.file ? req.file.filename : 'No image');
    
    // Check if this is a multipart form request with a 'recipe' field
    if (req.body && req.body.recipe && typeof req.body.recipe === 'string') {
      console.log('Found recipe data in multipart form');
      // Parse the JSON string
      const recipeData = JSON.parse(req.body.recipe);
      console.log('Parsed recipe data:', recipeData);
      
      // Replace the request body with the parsed JSON data
      req.body = recipeData;
      
      // Keep track of the fact that this was multipart form data
      req.isMultipartRequest = true;
      console.log('Successfully processed multipart form data');
    } else {
      console.log('No recipe data found in multipart form or not a multipart request');
    }
    
    next();
  } catch (error) {
    console.error('Error extracting recipe data:', error);
    next({
      statusCode: 400,
      message: 'Invalid recipe data format',
      details: error instanceof Error ? error.message : 'Failed to parse recipe data'
    });
  }
};

export default extractRecipeData;

// Add declaration merging to extend the Express Request type
declare global {
  namespace Express {
    interface Request {
      isMultipartRequest?: boolean;
    }
  }
}
