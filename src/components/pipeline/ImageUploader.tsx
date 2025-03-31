
import React, { useState } from 'react';
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
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = () => {
    // Create a file input element on demand
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    
    // Set up event listeners
    fileInput.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      
      // Convert FileList to array for processing
      const fileArray = Array.from(files);
      setIsUploading(true);
      
      // Process each file
      const promises = fileArray.map(file => {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          return Promise.resolve();
        }
        
        return new Promise<void>((resolve) => {
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
              resolve();
            }
          };
          
          // Add error handling
          reader.onerror = () => {
            toast.error(`Failed to read ${file.name}`);
            resolve();
          };
          
          reader.readAsDataURL(file);
        });
      });
      
      // When all files are processed
      Promise.all(promises).finally(() => {
        setIsUploading(false);
        // Clean up the input element
        document.body.removeChild(fileInput);
      });
    };
    
    // Handle cancel
    fileInput.oncancel = () => {
      document.body.removeChild(fileInput);
    };
    
    // Append to body (hidden), trigger click, and will be removed after use
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    fileInput.click();
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
          disabled={isUploading}
        >
          {isUploading ? (
            <span className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <>
              <Upload size={18} /> Upload Images
            </>
          )}
        </Button>
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
