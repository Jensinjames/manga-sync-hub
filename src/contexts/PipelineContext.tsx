
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { PipelinePanel, PipelineContextType, NarrationType, NarrationFormat, VoiceType } from './pipeline/types';
import { processPanel as processPanelOperation, 
         generateNarration as generateNarrationOperation,
         generateAudio as generateAudioOperation,
         updatePanelNarration as updatePanelNarrationOperation } from './pipeline/pipelineOperations';

const PipelineContext = createContext<PipelineContextType | undefined>(undefined);

export const PipelineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedPanels, setSelectedPanels] = useState<PipelinePanel[]>([]);
  const [activePanel, setActivePanel] = useState<PipelinePanel | null>(null);
  const [narrationTone, setNarrationTone] = useState<NarrationType>('anime drama');
  const [narrationFormat, setNarrationFormat] = useState<NarrationFormat>('narrative prose');
  const [voiceType, setVoiceType] = useState<VoiceType>('male');

  const processPanel = async (panelId: string) => {
    await processPanelOperation(panelId);
  };

  const generateNarration = async (panelId: string) => {
    await generateNarrationOperation(
      panelId,
      selectedPanels,
      setSelectedPanels,
      activePanel,
      setActivePanel,
      narrationTone,
      narrationFormat
    );
  };

  const generateAudio = async (panelId: string) => {
    await generateAudioOperation(
      panelId,
      selectedPanels,
      setSelectedPanels,
      activePanel,
      setActivePanel,
      voiceType
    );
  };

  const updatePanelNarration = (panelId: string, narration: string) => {
    updatePanelNarrationOperation(
      panelId,
      narration,
      selectedPanels,
      setSelectedPanels,
      activePanel,
      setActivePanel
    );
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

// Re-export types for easy access
export { PipelinePanel, NarrationType, NarrationFormat, VoiceType } from './pipeline/types';
