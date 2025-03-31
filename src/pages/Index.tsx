
import React from 'react';
import { Header } from '@/components/Header';
import { MangaPagesList } from '@/components/MangaPagesList';
import { PanelWorkspace } from '@/components/PanelWorkspace';
import { SceneNotes } from '@/components/SceneNotes';
import { StoryboardTimeline } from '@/components/StoryboardTimeline';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { MobileDrawer } from '@/components/MobileDrawer';
import { MobileNavButtons } from '@/components/MobileNavButtons';
import { useMobile } from '@/contexts/MobileContext';

// Mobile layout component
const MobileLayout: React.FC = () => {
  return (
    <>
      <main className="flex-1 p-2">
        <div className="bg-manga-dark rounded-lg p-4 mb-2">
          <PanelWorkspace />
        </div>
        <div className="bg-manga-dark rounded-lg p-4">
          <StoryboardTimeline />
        </div>
      </main>
      <MobileNavButtons />
      <MobileDrawer />
    </>
  );
};

// Desktop layout component
const DesktopLayout: React.FC = () => {
  return (
    <main className="flex-1 p-4">
      <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-80px)]">
        {/* Left column: Manga Pages */}
        <ResizablePanel defaultSize={20} minSize={15}>
          <div className="bg-manga-dark rounded-lg p-4 h-full">
            <MangaPagesList />
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Middle column: Panel Workspace */}
        <ResizablePanel defaultSize={55}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70}>
              <div className="bg-manga-dark rounded-lg p-4 h-full">
                <PanelWorkspace />
              </div>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={30}>
              <div className="bg-manga-dark rounded-lg p-4 h-full">
                <StoryboardTimeline />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Right column: Scene Notes */}
        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="bg-manga-dark rounded-lg p-4 h-full">
            <SceneNotes />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
};

// Responsive layout selector
const ResponsiveLayout: React.FC = () => {
  const { isMobile } = useMobile();
  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-manga-darker text-white">
      <Header />
      <ResponsiveLayout />
    </div>
  );
};

export default Index;
