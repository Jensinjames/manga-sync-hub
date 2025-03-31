
import { useContext } from 'react';
import { ProjectContext } from '../ProjectContext';
import { ProjectContextType } from '../types/ProjectContextTypes';

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
