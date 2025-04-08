require('dotenv').config(); // Ensure environment variables are loaded
const { searchProducts } = require('./bluecartApi');

async function testSearch() {
  try {
    const searchTerm = 'your_search_term'; // Replace with an actual search term
    const results = await searchProducts(searchTerm);
    console.log('Search Results:', results);
  } catch (error) {
    console.error('Error during search:', error.message);
  }
}

testSearch();
