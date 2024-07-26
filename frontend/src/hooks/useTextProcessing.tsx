import { useState } from 'react';
import { processText } from '../services/api';

interface Suggestion {
  old: string;
  new: string;
}

export const useTextProcessing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performProcessing = async (text: string): Promise<Suggestion[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await processText(text);
      setLoading(false);
      return result;
    } catch (err) {
      setError('Failed to process text');
      setLoading(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { performProcessing, loading, error };
};