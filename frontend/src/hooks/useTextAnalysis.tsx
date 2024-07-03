import { useState } from 'react';
import { analyzeText } from '../services/api';

export const useTextAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAnalysis = async (text: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeText(text);
      setLoading(false);
      return result;
    } catch (err) {
      setError('Failed to analyze text');
      setLoading(false);
    }
  };

  return { performAnalysis, loading, error };
};