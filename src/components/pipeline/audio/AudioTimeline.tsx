
import React from 'react';
import { EmptyTimeline } from './timeline/EmptyTimeline';
import { TimelinePanel } from './timeline/TimelinePanel';
import { PipelinePanel } from '@/contexts/pipeline/types';

interface AudioTimelineProps {
  selectedPanels: PipelinePanel[];
  playing: string | null;
  activePanel: PipelinePanel | null;
  onPanelClick: (panel: PipelinePanel) => void;
  onGenerateForPanel: (panelId: string) => Promise<void>;
  onPlayAudio: (panelId: string) => void;
}

export const AudioTimeline: React.FC<AudioTimelineProps> = ({
  selectedPanels,
  playing,
  activePanel,
  onPanelClick,
  onGenerateForPanel,
  onPlayAudio
}) => {
  if (selectedPanels.length === 0) {
    return <EmptyTimeline />;
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
      {selectedPanels.map((panel, index) => (
        <TimelinePanel 
          key={panel.id}
          panel={panel}
          index={index}
          isActive={activePanel?.id === panel.id}
          isPlaying={playing === panel.id}
          onPanelClick={onPanelClick}
          onGenerateForPanel={onGenerateForPanel}
          onPlayAudio={onPlayAudio}
        />
      ))}
    </div>
  );
};
