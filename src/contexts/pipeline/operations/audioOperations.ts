
import { PipelinePanel, VoiceType } from '../types';

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
