
import React, { useRef } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export const MangaPagesList = () => {
  const { project, addPage, selectPage, selectedPage } = useProject();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow image files
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        addPage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    
    // Reset the input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4 text-white">Manga Pages</h2>
      <div className="space-y-4 overflow-y-auto flex-1">
        {project.pages.map((page) => (
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
          <Plus size={32} className="text-gray-500 mb-2" />
          <p className="text-gray-500 text-sm">Upload Page</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
};
