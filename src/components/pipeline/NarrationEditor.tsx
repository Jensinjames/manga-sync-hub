
import React from 'react';
import { toast } from 'sonner';
import { Speech } from 'lucide-react';
import { usePipeline } from '@/contexts/PipelineContext';
import { NarrationControls } from './narration/NarrationControls';
import { PanelsList } from './narration/PanelsList';
import { PanelEditor } from './narration/PanelEditor';

export const NarrationEditor: React.FC = () => {
  const { 
    selectedPanels, 
    activePanel,
    setActivePanel, 
    narrationTone,
    setNarrationTone,
    narrationFormat,
    setNarrationFormat,
    generateNarration,
    updatePanelNarration
  } = usePipeline();

  const handleGenerateAll = async () => {
    if (selectedPanels.length === 0) {
      toast.error("No panels to generate narration for");
      return;
    }

    for (const panel of selectedPanels) {
      await generateNarration(panel.id);
    }
    
    toast.success("All narrations generated");
  };

  const handleGenerateForPanel = async (panelId: string) => {
    await generateNarration(panelId);
    toast.success("Narration generated");
  };

  const handlePanelClick = (panel: any) => {
    setActivePanel(panel);
  };

  const handleNarrationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activePanel) {
      updatePanelNarration(activePanel.id, e.target.value);
    }
  };

  return (
    <div className="space-y-6">
      <NarrationControls
        narrationTone={narrationTone}
        setNarrationTone={setNarrationTone}
        narrationFormat={narrationFormat}
        setNarrationFormat={setNarrationFormat}
        selectedPanels={selectedPanels}
        handleGenerateAll={handleGenerateAll}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Panels</h3>
          <PanelsList 
            selectedPanels={selectedPanels}
            activePanel={activePanel}
            onPanelClick={handlePanelClick}
            onGenerateForPanel={handleGenerateForPanel}
          />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Speech size={18} /> Narration Editor
          </h3>
          <PanelEditor 
            activePanel={activePanel}
            onNarrationChange={handleNarrationChange}
            onGenerateForPanel={handleGenerateForPanel}
          />
        </div>
      </div>
    </div>
  );
};
