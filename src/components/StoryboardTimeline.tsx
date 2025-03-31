
import React, { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from './ui/button';
import { isDebugMode, testTimelineSorting, validateProjectStructure } from '@/utils/debugUtils';
import { TimelinePanel } from './timeline/TimelinePanel';
import { DebugInfoPanel } from './timeline/DebugInfoPanel';
import { TimelineHeader } from './timeline/TimelineHeader';

export const StoryboardTimeline = () => {
  const { 
    project, 
    selectedPanel, 
    selectPanel, 
    updatePanelTimeCode, 
    updatePanelDuration,
    sortedPanels,
    reorderPanels
  } = useProject();
  const [isPlaying, setIsPlaying] = useState(false);
  const [draggedPanel, setDraggedPanel] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(isDebugMode());

  useEffect(() => {
    const checkDebugMode = () => {
      setShowDebugInfo(isDebugMode());
    };
    
    // Listen for changes to debug mode
    window.addEventListener('storage', checkDebugMode);
    
    // Check on mount
    checkDebugMode();
    
    return () => {
      window.removeEventListener('storage', checkDebugMode);
    };
  }, []);

  // Mock time codes if there are no panels
  const mockPanels = [
    { id: 'mock1', timeCode: '0:03', durationSec: 3, imageUrl: '', pageId: 'mock-page' },
    { id: 'mock2', timeCode: '0:05', durationSec: 5, imageUrl: '', pageId: 'mock-page' },
    { id: 'mock3', timeCode: '0:08', durationSec: 8, imageUrl: '', pageId: 'mock-page' },
  ];

  const displayPanels = sortedPanels.length > 0 ? sortedPanels : mockPanels;

  // Get validation results
  const sortingTestResults = testTimelineSorting(sortedPanels);
  const projectValidation = validateProjectStructure(project);

  const handleTimeCodeChange = (panel: any, newTimeCode: string) => {
    if (panel.imageUrl) { // Ensure it's not a mock panel
      updatePanelTimeCode(panel.id, newTimeCode);
    }
  };

  const handleDurationChange = (panel: any, newDuration: number) => {
    if (panel.imageUrl) { // Ensure it's not a mock panel
      updatePanelDuration(panel.id, newDuration);
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    
    // Simple preview playback simulation
    if (!isPlaying && sortedPanels.length > 1) {
      let currentIndex = 0;
      
      const interval = setInterval(() => {
        if (currentIndex < sortedPanels.length) {
          selectPanel(sortedPanels[currentIndex].id);
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsPlaying(false);
        }
      }, 1000);
    }
  };

  const handleDragStart = (e: React.DragEvent, panelId: string, pageId: string) => {
    e.dataTransfer.setData('panelId', panelId);
    e.dataTransfer.setData('pageId', pageId);
    setDraggedPanel(panelId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourcePanelId = e.dataTransfer.getData('panelId');
    const sourcePageId = e.dataTransfer.getData('pageId');
    
    // Find target panel's page
    let targetPageId = project?.pages?.[0]?.id || '';
    
    if (targetIndex < displayPanels.length) {
      targetPageId = displayPanels[targetIndex].pageId || targetPageId;
    }
    
    if (sourcePanelId && sourcePageId && targetPageId) {
      reorderPanels(sourcePageId, sourcePanelId, targetPageId, targetIndex);
    }
    
    setDraggedPanel(null);
  };

  const handleDragEnd = () => {
    setDraggedPanel(null);
  };

  return (
    <div className="flex flex-col">
      <TimelineHeader 
        title="Storyboard Timeline"
        isPlaying={isPlaying}
        hasPanels={sortedPanels.length > 0}
        onTogglePlayback={togglePlayback}
      />
      
      {/* Debug Information Panel */}
      {showDebugInfo && (
        <DebugInfoPanel 
          projectValidation={projectValidation} 
          sortingTestResults={sortingTestResults}
          project={project}
        />
      )}
      
      <div 
        className="flex gap-4 overflow-x-auto pb-2 items-end min-h-[140px]"
        onDragOver={handleDragOver}
      >
        {displayPanels.map((panel, index) => (
          <div
            key={panel.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, index)}
          >
            <TimelinePanel
              panel={panel}
              index={index}
              selectedPanelId={selectedPanel?.id || null}
              isDragging={draggedPanel === panel.id}
              isDebugMode={showDebugInfo}
              onSelect={selectPanel}
              onTimeCodeChange={handleTimeCodeChange}
              onDurationChange={handleDurationChange}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          </div>
        ))}
        
        {displayPanels.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>No panels have been created yet.</p>
          </div>
        )}
      </div>
      
      <div className="mt-2 bg-manga-primary/30 h-1 relative">
        <div className="absolute h-full bg-manga-primary w-1/4"></div>
      </div>
    </div>
  );
};
