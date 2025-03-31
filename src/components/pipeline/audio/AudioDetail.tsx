
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCw, Play, Pause, MusicIcon } from 'lucide-react';
import { PipelinePanel } from '@/contexts/pipeline/types';

interface AudioDetailProps {
  activePanel: PipelinePanel | null;
  playing: string | null;
  onGenerateForPanel: (panelId: string) => Promise<void>;
  onPlayAudio: (panelId: string) => void;
}

export const AudioDetail: React.FC<AudioDetailProps> = ({
  activePanel,
  playing,
  onGenerateForPanel,
  onPlayAudio
}) => {
  if (!activePanel) {
    return (
      <div className="border border-dashed border-gray-500 rounded-lg p-12 flex flex-col items-center justify-center h-[300px]">
        <p className="text-gray-500 text-center">
          Select a panel to preview its audio
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white flex items-center gap-2">
        <MusicIcon size={18} /> Audio Preview
      </h3>
      
      <div className="space-y-4">
        <div className="aspect-video relative overflow-hidden rounded-md">
          <img 
            src={activePanel.imageUrl} 
            alt="Selected panel"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-3">
          <div className="text-sm overflow-auto max-h-32 p-3 bg-gray-800/50 rounded-md">
            {activePanel.narration || "No narration available"}
          </div>
          
          <div className="flex justify-between items-center gap-3">
            <Button
              variant={activePanel.audioUrl && playing === activePanel.id ? "default" : "outline"}
              disabled={!activePanel.audioUrl}
              onClick={() => activePanel.audioUrl && onPlayAudio(activePanel.id)}
              className="flex-grow flex items-center justify-center"
            >
              {!activePanel.audioUrl ? (
                "No audio available"
              ) : playing === activePanel.id ? (
                <>
                  <Pause size={16} className="mr-2" /> Pause
                </>
              ) : (
                <>
                  <Play size={16} className="mr-2" /> Play
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              disabled={!activePanel.narration || activePanel.isProcessing}
              onClick={() => onGenerateForPanel(activePanel.id)}
              className="flex items-center"
            >
              {activePanel.isProcessing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RotateCw size={16} />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
