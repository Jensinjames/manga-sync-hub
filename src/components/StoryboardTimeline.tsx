
import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Play, Clock, GripHorizontal, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { formatDurationToTimeCode } from '@/types/manga';
import { isDebugMode, testTimelineSorting, validateProjectStructure } from '@/utils/debugUtils';

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

  React.useEffect(() => {
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Storyboard Timeline</h2>
        {sortedPanels.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={togglePlayback} 
            className={`flex items-center gap-1 ${isPlaying ? 'bg-manga-primary/30' : ''}`}
          >
            <Play className="w-4 h-4" />
            <span>{isPlaying ? 'Stop' : 'Play Preview'}</span>
          </Button>
        )}
      </div>
      
      {/* Debug Information Panel */}
      {showDebugInfo && (
        <div className="mb-4 p-3 bg-amber-900/30 border border-amber-800/50 rounded-md text-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-amber-300 font-medium">Debug Information</h3>
            <div className="flex items-center">
              {projectValidation.valid ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <h4 className="text-amber-200 font-semibold">Project Structure:</h4>
              <ul className="list-disc list-inside text-amber-100/80">
                <li>Project ID: {project?.id || 'Missing'}</li>
                <li>Pages: {projectValidation.pageCount}</li>
                <li>Panels: {projectValidation.panelCount}</li>
                <li>Structure valid: {projectValidation.valid ? 'Yes' : 'No'}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-amber-200 font-semibold">Timeline Sorting:</h4>
              <p className="text-amber-100/80">Status: {sortingTestResults.status}</p>
              <p className="text-amber-100/80">Sorted panels: {sortingTestResults.sorted?.length || 0}</p>
            </div>
          </div>
        </div>
      )}
      
      <div 
        className="flex gap-4 overflow-x-auto pb-2 items-end min-h-[140px]"
        onDragOver={handleDragOver}
      >
        {displayPanels.map((panel, index) => (
          <div 
            key={panel.id}
            className={`flex flex-col items-center ${draggedPanel === panel.id ? 'opacity-50' : ''}`}
            onClick={() => panel.imageUrl && selectPanel(panel.id)}
            draggable={!!panel.imageUrl}
            onDragStart={(e) => panel.imageUrl && handleDragStart(e, panel.id, panel.pageId || '')}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, index)}
          >
            <Card 
              className={`w-24 h-24 cursor-pointer transition-all hover:ring-2 hover:ring-manga-primary ${
                selectedPanel?.id === panel.id ? 'ring-2 ring-manga-primary' : ''
              } relative`}
            >
              <CardContent className="p-1 h-full flex items-center justify-center">
                {panel.imageUrl ? (
                  <>
                    <img 
                      src={panel.imageUrl}
                      alt={`Panel ${index + 1}`}
                      className="max-w-full max-h-full object-cover" 
                    />
                    <div className="absolute top-0 right-0 p-1 cursor-grab">
                      <GripHorizontal className="w-3 h-3 text-white/70" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-manga-dark flex items-center justify-center">
                    <span className="text-xs text-gray-500">No Image</span>
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <Input
                value={panel.timeCode}
                onChange={(e) => handleTimeCodeChange(panel, e.target.value)}
                className="w-16 h-6 text-xs p-1 bg-manga-darker text-gray-200"
                disabled={!panel.imageUrl}
              />
            </div>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-xs text-gray-400">{panel.durationSec || 0}s</span>
              {showDebugInfo && panel.imageUrl && (
                <span className="text-xs text-amber-400 ml-1">ID: {panel.id.slice(0, 4)}...</span>
              )}
            </div>
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
