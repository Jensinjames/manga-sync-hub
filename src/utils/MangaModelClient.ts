
import { useEffect, useRef, useState } from "react";
import * as GradioClient from "@gradio/client";
import { storePrediction } from "@/services/savePrediction";

export type Annotation = {
  image?: string;
  label: string;
  confidence?: number;
  bbox?: [number, number, number, number]; // [x1, y1, x2, y2] format
};

export type PredictionResult = {
  image?: string;
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

  constructor(
    spaceName: string = "jensin-manga109-yolo",
    options?: MangaModelClientOptions
  ) {
    this.spaceName = spaceName;
    this.options = options;
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
    imageBlob: Blob | string,
    modelName = "v2023.12.07_n_yv11",
    iouThreshold = 0.7,
    scoreThreshold = 0.25,
    allowDynamic = true
  ): Promise<PredictionResult> {
    try {
      const client = await this.connect();
      
      // Handle both blob and string input
      const imageInput = typeof imageBlob === 'string' ? imageBlob : imageBlob;
      
      console.log(`Calling Manga109 YOLO API with model ${modelName}`);
      
      const result = await client.predict(this.apiName, {
        image: imageInput,
        model_name: modelName,
        iou_threshold: iouThreshold,
        score_threshold: scoreThreshold,
        allow_dynamic: allowDynamic
      });

      // Parse the result data
      const data = result.data as any;
      const predictionResult: PredictionResult = {
        annotations: data.annotations || []
      };
      
      this.options?.onResult?.(predictionResult);

      // Save to Supabase if meta provided
      if (this.options?.meta) {
        try {
          await storePrediction(this.options.meta.imageUrl, {
            model_name: modelName,
            iou_threshold: iouThreshold,
            score_threshold: scoreThreshold,
            allow_dynamic: allowDynamic
          }, predictionResult);
        } catch (storageError) {
          console.error("Failed to store prediction:", storageError);
          // Continue execution even if storage fails
        }
      }

      return predictionResult;
    } catch (error) {
      console.error("Prediction error:", error);
      this.options?.onError?.(error);
      throw error;
    }
  }

  static async fetchImageBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    return await response.blob();
  }

  static dataURLToBlob(dataURL: string): Blob {
    const parts = dataURL.split(';base64,');
    if (parts.length !== 2) {
      throw new Error('Invalid data URL format');
    }
    
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    
    return new Blob([uInt8Array], { type: contentType });
  }
  
  /**
   * Convert annotations to PanelLabel format used in the application
   */
  static convertToPanelLabels(result: PredictionResult): any[] {
    if (!result || !result.annotations) return [];
    
    return result.annotations.map(annotation => {
      // Extract coordinates from bbox [x1, y1, x2, y2] format
      const [x1, y1, x2, y2] = annotation.bbox || [0, 0, 0, 0];
      
      // Convert to app's format (x, y, width, height)
      return {
        label: annotation.label,
        confidence: annotation.confidence,
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1
      };
    });
  }
}

// React hook for using MangaModelClient
export function useMangaClient(spaceName = "jensin-manga109-yolo") {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [client] = useState(() => new MangaModelClient(spaceName, {
    onResult: (data) => setResult(data),
    onError: (err) => setError(err)
  }));

  const predict = async (imageBlob: Blob | string, 
    modelName = "v2023.12.07_n_yv11", 
    iouThreshold = 0.7, 
    scoreThreshold = 0.25, 
    allowDynamic = true,
    meta?: MangaModelClientOptions["meta"]) => {
    
    setLoading(true);
    setError(null);
    
    try {
      const predictionResult = await client.predict(
        imageBlob, 
        modelName, 
        iouThreshold, 
        scoreThreshold, 
        allowDynamic
      );
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
