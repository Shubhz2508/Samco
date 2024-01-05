import User from "../Models/User";

export const getNetAvailableMargin = async (user: User): Promise<number> => {
  const headers = {
    'Accept': 'application/json',
    'x-session-token': user.demat_access_token,
  };

  try {
    const response = await axios.get('https://api.stocknote.com/limit/getLimits', { headers });

    // Check if 'response.data' is defined
    if (response.data) {
      const { status } = response.data;

      if (status === 'Success') {
        const amount = parseFloat(response.data.netAvailableMargin);
        return amount;
      } else {
        console.log('API request failed. Status:', response.data.statusMessage);
        throw new Error('API request failed. Status: ' + response.data.statusMessage);
      }
    } else {
      console.log('API request failed. Invalid response format.');
      throw new Error('API request failed. Invalid response format.');
    }
  } catch (error) {
    console.error('Error during API request:', error.message || error);
    throw new Error('Error during API request: ' + (error.message || error));
  }
}