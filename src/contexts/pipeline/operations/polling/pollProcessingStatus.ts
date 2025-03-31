
import { supabase } from '@/integrations/supabase/client';
import { PipelinePanel } from '../../types';
import { toast } from 'sonner';
import { sleep } from '../utils/panelProcessingUtils';
import { isMetadataObject } from '../types/panelMetadataTypes';

// Poll for processing status until complete
export const pollProcessingStatus = async (
  panelId: string,
  selectedPanels: PipelinePanel[],
  setSelectedPanels: React.Dispatch<React.SetStateAction<PipelinePanel[]>>
): Promise<void> => {
  let isProcessing = true;
  let retryCount = 0;
  const maxRetries = 30; // Retry for up to ~5 minutes (with exponential backoff)
  
  while (isProcessing && retryCount < maxRetries) {
    try {
      await sleep(3000 + retryCount * 500); // Start with 3s, gradually increase
      
      // Check if the panel is still in the selected panels
      const currentPanels = selectedPanels;
      const panelIndex = currentPanels.findIndex(p => p.id === panelId);
      if (panelIndex === -1) break; // Panel was removed, stop polling
      
      // Query the database for the current status
      const { data, error } = await supabase
        .from('panel_metadata')
        .select('metadata')
        .eq('panel_id', panelId)
        .maybeSingle();
        
      if (error) {
        console.error("Error checking processing status:", error);
        retryCount++;
        continue;
      }
      
      // Check if metadata exists and is an object
      if (!data?.metadata || !isMetadataObject(data.metadata)) {
        retryCount++;
        continue;
      }
      
      // Check if processing is complete
      if (data.metadata.processing !== true) {
        isProcessing = false;
        
        // Update the panel with the results
        const updatedPanels = [...currentPanels];
        updatedPanels[panelIndex] = {
          ...updatedPanels[panelIndex],
          isProcessing: false,
          isError: typeof data.metadata.error === 'string' && data.metadata.error.length > 0,
          status: typeof data.metadata.error === 'string' && data.metadata.error.length > 0 ? 'error' : 'done',
          metadata: data.metadata,
          content: typeof data.metadata.content === 'string' ? data.metadata.content : undefined,
          sceneType: typeof data.metadata.scene_type === 'string' ? data.metadata.scene_type : undefined,
          characterCount: typeof data.metadata.character_count === 'number' ? data.metadata.character_count : undefined,
          mood: typeof data.metadata.mood === 'string' ? data.metadata.mood : undefined,
          actionLevel: typeof data.metadata.action_level === 'string' ? data.metadata.action_level : undefined,
          lastProcessedAt: typeof data.metadata.processed_at === 'string' ? data.metadata.processed_at : undefined,
          debugOverlay: Array.isArray(data.metadata.labels) ? data.metadata.labels : undefined,
          errorMessage: typeof data.metadata.error === 'string' ? data.metadata.error : undefined
        };
        setSelectedPanels(updatedPanels);
        
        // Show appropriate toast
        if (typeof data.metadata.error === 'string' && data.metadata.error.length > 0) {
          toast.error(`Processing failed: ${data.metadata.error}`);
        } else {
          toast.success('Panel processing completed');
        }
      }
      
      retryCount++;
    } catch (error) {
      console.error("Error during polling:", error);
      retryCount++;
    }
  }
  
  // If we reached max retries but didn't complete, show an error
  if (isProcessing && retryCount >= maxRetries) {
    console.error(`Processing timed out for panel ${panelId} after ${maxRetries} retries`);
    
    const currentPanels = selectedPanels;
    const panelIndex = currentPanels.findIndex(p => p.id === panelId);
    
    if (panelIndex !== -1) {
      // Update the panel to show timeout
      const timeoutPanels = [...currentPanels];
      timeoutPanels[panelIndex] = {
        ...timeoutPanels[panelIndex],
        isProcessing: false,
        isError: true,
        status: 'error',
        errorMessage: 'Processing timed out. Please try again.'
      };
      setSelectedPanels(timeoutPanels);
      toast.error('Processing timed out. Please try again later.');
    }
  }
};
