
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploader } from './ImageUploader';
import { ImageProcessor } from './ImageProcessor';
import { NarrationEditor } from './NarrationEditor';
import { AudioPreview } from './AudioPreview';
import { ExportOptions } from './ExportOptions';
import { Card } from '@/components/ui/card';
import { useProject } from '@/contexts/ProjectContext';

export const AIContentPipeline = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Manga AI Transformation Pipeline</h1>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="upload">1. Upload</TabsTrigger>
          <TabsTrigger value="process">2. Process</TabsTrigger>
          <TabsTrigger value="narrate">3. Narrate</TabsTrigger>
          <TabsTrigger value="audio">4. Audio</TabsTrigger>
          <TabsTrigger value="export">5. Export</TabsTrigger>
        </TabsList>
        
        <Card className="border-manga-darker bg-manga-dark p-6">
          <TabsContent value="upload" className="space-y-4">
            <ImageUploader />
          </TabsContent>
          
          <TabsContent value="process" className="space-y-4">
            <ImageProcessor />
          </TabsContent>
          
          <TabsContent value="narrate" className="space-y-4">
            <NarrationEditor />
          </TabsContent>
          
          <TabsContent value="audio" className="space-y-4">
            <AudioPreview />
          </TabsContent>
          
          <TabsContent value="export" className="space-y-4">
            <ExportOptions />
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
};
