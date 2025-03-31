
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Bug, Cog, Globe } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { usePipeline } from '@/contexts/PipelineContext';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProcessorHeaderProps {
  debugMode: boolean;
  toggleDebugMode: () => void;
  handleProcessAll: () => void;
  processingAll: boolean;
  hasPanels: boolean;
}

export const ProcessorHeader: React.FC<ProcessorHeaderProps> = ({
  debugMode,
  toggleDebugMode,
  handleProcessAll,
  processingAll,
  hasPanels
}) => {
  const { useClientSideProcessing, setUseClientSideProcessing } = usePipeline();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Process Manga Panels</h2>
        <p className="text-gray-400">Analyze panel content using AI to prepare for narration</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Switch
                  id="client-side-mode"
                  checked={useClientSideProcessing}
                  onCheckedChange={setUseClientSideProcessing}
                />
                <label htmlFor="client-side-mode" className="text-sm cursor-pointer">
                  <Globe className="inline-block mr-1 h-4 w-4" />
                  Client Processing
                </label>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Process panels in the browser instead of using the server</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Switch
                  id="debug-mode"
                  checked={debugMode}
                  onCheckedChange={toggleDebugMode}
                />
                <label htmlFor="debug-mode" className="text-sm cursor-pointer">
                  <Bug className="inline-block mr-1 h-4 w-4" />
                  Debug Mode
                </label>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Show detailed debugging information</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button
          onClick={handleProcessAll}
          disabled={processingAll || !hasPanels}
          className="bg-manga-primary hover:bg-manga-primary/80"
        >
          {processingAll ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Process All
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
