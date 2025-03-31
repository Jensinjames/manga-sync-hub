
import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export const MangaPagesList = () => {
  const { project, addPage, selectPage, selectedPage } = useProject();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = () => {
    // Create a file input element dynamically
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    // Set up event listeners
    fileInput.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Only allow image files
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        document.body.removeChild(fileInput);
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          addPage(event.target.result as string);
          setIsUploading(false);
        }
      };
      
      reader.onerror = () => {
        toast.error('Failed to read the file');
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
      
      // Clean up the input element
      document.body.removeChild(fileInput);
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

  // Ensure project and project.pages exist before mapping
  const pages = project?.pages || [];

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4 text-white">Manga Pages</h2>
      <div className="space-y-4 overflow-y-auto flex-1">
        {pages.map((page) => (
          <Card 
            key={page.id} 
            className={`cursor-pointer transition-all hover:ring-2 hover:ring-manga-primary ${
              selectedPage?.id === page.id ? 'ring-2 ring-manga-primary' : ''
            }`}
            onClick={() => selectPage(page.id)}
          >
            <CardContent className="p-2">
              <img 
                src={page.imageUrl} 
                alt={`Page ${page.id}`}
                className="w-full h-auto object-cover"
              />
            </CardContent>
          </Card>
        ))}

        <div 
          className="border border-dashed border-gray-500 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-manga-primary transition-colors"
          onClick={handleUpload}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-6 w-6 text-gray-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-500 text-sm">Uploading...</p>
            </div>
          ) : (
            <>
              <Plus size={32} className="text-gray-500 mb-2" />
              <p className="text-gray-500 text-sm">Upload Page</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
