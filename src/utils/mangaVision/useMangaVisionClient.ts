
import { useState } from 'react';
import { MangaVisionClient } from './MangaVisionClient';
import { MangaVisionConfig, MangaVisionPredictionResult } from './types';

/**
 * React hook for using MangaVisionClient
 */
export function useMangaVisionClient(config: Partial<MangaVisionConfig> = {}) {
  const [result, setResult] = useState<MangaVisionPredictionResult | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [client] = useState(() => new MangaVisionClient(config));

  const predict = async (imageData: string | Blob) => {
    setLoading(true);
    setError(null);
    
    try {
      const predictionResult = await client.predict(imageData);
      setResult(predictionResult);
      return predictionResult;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { predict, result, error, loading, client };
}
