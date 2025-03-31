
import { MangaPanel } from '@/types/manga';

export type NarrationType = 'anime drama' | 'noir' | 'shonen epic' | 'comedic dub';
export type NarrationFormat = 'narrative prose' | 'screenplay-style';
export type VoiceType = 'male' | 'female' | 'neutral';

export interface PipelinePanel extends MangaPanel {
  narration?: string;
  narrationTone?: NarrationType;
  narrationFormat?: NarrationFormat;
  voiceType?: VoiceType;
  audioUrl?: string;
  isProcessing?: boolean;
  isError?: boolean;
  errorMessage?: string;
  metadata?: any;
  content?: string;
  sceneType?: string;
  characterCount?: number;
  mood?: string;
  actionLevel?: string;
}

export interface PipelineContextType {
  selectedPanels: PipelinePanel[];
  setSelectedPanels: React.Dispatch<React.SetStateAction<PipelinePanel[]>>;
  activePanel: PipelinePanel | null;
  setActivePanel: React.Dispatch<React.SetStateAction<PipelinePanel | null>>;
  narrationTone: NarrationType;
  setNarrationTone: React.Dispatch<React.SetStateAction<NarrationType>>;
  narrationFormat: NarrationFormat;
  setNarrationFormat: React.Dispatch<React.SetStateAction<NarrationFormat>>;
  voiceType: VoiceType;
  setVoiceType: React.Dispatch<React.SetStateAction<VoiceType>>;
  processPanel: (panelId: string) => Promise<void>;
  generateNarration: (panelId: string) => Promise<void>;
  generateAudio: (panelId: string) => Promise<void>;
  updatePanelNarration: (panelId: string, narration: string) => void;
}
