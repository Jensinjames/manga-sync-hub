
import { supabase } from '@/integrations/supabase/client';
import { PredictionResult } from '@/utils/MangaModelClient';

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
    const { data: predictionRow, error: predError } = await supabase
      .from('predictions')
      .insert([
        {
          image_url: imageUrl,
          ...modelConfig
        }
      ])
      .select()
      .single();

    if (predError) throw predError;

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

      if (annError) throw annError;
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
