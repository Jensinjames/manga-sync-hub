
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProject } from '@/contexts/ProjectContext';
import { 
  Upload, 
  Eye, 
  Download, 
  RotateCcw, 
  Save, 
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

export const Header = () => {
  const { project, setProject, importProject, exportProject, exportToPDF, resetProject, autoSave } = useProject();
  const [projectName, setProjectName] = useState(project.name);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importProject(file);
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Could not import the project file.",
        variant: "destructive",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
  };

  const handleNameBlur = () => {
    if (projectName !== project.name) {
      setProject({
        ...project,
        name: projectName
      });
      toast.success('Project name updated');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleManualSave = () => {
    autoSave();
  };

  return (
    <header className="bg-manga-dark border-b border-manga-darker px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-white">MangaSync Solo</h1>
        <Input
          value={projectName}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          onKeyDown={handleKeyDown}
          className="max-w-[240px] bg-manga-darker text-white border-manga-darker focus:border-manga-primary"
        />
      </div>
      <div className="flex gap-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportChange}
          accept=".json"
          className="hidden"
        />
        <Button variant="outline" onClick={handleManualSave}>
          <Save className="mr-2 h-4 w-4" /> Save
        </Button>
        <Button variant="outline" onClick={handleImportClick}>
          <Upload className="mr-2 h-4 w-4" /> Import
        </Button>
        <Button variant="outline">
          <Eye className="mr-2 h-4 w-4" /> Preview
        </Button>
        <Button variant="outline" onClick={exportProject}>
          <Download className="mr-2 h-4 w-4" /> Export JSON
        </Button>
        <Button variant="outline" onClick={exportToPDF}>
          <FileText className="mr-2 h-4 w-4" /> Export PDF
        </Button>
        <Button variant="outline" onClick={resetProject}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>
    </header>
  );
};
