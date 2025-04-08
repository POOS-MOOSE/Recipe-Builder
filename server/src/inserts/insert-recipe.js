const connectDB = require('../db');
const Recipe = require('../models/Recipe');

const run = async () => {
  await connectDB();

  const testRecipe = new Recipe({
    name: "Peanut Butter & Jelly Sandwich",
    ingredients: [
      { name: "Bread", quantity: "2 slices" },
      { name: "Peanut Butter", quantity: "2 tbsp" },
      { name: "Jelly", quantity: "1 tbsp" }
    ],
    instructions: "Spread peanut butter and jelly on bread. Combine. Eat.",
    createdBy: "UwU@example.com"
  });

  await testRecipe.save();
  console.log("✅ Recipe saved!");
  process.exit();
};

run();
