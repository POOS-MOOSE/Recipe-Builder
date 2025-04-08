const ORIGIN = '*'
const PORT = process.env.PORT || 8080

// For "MongoDB Atlas": edit MONGO_URI in -> .env file
// For "MongoDB Community Server": edit <DB_NAME> in -> MONGO_URI below
// TODO: this is very bad practive to add the uri here as is pushed to the repo...
// should be hidden away in an .env file
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://recipeUser:recipeUserPassword@recipedb.tz4gg7q.mongodb.net/?retryWrites=true&w=majority&appName=RecipeDB'
const MONGO_OPTIONS = {}

const JWT_SECRET = process.env.JWT_SECRET || 'unsafe_secret'

export { ORIGIN, PORT, MONGO_URI, MONGO_OPTIONS, JWT_SECRET }
