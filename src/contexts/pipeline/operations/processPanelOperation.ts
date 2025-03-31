
import { PipelinePanel } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('process-panel', {
      body: {
        panelId,
        imageUrl
      }
    });

    if (error) throw error;

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
