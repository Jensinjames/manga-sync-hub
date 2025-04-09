import { PanelLabel } from '@/contexts/pipeline/types';
import { Annotation, PredictionResult } from './manga/types';

export interface MangaVisionAnnotation extends Annotation {
  confidence: number; // Make confidence required
  bbox: [number, number, number, number];
}

export interface MangaVisionPredictionResult {
  image_id: string;
  annotations: MangaVisionAnnotation[];
}

export class MangaVisionTransformer {
  /**
   * Converts annotations to PanelLabel format for UI display
   */
  static toLabels(annotations: Annotation[]): PanelLabel[] {
    return annotations.map(annotation => {
      // Extract coordinates from bbox [x1, y1, x2, y2] format
      const [x1, y1, x2, y2] = annotation.bbox || [0, 0, 0, 0];
      
      return {
        label: annotation.label || 'unknown',
        confidence: annotation.confidence ?? 0, // Provide default for optional confidence
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1
      };
    });
  }

  /**
   * Normalizes prediction results to MangaVisionPredictionResult format
   */
  static normalizePrediction(result: PredictionResult): MangaVisionPredictionResult {
    // Ensure all annotations have required fields for MangaVisionAnnotation
    const normalizedAnnotations: MangaVisionAnnotation[] = result.annotations.map(annotation => ({
      ...annotation,
      confidence: annotation.confidence ?? 0, // Ensure confidence is always present
      bbox: annotation.bbox || [0, 0, 0, 0] as [number, number, number, number],
      label: annotation.label || 'unknown'
    }));

    return {
      image_id: result.image_id || 'unknown',
      annotations: normalizedAnnotations
    };
  }
}
