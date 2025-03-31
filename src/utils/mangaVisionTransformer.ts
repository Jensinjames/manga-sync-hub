
import { PanelLabel, PanelMetadata } from "@/contexts/pipeline/types";
import { MangaVisionAnnotation, MangaVisionPredictionResult } from "./mangaVisionClient";

/**
 * Transforms Manga Vision API results into the application's metadata format
 */
export class MangaVisionTransformer {
  /**
   * Convert prediction result to panel metadata format
   */
  static toPanelMetadata(
    result: MangaVisionPredictionResult, 
    imageHash: string
  ): PanelMetadata {
    // Count characters (faces, persons)
    const characterCount = result.annotations.filter(
      ann => ann.label.includes('face') || ann.label.includes('person')
    ).length;
    
    // Determine scene type based on annotations
    const sceneType = result.annotations.some(ann => ann.label.includes('scene'))
      ? "Complex scene"
      : "Character focus";
    
    // Determine action level based on annotation count
    const actionLevel = result.annotations.length > 5 ? "High" : "Medium";
    
    // Create the panel labels in the application's format
    const labels = result.annotations.map(ann => {
      // Extract coordinates from bbox [x1, y1, x2, y2] format
      const [x1, y1, x2, y2] = ann.bbox;
      
      return {
        label: ann.label,
        confidence: ann.confidence,
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1
      } as PanelLabel;
    });

    return {
      labels,
      imageHash,
      content: "Panel content detected via Manga109 YOLO",
      scene_type: sceneType,
      character_count: characterCount,
      mood: "Neutral", // Default mood
      action_level: actionLevel,
      processed_at: new Date().toISOString(),
    };
  }
}
