
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { PipelinePanel, PipelineContextType, NarrationType, NarrationFormat, VoiceType } from './pipeline/types';
import { processPanel as processPanelOperation, 
         generateNarration as generateNarrationOperation,
         generateAudio as generateAudioOperation,
         updatePanelNarration as updatePanelNarrationOperation } from './pipeline/pipelineOperations';
import { isDebugMode } from '@/utils/debugUtils';

const PipelineContext = createContext<PipelineContextType | undefined>(undefined);

export const PipelineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Add console log for debugging
  console.log('PipelineProvider rendering');
  
  const [selectedPanels, setSelectedPanels] = useState<PipelinePanel[]>([]);
  const [activePanel, setActivePanel] = useState<PipelinePanel | null>(null);
  const [narrationTone, setNarrationTone] = useState<NarrationType>('anime drama');
  const [narrationFormat, setNarrationFormat] = useState<NarrationFormat>('narrative prose');
  const [voiceType, setVoiceType] = useState<VoiceType>('male');
  const [debugMode, setDebugMode] = useState<boolean>(isDebugMode());
  const [jobsRunning, setJobsRunning] = useState<Record<string, boolean>>({});
  const [useClientSideProcessing, setUseClientSideProcessing] = useState<boolean>(false);

  useEffect(() => {
    const checkDebugMode = () => {
      setDebugMode(isDebugMode());
    };
    
    window.addEventListener('storage', checkDebugMode);
    return () => {
      window.removeEventListener('storage', checkDebugMode);
    };
  }, []);

  useEffect(() => {
    const savedPreference = localStorage.getItem('useClientSideProcessing');
    if (savedPreference !== null) {
      setUseClientSideProcessing(savedPreference === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('useClientSideProcessing', useClientSideProcessing.toString());
  }, [useClientSideProcessing]);

  const processPanel = async (panelId: string) => {
    // Track job status
    setJobsRunning(prev => ({ ...prev, [panelId]: true }));
    try {
      // Fixed: Using the correct number of arguments
      await processPanelOperation(panelId, selectedPanels, setSelectedPanels, useClientSideProcessing);
    } finally {
      setJobsRunning(prev => ({ ...prev, [panelId]: false }));
    }
  };

  const generateNarration = async (panelId: string) => {
    // Track job status
    setJobsRunning(prev => ({ ...prev, [panelId]: true }));
    try {
      await generateNarrationOperation(
        panelId,
        selectedPanels,
        setSelectedPanels,
        activePanel,
        setActivePanel,
        narrationTone,
        narrationFormat
      );
    } finally {
      setJobsRunning(prev => ({ ...prev, [panelId]: false }));
    }
  };

  const generateAudio = async (panelId: string) => {
    // Track job status
    setJobsRunning(prev => ({ ...prev, [panelId]: true }));
    try {
      await generateAudioOperation(
        panelId,
        selectedPanels,
        setSelectedPanels,
        activePanel,
        setActivePanel,
        voiceType
      );
    } finally {
      setJobsRunning(prev => ({ ...prev, [panelId]: false }));
    }
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

  const contextValue = {
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
    updatePanelNarration,
    debugMode,
    setDebugMode,
    jobsRunning,
    useClientSideProcessing,
    setUseClientSideProcessing
  };

  return (
    <PipelineContext.Provider value={contextValue}>
      {children}
    </PipelineContext.Provider>
  );
};

export const usePipeline = () => {
  const context = useContext(PipelineContext);
  if (context === undefined) {
    console.error('usePipeline was called outside of PipelineProvider');
    throw new Error('usePipeline must be used within a PipelineProvider');
  }
  return context;
};

export type { PipelinePanel, NarrationType, NarrationFormat, VoiceType } from './pipeline/types';
