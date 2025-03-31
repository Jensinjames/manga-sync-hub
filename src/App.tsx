
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { MobileProvider } from "@/contexts/MobileContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ExportView from "./pages/ExportView";
import NotFound from "./pages/NotFound";

const App = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ProjectProvider>
          <MobileProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/export" element={<ExportView />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </MobileProvider>
        </ProjectProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
