
import React from 'react';
import { Button } from '@/components/ui/button';
import { useProject } from '@/contexts/ProjectContext';
import { Upload, Eye, Download, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Header = () => {
  const { project, importProject, exportProject } = useProject();
  const { toast } = useToast();
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

  return (
    <header className="bg-manga-dark border-b border-manga-darker px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-white">MangaSync 2.0</h1>
      <div className="flex gap-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportChange}
          accept=".json"
          className="hidden"
        />
        <Button variant="outline" onClick={handleImportClick}>
          <Upload className="mr-2 h-4 w-4" /> Import
        </Button>
        <Button variant="outline">
          <Eye className="mr-2 h-4 w-4" /> Preview
        </Button>
        <Button variant="outline" onClick={exportProject}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
        <Button variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>
    </header>
  );
};
