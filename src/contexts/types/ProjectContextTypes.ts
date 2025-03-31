
import { ProjectData, MangaPage, MangaPanel } from '@/types/manga';

export interface ExportOptions {
  includeNotes?: boolean;
  includeThumbnails?: boolean;
}

export interface ProjectContextType {
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
