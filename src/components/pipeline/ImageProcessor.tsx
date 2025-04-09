
import React from 'react';
import { ProcessorHeader } from './processor/ProcessorHeader';
import { ProcessingProgress } from './processor/ProcessingProgress';
import { PanelGrid } from './processor/PanelGrid';
import { useImageProcessor } from './processor/useImageProcessor';
import { toast } from 'sonner';

export const ImageProcessor: React.FC = () => {
  const {
    selectedPanels,
    processingAll,
    progress,
    containerRef,
    debugMode,
    handleProcessSingle,
    handleProcessAll,
    handlePanelClick,
    toggleDebugMode
  } = useImageProcessor();

  return (
    <div className="space-y-6" ref={containerRef}>
      <ProcessorHeader
        debugMode={debugMode}
        toggleDebugMode={toggleDebugMode}
        handleProcessAll={handleProcessAll}
        processingAll={processingAll}
        hasPanels={selectedPanels.length > 0}
      />

      <ProcessingProgress 
        progress={progress} 
        isProcessing={processingAll} 
      />

      <PanelGrid
        panels={selectedPanels}
        debugMode={debugMode}
        onPanelClick={handlePanelClick}
        onProcessSingle={handleProcessSingle}
      />
    </div>
  );
};
