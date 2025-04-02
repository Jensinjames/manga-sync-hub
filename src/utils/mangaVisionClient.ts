import { PanelLabel } from "@/contexts/pipeline/types";
import { MangaModelClient, PredictionResult, Annotation } from "./MangaModelClient";

export type MangaVisionAnnotation = {
  label: string;
  confidence: number; // Required in MangaVisionAnnotation
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
  spaceName: "Jensin/manga109_yolo",
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
  private modelClient: MangaModelClient;
  private config: MangaVisionConfig;

  constructor(config: Partial<MangaVisionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.modelClient = new MangaModelClient(this.config.spaceName);
  }

  /**
   * Connect to the HuggingFace Space
   */
  async connect(): Promise<any> {
    return this.modelClient.connect();
  }

  /**
   * Predict objects in an image using the Manga109 YOLO model
   * @param imageData Base64 encoded image, URL to an image, or Blob
   * @returns Prediction result with annotations
   */
  async predict(
    imageData: string | Blob
  ): Promise<MangaVisionPredictionResult> {
    try {
      console.log(`Calling Manga109 YOLO API with model ${this.config.modelName}`);
      
      const result = await this.modelClient.predict(
        imageData,
        this.config.modelName,
        this.config.iouThreshold,
        this.config.scoreThreshold,
        this.config.allowDynamic
      );

      // Convert from MangaModelClient format to MangaVisionPredictionResult format
      return this.convertPredictionResult(result);
    } catch (error) {
      console.error('Error predicting with MangaVisionClient:', error);
      throw error;
    }
  }
  
  /**
   * Convert from MangaModelClient prediction result to MangaVisionPredictionResult format
   * Ensure that optional confidence in Annotation becomes required in MangaVisionAnnotation
   */
  private convertPredictionResult(result: PredictionResult): MangaVisionPredictionResult {
    return {
      annotations: (result.annotations || []).map(ann => ({
        label: ann.label,
        confidence: ann.confidence || 0, // Provide default value of 0 for optional confidence
        bbox: ann.bbox || [0, 0, 0, 0],
        image: ann.image
      }))
    };
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
    return MangaModelClient.fetchImageBlob(url);
  }

  /**
   * Utility to convert a data URL to a Blob
   */
  static dataURLToBlob(dataURL: string): Blob {
    return MangaModelClient.dataURLToBlob(dataURL);
  }
}

/**
 * React hook for using MangaVisionClient
 */
import { useState } from 'react';

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
