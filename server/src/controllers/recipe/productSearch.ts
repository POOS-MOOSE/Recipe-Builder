import { type RequestHandler } from 'express';
import { searchProducts } from '../../utils/bluecartApi';

/**
 * Search for products via the Bluecart API
 * This controller handles product searches for ingredients
 */
const searchProductsHandler: RequestHandler = async (req, res, next) => {
  try {
    // Get the search term from the query parameters
    const { term } = req.query;
    
    if (!term || typeof term !== 'string') {
      return next({
        statusCode: 400,
        message: 'Search term is required'
      });
    }
    
    // Search for products
    const results = await searchProducts(term);
    
    // Return the search results
    res.status(200).json({
      message: 'Products retrieved successfully',
      data: {
        totalProducts: results.search_results.length,
        requestInfo: results.request_info,
        products: results.search_results.map(item => ({
          id: item.product?.item_id,
          name: item.product?.title,
          price: item.offers?.primary?.price,
          currency: item.offers?.primary?.currency,
          image: item.product?.images?.[0],
          link: item.product?.link,
          rating: item.product?.rating
        }))
      }
    });
  } catch (error) {
    console.error('Product search error:', error);
    next({
      statusCode: 500,
      message: 'Failed to search products',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export { searchProductsHandler };
