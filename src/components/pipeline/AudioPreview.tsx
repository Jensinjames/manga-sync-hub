
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Loader2, 
  Volume2, 
  MusicIcon,
  Play,
  Pause,
  RotateCw
} from 'lucide-react';
import { usePipeline } from '@/contexts/PipelineContext';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export const AudioPreview: React.FC = () => {
  const { 
    selectedPanels, 
    activePanel,
    setActivePanel, 
    voiceType,
    setVoiceType,
    generateAudio
  } = usePipeline();
  
  const [playing, setPlaying] = React.useState<string | null>(null);

  const handleGenerateAll = async () => {
    if (selectedPanels.length === 0) {
      toast.error("No panels to generate audio for");
      return;
    }

    for (const panel of selectedPanels) {
      if (panel.narration) {
        await generateAudio(panel.id);
      }
    }
    
    toast.success("All audio generated");
  };

  const handleGenerateForPanel = async (panelId: string) => {
    const panel = selectedPanels.find(p => p.id === panelId);
    if (!panel || !panel.narration) {
      toast.error("Panel needs narration before generating audio");
      return;
    }
    
    await generateAudio(panelId);
    toast.success("Audio generated");
  };

  const handlePanelClick = (panel: any) => {
    setActivePanel(panel);
  };

  const togglePlayAudio = (panelId: string) => {
    // In a real implementation, this would play/pause the actual audio
    if (playing === panelId) {
      setPlaying(null);
      toast.info("Audio paused");
    } else {
      setPlaying(panelId);
      toast.info("Audio playing");
      
      // Simulate audio ending after 5 seconds
      setTimeout(() => {
        if (playing === panelId) {
          setPlaying(null);
        }
      }, 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">Audio Preview</h2>
          <p className="text-gray-400">Convert narration to spoken audio</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="space-y-1">
            <Label htmlFor="voice" className="text-xs">Voice Type</Label>
            <Select value={voiceType} onValueChange={(value: any) => setVoiceType(value)}>
              <SelectTrigger id="voice" className="w-[140px]">
                <SelectValue placeholder="Voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleGenerateAll} 
            className="bg-manga-primary hover:bg-manga-primary/80 text-white flex items-center gap-2 self-end"
            disabled={selectedPanels.length === 0}
          >
            <Volume2 size={18} /> Generate All Audio
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-medium text-white mb-4">Audio Timeline</h3>
          
          {selectedPanels.length > 0 ? (
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
                        onClick={() => handlePanelClick(panel)}
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
                                onClick={() => handleGenerateForPanel(panel.id)}
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
                                onClick={() => togglePlayAudio(panel.id)}
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
          ) : (
            <div className="border border-dashed border-gray-500 rounded-lg p-12 flex flex-col items-center justify-center">
              <p className="text-gray-500 text-center">
                No panels available. Please generate narration first.
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <MusicIcon size={18} /> Audio Preview
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
              
              <div className="space-y-3">
                <div className="text-sm overflow-auto max-h-32 p-3 bg-gray-800/50 rounded-md">
                  {activePanel.narration || "No narration available"}
                </div>
                
                <div className="flex justify-between items-center gap-3">
                  <Button
                    variant={activePanel.audioUrl && playing === activePanel.id ? "default" : "outline"}
                    disabled={!activePanel.audioUrl}
                    onClick={() => activePanel.audioUrl && togglePlayAudio(activePanel.id)}
                    className="flex-grow flex items-center justify-center"
                  >
                    {!activePanel.audioUrl ? (
                      "No audio available"
                    ) : playing === activePanel.id ? (
                      <>
                        <Pause size={16} className="mr-2" /> Pause
                      </>
                    ) : (
                      <>
                        <Play size={16} className="mr-2" /> Play
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    disabled={!activePanel.narration || activePanel.isProcessing}
                    onClick={() => handleGenerateForPanel(activePanel.id)}
                    className="flex items-center"
                  >
                    {activePanel.isProcessing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <RotateCw size={16} />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-gray-500 rounded-lg p-12 flex flex-col items-center justify-center h-[300px]">
              <p className="text-gray-500 text-center">
                Select a panel to preview its audio
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
