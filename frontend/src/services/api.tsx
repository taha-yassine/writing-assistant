import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const processText = async (text: string): Promise<string> => {
  try {
    const response = await axios.post<string>(`${API_URL}/process`, { text }, {
      params: { format: 'xml' },
    });
    return response.data;
  } catch (error) {
    console.error('Error processing text:', error);
    throw error;
  }
};