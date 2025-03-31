
import { useState, useRef, useEffect } from 'react';
import { usePipeline } from '@/contexts/PipelineContext';
import { toast } from 'sonner';
import { PipelinePanel } from '@/contexts/pipeline/types';

export const useImageProcessor = () => {
  const { 
    selectedPanels, 
    setActivePanel, 
    setSelectedPanels, 
    debugMode, 
    setDebugMode,
    processPanel: processPanelFromContext
  } = usePipeline();
  
  const [processingAll, setProcessingAll] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleProcessSingle = async (panel: PipelinePanel, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    await processPanelFromContext(panel.id);
    updateElementVisibility();
  };

  const handleProcessAll = async () => {
    if (selectedPanels.length === 0) {
      toast.error("No images to process");
      return;
    }

    setProcessingAll(true);
    setProgress(0);
    
    let successCount = 0;
    for (let i = 0; i < selectedPanels.length; i++) {
      const panel = selectedPanels[i];
      if (panel.status === 'done' && !panel.isError) {
        successCount++;
        setProgress(Math.round(((i + 1) / selectedPanels.length) * 100));
        continue;
      }
      
      try {
        await processPanelFromContext(panel.id);
        successCount++;
      } catch (err) {
        console.error(`Failed to process panel ${panel.id}:`, err);
      }
      setProgress(Math.round(((i + 1) / selectedPanels.length) * 100));
    }
    
    setProcessingAll(false);
    
    if (successCount === selectedPanels.length) {
      toast.success("All panels processed successfully");
    } else if (successCount > 0) {
      toast.warning(`Processed ${successCount} out of ${selectedPanels.length} panels`);
    } else {
      toast.error("Failed to process any panels");
    }
  };

  const handlePanelClick = (panel: PipelinePanel) => {
    setActivePanel(panel);
  };

  const toggleDebugMode = () => {
    const newDebugMode = !debugMode;
    setDebugMode(newDebugMode);
    
    localStorage.setItem('debugMode', newDebugMode ? 'true' : 'false');
    
    updateElementVisibility();
  };
  
  const updateElementVisibility = () => {
    setSelectedPanels(prevPanels => [...prevPanels]);
  };

  return {
    selectedPanels,
    processingAll,
    progress,
    containerRef,
    debugMode,
    handleProcessSingle,
    handleProcessAll,
    handlePanelClick,
    toggleDebugMode
  };
};
