
import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scissors, Maximize, Minimize } from 'lucide-react';

export const PanelWorkspace = () => {
  const { selectedPage, selectedPanel, addPanelToPage } = useProject();
  const [isFullscreen, setIsFullscreen] = useState(false);

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
            />
          </div>
        )}
      </Card>
    </div>
  );
};
