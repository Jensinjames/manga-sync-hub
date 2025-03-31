
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { PipelinePanel } from '@/contexts/pipeline/types';
import { DebugOverlay } from '../DebugOverlay';

interface PanelCardProps {
  panel: PipelinePanel;
  index: number;
  debugMode: boolean;
  onPanelClick: (panel: PipelinePanel) => void;
  onProcessSingle: (panel: PipelinePanel, event?: React.MouseEvent) => void;
}

export const PanelCard: React.FC<PanelCardProps> = ({
  panel,
  index,
  debugMode,
  onPanelClick,
  onProcessSingle
}) => {
  return (
    <Card 
      key={panel.id} 
      className={`cursor-pointer transition-all hover:ring-2 hover:ring-manga-primary ${
        panel.isError ? 'ring-2 ring-red-500' : 
        panel.status === 'done' ? 'ring-1 ring-green-500' : ''
      }`}
      onClick={() => onPanelClick(panel)}
    >
      <CardContent className="p-4">
        <div className="aspect-video relative overflow-hidden rounded-md mb-3">
          <img 
            src={panel.imageUrl} 
            alt={`Panel ${panel.id}`}
            className="w-full h-full object-cover"
          />
          
          {debugMode && panel.debugOverlay && panel.debugOverlay.length > 0 && (
            <DebugOverlay 
              labels={panel.debugOverlay} 
              width={300} 
              height={200}
            />
          )}
          
          {panel.isProcessing && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
              <p className="text-white text-sm">Processing...</p>
            </div>
          )}
          
          {panel.isError && (
            <div className="absolute inset-0 bg-red-900/70 flex flex-col items-center justify-center">
              <AlertCircle className="h-8 w-8 text-white mb-2" />
              <p className="text-white text-sm text-center px-4">Error processing image</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Panel {index + 1}</span>
            {panel.metadata && panel.status === 'done' && (
              <span className="text-xs text-green-500">
                ✓ {panel.metadata.labels?.length || 0} objects detected
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant={panel.isError ? "destructive" : "outline"}
            disabled={panel.isProcessing}
            onClick={(e) => onProcessSingle(panel, e)}
            className="flex items-center gap-1"
          >
            {panel.isProcessing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : panel.isError ? (
              <>
                <RotateCcw size={14} /> Retry
              </>
            ) : panel.status === 'done' ? (
              'Reprocess'
            ) : (
              'Process'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
