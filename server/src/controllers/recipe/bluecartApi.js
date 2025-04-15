const axios = require('axios');

/**
 * Search for products using the Bluecart API
 * @param {string} searchTerm - The term to search for
 * @returns {Promise<Object>} - The search results
 */
async function searchProducts(searchTerm) {
  try {
    const apiKey = process.env.BLUECART_API_KEY;
    
    if (!apiKey) {
      throw new Error('BLUECART_API_KEY is not set in environment variables');
    }
    
    // Encode the search term properly for URL parameters
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    
    // Construct the API URL
    const url = `https://api.bluecartapi.com/request?api_key=${apiKey}&search_term=${encodedSearchTerm}&walmart_domain=walmart.com&type=search`;
    
    // Make the API request
    const response = await axios.get(url);
    
    // Return the response data
    return response.data;
  } catch (error) {
    // Handle any errors that occur during the API call
    console.error('Bluecart API Error:', error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    throw error;
  }
}

module.exports = {
  searchProducts
};
