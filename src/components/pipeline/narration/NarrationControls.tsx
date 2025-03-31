
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Sparkles } from 'lucide-react';
import { NarrationType, NarrationFormat } from '@/contexts/pipeline/types';
import { toast } from 'sonner';

interface NarrationControlsProps {
  narrationTone: NarrationType;
  setNarrationTone: (value: NarrationType) => void;
  narrationFormat: NarrationFormat;
  setNarrationFormat: (value: NarrationFormat) => void;
  selectedPanels: any[];
  handleGenerateAll: () => Promise<void>;
}

export const NarrationControls: React.FC<NarrationControlsProps> = ({
  narrationTone,
  setNarrationTone,
  narrationFormat,
  setNarrationFormat,
  selectedPanels,
  handleGenerateAll
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-1">Narration Editor</h2>
        <p className="text-gray-400">Generate and edit AI narration for each panel</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="space-y-1">
          <Label htmlFor="tone" className="text-xs">Narration Tone</Label>
          <Select value={narrationTone} onValueChange={(value: any) => setNarrationTone(value)}>
            <SelectTrigger id="tone" className="w-[140px]">
              <SelectValue placeholder="Tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anime drama">Anime Drama</SelectItem>
              <SelectItem value="noir">Noir</SelectItem>
              <SelectItem value="shonen epic">Shonen Epic</SelectItem>
              <SelectItem value="comedic dub">Comedic Dub</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="format" className="text-xs">Format</Label>
          <Select value={narrationFormat} onValueChange={(value: any) => setNarrationFormat(value)}>
            <SelectTrigger id="format" className="w-[160px]">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="narrative prose">Narrative Prose</SelectItem>
              <SelectItem value="screenplay-style">Screenplay Style</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleGenerateAll} 
          className="bg-manga-primary hover:bg-manga-primary/80 text-white flex items-center gap-2 self-end"
          disabled={selectedPanels.length === 0}
        >
          <Sparkles size={18} /> Generate All
        </Button>
      </div>
    </div>
  );
};
