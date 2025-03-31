
import React from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Card, CardContent } from '@/components/ui/card';

export const StoryboardTimeline = () => {
  const { project, selectedPanel, selectPanel } = useProject();

  // Collect all panels across all pages
  const allPanels = project.pages.flatMap(page => 
    page.panels.map(panel => ({
      ...panel,
      pageId: page.id
    }))
  );

  // Mock time codes if there are no panels
  const mockPanels = [
    { id: 'mock1', timeCode: '0:03', imageUrl: '' },
    { id: 'mock2', timeCode: '0:05', imageUrl: '' },
    { id: 'mock3', timeCode: '0:08', imageUrl: '' },
  ];

  const displayPanels = allPanels.length > 0 ? allPanels : mockPanels;

  return (
    <div className="flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-white">Storyboard Timeline</h2>
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
            <span className="text-sm mt-1 text-gray-400">{panel.timeCode}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 bg-manga-primary/30 h-1 relative">
        <div className="absolute h-full bg-manga-primary w-1/4"></div>
      </div>
    </div>
  );
};
