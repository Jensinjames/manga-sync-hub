
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { ProjectData, MangaPage, MangaPanel } from '@/types/manga';

// Project creation and reset
export const createNewProject = (): ProjectData => ({
  id: uuidv4(),
  name: 'Untitled Project',
  pages: [],
  selectedPageId: null,
  selectedPanelId: null,
  lastModified: Date.now(),
});

// Storage utilities
export const saveProjectToLocalStorage = (project: ProjectData): void => {
  localStorage.setItem('mangasync-project', JSON.stringify({
    ...project,
    lastModified: Date.now()
  }));
};

export const loadProjectFromLocalStorage = (): ProjectData | null => {
  const savedProject = localStorage.getItem('mangasync-project');
  if (savedProject) {
    try {
      return JSON.parse(savedProject);
    } catch (error) {
      console.error('Failed to parse saved project:', error);
    }
  }
  return null;
};

// Import/Export utilities
export const importProjectFromFile = async (file: File): Promise<ProjectData> => {
  try {
    const text = await file.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error importing project:', error);
    throw new Error('Failed to import project');
  }
};

export const exportProjectToJSON = (project: ProjectData): void => {
  const dataStr = JSON.stringify(project, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  const exportName = `${project.name.replace(/\s+/g, '-').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportName);
  linkElement.click();
};

// PDF export utility
export const exportProjectToPDF = async (project: ProjectData): Promise<void> => {
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
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export to PDF');
  }
};
