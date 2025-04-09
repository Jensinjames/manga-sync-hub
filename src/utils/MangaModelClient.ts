
import { useEffect, useRef, useState } from "react";
import * as GradioClient from "@gradio/client";
import { storePrediction } from "@/services/savePrediction";

export type Annotation = {
  image?: string;
  label: string;
  confidence?: number;
  bbox?: [number, number, number, number];
};

export type PredictionResult = {
  image?: string;
  image_id?: string;
  annotations: Annotation[];
};

export interface MangaModelClientOptions {
  onResult?: (result: PredictionResult) => void;
  onError?: (error: unknown) => void;
  meta?: {
    imageUrl: string;
    model_name: string;
    iou_threshold: number;
    score_threshold: number;
    allow_dynamic: boolean;
  };
}

export class MangaModelClient {
  private client: any = null;
  private readonly apiName = "/_gr_detect";
  private readonly spaceName: string;
  private readonly options?: MangaModelClientOptions;
  private connectionPromise: Promise<any> | null = null;
  private static instance: MangaModelClient | null = null;
  private modelLoaded: boolean = false;

  constructor(
    spaceName: string = "Jensin/manga109_yolo",
    options?: MangaModelClientOptions
  ) {
    this.spaceName = spaceName;
    this.options = options;
  }

  /**
   * Get singleton instance of MangaModelClient
   */
  public static getInstance(
    spaceName: string = "Jensin/manga109_yolo",
    options?: MangaModelClientOptions
  ): MangaModelClient {
    if (!MangaModelClient.instance) {
      MangaModelClient.instance = new MangaModelClient(spaceName, options);
    }
    return MangaModelClient.instance;
  }

  /**
   * Check if model is loaded, and load it if not
   */
  public async ensureModelLoaded(onProgress?: () => void): Promise<void> {
    if (!this.modelLoaded) {
      await this.connect();
      this.modelLoaded = true;
      if (onProgress) onProgress();
    }
  }

  /**
   * Detect objects in an image
   */
  public async detectObjects(imageUrl: string): Promise<PredictionResult> {
    try {
      return await this.predict(imageUrl);
    } catch (error) {
      console.error("Error detecting objects:", error);
      throw error;
    }
  }

  async connect(): Promise<any> {
    if (this.client) return this.client;
    if (!this.connectionPromise) {
      this.connectionPromise = GradioClient.client(this.spaceName, {}).then(client => {
        this.client = client;
        return client;
      });
    }
    return this.connectionPromise;
  }

  async predict(
    imageData: string | Blob,
    modelName = "v2023.12.07_n_yv11",
    iouThreshold = 0.7,
    scoreThreshold = 0.25,
    allowDynamic = false
  ): Promise<PredictionResult> {
    try {
      const client = await this.connect();
      
      // If imageData is a string (URL or data URL), convert to Blob
      let imageBlob: Blob;
      if (typeof imageData === 'string') {
        if (imageData.startsWith('data:')) {
          imageBlob = MangaModelClient.dataURLToBlob(imageData);
        } else {
          imageBlob = await MangaModelClient.fetchImageBlob(imageData);
        }
      } else {
        imageBlob = imageData;
      }
      
      const result = await client.predict(this.apiName, [
        { data: imageBlob },
        modelName,
        iouThreshold,
        scoreThreshold,
        allowDynamic
      ]);

      const data = this.parseResult(result);
      this.options?.onResult?.(data);

      // Save to Supabase if meta provided
      if (this.options?.meta) {
        const imageUrl = this.options.meta.imageUrl;
        await storePrediction(
          imageUrl,
          {
            model_name: modelName,
            iou_threshold: iouThreshold,
            score_threshold: scoreThreshold,
            allow_dynamic: allowDynamic
          },
          data
        );
      }

      return data;
    } catch (error) {
      console.error("Prediction error:", error);
      this.options?.onError?.(error);
      throw error;
    }
  }

  private parseResult(result: any): PredictionResult {
    try {
      // Handle different result formats that might come from the API
      if (result.data && Array.isArray(result.data)) {
        // Format: { data: [ { annotations: [...] } ] }
        if (result.data[0] && result.data[0].annotations) {
          return {
            annotations: result.data[0].annotations || [],
            image_id: result.image_id || 'unknown'
          };
        }
        
        // Format: { data: [...] } where data is an array of annotations
        return {
          annotations: result.data || [],
          image_id: result.image_id || 'unknown'
        };
      }
      
      // If it's already in the expected format
      if (result.annotations) {
        return {
          annotations: result.annotations,
          image_id: result.image_id || 'unknown'
        };
      }
      
      console.warn('Unexpected result format:', result);
      return { annotations: [], image_id: 'unknown' };
    } catch (err) {
      console.error('Error parsing result:', err);
      return { annotations: [], image_id: 'unknown' };
    }
  }

  displayAnnotations(annotations: Annotation[]): void {
    annotations.forEach((ann) => {
      console.log(`Label: ${ann.label} | Confidence: ${ann.confidence}`);
    });
  }

  static async fetchImageBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image blob");
    return await response.blob();
  }

  static dataURLToBlob(dataURL: string): Blob {
    const parts = dataURL.split(';base64,');
    if (parts.length !== 2) {
      throw new Error('Invalid data URL format');
    }

    const contentType = parts[0].split(':')[1];
    const raw = atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  }
}

// React hook for using MangaModelClient
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

  const predict = async (imageData: string | Blob, meta?: MangaModelClientOptions["meta"]) => {
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
