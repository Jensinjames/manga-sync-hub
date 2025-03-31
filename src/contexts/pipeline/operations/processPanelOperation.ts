
import { PipelinePanel } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { convertToMetadata } from './types/panelMetadataTypes';
import { updatePanelWithProcessingStatus } from './utils/panelProcessingUtils';
import { callProcessPanelFunction } from './api/panelEdgeFunctionClient';
import { pollProcessingStatus } from './polling/pollProcessingStatus';

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
  updatedPanels[panelIndex] = updatePanelWithProcessingStatus(
    updatedPanels[panelIndex],
    true,
    false,
    'processing'
  );
  setSelectedPanels(updatedPanels);

  try {
    const panel = selectedPanels[panelIndex];
    const imageUrl = panel.imageUrl;
    
    if (!imageUrl) {
      throw new Error('Panel has no image URL');
    }

    // Call the Supabase Edge Function with retry logic
    const data = await callProcessPanelFunction(panelId, imageUrl);
    
    if (!data || !data.result) throw new Error('Invalid response from edge function');
    
    // Convert and validate the result data
    const result = convertToMetadata(data.result);
    
    // Update the panel with the initial processing status
    const resultPanels = [...selectedPanels];
    resultPanels[panelIndex] = {
      ...resultPanels[panelIndex],
      isProcessing: result.processing === true,
      status: result.processing === true ? 'processing' : 'done',
      metadata: result,
      content: result.content,
      sceneType: result.scene_type,
      characterCount: result.character_count,
      mood: result.mood,
      actionLevel: result.action_level,
      lastProcessedAt: result.processed_at,
      // Set debug overlay if we have labels
      debugOverlay: result.labels
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
  } catch (error) {
    console.error("Error processing panel:", error);
    
    // Mark the panel as having an error
    const errorPanels = [...selectedPanels];
    errorPanels[panelIndex] = updatePanelWithProcessingStatus(
      errorPanels[panelIndex],
      false,
      true,
      'error',
      error instanceof Error ? error.message : 'An error occurred'
    );
    setSelectedPanels(errorPanels);
    
    // Show a toast with the error
    toast.error(`Failed to process panel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return;
  }
};
