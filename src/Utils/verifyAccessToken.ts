import User from "../Models/User";
import axios from "axios";
import { accessResponse } from "../Types/SamcoResponse";

export const verifyAccessToken = async (user: User): Promise<{ success: number }> => {
  const headers = {
    'Accept': 'application/json',
    'x-session-token': user.demat_access_token,
  };

  try {
    const response = await axios.post<accessResponse>(
      'https://api.stocknote.com/login',
      {},
      { headers }
    );

    // Check if 'response.data' is defined
    if (response.data) {
      // Assuming the structure of 'response.data' has a property like 'status'
      const { status } = response.data;

      if (status === 'Success') {
        return { success: 1 };
      } else {
        console.log('Login failed. Something went wrong.');
        return { success: 0 };
      }
    } else {
      console.log('Login failed. Invalid response format.');
      return { success: 0 };
    }
  } catch (error) {
    console.error('Error during login:', error.message || error);
    return { success: 0 };
  }
};
