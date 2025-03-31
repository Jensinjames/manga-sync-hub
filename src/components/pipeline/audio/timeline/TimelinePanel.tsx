
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PanelAudioControls } from './PanelAudioControls';
import { AudioProgressBar } from './AudioProgressBar';
import { PipelinePanel } from '@/contexts/pipeline/types';

interface TimelinePanelProps {
  panel: PipelinePanel;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onPanelClick: (panel: PipelinePanel) => void;
  onGenerateForPanel: (panelId: string) => Promise<void>;
  onPlayAudio: (panelId: string) => void;
}

export const TimelinePanel: React.FC<TimelinePanelProps> = ({
  panel,
  index,
  isActive,
  isPlaying,
  onPanelClick,
  onGenerateForPanel,
  onPlayAudio
}) => {
  return (
    <Card 
      className={`transition-all hover:border-manga-primary/50 ${
        isActive ? 'border-manga-primary' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div 
            className="relative h-20 w-28 flex-shrink-0 cursor-pointer rounded-md overflow-hidden" 
            onClick={() => onPanelClick(panel)}
          >
            <img 
              src={panel.imageUrl} 
              alt={`Panel ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-grow flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="font-medium">Panel {index + 1}</span>
              
              <PanelAudioControls
                panelId={panel.id}
                hasNarration={!!panel.narration}
                hasAudio={!!panel.audioUrl}
                isProcessing={!!panel.isProcessing}
                isPlaying={isPlaying}
                onGenerateAudio={onGenerateForPanel}
                onPlayAudio={onPlayAudio}
              />
            </div>
            
            <div className="text-sm text-gray-400 line-clamp-2 mt-1">
              {panel.narration || "No narration available"}
            </div>
            
            {panel.audioUrl && (
              <AudioProgressBar playing={isPlaying} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
