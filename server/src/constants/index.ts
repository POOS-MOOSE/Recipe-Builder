// Set NODE_ENV based on how we're running the server
// When run with 'npm run dev', it will be in development mode
// When run with 'npm run build && npm start', it will be in production mode
const NODE_ENV = process.env.NODE_ENV || 'development'
const isProd = NODE_ENV === 'production'

// Configure CORS settings based on environment
const ORIGIN = isProd 
  ? 'http://server.fullybaked.me' // Production domain
  : '*' // Allow all origins in development

const PORT = process.env.PORT || 8080

// For "MongoDB Atlas": edit MONGO_URI in -> .env file
// For "MongoDB Community Server": edit <DB_NAME> in -> MONGO_URI below
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://recipeUser:recipeUserPassword@recipedb.tz4gg7q.mongodb.net/?retryWrites=true&w=majority&appName=RecipeDB'
const MONGO_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}

const JWT_SECRET = process.env.JWT_SECRET || 'unsafe_secret'

const BASE_URL = isProd
  ? 'http://server.fullybaked.me' // Production domain
  : `http://localhost:${PORT}` // Development URL

export { 
  NODE_ENV, 
  isProd, 
  ORIGIN, 
  PORT, 
  MONGO_URI, 
  MONGO_OPTIONS, 
  JWT_SECRET,
  BASE_URL 
}
