import { RequestHandler } from 'express'
import Recipe from '../../models/recipeModel'

const createRecipe: RequestHandler = async (req, res, next) => {
  try {
    const newRecipe = new Recipe({
      name: req.body.name,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions,
      createdBy: req.body.createdBy,
      dateCreated: new Date(),
    })

    await newRecipe.save()
    res.status(201).json({ message: 'Recipe created successfully!' })
  } catch (error: unknown) {
    if (error instanceof Error) {  // If we know what the error is
      next(error)  
    } else {
      next({
        statusCode: 500,
        message: 'An unexpected error occurred',
      })
    }
  }
}

export default createRecipe
