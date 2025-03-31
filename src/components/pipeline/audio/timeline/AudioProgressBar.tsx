
import React from 'react';

interface AudioProgressBarProps {
  playing: boolean;
  duration?: string;
}

export const AudioProgressBar: React.FC<AudioProgressBarProps> = ({ playing, duration }) => {
  return (
    <div className="flex items-center gap-3 mt-2">
      <div className="h-1 bg-gray-700 flex-grow rounded-full overflow-hidden">
        <div 
          className={`h-full bg-manga-primary ${playing ? 'animate-progress' : ''}`} 
          style={{width: playing ? '100%' : '0%'}}
        ></div>
      </div>
      <span className="text-xs text-gray-500">
        {playing ? "Playing..." : duration || "00:10"}
      </span>
    </div>
  );
};
