
import React, { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export const SceneNotes = () => {
  const { selectedPanel, updatePanelNotes } = useProject();
  
  const [cameraDirection, setCameraDirection] = useState(selectedPanel?.notes?.camera || '');
  const [fxNotes, setFxNotes] = useState(selectedPanel?.notes?.fx || '');
  const [audioPlaceholder, setAudioPlaceholder] = useState(selectedPanel?.notes?.audio || '');

  // Update state when selected panel changes
  useEffect(() => {
    if (selectedPanel) {
      setCameraDirection(selectedPanel.notes.camera || '');
      setFxNotes(selectedPanel.notes.fx || '');
      setAudioPlaceholder(selectedPanel.notes.audio || '');
    } else {
      setCameraDirection('');
      setFxNotes('');
      setAudioPlaceholder('');
    }
  }, [selectedPanel]);

  const handleCameraDirectionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCameraDirection(e.target.value);
    if (selectedPanel) {
      updatePanelNotes(selectedPanel.id, { camera: e.target.value });
    }
  };

  const handleFxNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFxNotes(e.target.value);
    if (selectedPanel) {
      updatePanelNotes(selectedPanel.id, { fx: e.target.value });
    }
  };

  const handleAudioPlaceholderChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAudioPlaceholder(e.target.value);
    if (selectedPanel) {
      updatePanelNotes(selectedPanel.id, { audio: e.target.value });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4 text-white">Scene Notes</h2>
      
      <div className="space-y-6 overflow-y-auto">
        <Card className="bg-manga-dark border-manga-darker">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Camera Direction</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={cameraDirection}
              onChange={handleCameraDirectionChange}
              placeholder="Add camera direction..."
              className="resize-none focus:border-manga-primary"
              disabled={!selectedPanel}
              rows={3}
            />
          </CardContent>
        </Card>

        <Card className="bg-manga-dark border-manga-darker">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">FX Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={fxNotes}
              onChange={handleFxNotesChange}
              placeholder="Add special effects notes..."
              className="resize-none focus:border-manga-primary"
              disabled={!selectedPanel}
              rows={3}
            />
          </CardContent>
        </Card>

        <Card className="bg-manga-dark border-manga-darker">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Audio Placeholder</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={audioPlaceholder}
              onChange={handleAudioPlaceholderChange}
              placeholder="Add audio notes..."
              className="resize-none focus:border-manga-primary"
              disabled={!selectedPanel}
              rows={3}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
