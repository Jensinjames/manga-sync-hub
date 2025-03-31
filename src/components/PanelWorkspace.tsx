
import React from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Card } from '@/components/ui/card';

export const PanelWorkspace = () => {
  const { selectedPage, selectedPanel } = useProject();

  if (!selectedPage && !selectedPanel) {
    return (
      <div className="flex flex-col h-full">
        <h2 className="text-xl font-semibold mb-4 text-white">Panel Workspace</h2>
        <div className="flex items-center justify-center flex-1 border border-dashed border-gray-500 rounded-lg">
          <p className="text-gray-500">Select a panel to edit</p>
        </div>
      </div>
    );
  }

  const imageToShow = selectedPanel?.imageUrl || selectedPage?.imageUrl;

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4 text-white">Panel Workspace</h2>
      <Card className="flex-1 flex items-center justify-center bg-manga-dark overflow-hidden">
        {imageToShow && (
          <img 
            src={imageToShow} 
            alt="Selected panel" 
            className="max-w-full max-h-full object-contain"
          />
        )}
      </Card>
    </div>
  );
};
