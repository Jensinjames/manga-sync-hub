
import { MangaPanel } from '@/types/manga';

export type NarrationType = 'anime drama' | 'noir' | 'shonen epic' | 'comedic dub';
export type NarrationFormat = 'narrative prose' | 'screenplay-style';
export type VoiceType = 'male' | 'female' | 'neutral';

export interface PanelLabel {
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PanelMetadata {
  labels?: PanelLabel[];
  imageHash?: string;
  content?: string;
  scene_type?: string;
  character_count?: number;
  mood?: string;
  action_level?: string;
  processed_at?: string;
  error?: string;
  error_timestamp?: string;
}

export type PanelStatus = 'idle' | 'processing' | 'error' | 'done';

export interface PipelinePanel extends MangaPanel {
  narration?: string;
  narrationTone?: NarrationType;
  narrationFormat?: NarrationFormat;
  voiceType?: VoiceType;
  audioUrl?: string;
  isProcessing?: boolean;
  isError?: boolean;
  errorMessage?: string;
  metadata?: PanelMetadata;
  content?: string;
  sceneType?: string;
  characterCount?: number;
  mood?: string;
  actionLevel?: string;
  status?: PanelStatus;
  lastProcessedAt?: string;
  debugOverlay?: PanelLabel[];
  jobId?: string;
  labels?: PanelLabel[];
  processedAt?: string;
  processingError?: string | null;
  forceClientProcessing?: boolean;
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
  debugMode: boolean;
  setDebugMode: React.Dispatch<React.SetStateAction<boolean>>;
  jobsRunning: Record<string, boolean>;
  useClientSideProcessing: boolean;
  setUseClientSideProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}
