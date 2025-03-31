
import React from 'react';
import { Header } from '@/components/Header';
import { AIContentPipeline } from '@/components/pipeline/AIContentPipeline';
import { PipelineProvider } from '@/contexts/PipelineContext';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-manga-darker text-white">
      <Header />
      <main className="flex-1 p-4">
        <PipelineProvider>
          <AIContentPipeline />
        </PipelineProvider>
      </main>
    </div>
  );
};

export default Index;
