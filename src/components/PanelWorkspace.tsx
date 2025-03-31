
import React, { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scissors, Maximize, Minimize, Info } from 'lucide-react';
import { isDebugMode } from '@/utils/debugUtils';

export const PanelWorkspace = () => {
  const { selectedPage, selectedPanel, addPanelToPage } = useProject();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [debugMode, setDebugMode] = useState(isDebugMode());
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const checkDebugMode = () => {
      setDebugMode(isDebugMode());
    };
    
    // Check debug mode on mount and when it changes
    checkDebugMode();
    window.addEventListener('storage', checkDebugMode);
    
    return () => {
      window.removeEventListener('storage', checkDebugMode);
    };
  }, []);

  const handleCreatePanel = () => {
    if (!selectedPage) return;
    
    // This is a simplified version. In a real implementation, you would:
    // 1. Let the user draw a selection box on the image
    // 2. Capture that region as a new panel
    // 3. Add the panel to the page with position data
    
    addPanelToPage(selectedPage.id, { 
      imageUrl: selectedPage.imageUrl 
    });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageSize({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
  };

  if (!selectedPage && !selectedPanel) {
    return (
      <div className="flex flex-col h-full">
        <h2 className="text-xl font-semibold mb-4 text-white">Panel Workspace</h2>
        <div className="flex items-center justify-center flex-1 border border-dashed border-gray-500 rounded-lg">
          <p className="text-gray-500">Select a page or panel to edit</p>
        </div>
      </div>
    );
  }

  const imageToShow = selectedPanel?.imageUrl || selectedPage?.imageUrl;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Panel Workspace</h2>
        <div className="flex gap-2">
          {selectedPage && !selectedPanel && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCreatePanel} 
              className="flex items-center gap-1"
            >
              <Scissors className="w-4 h-4" />
              <span>Create Panel</span>
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      {/* Debug info about the current selection */}
      {debugMode && (selectedPage || selectedPanel) && (
        <div className="mb-4 p-2 bg-amber-900/30 border border-amber-800/50 rounded-md text-xs">
          <div className="flex items-center gap-1 text-amber-300">
            <Info className="w-3 h-3" />
            <span className="font-medium">Debug Info:</span>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-amber-100/80">
            <div>Type: {selectedPanel ? 'Panel' : 'Page'}</div>
            <div>ID: {selectedPanel?.id || selectedPage?.id}</div>
            <div>Image Size: {imageSize.width} x {imageSize.height}px</div>
            {selectedPanel && (
              <>
                <div>Duration: {selectedPanel.durationSec}s</div>
                <div>Position: {selectedPanel.position ? 
                  `(${selectedPanel.position.x},${selectedPanel.position.y})` : 
                  'Not cropped'}
                </div>
                <div>Size: {selectedPanel.position ? 
                  `${selectedPanel.position.width}x${selectedPanel.position.height}` : 
                  'Full size'}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <Card 
        className={`flex-1 flex items-center justify-center bg-manga-dark overflow-hidden ${
          isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none' : ''
        }`}
      >
        {imageToShow && (
          <div className="relative max-w-full max-h-full">
            <img 
              src={imageToShow} 
              alt={selectedPanel ? "Selected panel" : "Selected page"}
              className="max-w-full max-h-full object-contain"
              onLoad={handleImageLoad}
            />
            
            {/* Show panel position overlay in debug mode */}
            {debugMode && selectedPanel?.position && (
              <div 
                className="absolute border-2 border-amber-500 bg-amber-500/10"
                style={{
                  left: `${selectedPanel.position.x}px`,
                  top: `${selectedPanel.position.y}px`,
                  width: `${selectedPanel.position.width}px`,
                  height: `${selectedPanel.position.height}px`,
                }}
              ></div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
