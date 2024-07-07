import axios from 'axios';

const API_URL = 'http://localhost:8000';

interface ProcessResponse {
  errors: string[];
  corrections: string[];
}

export const processText = async (text: string): Promise<[string[], string[]]> => {
  try {
    const response = await axios.post<ProcessResponse>(`${API_URL}/process`, { text });
    return [response.data.errors, response.data.corrections];
  } catch (error) {
    console.error('Error processing text:', error);
    throw error;
  }
};