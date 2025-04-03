import express from 'express'
import cors from 'cors'
import { ORIGIN } from '../constants/index'

// initialize app
const app = express()

// middlewares
app.use(cors({ origin: ORIGIN }))
app.use(express.json()) // body parser
app.use(express.urlencoded({ extended: false })) // url parser

export default app
