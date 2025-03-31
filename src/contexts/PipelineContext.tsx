
import React, { createContext, useState, useContext, ReactNode } from 'react';
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
}

interface PipelineContextType {
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

const PipelineContext = createContext<PipelineContextType | undefined>(undefined);

export const PipelineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedPanels, setSelectedPanels] = useState<PipelinePanel[]>([]);
  const [activePanel, setActivePanel] = useState<PipelinePanel | null>(null);
  const [narrationTone, setNarrationTone] = useState<NarrationType>('anime drama');
  const [narrationFormat, setNarrationFormat] = useState<NarrationFormat>('narrative prose');
  const [voiceType, setVoiceType] = useState<VoiceType>('male');

  const processPanel = async (panelId: string) => {
    setSelectedPanels(panels => 
      panels.map(panel => 
        panel.id === panelId 
          ? { ...panel, isProcessing: true }
          : panel
      )
    );

    try {
      // Here we will call the edge function to analyze the image
      // For now, we'll just simulate a successful process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSelectedPanels(panels => 
        panels.map(panel => 
          panel.id === panelId 
            ? { ...panel, isProcessing: false }
            : panel
        )
      );
    } catch (error) {
      setSelectedPanels(panels => 
        panels.map(panel => 
          panel.id === panelId 
            ? { 
                ...panel, 
                isProcessing: false, 
                isError: true, 
                errorMessage: error instanceof Error ? error.message : 'An error occurred' 
              }
            : panel
        )
      );
    }
  };

  const generateNarration = async (panelId: string) => {
    setSelectedPanels(panels => 
      panels.map(panel => 
        panel.id === panelId 
          ? { ...panel, isProcessing: true }
          : panel
      )
    );

    try {
      // Here we will call the edge function to generate narration
      // For now, we'll just simulate a successful narration generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockNarration = "As the sun sets over the bustling city, our protagonist stands at the crossroads of destiny. The weight of their decisions hangs in the air, tension rising with each passing moment.";
      
      setSelectedPanels(panels => 
        panels.map(panel => 
          panel.id === panelId 
            ? { 
                ...panel, 
                isProcessing: false, 
                narration: mockNarration,
                narrationTone,
                narrationFormat
              }
            : panel
        )
      );
      
      // Update active panel if this is the one being viewed
      if (activePanel?.id === panelId) {
        setActivePanel(prev => prev ? { 
          ...prev, 
          isProcessing: false,
          narration: mockNarration,
          narrationTone,
          narrationFormat
        } : null);
      }
    } catch (error) {
      setSelectedPanels(panels => 
        panels.map(panel => 
          panel.id === panelId 
            ? { 
                ...panel, 
                isProcessing: false, 
                isError: true, 
                errorMessage: error instanceof Error ? error.message : 'An error occurred' 
              }
            : panel
        )
      );
    }
  };

  const generateAudio = async (panelId: string) => {
    setSelectedPanels(panels => 
      panels.map(panel => 
        panel.id === panelId 
          ? { ...panel, isProcessing: true }
          : panel
      )
    );

    try {
      // Here we will call the edge function to generate audio
      // For now, we'll just simulate a successful audio generation
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Placeholder audio URL for demonstration
      const mockAudioUrl = "https://example.com/audio.mp3";
      
      setSelectedPanels(panels => 
        panels.map(panel => 
          panel.id === panelId 
            ? { 
                ...panel, 
                isProcessing: false, 
                audioUrl: mockAudioUrl,
                voiceType
              }
            : panel
        )
      );
      
      // Update active panel if this is the one being viewed
      if (activePanel?.id === panelId) {
        setActivePanel(prev => prev ? { 
          ...prev, 
          isProcessing: false,
          audioUrl: mockAudioUrl,
          voiceType
        } : null);
      }
    } catch (error) {
      setSelectedPanels(panels => 
        panels.map(panel => 
          panel.id === panelId 
            ? { 
                ...panel, 
                isProcessing: false, 
                isError: true, 
                errorMessage: error instanceof Error ? error.message : 'An error occurred' 
              }
            : panel
        )
      );
    }
  };

  const updatePanelNarration = (panelId: string, narration: string) => {
    setSelectedPanels(panels => 
      panels.map(panel => 
        panel.id === panelId 
          ? { ...panel, narration }
          : panel
      )
    );
    
    // Update active panel if this is the one being viewed
    if (activePanel?.id === panelId) {
      setActivePanel(prev => prev ? { ...prev, narration } : null);
    }
  };

  return (
    <PipelineContext.Provider value={{
      selectedPanels,
      setSelectedPanels,
      activePanel,
      setActivePanel,
      narrationTone,
      setNarrationTone,
      narrationFormat,
      setNarrationFormat,
      voiceType,
      setVoiceType,
      processPanel,
      generateNarration,
      generateAudio,
      updatePanelNarration
    }}>
      {children}
    </PipelineContext.Provider>
  );
};

export const usePipeline = () => {
  const context = useContext(PipelineContext);
  if (context === undefined) {
    throw new Error('usePipeline must be used within a PipelineProvider');
  }
  return context;
};
