const Recipe = require('../models/Recipe');

// ➕ Create a new recipe
async function createRecipe(data) {
  const recipe = new Recipe(data);
  return await recipe.save();
}

// 🔍 Get all recipes
async function getAllRecipes() {
  return await Recipe.find();
}

// 🔎 Get recipe by ID
async function getRecipeById(recipeId) {
  return await Recipe.findById(recipeId);
}

// 📁 Get recipes created by a specific user
async function getRecipesByUser(email) {
  return await Recipe.find({ createdBy: email });
}

module.exports = {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  getRecipesByUser,
};
