const User = require('../models/User');

// 🔍 Find a user by email
async function findUserByEmail(email) {
  return await User.findOne({ email });
}

// 🧾 Find a user by ID
async function findUserById(userId) {
  return await User.findById(userId);
}

// 💾 Add a recipe to a user's savedRecipes array
async function saveRecipeToUser(userId, recipeId) {
  return await User.findByIdAndUpdate(
    userId,
    { $addToSet: { savedRecipes: recipeId } }, // prevents duplicates
    { new: true }
  );
}

// 🧹 Remove a saved recipe
async function removeRecipeFromUser(userId, recipeId) {
  return await User.findByIdAndUpdate(
    userId,
    { $pull: { savedRecipes: recipeId } },
    { new: true }
  );
}

module.exports = {
  findUserByEmail,
  findUserById,
  saveRecipeToUser,
  removeRecipeFromUser,
};
