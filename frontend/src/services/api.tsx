import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const processText = async (text: string) => {
  const response = await axios.post(`${API_URL}/process`, { text });
  return response.data;
};