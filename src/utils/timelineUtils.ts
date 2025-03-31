
import { MangaPanel, ProjectData, formatDurationToTimeCode } from '@/types/manga';

/**
 * Updates the panel duration in seconds and recalculates the timecode
 */
export const updatePanelDuration = (
  project: ProjectData,
  panelId: string,
  durationSec: number
): ProjectData => {
  const updatedPages = project.pages.map(page => {
    const panelIndex = page.panels.findIndex(panel => panel.id === panelId);
    
    if (panelIndex === -1) return page;
    
    const updatedPanels = [...page.panels];
    updatedPanels[panelIndex] = {
      ...updatedPanels[panelIndex],
      durationSec,
      timeCode: formatDurationToTimeCode(durationSec)
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

/**
 * Reorders panels within the timeline
 */
export const reorderPanels = (
  project: ProjectData,
  sourcePageId: string, 
  sourcePanelId: string,
  destinationPageId: string,
  destinationIndex: number
): ProjectData => {
  // Find source page and panel
  const sourcePageIndex = project.pages.findIndex(page => page.id === sourcePageId);
  if (sourcePageIndex === -1) return project;

  const sourcePage = project.pages[sourcePageIndex];
  const sourcePanelIndex = sourcePage.panels.findIndex(panel => panel.id === sourcePanelId);
  if (sourcePanelIndex === -1) return project;
  
  // Create a copy of the pages
  const updatedPages = [...project.pages];
  
  // Remove panel from source
  const [movedPanel] = updatedPages[sourcePageIndex].panels.splice(sourcePanelIndex, 1);
  
  // Find destination page
  const destPageIndex = updatedPages.findIndex(page => page.id === destinationPageId);
  if (destPageIndex === -1) {
    // If destination page doesn't exist, put panel back where it was
    updatedPages[sourcePageIndex].panels.splice(sourcePanelIndex, 0, movedPanel);
  } else {
    // Add panel to destination
    updatedPages[destPageIndex].panels.splice(destinationIndex, 0, movedPanel);
  }
  
  return {
    ...project,
    pages: updatedPages,
    lastModified: Date.now()
  };
};

/**
 * Gets all panels across all pages sorted by timeCode
 */
export const getSortedPanels = (project: ProjectData): (MangaPanel & { pageId: string })[] => {
  // Collect all panels across all pages
  const allPanels = project.pages.flatMap(page => 
    page.panels.map(panel => ({
      ...panel,
      pageId: page.id
    }))
  );

  // Sort panels by timeCode
  return [...allPanels].sort((a, b) => {
    // Sort by durationSec if available
    if (a.durationSec !== undefined && b.durationSec !== undefined) {
      return a.durationSec - b.durationSec;
    }
    
    // Fallback to timeCode
    const timeA = a.timeCode.split(':').map(Number);
    const timeB = b.timeCode.split(':').map(Number);
    return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
  });
};
