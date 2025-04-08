// db.js
const mongoose = require('mongoose');

const uri = 'mongodb+srv://recipeUser:recipeUserPassword@recipedb.tz4gg7q.mongodb.net/?retryWrites=true&w=majority&appName=RecipeDB';

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
