import axios from 'axios';

const API_URL = 'http://localhost:8000';

interface Suggestion {
  old: string;
  new: string;
}

export const processText = async (text: string): Promise<Suggestion[]> => {
  try {
    const response = await axios.post<Suggestion[]>(`${API_URL}/process`, { text });
    return response.data;
  } catch (error) {
    console.error('Error processing text:', error);
    throw error;
  }
};