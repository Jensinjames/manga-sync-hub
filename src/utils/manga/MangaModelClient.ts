
import * as GradioClient from "@gradio/client";
import { PredictionResult, Annotation, ModelClientOptions } from "./types";
import { fetchImageBlob, dataURLToBlob } from "./imageUtils";
import { storePrediction } from "@/services/savePrediction";

/**
 * Client for interacting with Manga109 YOLO model hosted on HuggingFace Spaces
 */
export class MangaModelClient {
  private client: any = null;
  private readonly apiName = "/_gr_detect";
  private readonly spaceName: string;
  private readonly options?: ModelClientOptions;
  private connectionPromise: Promise<any> | null = null;
  private static instance: MangaModelClient | null = null;
  private modelLoaded: boolean = false;

  constructor(
    spaceName: string = "Jensin/manga109_yolo",
    options?: ModelClientOptions
  ) {
    this.spaceName = spaceName;
    this.options = options;
  }

  /**
   * Get singleton instance of MangaModelClient
   */
  public static getInstance(
    spaceName: string = "Jensin/manga109_yolo",
    options?: ModelClientOptions
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

  /**
   * Connect to the Gradio API client
   */
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

  /**
   * Make a prediction using the model
   */
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
          imageBlob = dataURLToBlob(imageData);
        } else {
          imageBlob = await fetchImageBlob(imageData);
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

  /**
   * Parse the result from the Gradio API
   */
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

  /**
   * Utility for fetching an image blob (exposed as static method)
   */
  static async fetchImageBlob(url: string): Promise<Blob> {
    return fetchImageBlob(url);
  }

  /**
   * Utility to convert a data URL to a Blob (exposed as static method)
   */
  static dataURLToBlob(dataURL: string): Blob {
    return dataURLToBlob(dataURL);
  }
}
