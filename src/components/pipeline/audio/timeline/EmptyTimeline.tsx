
import React from 'react';
import { FileAudio, Info } from 'lucide-react';

export const EmptyTimeline: React.FC = () => {
  return (
    <div className="border border-dashed border-gray-500 rounded-lg p-12 flex flex-col items-center justify-center gap-4">
      <FileAudio size={48} className="text-gray-500" />
      <div className="text-center">
        <p className="text-gray-500 mb-2">
          No audio panels available yet
        </p>
        <p className="text-gray-400 text-sm">
          Generate narration first, then create audio from the narrated content
        </p>
      </div>
      <div className="flex items-center gap-2 text-amber-500 text-xs bg-amber-500/10 p-2 rounded-md mt-2">
        <Info size={14} />
        <span>The audio processing happens in the background and may take a moment</span>
      </div>
    </div>
  );
};
