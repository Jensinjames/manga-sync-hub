
import React from 'react';
import { Button } from '@/components/ui/button';
import { Notebook, Image } from 'lucide-react';
import { useMobile } from '@/contexts/MobileContext';

export const MobileNavButtons: React.FC = () => {
  const { openDrawer } = useMobile();

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-6 md:hidden z-50">
      <Button 
        onClick={() => openDrawer('pages')} 
        size="sm" 
        variant="secondary"
        className="bg-manga-primary text-white rounded-full p-3 shadow-lg"
      >
        <Image size={20} />
        <span className="sr-only">Manga Pages</span>
      </Button>
      <Button 
        onClick={() => openDrawer('notes')} 
        size="sm" 
        variant="secondary"
        className="bg-manga-primary text-white rounded-full p-3 shadow-lg"
      >
        <Notebook size={20} />
        <span className="sr-only">Scene Notes</span>
      </Button>
    </div>
  );
};
