import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const analyzeText = async (text: string) => {
  const response = await axios.post(`${API_URL}/analyze`, { text });
  return response.data;
};