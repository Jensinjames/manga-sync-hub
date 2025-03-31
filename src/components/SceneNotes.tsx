
import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronRight } from 'lucide-react';

export const SceneNotes = () => {
  const { selectedPanel, updatePanelNotes } = useProject();
  
  const [cameraDirection, setCameraDirection] = useState(selectedPanel?.notes?.camera || '');
  const [fxNotes, setFxNotes] = useState(selectedPanel?.notes?.fx || '');
  const [audioPlaceholder, setAudioPlaceholder] = useState(selectedPanel?.notes?.audio || '');

  const handleCameraDirectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCameraDirection(e.target.value);
    if (selectedPanel) {
      updatePanelNotes(selectedPanel.id, { camera: e.target.value });
    }
  };

  const handleFxNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFxNotes(e.target.value);
    if (selectedPanel) {
      updatePanelNotes(selectedPanel.id, { fx: e.target.value });
    }
  };

  const handleAudioPlaceholderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudioPlaceholder(e.target.value);
    if (selectedPanel) {
      updatePanelNotes(selectedPanel.id, { audio: e.target.value });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4 text-white">Scene Notes</h2>
      
      <div className="space-y-6">
        <Card className="bg-manga-dark border-manga-darker">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Camera Direction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                value={cameraDirection}
                onChange={handleCameraDirectionChange}
                placeholder="Add camera direction..."
                className="pr-8"
                disabled={!selectedPanel}
              />
              <ChevronRight className="absolute top-3 right-3 h-4 w-4 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-manga-dark border-manga-darker">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">FX Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={fxNotes}
              onChange={handleFxNotesChange}
              placeholder="Add special effects notes..."
              disabled={!selectedPanel}
            />
          </CardContent>
        </Card>

        <Card className="bg-manga-dark border-manga-darker">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Audio Placeholder</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={audioPlaceholder}
              onChange={handleAudioPlaceholderChange}
              placeholder="Add audio notes..."
              disabled={!selectedPanel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
