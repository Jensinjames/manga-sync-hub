
import { PipelinePanel } from '../../types';
import { MangaModelClient } from '@/utils/MangaModelClient';
import { MangaVisionTransformer } from '@/utils/mangaVisionTransformer';
import { sleep } from '../utils/panelProcessingUtils';
import { toast } from 'sonner';

// Process the panel image entirely client-side using ML model directly in browser
export const processClientSide = async (
  panel: PipelinePanel,
  options: {
    onProgress?: (status: string) => void;
    onSuccess?: (panel: PipelinePanel) => void;
  } = {}
): Promise<PipelinePanel> => {
  const { onProgress, onSuccess } = options;
  const updatedPanel = { ...panel };
  
  onProgress?.('Initializing client-side ML model...');
  
  try {
    // Initialize the ML model client
    const client = MangaModelClient.getInstance();
    
    // Show progress for model loading
    onProgress?.('Loading machine learning model...');
    await client.ensureModelLoaded(() => {
      onProgress?.('ML model loaded, analyzing image...');
    });
    
    // Show progress for inference
    onProgress?.('Analyzing panel content...');
    
    // Analyze the image using TensorFlow.js
    const startTime = performance.now();
    const result = await client.detectObjects(panel.imageUrl);
    const inferenceTime = Math.round(performance.now() - startTime);
    
    // Sometimes the model needs to warm up, so if there are no results, wait and retry
    if (!result.annotations || result.annotations.length === 0) {
      onProgress?.('Warming up model, retrying analysis...');
      await sleep(500);
      const retryResult = await client.detectObjects(panel.imageUrl);
      
      // If still no results, generate a minimal synthetic result
      if (!retryResult.annotations || retryResult.annotations.length === 0) {
        onProgress?.('No objects detected, using fallback analysis...');
        const fallbackResult = {
          image_id: panel.id,
          annotations: [{
            label: 'panel',
            confidence: 0.8,
            bbox: [0, 0, 0, 0] as [number, number, number, number]
          }]
        };
        
        // Convert the normalized prediction to our app's format
        const normalizedResult = MangaVisionTransformer.normalizePrediction(fallbackResult);
        updatedPanel.labels = MangaVisionTransformer.toLabels(normalizedResult.annotations);
        updatedPanel.debugOverlay = updatedPanel.labels;
      } else {
        const normalizedResult = MangaVisionTransformer.normalizePrediction(retryResult);
        updatedPanel.labels = MangaVisionTransformer.toLabels(normalizedResult.annotations);
        updatedPanel.debugOverlay = updatedPanel.labels;
      }
    } else {
      // Normal case - got results on the first try
      const normalizedResult = MangaVisionTransformer.normalizePrediction(result);
      updatedPanel.labels = MangaVisionTransformer.toLabels(normalizedResult.annotations);
      updatedPanel.debugOverlay = updatedPanel.labels;
    }
    
    // Add metadata fields for the processedPanel
    updatedPanel.processedAt = new Date().toISOString();
    updatedPanel.processingError = null;
    updatedPanel.status = 'done';
    updatedPanel.isProcessing = false;
    updatedPanel.isError = false;
    updatedPanel.content = `Processed via client-side ML (${inferenceTime}ms)`;
    updatedPanel.sceneType = updatedPanel.labels?.some(l => l.label.includes("scene")) ? 
      "Complex scene" : "Character focus";
    updatedPanel.characterCount = updatedPanel.labels?.filter(
      l => l.label.includes("face") || l.label.includes("person")
    ).length || 0;
    updatedPanel.mood = "Neutral";
    updatedPanel.actionLevel = updatedPanel.labels && updatedPanel.labels.length > 5 ? "High" : "Medium";
    
    onSuccess?.(updatedPanel);
    onProgress?.('Analysis complete!');
    
    return updatedPanel;
  } catch (error) {
    console.error('Client-side processing failed:', error);
    
    // Update panel with error state
    updatedPanel.isProcessing = false;
    updatedPanel.isError = true;
    updatedPanel.status = 'error';
    updatedPanel.processingError = error instanceof Error ? error.message : 'Unknown error';
    
    toast.error('Failed to process panel with client-side ML');
    throw error;
  }
};
