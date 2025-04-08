const connectDB = require('../db');
const { getRecipesByUser } = require('../queries/recipeQueries');

const run = async () => {
  await connectDB();

  const recipes = await getRecipesByUser('xander@example.com');
  console.log('📋 Recipes created by user:');
  console.log(recipes);

  process.exit();
};

run();

