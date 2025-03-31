
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Clock, GripHorizontal } from 'lucide-react';
import { isDebugMode } from '@/utils/debugUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface TimelinePanelProps {
  panel: any;
  index: number;
  selectedPanelId: string | null;
  isDragging: boolean;
  isDebugMode: boolean;
  onSelect: (panelId: string) => void;
  onTimeCodeChange: (panel: any, newTimeCode: string) => void;
  onDurationChange: (panel: any, newDuration: number) => void;
  onDragStart: (e: React.DragEvent, panelId: string, pageId: string) => void;
  onDragEnd: () => void;
}

export const TimelinePanel: React.FC<TimelinePanelProps> = ({
  panel,
  index,
  selectedPanelId,
  isDragging,
  isDebugMode,
  onSelect,
  onTimeCodeChange,
  onDurationChange,
  onDragStart,
  onDragEnd
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div 
      className={`flex flex-col items-center ${isDragging ? 'opacity-50' : ''}`}
      onClick={() => panel.imageUrl && onSelect(panel.id)}
      draggable={!!panel.imageUrl}
      onDragStart={(e) => panel.imageUrl && onDragStart(e, panel.id, panel.pageId || '')}
      onDragEnd={onDragEnd}
    >
      <Card 
        className={`${isMobile ? 'w-20 h-20' : 'w-24 h-24'} cursor-pointer transition-all hover:ring-2 hover:ring-manga-primary ${
          selectedPanelId === panel.id ? 'ring-2 ring-manga-primary' : ''
        } relative`}
      >
        <CardContent className="p-1 h-full flex items-center justify-center">
          {panel.imageUrl ? (
            <>
              <img 
                src={panel.imageUrl}
                alt={`Panel ${index + 1}`}
                className="max-w-full max-h-full object-cover" 
              />
              <div className="absolute top-0 right-0 p-1 cursor-grab">
                <GripHorizontal className="w-3 h-3 text-white/70" />
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-manga-dark flex items-center justify-center">
              <span className="text-xs text-gray-500">No Image</span>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mt-1 flex items-center gap-1">
        <Clock className="w-3 h-3 text-gray-400" />
        <Input
          value={panel.timeCode}
          onChange={(e) => onTimeCodeChange(panel, e.target.value)}
          className={`${isMobile ? 'w-14' : 'w-16'} h-6 text-xs p-1 bg-manga-darker text-gray-200`}
          disabled={!panel.imageUrl}
        />
      </div>
      <div className="mt-1 flex items-center gap-1">
        <span className="text-xs text-gray-400">{panel.durationSec || 0}s</span>
        {isDebugMode && panel.imageUrl && (
          <span className="text-xs text-amber-400 ml-1">ID: {panel.id.slice(0, 4)}...</span>
        )}
      </div>
    </div>
  );
};
