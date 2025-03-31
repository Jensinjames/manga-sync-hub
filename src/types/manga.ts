
export interface MangaPage {
  id: string;
  imageUrl: string;
  panels: MangaPanel[];
}

export interface MangaPanel {
  id: string;
  imageUrl: string;
  timeCode: string;
  notes: {
    camera?: string;
    fx?: string;
    audio?: string;
  };
}

export interface ProjectData {
  id: string;
  name: string;
  pages: MangaPage[];
  selectedPageId: string | null;
  selectedPanelId: string | null;
}
