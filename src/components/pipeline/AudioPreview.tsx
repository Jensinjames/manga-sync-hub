
import React from 'react';
import { AudioPreviewHeader } from './audio/AudioPreviewHeader';
import { AudioTimeline } from './audio/AudioTimeline';
import { AudioDetail } from './audio/AudioDetail';
import { useAudioPreview } from './audio/useAudioPreview';

export const AudioPreview: React.FC = () => {
  const {
    selectedPanels,
    activePanel,
    voiceType,
    setVoiceType,
    playing,
    handleGenerateAll,
    handleGenerateForPanel,
    handlePanelClick,
    togglePlayAudio
  } = useAudioPreview();

  return (
    <div className="space-y-6">
      <AudioPreviewHeader 
        voiceType={voiceType}
        setVoiceType={setVoiceType}
        handleGenerateAll={handleGenerateAll}
        selectedPanels={selectedPanels}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-medium text-white mb-4">Audio Timeline</h3>
          
          <AudioTimeline 
            selectedPanels={selectedPanels}
            playing={playing}
            activePanel={activePanel}
            onPanelClick={handlePanelClick}
            onGenerateForPanel={handleGenerateForPanel}
            onPlayAudio={togglePlayAudio}
          />
        </div>
        
        <div className="space-y-4">
          <AudioDetail 
            activePanel={activePanel}
            playing={playing}
            onGenerateForPanel={handleGenerateForPanel}
            onPlayAudio={togglePlayAudio}
          />
        </div>
      </div>
    </div>
  );
};
