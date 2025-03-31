
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileDown, 
  FileAudio,
  FileText,
  Video, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import { usePipeline } from '@/contexts/PipelineContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export const ExportOptions: React.FC = () => {
  const { selectedPanels } = usePipeline();
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'video' | 'audio' | 'script'>('pdf');
  
  // Export options
  const [options, setOptions] = useState({
    includeImages: true,
    includeNarration: true,
    includeAudio: true,
    combineAudio: false,
  });

  const handleOptionChange = (option: keyof typeof options) => {
    setOptions({ ...options, [option]: !options[option] });
  };

  const handleExport = async () => {
    if (selectedPanels.length === 0) {
      toast.error("No content to export");
      return;
    }

    setExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setExporting(false);
    toast.success(`Export completed as ${exportType.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">Export Content</h2>
          <p className="text-gray-400">Export your narrated manga panels in various formats</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-lg font-medium">Export Format</h3>
              
              <div className="space-y-3">
                <Button
                  variant={exportType === 'pdf' ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setExportType('pdf')}
                >
                  <FileText className="mr-2 h-5 w-5" /> PDF Document
                </Button>
                
                <Button
                  variant={exportType === 'video' ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setExportType('video')}
                >
                  <Video className="mr-2 h-5 w-5" /> Video Slideshow
                </Button>
                
                <Button
                  variant={exportType === 'audio' ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setExportType('audio')}
                >
                  <FileAudio className="mr-2 h-5 w-5" /> Audio Files
                </Button>
                
                <Button
                  variant={exportType === 'script' ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setExportType('script')}
                >
                  <FileText className="mr-2 h-5 w-5" /> Script Text
                </Button>
              </div>
              
              <div className="pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium mb-3">Export Options</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="includeImages" className="text-sm">Include Images</Label>
                    <Switch
                      id="includeImages"
                      checked={options.includeImages}
                      onCheckedChange={() => handleOptionChange('includeImages')}
                      disabled={exportType === 'audio' || exportType === 'script'}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="includeNarration" className="text-sm">Include Narration</Label>
                    <Switch
                      id="includeNarration"
                      checked={options.includeNarration}
                      onCheckedChange={() => handleOptionChange('includeNarration')}
                      disabled={exportType === 'audio'}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="includeAudio" className="text-sm">Include Audio</Label>
                    <Switch
                      id="includeAudio"
                      checked={options.includeAudio}
                      onCheckedChange={() => handleOptionChange('includeAudio')}
                      disabled={exportType === 'script' || exportType === 'audio'}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="combineAudio" className="text-sm">Combine Audio Files</Label>
                    <Switch
                      id="combineAudio"
                      checked={options.combineAudio}
                      onCheckedChange={() => handleOptionChange('combineAudio')}
                      disabled={exportType !== 'audio' && exportType !== 'video'}
                    />
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full mt-4 bg-manga-primary hover:bg-manga-primary/80 text-white"
                disabled={selectedPanels.length === 0 || exporting}
                onClick={handleExport}
              >
                {exporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exporting...
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" /> Export Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Content Preview</h3>
              
              {selectedPanels.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-3">
                    {selectedPanels.slice(0, 6).map((panel, idx) => (
                      <div key={panel.id} className="aspect-square rounded-md overflow-hidden relative">
                        <img 
                          src={panel.imageUrl} 
                          alt={`Panel ${idx + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-xs">
                          {idx + 1}
                        </div>
                        
                        {panel.narration && (
                          <div className="absolute top-1 right-1 text-green-400">
                            <CheckCircle size={14} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-gray-800/50 p-4 rounded-md">
                    <h4 className="text-sm font-medium mb-2">Export Summary</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span>Total Panels:</span>
                        <span>{selectedPanels.length}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Panels with Narration:</span>
                        <span>
                          {selectedPanels.filter(panel => panel.narration).length} / {selectedPanels.length}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Panels with Audio:</span>
                        <span>
                          {selectedPanels.filter(panel => panel.audioUrl).length} / {selectedPanels.length}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Export Format:</span>
                        <span className="capitalize">{exportType}</span>
                      </li>
                    </ul>
                  </div>
                  
                  {exportType === 'pdf' && (
                    <div className="border border-dashed border-gray-500 p-4 rounded-md">
                      <div className="flex items-center">
                        <FileText size={24} className="mr-3 text-gray-400" />
                        <div>
                          <p className="font-medium">PDF Export Preview</p>
                          <p className="text-sm text-gray-400">
                            Will include {selectedPanels.length} panels with narration text
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {exportType === 'video' && (
                    <div className="border border-dashed border-gray-500 p-4 rounded-md">
                      <div className="flex items-center">
                        <Video size={24} className="mr-3 text-gray-400" />
                        <div>
                          <p className="font-medium">Video Export Preview</p>
                          <p className="text-sm text-gray-400">
                            Will create a slideshow with {selectedPanels.filter(panel => panel.audioUrl).length} panels with audio narration
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {exportType === 'audio' && (
                    <div className="border border-dashed border-gray-500 p-4 rounded-md">
                      <div className="flex items-center">
                        <FileAudio size={24} className="mr-3 text-gray-400" />
                        <div>
                          <p className="font-medium">Audio Files Export Preview</p>
                          <p className="text-sm text-gray-400">
                            Will export {options.combineAudio ? '1 combined' : selectedPanels.filter(panel => panel.audioUrl).length} audio file(s)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {exportType === 'script' && (
                    <div className="border border-dashed border-gray-500 p-4 rounded-md">
                      <div className="flex items-center">
                        <FileText size={24} className="mr-3 text-gray-400" />
                        <div>
                          <p className="font-medium">Script Export Preview</p>
                          <p className="text-sm text-gray-400">
                            Will export text narration for {selectedPanels.filter(panel => panel.narration).length} panels
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-dashed border-gray-500 rounded-lg p-12 flex flex-col items-center justify-center h-[300px]">
                  <p className="text-gray-500 text-center">
                    No panels available to export. Please complete the previous steps first.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
