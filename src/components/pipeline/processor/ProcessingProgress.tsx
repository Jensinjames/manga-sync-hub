
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProcessingProgressProps {
  progress: number;
  isProcessing: boolean;
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({ 
  progress, 
  isProcessing 
}) => {
  if (!isProcessing) return null;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Processing images...</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};
