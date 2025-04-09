
import { MangaModelClient } from "../manga/MangaModelClient";
import { MangaVisionAnnotation, MangaVisionPredictionResult, MangaVisionConfig, DEFAULT_CONFIG } from "./types";
import { MangaVisionConverter } from "./conversionUtils";

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
      return MangaVisionConverter.convertPredictionResult(result);
    } catch (error) {
      console.error('Error predicting with MangaVisionClient:', error);
      throw error;
    }
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
