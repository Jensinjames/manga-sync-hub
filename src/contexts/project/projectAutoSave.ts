
import { ProjectData } from '@/types/manga';
import { saveProjectToLocalStorage } from '@/utils/projectUtils';
import { toast } from 'sonner';

export const setupAutoSave = (
  project: ProjectData,
  autoSavePeriod: number = 2 * 60 * 1000 // 2 minutes
) => {
  return setInterval(() => {
    saveProjectToLocalStorage(project);
    toast.success('Project autosaved');
  }, autoSavePeriod);
};

export const manualSave = (project: ProjectData) => {
  saveProjectToLocalStorage(project);
  toast.success('Project autosaved');
};
