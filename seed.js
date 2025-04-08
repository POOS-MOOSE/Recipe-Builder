const connectDB = require('./db');
const User = require('./models/User');
const Recipe = require('./models/Recipe');
const Product = require('./models/Product');

const run = async () => {
  await connectDB();

  // Optional: Clear existing data
  await User.deleteMany({});
  await Recipe.deleteMany({});
  await Product.deleteMany({});

  // Create a user
  const user = new User({
    username: 'xander123',
    email: 'xander@example.com',
    passwordHash: 'hashed_password_here'
  });
  await user.save();

  // Create a product
  const product = new Product({
    name: 'JIF Creamy Peanut Butter, 16 oz',
    walmartItemId: 'jif12345',
    price: 3.49,
    imageUrl: 'https://example.com/jif.jpg',
    availability: true
  });
  await product.save();

  // Create a recipe using that product
  const recipe = new Recipe({
    name: 'PB&J Sandwich',
    ingredients: [
      { name: 'Bread', quantity: '2 slices' },
      { name: 'JIF Creamy Peanut Butter', quantity: '2 tbsp', walmartProductId: 'jif12345' },
      { name: 'Jelly', quantity: '1 tbsp' }
    ],
    instructions: 'Spread peanut butter and jelly on bread. Combine. Eat.',
    createdBy: user.email
  });
  await recipe.save();

  console.log('✅ All test data seeded!');
  process.exit();
};

run();
