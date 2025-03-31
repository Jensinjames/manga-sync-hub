
import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { MangaPagesList } from '@/components/MangaPagesList';
import { SceneNotes } from '@/components/SceneNotes';
import { useMobile } from '@/contexts/MobileContext';

export const MobileDrawer: React.FC = () => {
  const { isDrawerOpen, activeDrawer, closeDrawer } = useMobile();

  return (
    <Drawer open={isDrawerOpen} onOpenChange={closeDrawer}>
      <DrawerContent className="bg-manga-dark text-white max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="text-white">
            {activeDrawer === 'pages' ? 'Manga Pages' : 'Scene Notes'}
          </DrawerTitle>
        </DrawerHeader>
        <div className="p-4 overflow-auto max-h-[calc(90vh-4rem)]">
          {activeDrawer === 'pages' && <MangaPagesList />}
          {activeDrawer === 'notes' && <SceneNotes />}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
