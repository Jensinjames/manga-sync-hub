
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
