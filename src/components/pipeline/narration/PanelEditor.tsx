
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Pencil, Speech } from 'lucide-react';
import { PipelinePanel } from '@/contexts/pipeline/types';

interface PanelEditorProps {
  activePanel: PipelinePanel | null;
  onNarrationChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onGenerateForPanel: (panelId: string) => Promise<void>;
}

export const PanelEditor: React.FC<PanelEditorProps> = ({ 
  activePanel, 
  onNarrationChange, 
  onGenerateForPanel 
}) => {
  if (!activePanel) {
    return (
      <div className="border border-dashed border-gray-500 rounded-lg p-12 flex flex-col items-center justify-center h-[300px]">
        <p className="text-gray-500 text-center">
          Select a panel to edit its narration
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-video relative overflow-hidden rounded-md">
        <img 
          src={activePanel.imageUrl} 
          alt="Selected panel"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="narration" className="text-sm">Edit Narration</Label>
          <Button
            size="sm"
            variant="outline"
            disabled={activePanel.isProcessing}
            onClick={() => onGenerateForPanel(activePanel.id)}
            className="flex items-center gap-1 h-7 px-3"
          >
            {activePanel.isProcessing ? (
              <Loader2 size={14} className="animate-spin mr-1" />
            ) : (
              <Sparkles size={14} className="mr-1" />
            )} 
            Regenerate
          </Button>
        </div>
        
        <Textarea
          id="narration"
          value={activePanel.narration || ''}
          onChange={onNarrationChange}
          placeholder={activePanel.narration ? '' : 'Generate narration or write your own...'}
          className="min-h-[200px] resize-none focus:border-manga-primary"
        />
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Pencil size={12} />
          <span>
            {activePanel.narration 
              ? 'Edit the narration above or regenerate with different settings' 
              : 'Click "Regenerate" to create AI narration or write your own'}
          </span>
        </div>
      </div>
    </div>
  );
};
