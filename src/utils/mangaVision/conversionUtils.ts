
import { PanelLabel } from "@/contexts/pipeline/types";
import { MangaVisionAnnotation, MangaVisionPredictionResult } from "./types";
import { PredictionResult, Annotation } from "../manga/types";

/**
 * Utility for converting between different annotation formats
 */
export class MangaVisionConverter {
  /**
   * Convert from MangaModelClient prediction result to MangaVisionPredictionResult format
   */
  static convertPredictionResult(result: PredictionResult): MangaVisionPredictionResult {
    return {
      annotations: (result.annotations || []).map(ann => ({
        label: ann.label,
        confidence: ann.confidence || 0,
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
}
