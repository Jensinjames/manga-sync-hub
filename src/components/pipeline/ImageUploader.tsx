
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Image, Plus } from 'lucide-react';
import { usePipeline } from '@/contexts/PipelineContext';
import { useProject } from '@/contexts/ProjectContext';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export const ImageUploader: React.FC = () => {
  const { selectedPanels, setSelectedPanels, setActivePanel } = usePipeline();
  const { project } = useProject();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Convert FileList to array for processing
    const fileArray = Array.from(files);
    
    // Process each file
    fileArray.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imageUrl = event.target.result as string;
          
          // Create a new panel object
          const newPanel = {
            id: uuidv4(),
            imageUrl,
            timeCode: '0:00',
            durationSec: 0,
            notes: {},
            pageId: 'pipeline', // Special identifier for pipeline panels
          };
          
          setSelectedPanels(prev => [...prev, newPanel]);
          toast.success(`${file.name} uploaded successfully`);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePanelClick = (panel: any) => {
    setActivePanel(panel);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">Upload Manga Panels</h2>
          <p className="text-gray-400">Upload the manga panels you want to transform into narrated content</p>
        </div>
        <Button 
          onClick={handleUploadClick} 
          className="bg-manga-primary hover:bg-manga-primary/80 text-white flex items-center gap-2"
        >
          <Upload size={18} /> Upload Images
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
          multiple
        />
      </div>

      {selectedPanels.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {selectedPanels.map((panel) => (
            <Card 
              key={panel.id} 
              className={`cursor-pointer transition-all hover:ring-2 hover:ring-manga-primary ${
                panel.id === panel.id ? 'ring-2 ring-manga-primary' : ''
              }`}
              onClick={() => handlePanelClick(panel)}
            >
              <CardContent className="p-2">
                <img 
                  src={panel.imageUrl} 
                  alt={`Panel ${panel.id}`}
                  className="w-full h-auto object-cover aspect-square"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-gray-500 rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:border-manga-primary transition-colors" onClick={handleUploadClick}>
          <Image size={48} className="text-gray-500 mb-4" />
          <p className="text-gray-500 text-center">
            No panels uploaded yet. Click here to upload manga panels
            <br />
            <span className="text-sm opacity-70">Supported: JPG, PNG, WebP</span>
          </p>
        </div>
      )}
    </div>
  );
};
