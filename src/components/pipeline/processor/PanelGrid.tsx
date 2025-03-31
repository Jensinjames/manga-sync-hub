
import React from 'react';
import { PipelinePanel } from '@/contexts/pipeline/types';
import { PanelCard } from './PanelCard';

interface PanelGridProps {
  panels: PipelinePanel[];
  debugMode: boolean;
  onPanelClick: (panel: PipelinePanel) => void;
  onProcessSingle: (panel: PipelinePanel, event?: React.MouseEvent) => void;
}

export const PanelGrid: React.FC<PanelGridProps> = ({
  panels,
  debugMode,
  onPanelClick,
  onProcessSingle
}) => {
  if (panels.length === 0) {
    return (
      <div className="border border-dashed border-gray-500 rounded-lg p-12 flex flex-col items-center justify-center">
        <p className="text-gray-500 text-center">
          No panels available. Please upload images first.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {panels.map((panel, index) => (
        <PanelCard
          key={panel.id}
          panel={panel}
          index={index}
          debugMode={debugMode}
          onPanelClick={onPanelClick}
          onProcessSingle={onProcessSingle}
        />
      ))}
    </div>
  );
};
