
import { Client } from "@gradio/client";
import { PanelLabel } from "@/contexts/pipeline/types";

export type MangaVisionAnnotation = {
  label: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2] format
  image?: string;
};

export type MangaVisionPredictionResult = {
  annotations: MangaVisionAnnotation[];
};

export interface MangaVisionConfig {
  spaceName: string;
  modelName: string;
  iouThreshold: number;
  scoreThreshold: number;
  allowDynamic: boolean;
}

export const DEFAULT_CONFIG: MangaVisionConfig = {
  spaceName: "jensin-manga109-yolo",
  modelName: "v2023.12.07_n_yv11",
  iouThreshold: 0.7,
  scoreThreshold: 0.25,
  allowDynamic: true
};

/**
 * Client for the Manga109 YOLO model hosted on HuggingFace Spaces
 * This can be used for direct client-side processing when debugging or in development
 */
export class MangaVisionClient {
  private client: Client | null = null;
  private readonly apiEndpoint = "/_gr_detect";
  private config: MangaVisionConfig;
  private connectionPromise: Promise<Client> | null = null;

  constructor(config: Partial<MangaVisionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Connect to the HuggingFace Space
   */
  async connect(): Promise<Client> {
    if (this.client) return this.client;
    
    if (!this.connectionPromise) {
      try {
        // Using the proper Client.connect method from @gradio/client
        this.connectionPromise = Client.connect(this.config.spaceName).then(client => {
          this.client = client;
          return client;
        });
      } catch (error) {
        console.error("Failed to connect to Gradio client:", error);
        throw error;
      }
    }
    
    return this.connectionPromise;
  }

  /**
   * Predict objects in an image using the Manga109 YOLO model
   * @param imageData Base64 encoded image, URL to an image, or Blob
   * @returns Prediction result with annotations
   */
  async predict(
    imageData: string | Blob
  ): Promise<MangaVisionPredictionResult> {
    const client = await this.connect();
    
    // Prepare the image input (handle both string and Blob types)
    const imageInput = typeof imageData === 'string' 
      ? imageData 
      : imageData;

    try {
      console.log(`Calling Manga109 YOLO API with model ${this.config.modelName}`);
      
      const result = await client.predict(this.apiEndpoint, {
        image: imageInput,
        model_name: this.config.modelName,
        iou_threshold: this.config.iouThreshold,
        score_threshold: this.config.scoreThreshold,
        allow_dynamic: this.config.allowDynamic
      });

      // Handle the result in the new format
      const data = result.data as any;
      if (!data || !Array.isArray(data.annotations)) {
        throw new Error('Invalid response format from the model');
      }

      return {
        annotations: data.annotations
      };
    } catch (error) {
      console.error('Error predicting with MangaVisionClient:', error);
      throw error;
    }
  }

  /**
   * Convert raw Manga109 YOLO annotations to the PanelLabel format used in the app
   */
  static convertToPanelLabels(result: MangaVisionPredictionResult): PanelLabel[] {
    if (!result || !result.annotations) return [];
    
    return result.annotations.map(annotation => {
      // Extract coordinates from bbox [x1, y1, x2, y2] format
      const [x1, y1, x2, y2] = annotation.bbox;
      
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

  /**
   * Fetch an image from a URL and convert to a Blob
   */
  static async fetchImageBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    return await response.blob();
  }

  /**
   * Utility to convert a data URL to a Blob
   */
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
}

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

// Import React useState for the hook
import { useState } from 'react';
