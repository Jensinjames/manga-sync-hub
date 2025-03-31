
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, Eye, EyeOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  return (
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
          disabled={processingAll || !hasPanels}
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
  );
};
