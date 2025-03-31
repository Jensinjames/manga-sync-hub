
import { PipelinePanel } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Helper for exponential backoff
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
            attempt: attempt + 1,
            model: 'v2023.12.07_n_yv11', // Explicitly specify the model version
            endpoint: 'https://jensin-manga109-yolo.hf.space/gradio_api/call/_gr_detect' // Explicitly specify endpoint
          }
        });
        
        if (error) throw error;
        if (!data || !data.result) throw new Error('Invalid response from edge function');
        
        // Update the panel with the results
        const resultPanels = [...selectedPanels];
        resultPanels[panelIndex] = {
          ...resultPanels[panelIndex],
          isProcessing: false,
          status: 'done',
          metadata: data.result,
          content: data.result.content,
          sceneType: data.result.scene_type,
          characterCount: data.result.character_count,
          mood: data.result.mood,
          actionLevel: data.result.action_level,
          lastProcessedAt: data.result.processed_at,
          // Set debug overlay if we have labels
          debugOverlay: data.result.labels
        };
        setSelectedPanels(resultPanels);
        
        toast.success(`Panel processed successfully${data.cached ? ' (cached)' : ''}`);
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
