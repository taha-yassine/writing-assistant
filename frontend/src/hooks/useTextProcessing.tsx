import { useState } from 'react';
import { processText } from '../services/api';

export const useTextProcessing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performProcessing = async (text: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await processText(text);
      setLoading(false);
      return result;
    } catch (err) {
      setError('Failed to process text');
      setLoading(false);
    }
  };

  return { performProcessing, loading, error };
};