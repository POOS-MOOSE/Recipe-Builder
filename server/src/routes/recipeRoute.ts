import { Router } from 'express'
import createRecipe from '../controllers/auth/recipeControl'  // import the controller function

const router = Router()

router.post('/recipes', createRecipe)

export default router
