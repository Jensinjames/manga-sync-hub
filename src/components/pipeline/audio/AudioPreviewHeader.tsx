
import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { VoiceType } from '@/contexts/pipeline/types';

interface AudioPreviewHeaderProps {
  voiceType: VoiceType;
  setVoiceType: (value: VoiceType) => void;
  handleGenerateAll: () => void;
  selectedPanels: any[];
}

export const AudioPreviewHeader: React.FC<AudioPreviewHeaderProps> = ({
  voiceType,
  setVoiceType,
  handleGenerateAll,
  selectedPanels
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-1">Audio Preview</h2>
        <p className="text-gray-400">Convert narration to spoken audio</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="space-y-1">
          <Label htmlFor="voice" className="text-xs">Voice Type</Label>
          <Select value={voiceType} onValueChange={(value: any) => setVoiceType(value)}>
            <SelectTrigger id="voice" className="w-[140px]">
              <SelectValue placeholder="Voice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleGenerateAll} 
          className="bg-manga-primary hover:bg-manga-primary/80 text-white flex items-center gap-2 self-end"
          disabled={selectedPanels.length === 0}
        >
          <Volume2 size={18} /> Generate All Audio
        </Button>
      </div>
    </div>
  );
};
