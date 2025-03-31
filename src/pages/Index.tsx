
import React, { lazy, Suspense } from 'react';
import { Header } from '@/components/Header';
import { PipelineProvider } from '@/contexts/PipelineContext';

// Use lazy loading for the AIContentPipeline component
const AIContentPipeline = lazy(() => import('@/components/pipeline/AIContentPipeline').then(
  module => ({ default: module.AIContentPipeline })
));

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-manga-darker text-white">
      <Header />
      <main className="flex-1 p-4">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-manga-primary"></div>
          </div>
        }>
          <PipelineProvider>
            <AIContentPipeline />
          </PipelineProvider>
        </Suspense>
      </main>
    </div>
  );
};

export default Index;
