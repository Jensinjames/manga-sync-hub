
import { v4 as uuidv4 } from 'uuid';
import { ProjectData, MangaPage, MangaPanel } from '@/types/manga';

export const addNewPage = (project: ProjectData, imageUrl: string): ProjectData => {
  const newPage: MangaPage = {
    id: uuidv4(),
    imageUrl,
    panels: [],
  };

  return {
    ...project,
    pages: [...project.pages, newPage],
    selectedPageId: newPage.id,
    lastModified: Date.now(),
  };
};

export const addPanelToPage = (
  project: ProjectData, 
  pageId: string, 
  panelData: { imageUrl: string, position?: MangaPanel['position'] }
): ProjectData => {
  const pageIndex = project.pages.findIndex(page => page.id === pageId);
  
  if (pageIndex === -1) {
    throw new Error('Page not found');
  }
  
  const newPanel: MangaPanel = {
    id: uuidv4(),
    imageUrl: panelData.imageUrl,
    timeCode: '0:00',
    durationSec: 0,
    position: panelData.position,
    notes: {},
  };
  
  const updatedPages = [...project.pages];
  updatedPages[pageIndex] = {
    ...updatedPages[pageIndex],
    panels: [...updatedPages[pageIndex].panels, newPanel],
  };
  
  return {
    ...project,
    pages: updatedPages,
    selectedPanelId: newPanel.id,
    lastModified: Date.now(),
  };
};

export const updatePanelNotes = (
  project: ProjectData, 
  panelId: string, 
  notes: Partial<MangaPanel['notes']>
): ProjectData => {
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

  return {
    ...project,
    pages: updatedPages,
    lastModified: Date.now(),
  };
};

export const updatePanelTimeCode = (
  project: ProjectData, 
  panelId: string, 
  timeCode: string
): ProjectData => {
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

  return {
    ...project,
    pages: updatedPages,
    lastModified: Date.now(),
  };
};

export const selectPage = (project: ProjectData, pageId: string): ProjectData => {
  return {
    ...project,
    selectedPageId: pageId,
    selectedPanelId: null,
    lastModified: Date.now(),
  };
};

export const selectPanel = (project: ProjectData, panelId: string): ProjectData => {
  return {
    ...project,
    selectedPanelId: panelId,
    lastModified: Date.now(),
  };
};
