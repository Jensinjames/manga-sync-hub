
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface TimelineHeaderProps {
  title: string;
  isPlaying: boolean;
  hasPanels: boolean;
  onTogglePlayback: () => void;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  title,
  isPlaying,
  hasPanels,
  onTogglePlayback
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {hasPanels && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onTogglePlayback} 
          className={`flex items-center gap-1 ${isPlaying ? 'bg-manga-primary/30' : ''}`}
        >
          <Play className="w-4 h-4" />
          <span>{isPlaying ? 'Stop' : 'Play Preview'}</span>
        </Button>
      )}
    </div>
  );
};
