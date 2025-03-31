import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ProjectData, MangaPage, MangaPanel } from '@/types/manga';
import { toast } from 'sonner';
import { 
  createNewProject, 
  saveProjectToLocalStorage, 
  loadProjectFromLocalStorage,
  importProjectFromFile,
  exportProjectToJSON,
  exportProjectToPDF
} from '@/utils/projectUtils';
import {
  addNewPage,
  addPanelToPage as addPanelToPageUtil,
  updatePanelNotes as updatePanelNotesUtil,
  updatePanelTimeCode as updatePanelTimeCodeUtil,
  selectPage as selectPageUtil,
  selectPanel as selectPanelUtil
} from '@/utils/panelOperations';

import {
  updatePanelDuration,
  reorderPanels,
  getSortedPanels
} from '@/utils/timelineUtils';

interface ExportOptions {
  includeNotes?: boolean;
  includeThumbnails?: boolean;
}

interface ProjectContextType {
  project: ProjectData;
  selectedPage: MangaPage | null;
  selectedPanel: MangaPanel | null;
  sortedPanels: (MangaPanel & { pageId: string })[];
  setProject: (project: ProjectData) => void;
  addPage: (imageUrl: string) => void;
  selectPage: (pageId: string) => void;
  selectPanel: (panelId: string) => void;
  updatePanelNotes: (panelId: string, notes: Partial<MangaPanel['notes']>) => void;
  updatePanelTimeCode: (panelId: string, timeCode: string) => void;
  updatePanelDuration: (panelId: string, durationSec: number) => void;
  reorderPanels: (sourcePageId: string, sourcePanelId: string, destinationPageId: string, destinationIndex: number) => void;
  addPanelToPage: (pageId: string, panelData: { imageUrl: string, position?: MangaPanel['position'] }) => void;
  importProject: (file: File) => Promise<void>;
  exportProject: () => void;
  exportToPDF: (options?: ExportOptions) => Promise<void>;
  resetProject: () => void;
  autoSave: () => void;
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
  const [project, setProjectState] = useState<ProjectData>(() => {
    const savedProject = loadProjectFromLocalStorage();
    return savedProject || createNewProject();
  });

  const selectedPage = project.selectedPageId 
    ? project.pages.find(page => page.id === project.selectedPageId) || null 
    : null;
    
  const selectedPanel = selectedPage?.panels.find(panel => panel.id === project.selectedPanelId) || null;
  
  const sortedPanels = project && project.pages ? getSortedPanels(project) : [];

  useEffect(() => {
    const intervalId = setInterval(() => {
      autoSave();
    }, 2 * 60 * 1000); // 2 minutes
    
    return () => clearInterval(intervalId);
  }, [project]);

  const setProject = (updatedProject: ProjectData) => {
    const projectWithTimestamp = {
      ...updatedProject,
      lastModified: Date.now(),
    };
    setProjectState(projectWithTimestamp);
    
    saveProjectToLocalStorage(projectWithTimestamp);
  };

  const autoSave = () => {
    saveProjectToLocalStorage(project);
    toast.success('Project autosaved');
  };

  const addPage = (imageUrl: string) => {
    const updatedProject = addNewPage(project, imageUrl);
    setProject(updatedProject);
    toast.success('Page added successfully');
  };

  const addPanelToPage = (pageId: string, panelData: { imageUrl: string, position?: MangaPanel['position'] }) => {
    try {
      const updatedProject = addPanelToPageUtil(project, pageId, panelData);
      setProject(updatedProject);
      toast.success('Panel added successfully');
    } catch (error) {
      toast.error('Failed to add panel');
    }
  };

  const selectPage = (pageId: string) => {
    setProject(selectPageUtil(project, pageId));
  };

  const selectPanel = (panelId: string) => {
    setProject(selectPanelUtil(project, panelId));
  };

  const updatePanelNotes = (panelId: string, notes: Partial<MangaPanel['notes']>) => {
    setProject(updatePanelNotesUtil(project, panelId, notes));
  };

  const updatePanelTimeCode = (panelId: string, timeCode: string) => {
    setProject(updatePanelTimeCodeUtil(project, panelId, timeCode));
  };

  const handleUpdatePanelDuration = (panelId: string, durationSec: number) => {
    setProject(updatePanelDuration(project, panelId, durationSec));
  };

  const handleReorderPanels = (
    sourcePageId: string, 
    sourcePanelId: string, 
    destinationPageId: string, 
    destinationIndex: number
  ) => {
    setProject(reorderPanels(project, sourcePageId, sourcePanelId, destinationPageId, destinationIndex));
  };

  const importProject = async (file: File): Promise<void> => {
    try {
      const importedProject = await importProjectFromFile(file);
      setProject(importedProject);
      toast.success('Project imported successfully');
    } catch (error) {
      toast.error('Failed to import project');
    }
  };

  const exportProject = () => {
    try {
      exportProjectToJSON(project);
      toast.success('Project exported successfully');
    } catch (error) {
      toast.error('Failed to export project');
    }
  };

  const exportToPDF = async (options: ExportOptions = {}): Promise<void> => {
    try {
      await exportProjectToPDF(project, options);
      toast.success('PDF exported successfully');
    } catch (error) {
      toast.error('Failed to export to PDF');
    }
  };

  const resetProject = () => {
    const newProject = createNewProject();
    setProject(newProject);
    toast.success('Project reset successfully');
  };

  return (
    <ProjectContext.Provider
      value={{
        project,
        selectedPage,
        selectedPanel,
        sortedPanels,
        setProject,
        addPage,
        selectPage,
        selectPanel,
        updatePanelNotes,
        updatePanelTimeCode,
        updatePanelDuration: handleUpdatePanelDuration,
        reorderPanels: handleReorderPanels,
        addPanelToPage,
        importProject,
        exportProject,
        exportToPDF,
        resetProject,
        autoSave,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
