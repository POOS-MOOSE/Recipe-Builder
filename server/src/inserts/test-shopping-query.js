const connectDB = require('../db');
const {
  createShoppingList,
  addItemToList,
  getShoppingListsByUser
} = require('../queries/shoppingListQueries');
const { findUserByEmail } = require('../queries/userQueries');
const { findProductByWalmartId } = require('../queries/productQueries');

const run = async () => {
  await connectDB();

  const user = await findUserByEmail('xander@example.com');
  const product = await findProductByWalmartId('jif12345');

  // Create list
  const list = await createShoppingList(user._id, 'PB&J Run');
  console.log('📝 Created shopping list:', list);

  // Add item
  const updatedList = await addItemToList(list._id, product._id, '1 jar');
  console.log('📦 Updated list with item:', updatedList);

  // Get all lists
  const lists = await getShoppingListsByUser(user._id);
  console.log('📋 All shopping lists for user:', lists);

  process.exit();
};

run();
