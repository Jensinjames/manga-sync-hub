
import { supabase } from '@/integrations/supabase/client';
import { PredictionResult } from '@/utils/MangaModelClient';
import { Database } from '@/integrations/supabase/types';

/**
 * Saves prediction results to the database
 * @param imageUrl URL of the image that was processed
 * @param modelConfig Configuration of the model used
 * @param prediction Results from the prediction
 * @returns The stored prediction data or null if saving failed
 */
export async function storePrediction(
  imageUrl: string,
  modelConfig: {
    model_name: string;
    iou_threshold: number;
    score_threshold: number;
    allow_dynamic: boolean;
  },
  prediction: PredictionResult
) {
  try {
    // Insert the prediction record
    const { data: predictionRow, error: predError } = await supabase
      .from('predictions')
      .insert([{
        image_url: imageUrl,
        model_name: modelConfig.model_name,
        iou_threshold: modelConfig.iou_threshold,
        score_threshold: modelConfig.score_threshold,
        allow_dynamic: modelConfig.allow_dynamic
      }])
      .select()
      .single();

    if (predError) {
      console.error("Failed to store prediction:", predError);
      throw predError;
    }

    // Insert any annotations if available
    if (prediction.annotations && prediction.annotations.length > 0) {
      const { error: annError } = await supabase
        .from('annotations')
        .insert(
          prediction.annotations.map((ann) => ({
            prediction_id: predictionRow.id,
            label: ann.label,
            confidence: ann.confidence ?? null,
            bbox: ann.bbox ?? null
          }))
        );

      if (annError) {
        console.error("Failed to store annotations:", annError);
        throw annError;
      }
    }

    return {
      prediction: predictionRow,
      annotations: prediction.annotations
    };
  } catch (error) {
    console.error("Failed to store prediction:", error);
    // Continue even if storage fails - don't block the UI
    return null;
  }
}
