
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { PipelinePanel } from '@/contexts/pipeline/types';

interface PanelsListProps {
  selectedPanels: PipelinePanel[];
  activePanel: PipelinePanel | null;
  onPanelClick: (panel: PipelinePanel) => void;
  onGenerateForPanel: (panelId: string) => Promise<void>;
}

export const PanelsList: React.FC<PanelsListProps> = ({ 
  selectedPanels, 
  activePanel, 
  onPanelClick,
  onGenerateForPanel
}) => {
  if (selectedPanels.length === 0) {
    return (
      <div className="border border-dashed border-gray-500 rounded-lg p-12 flex flex-col items-center justify-center">
        <p className="text-gray-500 text-center">
          No panels available. Please upload and process images first.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
      {selectedPanels.map((panel) => (
        <Card 
          key={panel.id} 
          className={`cursor-pointer transition-all hover:ring-2 hover:ring-manga-primary ${
            activePanel?.id === panel.id ? 'ring-2 ring-manga-primary' : ''
          }`}
          onClick={() => onPanelClick(panel)}
        >
          <CardContent className="p-3">
            <div className="aspect-video relative overflow-hidden rounded-md mb-2">
              <img 
                src={panel.imageUrl} 
                alt={`Panel ${selectedPanels.indexOf(panel) + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Panel {selectedPanels.indexOf(panel) + 1}</span>
              <div className="flex items-center gap-1">
                {panel.narration && (
                  <div className="h-2 w-2 rounded-full bg-green-500" title="Has narration"></div>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={panel.isProcessing}
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenerateForPanel(panel.id);
                  }}
                  className="flex items-center gap-1 h-7 px-2"
                >
                  {panel.isProcessing ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Sparkles size={12} />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
