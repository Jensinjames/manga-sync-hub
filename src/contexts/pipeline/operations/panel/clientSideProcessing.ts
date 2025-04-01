
import { PipelinePanel } from '../../types';
import { toast } from 'sonner';
import { getMangaModelClient, getMangaVisionClient } from '../../pipelineOperations';
import { MangaVisionClient } from '@/utils/mangaVisionClient';
import { storePrediction } from '@/services/savePrediction';

// Process the panel image via client-side API calls
export const processClientSide = async (
  panel: PipelinePanel,
  options: {
    onProgress?: (status: string) => void;
    onSuccess?: (panel: PipelinePanel) => void;
  } = {}
): Promise<PipelinePanel> => {
  const { onProgress, onSuccess } = options;
  const updatedPanel = { ...panel };
  
  onProgress?.('Initializing client...');
  
  // First try the new MangaModelClient
  try {
    const modelClient = await getMangaModelClient();
    onProgress?.('Processing with MangaModelClient...');
    
    // Convert image URL to blob
    const imageBlob = await MangaVisionClient.fetchImageBlob(panel.imageUrl);
    
    // Process the image
    const result = await modelClient.predict(imageBlob, undefined, undefined, undefined, undefined);
    
    // Store prediction in Supabase
    await storePrediction(
      panel.imageUrl, 
      {
        model_name: 'v2023.12.07_n_yv11',
        iou_threshold: 0.7,
        score_threshold: 0.25,
        allow_dynamic: true
      }, 
      result
    );
    
    // Update panel with the results
    updatedPanel.labels = result.annotations.map(ann => {
      const [x1, y1, x2, y2] = ann.bbox || [0, 0, 0, 0];
      
      return {
        label: ann.label,
        confidence: ann.confidence || 0,
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1
      };
    });
    
    updatedPanel.processedAt = new Date().toISOString();
    updatedPanel.processingError = null;
    
    onSuccess?.(updatedPanel);
    return updatedPanel;
  } catch (modelClientError) {
    console.error('MangaModelClient processing failed:', modelClientError);
    
    // Fall back to legacy MangaVisionClient
    try {
      onProgress?.('Falling back to MangaVisionClient...');
      const client = await getMangaVisionClient();
      const result = await client.predict(panel.imageUrl);
      
      // Convert the result to app format
      updatedPanel.labels = MangaVisionClient.convertToPanelLabels(result);
      updatedPanel.processedAt = new Date().toISOString();
      updatedPanel.processingError = null;
      
      onSuccess?.(updatedPanel);
      return updatedPanel;
    } catch (visionClientError) {
      console.error('MangaVisionClient processing failed:', visionClientError);
      throw visionClientError;
    }
  }
};
