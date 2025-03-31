
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Loader2, 
  Sparkles,
  Pencil, 
  Speech 
} from 'lucide-react';
import { usePipeline } from '@/contexts/PipelineContext';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export const NarrationEditor: React.FC = () => {
  const { 
    selectedPanels, 
    activePanel,
    setActivePanel, 
    narrationTone,
    setNarrationTone,
    narrationFormat,
    setNarrationFormat,
    generateNarration,
    updatePanelNarration
  } = usePipeline();

  const handleGenerateAll = async () => {
    if (selectedPanels.length === 0) {
      toast.error("No panels to generate narration for");
      return;
    }

    for (const panel of selectedPanels) {
      await generateNarration(panel.id);
    }
    
    toast.success("All narrations generated");
  };

  const handleGenerateForPanel = async (panelId: string) => {
    await generateNarration(panelId);
    toast.success("Narration generated");
  };

  const handlePanelClick = (panel: any) => {
    setActivePanel(panel);
  };

  const handleNarrationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activePanel) {
      updatePanelNarration(activePanel.id, e.target.value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">Narration Editor</h2>
          <p className="text-gray-400">Generate and edit AI narration for each panel</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="space-y-1">
            <Label htmlFor="tone" className="text-xs">Narration Tone</Label>
            <Select value={narrationTone} onValueChange={(value: any) => setNarrationTone(value)}>
              <SelectTrigger id="tone" className="w-[140px]">
                <SelectValue placeholder="Tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anime drama">Anime Drama</SelectItem>
                <SelectItem value="noir">Noir</SelectItem>
                <SelectItem value="shonen epic">Shonen Epic</SelectItem>
                <SelectItem value="comedic dub">Comedic Dub</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="format" className="text-xs">Format</Label>
            <Select value={narrationFormat} onValueChange={(value: any) => setNarrationFormat(value)}>
              <SelectTrigger id="format" className="w-[160px]">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="narrative prose">Narrative Prose</SelectItem>
                <SelectItem value="screenplay-style">Screenplay Style</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleGenerateAll} 
            className="bg-manga-primary hover:bg-manga-primary/80 text-white flex items-center gap-2 self-end"
            disabled={selectedPanels.length === 0}
          >
            <Sparkles size={18} /> Generate All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Panels</h3>
          
          {selectedPanels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
              {selectedPanels.map((panel) => (
                <Card 
                  key={panel.id} 
                  className={`cursor-pointer transition-all hover:ring-2 hover:ring-manga-primary ${
                    activePanel?.id === panel.id ? 'ring-2 ring-manga-primary' : ''
                  }`}
                  onClick={() => handlePanelClick(panel)}
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
                            handleGenerateForPanel(panel.id);
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
          ) : (
            <div className="border border-dashed border-gray-500 rounded-lg p-12 flex flex-col items-center justify-center">
              <p className="text-gray-500 text-center">
                No panels available. Please upload and process images first.
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Speech size={18} /> Narration Editor
          </h3>
          
          {activePanel ? (
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
                    onClick={() => handleGenerateForPanel(activePanel.id)}
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
                  onChange={handleNarrationChange}
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
          ) : (
            <div className="border border-dashed border-gray-500 rounded-lg p-12 flex flex-col items-center justify-center h-[300px]">
              <p className="text-gray-500 text-center">
                Select a panel to edit its narration
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
