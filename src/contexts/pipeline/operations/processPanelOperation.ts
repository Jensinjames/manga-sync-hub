
import { PipelinePanel } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

// Helper for exponential backoff
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to safely type-check JSON metadata
const isMetadataObject = (data: Json): data is { [key: string]: any } => {
  return typeof data === 'object' && data !== null && !Array.isArray(data);
};

export const processPanel = async (
  panelId: string,
  selectedPanels: PipelinePanel[],
  setSelectedPanels: React.Dispatch<React.SetStateAction<PipelinePanel[]>>
): Promise<void> => {
  // Find the panel in the selected panels
  const panelIndex = selectedPanels.findIndex(p => p.id === panelId);
  if (panelIndex === -1) return;
  
  // Mark the panel as processing
  const updatedPanels = [...selectedPanels];
  updatedPanels[panelIndex] = { 
    ...updatedPanels[panelIndex], 
    isProcessing: true,
    isError: false,
    status: 'processing'
  };
  setSelectedPanels(updatedPanels);

  try {
    const panel = selectedPanels[panelIndex];
    const imageUrl = panel.imageUrl;
    
    if (!imageUrl) {
      throw new Error('Panel has no image URL');
    }

    // Call the Supabase Edge Function with retry logic
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Add attempt number to the request for logging/debugging
        const { data, error } = await supabase.functions.invoke('process-panel', {
          body: {
            panelId,
            imageUrl,
            attempt: attempt + 1
          }
        });
        
        if (error) throw error;
        if (!data || !data.result) throw new Error('Invalid response from edge function');
        
        // Safely type check the result data
        const result = data.result;
        if (!isMetadataObject(result)) {
          throw new Error('Invalid metadata format from edge function');
        }
        
        // Update the panel with the initial processing status
        const resultPanels = [...selectedPanels];
        resultPanels[panelIndex] = {
          ...resultPanels[panelIndex],
          isProcessing: result.processing === true,
          status: result.processing === true ? 'processing' : 'done',
          metadata: result,
          content: result.content as string | undefined,
          sceneType: result.scene_type as string | undefined,
          characterCount: typeof result.character_count === 'number' ? result.character_count : undefined,
          mood: result.mood as string | undefined,
          actionLevel: result.action_level as string | undefined,
          lastProcessedAt: result.processed_at as string | undefined,
          // Set debug overlay if we have labels
          debugOverlay: Array.isArray(result.labels) ? result.labels : undefined
        };
        setSelectedPanels(resultPanels);
        
        // If processing is happening in background, start polling
        if (result.processing === true) {
          toast.info('Processing started - this may take a moment');
          pollProcessingStatus(panelId, selectedPanels, setSelectedPanels);
        } else {
          toast.success(`Panel processed successfully${data.cached ? ' (cached)' : ''}`);
        }
        return;
      } catch (err) {
        lastError = err as Error;
        console.error(`Attempt ${attempt + 1} failed:`, err);
        
        // Don't wait after the last attempt
        if (attempt < maxRetries - 1) {
          // Exponential backoff: 1s, 2s, 4s, etc.
          const backoffTime = Math.pow(2, attempt) * 1000;
          await sleep(backoffTime);
        }
      }
    }
    
    // If we get here, all retries failed
    throw lastError || new Error('Failed after multiple attempts');
  } catch (error) {
    console.error("Error processing panel:", error);
    
    // Mark the panel as having an error
    const errorPanels = [...selectedPanels];
    errorPanels[panelIndex] = {
      ...errorPanels[panelIndex],
      isProcessing: false,
      isError: true,
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'An error occurred'
    };
    setSelectedPanels(errorPanels);
    
    // Show a toast with the error
    toast.error(`Failed to process panel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return;
  }
};

// Poll for processing status until complete
const pollProcessingStatus = async (
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
          isError: !!data.metadata.error,
          status: data.metadata.error ? 'error' : 'done',
          metadata: data.metadata,
          content: data.metadata.content as string | undefined,
          sceneType: data.metadata.scene_type as string | undefined,
          characterCount: typeof data.metadata.character_count === 'number' ? data.metadata.character_count : undefined,
          mood: data.metadata.mood as string | undefined,
          actionLevel: data.metadata.action_level as string | undefined,
          lastProcessedAt: data.metadata.processed_at as string | undefined,
          debugOverlay: Array.isArray(data.metadata.labels) ? data.metadata.labels : undefined,
          errorMessage: data.metadata.error as string | undefined
        };
        setSelectedPanels(updatedPanels);
        
        // Show appropriate toast
        if (data.metadata.error) {
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
