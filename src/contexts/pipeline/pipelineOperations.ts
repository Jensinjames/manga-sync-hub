
import { PipelinePanel, NarrationType, NarrationFormat, VoiceType } from './types';
import { processPanel } from './operations/processPanelOperation';
import { generateNarration, updatePanelNarration } from './operations/narrationOperations';
import { generateAudio } from './operations/audioOperations';
import { toast } from 'sonner';

// Export the Hugging Face endpoints configuration with timeout settings
export const HF_CONFIG = {
  yoloEndpoint: 'https://jensin-manga109-yolo.hf.space/gradio_api/call/_gr_detect',
  modelVersion: 'v2023.12.07_n_yv11',
  requestTimeout: 30000 // 30 second timeout for API requests
};

// Lazy-load heavy resources
export const loadResources = async () => {
  try {
    // This function can be used to dynamically load resources when they're needed
    // to avoid preloading resources that may not be used immediately
    return true;
  } catch (error) {
    console.error('Failed to load resources:', error);
    return false;
  }
};

export { processPanel };
export { generateNarration, updatePanelNarration };
export { generateAudio };
