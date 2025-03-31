
import { PipelinePanel } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  convertToMetadata, 
  convertLabelsForPipeline,
  errorHasLength,
  getErrorString
} from './types/panelMetadataTypes';
import { updatePanelWithProcessingStatus } from './utils/panelProcessingUtils';
import { callProcessPanelFunction } from './api/panelEdgeFunctionClient';
import { pollProcessingStatus } from './polling/pollProcessingStatus';
import { getMangaVisionClient, getMangaModelClient, MangaVisionClient, MangaModelClient } from '../pipelineOperations';
import { MangaVisionTransformer } from '@/utils/mangaVisionTransformer';

// Simple URL hash function for caching
const hashImageUrl = (url: string) => {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

export const processPanel = async (
  panelId: string,
  selectedPanels: PipelinePanel[],
  setSelectedPanels: React.Dispatch<React.SetStateAction<PipelinePanel[]>>,
  useClientSide: boolean = false // New parameter to control processing mode
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

    const imageHash = hashImageUrl(imageUrl);
    
    let result;
    
    // Client-side processing path
    if (useClientSide) {
      try {
        toast.info('Processing with client-side vision API...');
        
        // First try the new MangaModelClient
        try {
          const mangaModelClient = await getMangaModelClient();
          
          // For data URLs, convert to blob before sending
          let imageInput;
          if (imageUrl.startsWith('data:')) {
            imageInput = MangaModelClient.dataURLToBlob(imageUrl);
          } else {
            // For remote URLs, use the URL directly
            imageInput = imageUrl;
          }
          
          const predictionResult = await mangaModelClient.predict(
            imageInput, 
            "v2023.12.07_n_yv11", 
            0.7, 
            0.25, 
            true,
            { imageUrl }
          );
          
          // Convert the prediction result to panel metadata
          const pipelineLabels = MangaModelClient.convertToPanelLabels(predictionResult);
          
          // Create metadata structure
          const metadata = {
            labels: pipelineLabels,
            scene_type: determineSceneType(predictionResult.annotations),
            character_count: countCharacters(predictionResult.annotations),
            content: generateContentDescription(predictionResult.annotations),
            mood: determineMood(predictionResult.annotations),
            action_level: determineActionLevel(predictionResult.annotations),
            processed_at: new Date().toISOString(),
            hash: imageHash
          };
          
          // Update the panel with the results
          const resultPanels = [...selectedPanels];
          resultPanels[panelIndex] = {
            ...resultPanels[panelIndex],
            isProcessing: false,
            status: 'done',
            metadata: metadata,
            content: metadata.content,
            sceneType: metadata.scene_type,
            characterCount: metadata.character_count,
            mood: metadata.mood,
            actionLevel: metadata.action_level,
            lastProcessedAt: metadata.processed_at,
            debugOverlay: pipelineLabels
          };
          
          setSelectedPanels(resultPanels);
          toast.success('Panel processed successfully using client-side API');
          return;
        } catch (modelClientError) {
          console.error("New MangaModelClient failed, falling back to MangaVisionClient:", modelClientError);
          
          // Fall back to the original MangaVisionClient
          const mangaVisionClient = await getMangaVisionClient();
          
          // For data URLs, convert to blob before sending
          let imageInput;
          if (imageUrl.startsWith('data:')) {
            imageInput = MangaVisionClient.dataURLToBlob(imageUrl);
          } else {
            // For remote URLs, use the URL directly
            imageInput = imageUrl;
          }
          
          const predictionResult = await mangaVisionClient.predict(imageInput);
          const metadata = MangaVisionTransformer.toPanelMetadata(predictionResult, imageHash);
          
          // Convert labels to the format expected by the pipeline
          const pipelineLabels = metadata.labels || [];
          
          // Update the panel with the results
          const resultPanels = [...selectedPanels];
          resultPanels[panelIndex] = {
            ...resultPanels[panelIndex],
            isProcessing: false,
            status: 'done',
            metadata: metadata,
            content: metadata.content,
            sceneType: metadata.scene_type,
            characterCount: metadata.character_count,
            mood: metadata.mood,
            actionLevel: metadata.action_level,
            lastProcessedAt: metadata.processed_at,
            debugOverlay: pipelineLabels
          };
          
          setSelectedPanels(resultPanels);
          toast.success('Panel processed successfully using client-side API');
          return;
        }
      } catch (clientError) {
        console.error("Client-side processing failed, falling back to edge function:", clientError);
        toast.error('Client-side processing failed, falling back to server');
        
        // Fall back to edge function if client-side fails
      }
    }
    
    // Server-side processing via Supabase Edge Function
    const data = await callProcessPanelFunction(panelId, imageUrl);
    
    if (!data || !data.result) throw new Error('Invalid response from edge function');
    
    // Convert and validate the result data
    result = convertToMetadata(data.result);
    
    // Convert labels to the format expected by the pipeline
    const pipelineLabels = convertLabelsForPipeline(result);
    
    // Update the panel with the initial processing status
    const resultPanels = [...selectedPanels];
    resultPanels[panelIndex] = {
      ...resultPanels[panelIndex],
      isProcessing: result.processing === true,
      status: result.processing === true ? 'processing' : 'done',
      metadata: {
        ...(result as any),  // Type assertion to avoid incompatible labels
        labels: pipelineLabels // Use the converted labels that match PanelLabel[]
      },
      content: result.content,
      sceneType: result.scene_type,
      characterCount: result.character_count,
      mood: result.mood,
      actionLevel: result.action_level,
      lastProcessedAt: result.processed_at,
      // Set debug overlay if we have labels
      debugOverlay: pipelineLabels
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

// Helper functions to extract metadata from annotations
function determineSceneType(annotations: any[]): string {
  // Basic logic to determine scene type
  const labels = annotations.map(a => a.label.toLowerCase());
  
  if (labels.some(l => l.includes('action'))) return 'action';
  if (labels.some(l => l.includes('character'))) return 'character';
  if (labels.some(l => l.includes('background'))) return 'scenery';
  
  return 'general';
}

function countCharacters(annotations: any[]): number {
  return annotations.filter(a => 
    a.label.toLowerCase().includes('character') || 
    a.label.toLowerCase().includes('person')
  ).length;
}

function generateContentDescription(annotations: any[]): string {
  if (annotations.length === 0) return 'Empty scene';
  
  const labelCounts: Record<string, number> = {};
  
  annotations.forEach(a => {
    const label = a.label.toLowerCase();
    labelCounts[label] = (labelCounts[label] || 0) + 1;
  });
  
  const description = Object.entries(labelCounts)
    .map(([label, count]) => `${count} ${label}${count > 1 ? 's' : ''}`)
    .join(', ');
  
  return description || 'Scene with objects';
}

function determineMood(annotations: any[]): string {
  // Simplified mood detection based on labels
  const labels = annotations.map(a => a.label.toLowerCase());
  
  if (labels.some(l => l.includes('action') || l.includes('fighting'))) return 'intense';
  if (labels.some(l => l.includes('smile') || l.includes('happy'))) return 'happy';
  if (labels.some(l => l.includes('sad') || l.includes('cry'))) return 'sad';
  
  return 'neutral';
}

function determineActionLevel(annotations: any[]): string {
  // Simplified action level detection
  const actionLabels = annotations.filter(a => 
    a.label.toLowerCase().includes('action') || 
    a.label.toLowerCase().includes('move')
  ).length;
  
  if (actionLabels > 2) return 'high';
  if (actionLabels > 0) return 'medium';
  return 'low';
}
