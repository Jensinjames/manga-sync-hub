import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProject } from '@/contexts/ProjectContext';
import { Upload, Eye, Download, RotateCcw, Save, FileText, Bug } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { isDebugMode, toggleDebugMode } from '@/utils/debugUtils';
export const Header = () => {
  const {
    project,
    setProject,
    importProject,
    exportProject,
    exportToPDF,
    resetProject,
    autoSave
  } = useProject();
  const [projectName, setProjectName] = useState(project.name);
  const [debugMode, setDebugMode] = useState(isDebugMode());
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
      toast.error("Import failed", {
        description: "Could not import the project file."
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
  const handleExportPDF = () => {
    exportToPDF();
  };
  const handleToggleDebugMode = () => {
    const newMode = toggleDebugMode();
    setDebugMode(newMode);
    toast.info(`Debug mode ${newMode ? 'enabled' : 'disabled'}`);
  };
  return <header className="bg-manga-dark border-b border-manga-darker flex justify-between items-center px-0 rounded mx-px py-0 my-0">
      <div className="flex items-center gap-3 rounded py-0 my-[18px] px-[2px] mx-0">
        <h1 className="text-2xl font-bold text-blue-500 mx-0 py-0 px-0 my-0">MangaSync Solo</h1>
        <Input value={projectName} onChange={handleNameChange} onBlur={handleNameBlur} onKeyDown={handleKeyDown} className="max-w-[240px] bg-manga-darker text-white border-manga-darker focus:border-manga-primary" />
      </div>
      <div className="flex gap-3 px-0 bg-indigo-200 py-[6px] my-[7px] mx-px rounded-sm">
        <input type="file" ref={fileInputRef} onChange={handleImportChange} accept=".json" className="hidden" />
        <Button variant="outline" onClick={handleManualSave} className="bg-slate-950 hover:bg-slate-800 text-sm rounded-sm px-[7px] py-px mx-[6px] text-center font-thin my-0">
          <Save className="mr-2 h-4 w-4" /> Save
        </Button>
        <Button variant="outline" onClick={handleImportClick} className="text-slate-950">
          <Upload className="mr-2 h-4 w-4" /> Import
        </Button>
        <Link to="/export">
          <Button variant="outline" className="text-slate-950">
            <Eye className="mr-2 h-4 w-4" /> Preview
          </Button>
        </Link>
        <Button variant="outline" onClick={exportProject} className="text-slate-950">
          <Download className="mr-2 h-4 w-4" /> Export JSON
        </Button>
        <Button variant="outline" onClick={handleExportPDF} className="font-normal text-slate-950">
          <FileText className="mr-2 h-4 w-4" /> Export PDF
        </Button>
        <Button variant="outline" onClick={resetProject} className="text-zinc-950">
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
        <Button variant={debugMode ? "default" : "outline"} onClick={handleToggleDebugMode} className={`${debugMode ? "bg-amber-600 text-white" : "text-slate-950"}`}>
          <Bug className="mr-2 h-4 w-4" /> Debug
        </Button>
      </div>
    </header>;
};