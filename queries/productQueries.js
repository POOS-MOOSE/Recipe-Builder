const Product = require('../models/Product');

// ➕ Add a product
async function createProduct(data) {
  const product = new Product(data);
  return await product.save();
}

// 🔍 Find product by Walmart ID
async function findProductByWalmartId(walmartItemId) {
  return await Product.findOne({ walmartItemId });
}

// 📦 Get all products
async function getAllProducts() {
  return await Product.find();
}

// 🔎 Get a single product by Mongo ID
async function getProductById(id) {
  return await Product.findById(id);
}

module.exports = {
  createProduct,
  findProductByWalmartId,
  getAllProducts,
  getProductById,
};
