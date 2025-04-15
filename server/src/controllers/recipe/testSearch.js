require('dotenv').config(); // Ensure environment variables are loaded
const { searchProducts } = require('./bluecartApi');

async function testSearch() {
  try {
    // Replace with an actual product search term (food item)
    const searchTerm = 'apple';
    
    console.log(`Searching for: "${searchTerm}"`);
    console.log('Please wait, fetching results from Bluecart API...');
    
    const results = await searchProducts(searchTerm);
    
    // Print basic request info
    console.log('\n===== API Request Info =====');
    console.log('Success:', results.request_info.success);
    console.log('Credits used:', results.request_info.credits_used);
    console.log('Credits remaining:', results.request_info.credits_remaining);
    
    // Print search results summary
    console.log('\n===== Search Results =====');
    console.log('Total products found:', results.search_results.length);
    
    // Print details of first 5 products
    console.log('\n===== First 5 Products =====');
    for (let i = 0; i < Math.min(5, results.search_results.length); i++) {
      const product = results.search_results[i];
      console.log(`\n--- Product ${i+1} ---`);
      console.log('Name:', product.product?.title);
      console.log('Price:', product.offers?.primary?.price, product.offers?.primary?.currency);
      console.log('Rating:', product.product?.rating);
      console.log('Link:', product.product?.link);
      console.log('Image:', product.product?.images[0]);
      console.log('ID:', product.product?.item_id);
    }
    
    // Print full results object if needed
    console.log('\n===== Full API Response =====');
    console.log(JSON.stringify(results, null, 2));
    
  } catch (error) {
    console.error('Error during search:', error.message);
  }
}

testSearch();
