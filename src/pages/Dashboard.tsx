
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Plus, Trash, Edit, Download } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { ProjectData } from '@/types/manga';

type ProjectSummary = {
  id: string;
  name: string;
  lastModified: number;
  pageCount: number;
  panelCount: number;
};

const Dashboard = () => {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  
  // Load projects from localStorage on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const projectKeys = Object.keys(localStorage).filter(key => key.startsWith('mangasync-'));
    const loadedProjects: ProjectSummary[] = [];
    
    projectKeys.forEach(key => {
      try {
        const projectData = JSON.parse(localStorage.getItem(key) || '{}') as ProjectData;
        if (projectData.id) {
          loadedProjects.push({
            id: projectData.id,
            name: projectData.name,
            lastModified: projectData.lastModified || Date.now(),
            pageCount: projectData.pages.length,
            panelCount: projectData.pages.reduce((count, page) => count + page.panels.length, 0),
          });
        }
      } catch (error) {
        console.error('Error parsing project:', error);
      }
    });
    
    // Sort by last modified date (newest first)
    loadedProjects.sort((a, b) => b.lastModified - a.lastModified);
    setProjects(loadedProjects);
  };

  const createNewProject = () => {
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }
    
    const projectId = uuidv4();
    const newProject: ProjectData = {
      id: projectId,
      name: newProjectName,
      pages: [],
      selectedPageId: null,
      selectedPanelId: null,
      lastModified: Date.now(),
    };
    
    // Save to localStorage
    localStorage.setItem('mangasync-project', JSON.stringify(newProject));
    toast.success('Project created successfully');
    
    // Clear input and reload projects
    setNewProjectName('');
    loadProjects();
    
    // Navigate to editor (this works with react-router)
    window.location.href = '/';
  };

  const deleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      localStorage.removeItem(`mangasync-${id}`);
      loadProjects();
      toast.success('Project deleted successfully');
    }
  };

  const loadProject = (id: string) => {
    try {
      const projectData = localStorage.getItem(`mangasync-${id}`);
      if (projectData) {
        localStorage.setItem('mangasync-project', projectData);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Failed to load project');
    }
  };

  const exportProject = (id: string) => {
    try {
      const projectData = localStorage.getItem(`mangasync-${id}`);
      if (projectData) {
        const project = JSON.parse(projectData) as ProjectData;
        
        const dataStr = JSON.stringify(project, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
        
        const exportName = `${project.name.replace(/\s+/g, '-').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportName);
        linkElement.click();
        
        toast.success('Project exported successfully');
      }
    } catch (error) {
      console.error('Error exporting project:', error);
      toast.error('Failed to export project');
    }
  };

  return (
    <div className="min-h-screen bg-manga-darker text-white">
      <header className="bg-manga-dark border-b border-manga-darker px-6 py-4">
        <h1 className="text-2xl font-bold text-white">MangaSync Solo - Dashboard</h1>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold">Your Projects</h2>
          <div className="flex gap-4">
            <Input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="New Project Name"
              className="w-64 bg-manga-dark border-manga-darker"
            />
            <Button onClick={createNewProject} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Project
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="bg-manga-dark border-manga-darker">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-400">
                  <p>Last modified: {new Date(project.lastModified).toLocaleString()}</p>
                  <p>Pages: {project.pageCount}</p>
                  <p>Panels: {project.panelCount}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => loadProject(project.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Open
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportProject(project.id)}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => deleteProject(project.id)}
                    className="text-red-500 hover:text-red-300"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
          
          {projects.length === 0 && (
            <div className="col-span-full flex justify-center py-10">
              <p className="text-gray-400">No projects yet. Create your first one!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
