
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
import { getPanelMetadata, getPanelJobs, MAX_RETRIES } from '../api';

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
      
      // Add fallback mechanism if API calls fail
      try {
        // Get both panel metadata and job status
        const [metadataResponse, jobsResponse] = await Promise.all([
          getPanelMetadata(panelId),
          getPanelJobs(panelId)
        ]);
        
        if (!metadataResponse || 
            !metadataResponse.data || 
            (!metadataResponse.data.metadata && !metadataResponse.success)) {
          console.log("No metadata found, will retry");
          retryCount++;
          continue;
        }
        
        // Check job status first (it's more authoritative)
        const latestJob = jobsResponse && jobsResponse.length > 0 ? jobsResponse[0] : null;
        const jobStatus = latestJob ? latestJob.status : 'unknown';
        
        // Safely extract metadata with fallbacks
        const metadataObj = metadataResponse.data.metadata ? 
          metadataResponse.data.metadata.metadata || metadataResponse.data.metadata :
          null;
          
        if (!metadataObj) {
          console.log("No metadata object found, will retry");
          retryCount++;
          continue;
        }
        
        // Convert the metadata to a strongly typed object
        const metadata = convertToMetadata(metadataObj);
        
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
            content: metadata.content || 'Content unavailable',
            sceneType: metadata.scene_type || 'Unknown',
            characterCount: metadata.character_count || 0,
            mood: metadata.mood || 'Unknown',
            actionLevel: metadata.action_level || 'Medium',
            lastProcessedAt: metadata.processed_at || new Date().toISOString(),
            debugOverlay: pipelineLabels,
            errorMessage: errorMessage || 'Unknown error'
          };
          setSelectedPanels(updatedPanels);
          
          // Show appropriate toast
          if (hasError) {
            toast.error(`Processing failed: ${errorMessage || 'Unknown error'}`);
          } else {
            toast.success('Panel processing completed');
          }
        } else {
          console.log("Panel is still processing, will retry");
        }
      } catch (pollError) {
        console.error("Error during metadata polling:", pollError);
        // Use client-side processing as a fallback
        if (retryCount >= MAX_RETRIES) {
          const currentPanels = selectedPanels;
          const panelIndex = currentPanels.findIndex(p => p.id === panelId);
          
          if (panelIndex !== -1) {
            // Try to trigger client-side processing as fallback
            toast.error("Server processing failed, trying client-side processing");
            
            // We'll let the system continue polling, but mark for client-side processing
            const updatedPanels = [...currentPanels];
            // Create a new object with all existing properties plus the new one
            const updatedPanel = {
              ...updatedPanels[panelIndex], 
              forceClientProcessing: true // Add flag for later
            };
            updatedPanels[panelIndex] = updatedPanel;
            setSelectedPanels(updatedPanels);
          }
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
