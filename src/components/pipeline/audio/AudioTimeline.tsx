
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Volume2, Play, Pause } from 'lucide-react';
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
    return (
      <div className="border border-dashed border-gray-500 rounded-lg p-12 flex flex-col items-center justify-center">
        <p className="text-gray-500 text-center">
          No panels available. Please generate narration first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
      {selectedPanels.map((panel, index) => (
        <Card 
          key={panel.id} 
          className={`transition-all hover:border-manga-primary/50 ${
            activePanel?.id === panel.id ? 'border-manga-primary' : ''
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
                  
                  <div className="flex items-center gap-2">
                    {panel.narration && !panel.audioUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={panel.isProcessing}
                        onClick={() => onGenerateForPanel(panel.id)}
                        className="flex items-center gap-1 h-8"
                      >
                        {panel.isProcessing ? (
                          <Loader2 size={14} className="animate-spin mr-1" />
                        ) : (
                          <Volume2 size={14} className="mr-1" />
                        )} 
                        Generate
                      </Button>
                    )}
                    
                    {panel.audioUrl && (
                      <Button
                        size="sm"
                        variant={playing === panel.id ? "default" : "outline"}
                        onClick={() => onPlayAudio(panel.id)}
                        className="flex items-center gap-1 h-8"
                      >
                        {playing === panel.id ? (
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
                </div>
                
                <div className="text-sm text-gray-400 line-clamp-2 mt-1">
                  {panel.narration || "No narration available"}
                </div>
                
                <div className="flex items-center gap-3 mt-2">
                  {panel.audioUrl && (
                    <>
                      <div className="h-1 bg-gray-700 flex-grow rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-manga-primary ${playing === panel.id ? 'animate-progress' : ''}`} 
                          style={{width: playing === panel.id ? '100%' : '0%'}}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {playing === panel.id ? "Playing..." : "00:10"}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
