
import { PipelinePanel } from '../../types';
import { toast } from 'sonner';
import { getMangaModelClient, getMangaVisionClient } from '../../pipelineOperations';
import { MangaVisionClient, MangaVisionPredictionResult } from '@/utils/mangaVisionClient';
import { storePrediction } from '@/services/savePrediction';
import { MangaVisionTransformer } from '@/utils/mangaVisionTransformer';
import { PredictionResult } from '@/utils/MangaModelClient';

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
    const imageBlob = await fetchImageBlobWithRetry(panel.imageUrl, 3);
    
    if (!imageBlob) {
      throw new Error('Failed to fetch image after multiple attempts');
    }
    
    // Process the image
    const result = await modelClient.predict(imageBlob, undefined, undefined, undefined, undefined);
    
    if (!result || !result.annotations) {
      throw new Error('Empty result from model client');
    }
    
    console.log('MangaModelClient result:', result);
    
    // Store prediction in Supabase (don't block on this)
    try {
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
    } catch (storeError) {
      console.error('Error storing prediction (non-blocking):', storeError);
      // Continue even if storage fails
    }
    
    // Convert the result to MangaVisionPredictionResult to use with the transformer
    const mangaVisionResult: MangaVisionPredictionResult = {
      annotations: result.annotations.map(ann => ({
        label: ann.label,
        confidence: ann.confidence || 0, // Provide default value
        bbox: ann.bbox || [0, 0, 0, 0],
        image: ann.image
      }))
    };
    
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
    updatedPanel.status = 'done';
    updatedPanel.isProcessing = false;
    updatedPanel.isError = false;
    
    // Add additional metadata fields
    const metadata = MangaVisionTransformer.toPanelMetadata(mangaVisionResult, generateSimpleHash(panel.imageUrl));
    
    updatedPanel.metadata = metadata;
    updatedPanel.content = metadata.content || 'Processed content';
    updatedPanel.sceneType = metadata.scene_type || 'Unknown';
    updatedPanel.characterCount = metadata.character_count || 0;
    updatedPanel.mood = metadata.mood || 'Unknown';
    updatedPanel.actionLevel = metadata.action_level || 'Medium';
    
    onSuccess?.(updatedPanel);
    return updatedPanel;
  } catch (modelClientError) {
    console.error('MangaModelClient processing failed:', modelClientError);
    
    // Fall back to legacy MangaVisionClient
    try {
      onProgress?.('Falling back to MangaVisionClient...');
      const client = await getMangaVisionClient();
      const result = await client.predict(panel.imageUrl);
      
      if (!result) {
        throw new Error('Empty result from vision client');
      }
      
      console.log('MangaVisionClient result:', result);
      
      // Convert the result to app format
      updatedPanel.labels = MangaVisionClient.convertToPanelLabels(result);
      updatedPanel.processedAt = new Date().toISOString();
      updatedPanel.processingError = null;
      updatedPanel.status = 'done';
      updatedPanel.isProcessing = false;
      updatedPanel.isError = false;
      
      // Add additional metadata
      updatedPanel.content = 'Panel content detected';
      updatedPanel.sceneType = 'Auto-detected';
      updatedPanel.characterCount = updatedPanel.labels.filter(l => 
        l.label.includes('face') || l.label.includes('person')
      ).length;
      updatedPanel.mood = 'Unknown';
      updatedPanel.actionLevel = updatedPanel.labels.length > 5 ? 'High' : 'Medium';
      
      onSuccess?.(updatedPanel);
      return updatedPanel;
    } catch (visionClientError) {
      console.error('MangaVisionClient processing failed:', visionClientError);
      throw new Error(`Client-side processing failed: ${visionClientError.message || 'Unknown error'}`);
    }
  }
};

// Helper function to fetch image with retries
async function fetchImageBlobWithRetry(url: string, maxRetries: number): Promise<Blob | null> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.blob();
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error);
      retries++;
      if (retries >= maxRetries) return null;
      // Exponential backoff
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries)));
    }
  }
  
  return null;
}

// Simple hash function for image URL caching
function generateSimpleHash(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash.toString();
}
