
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Wand2, AlertCircle } from 'lucide-react';
import { usePipeline } from '@/contexts/PipelineContext';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export const ImageProcessor: React.FC = () => {
  const { selectedPanels, setActivePanel, processPanel } = usePipeline();
  const [processingAll, setProcessingAll] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleProcessAll = async () => {
    if (selectedPanels.length === 0) {
      toast.error("No images to process");
      return;
    }

    setProcessingAll(true);
    setProgress(0);
    
    for (let i = 0; i < selectedPanels.length; i++) {
      const panel = selectedPanels[i];
      await processPanel(panel.id);
      setProgress(Math.round(((i + 1) / selectedPanels.length) * 100));
    }
    
    setProcessingAll(false);
    toast.success("All images processed");
  };

  const handleProcessSingle = async (panel: any) => {
    await processPanel(panel.id);
    toast.success("Image processed");
  };

  const handlePanelClick = (panel: any) => {
    setActivePanel(panel);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">Process Images</h2>
          <p className="text-gray-400">AI analyzes each panel to understand context, characters, and action</p>
        </div>
        <Button 
          onClick={handleProcessAll} 
          className="bg-manga-primary hover:bg-manga-primary/80 text-white flex items-center gap-2"
          disabled={processingAll || selectedPanels.length === 0}
        >
          {processingAll ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Processing...
            </>
          ) : (
            <>
              <Wand2 size={18} /> Process All Images
            </>
          )}
        </Button>
      </div>

      {processingAll && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing images...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {selectedPanels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedPanels.map((panel) => (
            <Card 
              key={panel.id} 
              className={`cursor-pointer transition-all hover:ring-2 hover:ring-manga-primary ${
                panel.isError ? 'ring-2 ring-red-500' : ''
              }`}
              onClick={() => handlePanelClick(panel)}
            >
              <CardContent className="p-4">
                <div className="aspect-video relative overflow-hidden rounded-md mb-3">
                  <img 
                    src={panel.imageUrl} 
                    alt={`Panel ${panel.id}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Processing overlay */}
                  {panel.isProcessing && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
                      <p className="text-white text-sm">Processing...</p>
                    </div>
                  )}
                  
                  {/* Error overlay */}
                  {panel.isError && (
                    <div className="absolute inset-0 bg-red-900/70 flex flex-col items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-white mb-2" />
                      <p className="text-white text-sm text-center px-4">Error processing image</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Panel {selectedPanels.indexOf(panel) + 1}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={panel.isProcessing}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProcessSingle(panel);
                    }}
                    className="flex items-center gap-1"
                  >
                    {panel.isProcessing ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : panel.isError ? (
                      'Retry'
                    ) : (
                      'Process'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-gray-500 rounded-lg p-12 flex flex-col items-center justify-center">
          <p className="text-gray-500 text-center">
            No panels available. Please upload images first.
          </p>
        </div>
      )}
    </div>
  );
};
