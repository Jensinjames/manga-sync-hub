
import { PipelinePanel, NarrationType, NarrationFormat, VoiceType } from './types';

export const processPanel = async (panelId: string): Promise<void> => {
  console.log(`Process panel method called for ${panelId}, but processing is handled in ImageProcessor component`);
};

export const generateNarration = async (
  panelId: string,
  selectedPanels: PipelinePanel[],
  setSelectedPanels: React.Dispatch<React.SetStateAction<PipelinePanel[]>>,
  activePanel: PipelinePanel | null,
  setActivePanel: React.Dispatch<React.SetStateAction<PipelinePanel | null>>,
  narrationTone: NarrationType,
  narrationFormat: NarrationFormat
): Promise<void> => {
  setSelectedPanels(panels => 
    panels.map(panel => 
      panel.id === panelId 
        ? { ...panel, isProcessing: true }
        : panel
    )
  );

  try {
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

export const generateAudio = async (
  panelId: string,
  selectedPanels: PipelinePanel[],
  setSelectedPanels: React.Dispatch<React.SetStateAction<PipelinePanel[]>>,
  activePanel: PipelinePanel | null,
  setActivePanel: React.Dispatch<React.SetStateAction<PipelinePanel | null>>,
  voiceType: VoiceType
): Promise<void> => {
  setSelectedPanels(panels => 
    panels.map(panel => 
      panel.id === panelId 
        ? { ...panel, isProcessing: true }
        : panel
    )
  );

  try {
    await new Promise(resolve => setTimeout(resolve, 2500));
    
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

export const updatePanelNarration = (
  panelId: string,
  narration: string,
  selectedPanels: PipelinePanel[],
  setSelectedPanels: React.Dispatch<React.SetStateAction<PipelinePanel[]>>,
  activePanel: PipelinePanel | null,
  setActivePanel: React.Dispatch<React.SetStateAction<PipelinePanel | null>>
): void => {
  setSelectedPanels(panels => 
    panels.map(panel => 
      panel.id === panelId 
        ? { ...panel, narration }
        : panel
    )
  );
  
  if (activePanel?.id === panelId) {
    setActivePanel(prev => prev ? { ...prev, narration } : null);
  }
};
