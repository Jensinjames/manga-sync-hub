
import { useState, useRef, useEffect, useCallback } from 'react';
import { usePipeline } from '@/contexts/PipelineContext';
import { toast } from 'sonner';
import { PipelinePanel } from '@/contexts/pipeline/types';
import { loadResources } from '@/contexts/pipeline/pipelineOperations';

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
  const [resourcesLoaded, setResourcesLoaded] = useState(false);

  // Clean up any resources when the component unmounts
  useEffect(() => {
    return () => {
      // Release references to help with garbage collection
      containerRef.current = null;
    };
  }, []);

  // Lazy load resources only when needed
  const ensureResourcesLoaded = useCallback(async () => {
    if (!resourcesLoaded) {
      const loaded = await loadResources();
      setResourcesLoaded(loaded);
      return loaded;
    }
    return true;
  }, [resourcesLoaded]);

  const handleProcessSingle = async (panel: PipelinePanel, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    await ensureResourcesLoaded();
    await processPanelFromContext(panel.id);
    updateElementVisibility();
  };

  const handleProcessAll = async () => {
    if (selectedPanels.length === 0) {
      toast.error("No images to process");
      return;
    }

    const resourceCheck = await ensureResourcesLoaded();
    if (!resourceCheck) {
      toast.error("Failed to load required resources");
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
