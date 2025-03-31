
import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Play, Clock } from 'lucide-react';
import { Button } from './ui/button';

export const StoryboardTimeline = () => {
  const { project, selectedPanel, selectPanel, updatePanelTimeCode } = useProject();
  const [isPlaying, setIsPlaying] = useState(false);

  // Ensure project and project.pages exist before using them
  const pages = project?.pages || [];

  // Collect all panels across all pages
  const allPanels = pages.flatMap(page => 
    page.panels.map(panel => ({
      ...panel,
      pageId: page.id
    }))
  );

  // Sort panels by timeCode
  const sortedPanels = [...allPanels].sort((a, b) => {
    const timeA = a.timeCode.split(':').map(Number);
    const timeB = b.timeCode.split(':').map(Number);
    return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
  });

  // Mock time codes if there are no panels
  const mockPanels = [
    { id: 'mock1', timeCode: '0:03', imageUrl: '' },
    { id: 'mock2', timeCode: '0:05', imageUrl: '' },
    { id: 'mock3', timeCode: '0:08', imageUrl: '' },
  ];

  const displayPanels = sortedPanels.length > 0 ? sortedPanels : mockPanels;

  const handleTimeCodeChange = (panel: any, newTimeCode: string) => {
    if (panel.imageUrl) { // Ensure it's not a mock panel
      updatePanelTimeCode(panel.id, newTimeCode);
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
      
      <div className="flex gap-4 overflow-x-auto pb-2 items-end min-h-[140px]">
        {displayPanels.map((panel, index) => (
          <div 
            key={panel.id}
            className="flex flex-col items-center"
            onClick={() => panel.imageUrl && selectPanel(panel.id)}
          >
            <Card 
              className={`w-24 h-24 cursor-pointer transition-all hover:ring-2 hover:ring-manga-primary ${
                selectedPanel?.id === panel.id ? 'ring-2 ring-manga-primary' : ''
              }`}
            >
              <CardContent className="p-1 h-full flex items-center justify-center">
                {panel.imageUrl ? (
                  <img 
                    src={panel.imageUrl}
                    alt={`Panel ${index + 1}`}
                    className="max-w-full max-h-full object-cover" 
                  />
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
