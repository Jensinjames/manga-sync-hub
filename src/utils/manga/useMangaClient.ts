
import { useState, useRef, useEffect } from "react";
import { MangaModelClient } from "./MangaModelClient";
import { PredictionResult, ModelClientOptions } from "./types";

/**
 * React hook for using MangaModelClient in components
 */
export function useMangaClient(spaceName = "jensin-manga109-yolo") {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const clientRef = useRef<MangaModelClient | null>(null);

  useEffect(() => {
    clientRef.current = new MangaModelClient(spaceName, {
      onResult: (data) => setResult(data),
      onError: (err) => setError(err)
    });
  }, [spaceName]);

  const predict = async (imageData: string | Blob, meta?: ModelClientOptions["meta"]) => {
    if (!clientRef.current) return null;
    setLoading(true);
    setError(null);
    
    try {
      if (meta) {
        clientRef.current = new MangaModelClient(spaceName, {
          onResult: (data) => setResult(data),
          onError: (err) => setError(err),
          meta
        });
      }
      
      const result = await clientRef.current.predict(imageData);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { predict, result, error, loading };
}
