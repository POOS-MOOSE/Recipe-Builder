import axios, { AxiosError } from 'axios';

// Define types for Bluecart API response
export interface BluecartProduct {
  product?: {
    title: string;
    item_id: string;
    link: string;
    images: string[];
    rating?: number;
  };
  offers?: {
    primary?: {
      price: number;
      currency: string;
    };
  };
}

export interface BluecartApiResponse {
  request_info: {
    success: boolean;
    credits_used: number;
    credits_remaining: number;
    credits_reset_at: string;
  };
  search_results: BluecartProduct[];
  [key: string]: any; // For other properties that may be in the response
}

/**
 * Search for products using the Bluecart API
 * @param searchTerm - The term to search for
 * @returns The search results from Bluecart API
 */
export async function searchProducts(searchTerm: string): Promise<BluecartApiResponse> {
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
    const response = await axios.get<BluecartApiResponse>(url);
    
    // Return the response data
    return response.data;
  } catch (error) {
    // Handle any errors that occur during the API call
    const err = error as Error | AxiosError;
    console.error('Bluecart API Error:', err.message);
    
    if (axios.isAxiosError(error) && error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    throw err;
  }
}
