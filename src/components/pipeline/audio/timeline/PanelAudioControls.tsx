
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Volume2, Play, Pause } from 'lucide-react';

interface PanelAudioControlsProps {
  panelId: string;
  hasNarration: boolean;
  hasAudio: boolean;
  isProcessing: boolean;
  isPlaying: boolean;
  onGenerateAudio: (panelId: string) => Promise<void>;
  onPlayAudio: (panelId: string) => void;
}

export const PanelAudioControls: React.FC<PanelAudioControlsProps> = ({
  panelId,
  hasNarration,
  hasAudio,
  isProcessing,
  isPlaying,
  onGenerateAudio,
  onPlayAudio
}) => {
  return (
    <div className="flex items-center gap-2">
      {hasNarration && !hasAudio && (
        <Button
          size="sm"
          variant="outline"
          disabled={isProcessing}
          onClick={() => onGenerateAudio(panelId)}
          className="flex items-center gap-1 h-8"
        >
          {isProcessing ? (
            <Loader2 size={14} className="animate-spin mr-1" />
          ) : (
            <Volume2 size={14} className="mr-1" />
          )} 
          Generate
        </Button>
      )}
      
      {hasAudio && (
        <Button
          size="sm"
          variant={isPlaying ? "default" : "outline"}
          onClick={() => onPlayAudio(panelId)}
          className="flex items-center gap-1 h-8"
        >
          {isPlaying ? (
            <>
              <Pause size={14} className="mr-1" /> Pause
            </>
          ) : (
            <>
              <Play size={14} className="mr-1" /> Play
            </>
          )}
        </Button>
      )}
    </div>
  );
};
