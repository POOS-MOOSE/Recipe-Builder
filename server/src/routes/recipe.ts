import express from 'express'
import checkBearerToken from '../middlewares/check-bearer-token'
import errorHandler from '../middlewares/error-handler'
import register from '../controllers/auth/register'

// initialize router
const router = express.Router()

// TODO (andrew): add some routes here.

export default router
