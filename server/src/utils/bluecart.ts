import axios from 'axios';

export async function fetchBlueCartData(searchTerm: string): Promise<any> {
  const params = {
    api_key: process.env.BLUECART_API_KEY || "83BE3952D96246199446928CBD3D9395",
    search_term: searchTerm,
    type: "search"
  };

  try {
    const response = await axios.get('https://api.bluecartapi.com/request', { params });
    return response.data;
  } catch (error) {
    console.error(`Error calling BlueCart API for "${searchTerm}":`, error);
    throw error;
  }
}
