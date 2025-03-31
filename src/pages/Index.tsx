
import React from 'react';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { Header } from '@/components/Header';
import { MangaPagesList } from '@/components/MangaPagesList';
import { PanelWorkspace } from '@/components/PanelWorkspace';
import { SceneNotes } from '@/components/SceneNotes';
import { StoryboardTimeline } from '@/components/StoryboardTimeline';

const Index = () => {
  return (
    <ProjectProvider>
      <div className="min-h-screen flex flex-col bg-manga-darker text-white">
        <Header />
        <main className="flex-1 grid grid-cols-12 gap-4 p-4">
          {/* Left column: Manga Pages */}
          <div className="col-span-3 bg-manga-dark rounded-lg p-4">
            <MangaPagesList />
          </div>

          {/* Middle column: Panel Workspace */}
          <div className="col-span-6 flex flex-col space-y-4">
            <div className="bg-manga-dark rounded-lg p-4 flex-1">
              <PanelWorkspace />
            </div>
            <div className="bg-manga-dark rounded-lg p-4">
              <StoryboardTimeline />
            </div>
          </div>

          {/* Right column: Scene Notes */}
          <div className="col-span-3 bg-manga-dark rounded-lg p-4">
            <SceneNotes />
          </div>
        </main>
      </div>
    </ProjectProvider>
  );
};

export default Index;
