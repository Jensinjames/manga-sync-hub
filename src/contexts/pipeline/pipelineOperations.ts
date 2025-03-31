import { PipelinePanel, NarrationType, NarrationFormat, VoiceType } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const processPanel = async (
  panelId: string,
  selectedPanels: PipelinePanel[],
  setSelectedPanels: React.Dispatch<React.SetStateAction<PipelinePanel[]>>
): Promise<void> => {
  // Find the panel in the selected panels
  const panelIndex = selectedPanels.findIndex(p => p.id === panelId);
  if (panelIndex === -1) return;
  
  // Mark the panel as processing
  const updatedPanels = [...selectedPanels];
  updatedPanels[panelIndex] = { 
    ...updatedPanels[panelIndex], 
    isProcessing: true,
    isError: false,
    status: 'processing'
  };
  setSelectedPanels(updatedPanels);

  try {
    const panel = selectedPanels[panelIndex];
    const imageUrl = panel.imageUrl;
    
    if (!imageUrl) {
      throw new Error('Panel has no image URL');
    }

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('process-panel', {
      body: {
        panelId,
        imageUrl
      }
    });

    if (error) throw error;

    // Update the panel with the results
    const resultPanels = [...selectedPanels];
    resultPanels[panelIndex] = {
      ...resultPanels[panelIndex],
      isProcessing: false,
      status: 'done',
      metadata: data.result,
      content: data.result.content,
      sceneType: data.result.scene_type,
      characterCount: data.result.character_count,
      mood: data.result.mood,
      actionLevel: data.result.action_level,
      lastProcessedAt: data.result.processed_at,
      // Set debug overlay if we have labels
      debugOverlay: data.result.labels
    };
    setSelectedPanels(resultPanels);
    
    toast.success(`Panel processed successfully${data.cached ? ' (cached)' : ''}`);
    return;
  } catch (error) {
    console.error("Error processing panel:", error);
    
    // Mark the panel as having an error
    const errorPanels = [...selectedPanels];
    errorPanels[panelIndex] = {
      ...errorPanels[panelIndex],
      isProcessing: false,
      isError: true,
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'An error occurred'
    };
    setSelectedPanels(errorPanels);
    
    // Show a toast with the error
    toast.error(`Failed to process panel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return;
  }
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
