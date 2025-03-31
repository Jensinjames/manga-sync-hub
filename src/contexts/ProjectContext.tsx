
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
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
  updatePanelTimeCode: (panelId: string, timeCode: string) => void;
  addPanelToPage: (pageId: string, panelData: { imageUrl: string, position?: MangaPanel['position'] }) => void;
  importProject: (file: File) => Promise<void>;
  exportProject: () => void;
  exportToPDF: () => Promise<void>;
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
    const savedProject = localStorage.getItem('mangasync-project');
    if (savedProject) {
      try {
        return JSON.parse(savedProject);
      } catch (error) {
        console.error('Failed to parse saved project:', error);
      }
    }
    
    // Default project if nothing is saved
    return {
      id: uuidv4(),
      name: 'Untitled Project',
      pages: [],
      selectedPageId: null,
      selectedPanelId: null,
      lastModified: Date.now(),
    };
  });

  const selectedPage = project.selectedPageId 
    ? project.pages.find(page => page.id === project.selectedPageId) || null 
    : null;
    
  const selectedPanel = selectedPage?.panels.find(panel => panel.id === project.selectedPanelId) || null;

  const setProject = (updatedProject: ProjectData) => {
    const projectWithTimestamp = {
      ...updatedProject,
      lastModified: Date.now(),
    };
    setProjectState(projectWithTimestamp);
    
    // Auto-save to localStorage
    localStorage.setItem('mangasync-project', JSON.stringify(projectWithTimestamp));
  };

  const autoSave = () => {
    localStorage.setItem('mangasync-project', JSON.stringify({
      ...project,
      lastModified: Date.now()
    }));
    toast.success('Project autosaved');
  };

  // Set up autosave every 2 minutes
  useEffect(() => {
    const intervalId = setInterval(() => {
      autoSave();
    }, 2 * 60 * 1000); // 2 minutes
    
    return () => clearInterval(intervalId);
  }, [project]);

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

  const addPanelToPage = (pageId: string, panelData: { imageUrl: string, position?: MangaPanel['position'] }) => {
    const pageIndex = project.pages.findIndex(page => page.id === pageId);
    
    if (pageIndex === -1) {
      toast.error('Page not found');
      return;
    }
    
    const newPanel: MangaPanel = {
      id: uuidv4(),
      imageUrl: panelData.imageUrl,
      timeCode: '0:00',
      position: panelData.position,
      notes: {},
    };
    
    const updatedPages = [...project.pages];
    updatedPages[pageIndex] = {
      ...updatedPages[pageIndex],
      panels: [...updatedPages[pageIndex].panels, newPanel],
    };
    
    setProject({
      ...project,
      pages: updatedPages,
      selectedPanelId: newPanel.id,
    });
    
    toast.success('Panel added successfully');
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

  const updatePanelTimeCode = (panelId: string, timeCode: string) => {
    const updatedPages = project.pages.map(page => {
      const panelIndex = page.panels.findIndex(panel => panel.id === panelId);
      
      if (panelIndex === -1) return page;
      
      const updatedPanels = [...page.panels];
      updatedPanels[panelIndex] = {
        ...updatedPanels[panelIndex],
        timeCode
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

  const exportToPDF = async (): Promise<void> => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Get all panels from all pages
      const allPanels = project.pages.flatMap(page => 
        page.panels.map(panel => ({
          ...panel,
          pageName: project.pages.find(p => p.id === page.id)?.id || 'Unknown'
        }))
      );
      
      // Sort panels by timeCode
      allPanels.sort((a, b) => {
        const timeA = a.timeCode.split(':').map(Number);
        const timeB = b.timeCode.split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
      });
      
      // Add title
      doc.setFontSize(20);
      doc.text(`Storyboard: ${project.name}`, 10, 15);
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 10, 25);
      
      let yPosition = 40;
      
      // Add panels and notes
      for (let i = 0; i < allPanels.length; i++) {
        const panel = allPanels[i];
        
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Add panel number and time code
        doc.setFontSize(14);
        doc.text(`Panel ${i + 1} - ${panel.timeCode}`, 10, yPosition);
        yPosition += 10;
        
        // Add panel notes
        doc.setFontSize(10);
        if (panel.notes.camera) {
          doc.text(`Camera: ${panel.notes.camera}`, 15, yPosition);
          yPosition += 5;
        }
        if (panel.notes.fx) {
          doc.text(`FX: ${panel.notes.fx}`, 15, yPosition);
          yPosition += 5;
        }
        if (panel.notes.audio) {
          doc.text(`Audio: ${panel.notes.audio}`, 15, yPosition);
          yPosition += 5;
        }
        
        yPosition += 10;
      }
      
      // Save the PDF
      const fileName = `${project.name.replace(/\s+/g, '-').toLowerCase()}_storyboard_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export to PDF');
    }
  };

  const resetProject = () => {
    const newProject: ProjectData = {
      id: uuidv4(),
      name: 'Untitled Project',
      pages: [],
      selectedPageId: null,
      selectedPanelId: null,
      lastModified: Date.now(),
    };
    
    setProject(newProject);
    toast.success('Project reset successfully');
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
        updatePanelTimeCode,
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
