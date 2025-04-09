import { PipelinePanel, NarrationType, NarrationFormat, VoiceType } from './types';
import { processPanel } from './operations/processPanelOperation';
import { generateNarration, updatePanelNarration } from './operations/narrationOperations';
import { generateAudio } from './operations/audioOperations';
import { MangaVisionClient, DEFAULT_CONFIG } from '@/utils/mangaVision';
import { MangaModelClient } from '@/utils/manga/MangaModelClient';
import { toast } from 'sonner';

// Export the Hugging Face endpoints configuration with timeout settings
export const HF_CONFIG = {
  yoloEndpoint: 'https://jensin-manga109-yolo.hf.space/gradio_api/call/_gr_detect',
  modelVersion: 'v2023.12.07_n_yv11',
  requestTimeout: 30000 // 30 second timeout for API requests
};

// Manga Vision client singleton for direct API access
let mangaVisionClientInstance: MangaVisionClient | null = null;
let mangaModelClientInstance: MangaModelClient | null = null;

// Get or initialize the MangaVisionClient
export const getMangaVisionClient = async (): Promise<MangaVisionClient> => {
  if (!mangaVisionClientInstance) {
    mangaVisionClientInstance = new MangaVisionClient();
    try {
      await mangaVisionClientInstance.connect();
    } catch (error) {
      console.error('Failed to connect to MangaVision client:', error);
      toast.error('Failed to connect to manga vision service');
      throw error;
    }
  }
  return mangaVisionClientInstance;
};

// Get or initialize the new MangaModelClient
export const getMangaModelClient = async (): Promise<MangaModelClient> => {
  if (!mangaModelClientInstance) {
    mangaModelClientInstance = new MangaModelClient("jensin-manga109-yolo");
    try {
      await mangaModelClientInstance.connect();
    } catch (error) {
      console.error('Failed to connect to MangaModel client:', error);
      toast.error('Failed to connect to manga vision service');
      throw error;
    }
  }
  return mangaModelClientInstance;
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

// Export the MangaVisionClient class so it's accessible in other modules
export { MangaVisionClient, MangaModelClient };
export { processPanel };
export { generateNarration, updatePanelNarration };
export { generateAudio };
