
// Interface that matches the database schema
export interface DbProject {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface DbMangaPage {
  id: string;
  project_id: string;
  page_number: number;
  image_url: string;
}

export interface DbMangaPanel {
  id: string;
  page_id: string;
  crop_x?: number;
  crop_y?: number;
  crop_width?: number;
  crop_height?: number;
  duration_sec: number;
}

export interface DbSceneNote {
  id: string;
  panel_id: string;
  direction?: string;
  fx?: string;
  audio?: string;
}

// Interfaces used by the app (maintaining compatibility with existing code)
export interface MangaPage {
  id: string;
  imageUrl: string;
  panels: MangaPanel[];
}

export interface MangaPanel {
  id: string;
  imageUrl: string;
  timeCode: string;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  notes: {
    camera?: string;
    fx?: string;
    audio?: string;
  };
}

export interface SceneNote {
  id: string;
  panelId: string;
  text: string;
  type: 'camera' | 'fx' | 'audio';
  timestamp: number;
}

export interface ProjectData {
  id: string;
  name: string;
  pages: MangaPage[];
  selectedPageId: string | null;
  selectedPanelId: string | null;
  lastModified: number;
}

// Helper function to convert between database and app models
export const convertDbToAppProject = (
  dbProject: DbProject, 
  dbPages: DbMangaPage[], 
  dbPanels: DbMangaPanel[],
  dbNotes: DbSceneNote[]
): ProjectData => {
  const pages: MangaPage[] = dbPages.map(dbPage => {
    const pagePanels = dbPanels
      .filter(panel => panel.page_id === dbPage.id)
      .map(dbPanel => {
        const panelNotes = dbNotes.find(note => note.panel_id === dbPanel.id);
        
        return {
          id: dbPanel.id,
          imageUrl: dbPage.image_url, // We reuse the page image and just crop it
          timeCode: formatDurationToTimeCode(dbPanel.duration_sec || 0),
          position: dbPanel.crop_x !== undefined ? {
            x: dbPanel.crop_x,
            y: dbPanel.crop_y || 0,
            width: dbPanel.crop_width || 0,
            height: dbPanel.crop_height || 0
          } : undefined,
          notes: {
            camera: panelNotes?.direction,
            fx: panelNotes?.fx,
            audio: panelNotes?.audio
          }
        } as MangaPanel;
      });
    
    return {
      id: dbPage.id,
      imageUrl: dbPage.image_url,
      panels: pagePanels
    };
  });

  return {
    id: dbProject.id,
    name: dbProject.title,
    pages,
    selectedPageId: null,
    selectedPanelId: null,
    lastModified: new Date(dbProject.updated_at).getTime()
  };
};

export const convertAppToDbProject = (project: ProjectData): {
  dbProject: DbProject,
  dbPages: DbMangaPage[],
  dbPanels: DbMangaPanel[],
  dbNotes: DbSceneNote[]
} => {
  const dbProject: DbProject = {
    id: project.id,
    title: project.name,
    created_at: new Date(project.lastModified).toISOString(),
    updated_at: new Date().toISOString()
  };

  const dbPages: DbMangaPage[] = [];
  const dbPanels: DbMangaPanel[] = [];
  const dbNotes: DbSceneNote[] = [];

  project.pages.forEach((page, pageIndex) => {
    const dbPage: DbMangaPage = {
      id: page.id,
      project_id: project.id,
      page_number: pageIndex + 1,
      image_url: page.imageUrl
    };
    dbPages.push(dbPage);

    page.panels.forEach(panel => {
      const durationSec = parseTimeCodeToDuration(panel.timeCode);
      
      const dbPanel: DbMangaPanel = {
        id: panel.id,
        page_id: page.id,
        duration_sec: durationSec,
        ...(panel.position ? {
          crop_x: panel.position.x,
          crop_y: panel.position.y,
          crop_width: panel.position.width,
          crop_height: panel.position.height
        } : {})
      };
      dbPanels.push(dbPanel);

      const dbNote: DbSceneNote = {
        id: panel.id, // We can reuse the panel ID since there's a 1:1 relationship
        panel_id: panel.id,
        direction: panel.notes.camera,
        fx: panel.notes.fx,
        audio: panel.notes.audio
      };
      dbNotes.push(dbNote);
    });
  });

  return { dbProject, dbPages, dbPanels, dbNotes };
};

// Helper functions for time code conversion
const formatDurationToTimeCode = (durationSec: number): string => {
  const minutes = Math.floor(durationSec / 60);
  const seconds = Math.floor(durationSec % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const parseTimeCodeToDuration = (timeCode: string): number => {
  const [minutesStr, secondsStr] = timeCode.split(':');
  const minutes = parseInt(minutesStr || '0', 10);
  const seconds = parseInt(secondsStr || '0', 10);
  return minutes * 60 + seconds;
};
