// server/src/utils/bluecartApi.js
const axios = require('axios');

const BLUECART_API_KEY = process.env.BLUECART_API_KEY;
const BASE_URL = 'https://api.bluecart.com/v1'; // Change this to the actual base URL for BlueCart's API

// Create an axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${BLUECART_API_KEY}`, // Taken from env file
    'Content-Type': 'application/json',
  },
});

// FUNCTIONS

// Example of searching for a product by category. Can add more once figured stuff out
async function getProductsByCategory(category) {
  try {
    const response = await api.get('/products', {
      params: { category: category }  // Filtering by category
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
}


module.exports = { // When adding new functions, names go here
  getProducts,
};
