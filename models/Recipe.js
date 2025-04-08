const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  ingredients: [{
    name: String,
    quantity: String,
    walmartProductId: String, // Optional: Link to Walmart product
  }],
  instructions: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String, // user ID or email (can link to User later)
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Recipe', RecipeSchema);
