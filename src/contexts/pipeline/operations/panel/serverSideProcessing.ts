
import { PipelinePanel } from '../../types';
import { callProcessPanelFunction, getPanelMetadata } from '../api';
import { sleep } from '../utils/panelProcessingUtils';

// Process the panel image via edge function
export const processServerSide = async (
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
