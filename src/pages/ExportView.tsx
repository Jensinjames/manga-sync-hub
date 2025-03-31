
import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, FileText, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const ExportView = () => {
  const { project, exportProject, exportToPDF } = useProject();
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeThumbnails, setIncludeThumbnails] = useState(true);
  
  // Calculate project statistics
  const totalPages = project.pages.length;
  const totalPanels = project.pages.reduce((sum, page) => sum + page.panels.length, 0);
  const panelsWithNotes = project.pages.reduce(
    (sum, page) => sum + page.panels.filter(panel => 
      panel.notes.camera || panel.notes.fx || panel.notes.audio
    ).length, 
    0
  );

  // Handle exporting with options (for future implementation)
  const handleExportJSON = () => {
    exportProject();
    toast.success('Project exported as JSON');
  };

  const handleExportPDF = async () => {
    await exportToPDF();
    toast.success('Project exported as PDF');
  };

  return (
    <div className="min-h-screen bg-manga-darker text-white">
      <header className="bg-manga-dark border-b border-manga-darker px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">MangaSync Solo - Export</h1>
        <Link to="/">
          <Button variant="outline" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to Workspace
          </Button>
        </Link>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-6">Export Options</h2>
            
            <Card className="bg-manga-dark border-manga-darker mb-6">
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><span className="text-gray-400">Name:</span> {project.name}</p>
                  <p><span className="text-gray-400">Pages:</span> {totalPages}</p>
                  <p><span className="text-gray-400">Panels:</span> {totalPanels}</p>
                  <p><span className="text-gray-400">Panels with notes:</span> {panelsWithNotes}</p>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-manga-dark border-manga-darker">
                <CardHeader>
                  <CardTitle>JSON Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-gray-400">
                    Export your project as a JSON file that can be imported back into MangaSync Solo.
                    Includes all pages, panels, and notes.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="includeAllDataJson" checked disabled />
                      <Label htmlFor="includeAllDataJson">Include all project data</Label>
                    </div>
                  </div>
                  
                  <Button onClick={handleExportJSON} className="w-full flex items-center justify-center gap-2">
                    <Download className="h-4 w-4" />
                    Export as JSON
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-manga-dark border-manga-darker">
                <CardHeader>
                  <CardTitle>PDF Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-gray-400">
                    Export your storyboard as a PDF document with timeline, panels and notes.
                    Great for sharing with team members who don't have access to MangaSync.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="includeNotes" 
                        checked={includeNotes} 
                        onCheckedChange={(checked) => setIncludeNotes(checked as boolean)}
                      />
                      <Label htmlFor="includeNotes">Include panel notes</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="includeThumbnails" 
                        checked={includeThumbnails} 
                        onCheckedChange={(checked) => setIncludeThumbnails(checked as boolean)}
                      />
                      <Label htmlFor="includeThumbnails">Include panel thumbnails</Label>
                    </div>
                  </div>
                  
                  <Button onClick={handleExportPDF} className="w-full flex items-center justify-center gap-2">
                    <FileText className="h-4 w-4" />
                    Export as PDF
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-6">Export Preview</h2>
            <Card className="bg-manga-dark border-manga-darker h-[500px] flex items-center justify-center">
              <div className="text-center p-4">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">Preview will be generated when you select an export format</p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExportView;
