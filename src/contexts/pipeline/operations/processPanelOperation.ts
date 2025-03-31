
import { PipelinePanel } from '../types';
import { toast } from 'sonner';
import { getMangaModelClient, getMangaVisionClient } from '../pipelineOperations';
import { MangaVisionClient } from '@/utils/mangaVisionClient';
import { callProcessPanelFunction, getPanelMetadata } from './api/panelEdgeFunctionClient';
import { sleep } from './utils/panelProcessingUtils';
import { storePrediction } from '@/services/savePrediction';

// Number of times to retry client-side processing before falling back to edge function
const MAX_CLIENT_RETRIES = 2;

// Process the panel image either client-side or server-side (via edge function)
export const processPanel = async (
  panel: PipelinePanel,
  options: {
    preferClientSide?: boolean;
    onSuccess?: (panel: PipelinePanel) => void;
    onError?: (error: any) => void;
    onProgress?: (status: string) => void;
  } = {}
): Promise<PipelinePanel> => {
  const { preferClientSide = true, onSuccess, onError, onProgress } = options;

  try {
    onProgress?.('Starting panel processing...');
    
    // Always try client-side processing first if preferred
    if (preferClientSide) {
      try {
        return await processClientSide(panel, { onProgress, onSuccess });
      } catch (clientError) {
        console.error('Client-side processing failed, falling back to edge function:', clientError);
        onProgress?.('Falling back to server-side processing...');
        // Fall through to edge function processing
      }
    }
    
    // Process via edge function as fallback or if client-side not preferred
    const updatedPanel = await processServerSide(panel, { onProgress, onSuccess });
    return updatedPanel;
  } catch (error) {
    console.error('Panel processing failed:', error);
    onError?.(error);
    toast.error('Failed to process panel');
    throw error;
  }
};

// Process the panel image via client-side API calls
const processClientSide = async (
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

// Process the panel image via edge function
const processServerSide = async (
  panel: PipelinePanel,
  options: {
    onProgress?: (status: string) => void;
    onSuccess?: (panel: PipelinePanel) => void;
  } = {}
): Promise<PipelinePanel> => {
  const { onProgress, onSuccess } = options;
  const updatedPanel = { ...panel };
  
  onProgress?.('Processing via edge function...');
  
  // Call the edge function to process the panel
  const { data, result, processing } = await callProcessPanelFunction(panel.id, panel.imageUrl);
  
  if (processing) {
    onProgress?.('Edge function processing in background...');
    
    // Poll for completion if processing in background
    let attempts = 0;
    const maxAttempts = 20; // Maximum number of polling attempts
    
    while (attempts < maxAttempts) {
      await sleep(2000); // Wait 2 seconds between polls
      attempts++;
      
      onProgress?.(`Checking processing status (attempt ${attempts})...`);
      
      // Get the latest metadata
      try {
        const metadata = await getPanelMetadata(panel.id);
        
        // If metadata exists and processing is complete
        if (metadata?.data?.metadata && !metadata.data.metadata.processing) {
          const panelMetadata = metadata.data.metadata;
          
          // Convert the labels if available
          if (panelMetadata.labels && panelMetadata.labels.length > 0) {
            updatedPanel.labels = panelMetadata.labels.map((label: any) => {
              // Extract coordinates from bbox [x1, y1, x2, y2] format
              const [x1, y1, x2, y2] = label.bbox || [0, 0, 0, 0];
              
              return {
                label: label.label,
                confidence: label.confidence || 0,
                x: x1,
                y: y1,
                width: x2 - x1,
                height: y2 - y1
              };
            });
            
            updatedPanel.processedAt = panelMetadata.processed_at || new Date().toISOString();
            updatedPanel.processingError = null;
            
            onSuccess?.(updatedPanel);
            return updatedPanel;
          }
          
          // If there was an error during processing
          if (panelMetadata.error) {
            throw new Error(panelMetadata.error);
          }
        }
      } catch (pollError) {
        console.error(`Error polling for panel processing (attempt ${attempts}):`, pollError);
        
        // Continue polling despite errors
        if (attempts >= maxAttempts) {
          throw pollError;
        }
      }
    }
    
    throw new Error('Panel processing timed out');
  }
  
  // If result is immediately available
  if (result && result.labels && result.labels.length > 0) {
    updatedPanel.labels = result.labels.map((label: any) => {
      // Extract coordinates from bbox [x1, y1, x2, y2] format
      const [x1, y1, x2, y2] = label.bbox || [0, 0, 0, 0];
      
      return {
        label: label.label,
        confidence: label.confidence || 0,
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1
      };
    });
    
    updatedPanel.processedAt = result.processed_at || new Date().toISOString();
    updatedPanel.processingError = null;
    
    onSuccess?.(updatedPanel);
    return updatedPanel;
  }
  
  throw new Error('Edge function returned invalid result');
};
