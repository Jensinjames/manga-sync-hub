
import React, { createContext } from 'react';
import { ProjectContextType } from './types/ProjectContextTypes';
import { ProjectProvider } from './project/ProjectProvider';
import { useProject } from './hooks/useProjectContext';

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export { ProjectContext, ProjectProvider, useProject };
