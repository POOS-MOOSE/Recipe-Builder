// server/src/utils/bluecartApi.js
const axios = require('axios');

const BLUECART_API_KEY = process.env.BLUECART_API_KEY;
const BASE_URL = 'https://api.bluecartapi.com'; 

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
const fetchProductData = async (searchTerm) => {
  try {
    const response = await axios.get('https://api.bluecartapi.com/request', {
      params: {
        api_key: process.env.BLUECART_API_KEY, // Ensure your API key is stored in .env
        type: 'search',
        search_term: searchTerm,
        sort_by: 'best_seller',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching product data:', error);
    throw error;
  }
};


module.exports = { // When adding new functions, names go here
  fetchProductData,
};
