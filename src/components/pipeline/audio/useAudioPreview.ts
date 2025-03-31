
import { useState } from 'react';
import { usePipeline } from '@/contexts/PipelineContext';
import { toast } from 'sonner';
import { PipelinePanel } from '@/contexts/pipeline/types';

export const useAudioPreview = () => {
  const { 
    selectedPanels, 
    activePanel,
    setActivePanel, 
    voiceType,
    setVoiceType,
    generateAudio
  } = usePipeline();
  
  const [playing, setPlaying] = useState<string | null>(null);

  const handleGenerateAll = async () => {
    if (selectedPanels.length === 0) {
      toast.error("No panels to generate audio for");
      return;
    }

    for (const panel of selectedPanels) {
      if (panel.narration) {
        await generateAudio(panel.id);
      }
    }
    
    toast.success("All audio generated");
  };

  const handleGenerateForPanel = async (panelId: string) => {
    const panel = selectedPanels.find(p => p.id === panelId);
    if (!panel || !panel.narration) {
      toast.error("Panel needs narration before generating audio");
      return;
    }
    
    await generateAudio(panelId);
    toast.success("Audio generated");
  };

  const handlePanelClick = (panel: PipelinePanel) => {
    setActivePanel(panel);
  };

  const togglePlayAudio = (panelId: string) => {
    // In a real implementation, this would play/pause the actual audio
    if (playing === panelId) {
      setPlaying(null);
      toast.info("Audio paused");
    } else {
      setPlaying(panelId);
      toast.info("Audio playing");
      
      // Simulate audio ending after 5 seconds
      setTimeout(() => {
        if (playing === panelId) {
          setPlaying(null);
        }
      }, 5000);
    }
  };

  return {
    selectedPanels,
    activePanel,
    voiceType,
    setVoiceType,
    playing,
    handleGenerateAll,
    handleGenerateForPanel,
    handlePanelClick,
    togglePlayAudio
  };
};
