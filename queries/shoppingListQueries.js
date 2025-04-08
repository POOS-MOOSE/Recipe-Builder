const ShoppingList = require('../models/ShoppingList');

// ➕ Create a new shopping list
async function createShoppingList(userId, title = 'My Shopping List') {
  const list = new ShoppingList({ userId, title });
  return await list.save();
}

// 📄 Get all shopping lists for a user
async function getShoppingListsByUser(userId) {
  return await ShoppingList.find({ userId }).populate('items.productId');
}

// ➕ Add an item to a shopping list
async function addItemToList(listId, productId, quantity) {
  return await ShoppingList.findByIdAndUpdate(
    listId,
    { $push: { items: { productId, quantity } } },
    { new: true }
  ).populate('items.productId');
}

// ❌ Remove an item from a list
async function removeItemFromList(listId, productId) {
  return await ShoppingList.findByIdAndUpdate(
    listId,
    { $pull: { items: { productId } } },
    { new: true }
  );
}

module.exports = {
  createShoppingList,
  getShoppingListsByUser,
  addItemToList,
  removeItemFromList,
};
