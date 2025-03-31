
import { supabase } from '@/integrations/supabase/client';
import { PipelinePanel } from '../../types';
import { toast } from 'sonner';
import { sleep } from '../utils/panelProcessingUtils';
import { 
  convertToMetadata, 
  convertLabelsForPipeline,
  errorHasLength,
  getErrorString
} from '../types/panelMetadataTypes';
import { getPanelMetadata, getPanelJobs } from '../api/panelEdgeFunctionClient';

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
      
      // Get both panel metadata and job status
      const [metadataResponse, jobsResponse] = await Promise.all([
        getPanelMetadata(panelId),
        getPanelJobs(panelId)
      ]);
      
      if (!metadataResponse || !metadataResponse.data || !metadataResponse.data.metadata) {
        console.log("No metadata found, will retry");
        retryCount++;
        continue;
      }
      
      // Check job status first (it's more authoritative)
      const latestJob = jobsResponse && jobsResponse.length > 0 ? jobsResponse[0] : null;
      const jobStatus = latestJob ? latestJob.status : 'unknown';
      
      // Convert the metadata to a strongly typed object
      const metadata = convertToMetadata(metadataResponse.data.metadata.metadata || metadataResponse.data.metadata);
      
      // Determine if processing is complete based on job status and metadata
      if ((jobStatus === 'done' || jobStatus === 'error') || metadata.processing !== true) {
        isProcessing = false;
        
        // Convert labels to the format expected by the pipeline
        const pipelineLabels = convertLabelsForPipeline(metadata);
        
        // Check if we have an error from the job or the metadata
        const hasError = jobStatus === 'error' || errorHasLength(metadata.error);
        const errorMessage = latestJob?.error_message || getErrorString(metadata.error);
        
        // Update the panel with the results
        const updatedPanels = [...currentPanels];
        updatedPanels[panelIndex] = {
          ...updatedPanels[panelIndex],
          isProcessing: false,
          isError: hasError,
          status: hasError ? 'error' : 'done',
          metadata: {
            ...(metadata as any), // Type assertion to avoid incompatible labels
            labels: pipelineLabels // Use the converted labels that match PanelLabel[]
          },
          content: metadata.content,
          sceneType: metadata.scene_type,
          characterCount: metadata.character_count,
          mood: metadata.mood,
          actionLevel: metadata.action_level,
          lastProcessedAt: metadata.processed_at,
          debugOverlay: pipelineLabels,
          errorMessage: errorMessage
        };
        setSelectedPanels(updatedPanels);
        
        // Show appropriate toast
        if (hasError) {
          toast.error(`Processing failed: ${errorMessage}`);
        } else {
          toast.success('Panel processing completed');
        }
      } else {
        console.log("Panel is still processing, will retry");
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
