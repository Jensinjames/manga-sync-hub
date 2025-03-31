
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ProjectData, MangaPage, MangaPanel } from '@/types/manga';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface ProjectContextType {
  project: ProjectData;
  selectedPage: MangaPage | null;
  selectedPanel: MangaPanel | null;
  setProject: (project: ProjectData) => void;
  addPage: (imageUrl: string) => void;
  selectPage: (pageId: string) => void;
  selectPanel: (panelId: string) => void;
  updatePanelNotes: (panelId: string, notes: Partial<MangaPanel['notes']>) => void;
  importProject: (file: File) => Promise<void>;
  exportProject: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<ProjectData>({
    id: uuidv4(),
    name: 'Untitled Project',
    pages: [],
    selectedPageId: null,
    selectedPanelId: null,
  });

  const selectedPage = project.selectedPageId 
    ? project.pages.find(page => page.id === project.selectedPageId) || null 
    : null;
    
  const selectedPanel = selectedPage?.panels.find(panel => panel.id === project.selectedPanelId) || null;

  const addPage = (imageUrl: string) => {
    const newPage: MangaPage = {
      id: uuidv4(),
      imageUrl,
      panels: [],
    };

    const updatedProject = {
      ...project,
      pages: [...project.pages, newPage],
      selectedPageId: newPage.id,
    };

    setProject(updatedProject);
    toast.success('Page added successfully');
  };

  const selectPage = (pageId: string) => {
    setProject({
      ...project,
      selectedPageId: pageId,
      selectedPanelId: null,
    });
  };

  const selectPanel = (panelId: string) => {
    setProject({
      ...project,
      selectedPanelId: panelId,
    });
  };

  const updatePanelNotes = (panelId: string, notes: Partial<MangaPanel['notes']>) => {
    const updatedPages = project.pages.map(page => {
      const panelIndex = page.panels.findIndex(panel => panel.id === panelId);
      
      if (panelIndex === -1) return page;
      
      const updatedPanels = [...page.panels];
      updatedPanels[panelIndex] = {
        ...updatedPanels[panelIndex],
        notes: {
          ...updatedPanels[panelIndex].notes,
          ...notes
        }
      };
      
      return {
        ...page,
        panels: updatedPanels
      };
    });

    setProject({
      ...project,
      pages: updatedPages
    });
  };

  const importProject = async (file: File): Promise<void> => {
    try {
      const text = await file.text();
      const importedProject = JSON.parse(text);
      setProject(importedProject);
      toast.success('Project imported successfully');
    } catch (error) {
      console.error('Error importing project:', error);
      toast.error('Failed to import project');
    }
  };

  const exportProject = () => {
    const dataStr = JSON.stringify(project, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportName = `${project.name.replace(/\s+/g, '-').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
    
    toast.success('Project exported successfully');
  };

  return (
    <ProjectContext.Provider
      value={{
        project,
        selectedPage,
        selectedPanel,
        setProject,
        addPage,
        selectPage,
        selectPanel,
        updatePanelNotes,
        importProject,
        exportProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
