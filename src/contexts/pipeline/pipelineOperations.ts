
import { PipelinePanel, NarrationType, NarrationFormat, VoiceType } from './types';
import { processPanel } from './operations/processPanelOperation';
import { generateNarration, updatePanelNarration } from './operations/narrationOperations';
import { generateAudio } from './operations/audioOperations';
import { toast } from 'sonner';

// Export the Hugging Face endpoints configuration
export const HF_CONFIG = {
  yoloEndpoint: 'https://jensin-manga109-yolo.hf.space/gradio_api/call/_gr_detect',
  modelVersion: 'v2023.12.07_n_yv11'
};

export { processPanel };
export { generateNarration, updatePanelNarration };
export { generateAudio };
