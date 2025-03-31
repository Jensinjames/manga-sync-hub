import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Wand2, AlertCircle, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { usePipeline } from '@/contexts/PipelineContext';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { DebugOverlay } from './DebugOverlay';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const ImageProcessor: React.FC = () => {
  const { selectedPanels, setActivePanel, setSelectedPanels, debugMode, setDebugMode } = usePipeline();
  const [processingAll, setProcessingAll] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleProcessSingle = async (panel: any, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    await processPanel(panel.id);
    updateElementVisibility();
  };

  const handleProcessAll = async () => {
    if (selectedPanels.length === 0) {
      toast.error("No images to process");
      return;
    }

    setProcessingAll(true);
    setProgress(0);
    
    let successCount = 0;
    for (let i = 0; i < selectedPanels.length; i++) {
      const panel = selectedPanels[i];
      if (panel.status === 'done' && !panel.isError) {
        successCount++;
        setProgress(Math.round(((i + 1) / selectedPanels.length) * 100));
        continue;
      }
      
      try {
        await processPanel(panel.id);
        successCount++;
      } catch (err) {
        console.error(`Failed to process panel ${panel.id}:`, err);
      }
      setProgress(Math.round(((i + 1) / selectedPanels.length) * 100));
    }
    
    setProcessingAll(false);
    
    if (successCount === selectedPanels.length) {
      toast.success("All panels processed successfully");
    } else if (successCount > 0) {
      toast.warning(`Processed ${successCount} out of ${selectedPanels.length} panels`);
    } else {
      toast.error("Failed to process any panels");
    }
  };

  const handlePanelClick = (panel: any) => {
    setActivePanel(panel);
  };

  const toggleDebugMode = () => {
    const newDebugMode = !debugMode;
    setDebugMode(newDebugMode);
    
    localStorage.setItem('debugMode', newDebugMode ? 'true' : 'false');
    
    updateElementVisibility();
  };
  
  const updateElementVisibility = () => {
    setSelectedPanels(prevPanels => [...prevPanels]);
  };

  const processPanel = async (panelId: string) => {
    const panel = selectedPanels.find(p => p.id === panelId);
    if (!panel) return;
    
    const panelIndex = selectedPanels.findIndex(p => p.id === panelId);
    if (panelIndex === -1) return;
    
    const updatedPanels = [...selectedPanels];
    updatedPanels[panelIndex] = { 
      ...updatedPanels[panelIndex], 
      isProcessing: true,
      isError: false,
      status: 'processing'
    };
    setSelectedPanels(updatedPanels);

    try {
      const { data, error } = await supabase.functions.invoke('process-panel', {
        body: {
          panelId,
          imageUrl: panel.imageUrl
        }
      });

      if (error) throw error;

      const resultPanels = [...selectedPanels];
      resultPanels[panelIndex] = {
        ...resultPanels[panelIndex],
        isProcessing: false,
        status: 'done',
        metadata: data.result,
        content: data.result.content,
        sceneType: data.result.scene_type,
        characterCount: data.result.character_count,
        mood: data.result.mood,
        actionLevel: data.result.action_level,
        lastProcessedAt: data.result.processed_at,
        debugOverlay: data.result.labels
      };
      setSelectedPanels(resultPanels);
      
      return data.result;
    } catch (error) {
      console.error("Error processing panel:", error);
      
      const errorPanels = [...selectedPanels];
      errorPanels[panelIndex] = {
        ...errorPanels[panelIndex],
        isProcessing: false,
        isError: true,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'An error occurred'
      };
      setSelectedPanels(errorPanels);
      
      toast.error(`Failed to process panel: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  return (
    <div className="space-y-6" ref={containerRef}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">Process Images</h2>
          <p className="text-gray-400">AI analyzes each panel to understand context, characters, and action</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex items-center space-x-2">
            <Switch 
              id="debug-mode" 
              checked={debugMode}
              onCheckedChange={toggleDebugMode}
            />
            <Label htmlFor="debug-mode" className="text-white">
              {debugMode ? 
                <span className="flex items-center gap-1"><Eye size={16} /> Debug Mode</span> : 
                <span className="flex items-center gap-1"><EyeOff size={16} /> Debug Mode</span>
              }
            </Label>
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
                panel.isError ? 'ring-2 ring-red-500' : 
                panel.status === 'done' ? 'ring-1 ring-green-500' : ''
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
                    <span className="text-sm text-gray-400">Panel {selectedPanels.indexOf(panel) + 1}</span>
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
                    onClick={(e) => handleProcessSingle(panel, e)}
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

import { supabase } from '@/integrations/supabase/client';
