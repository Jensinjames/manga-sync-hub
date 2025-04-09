
// src/pages/Index.tsx
import React from "react";
import { Header } from "@/components/Header";
import { AIContentPipeline } from "@/components/pipeline/AIContentPipeline";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-manga-darker text-white">
      <Header />
      <main className="flex-1 p-4">
        <AIContentPipeline />
      </main>
    </div>
  );
};

export default Index;
