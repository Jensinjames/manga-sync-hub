
import { PipelinePanel } from '../../types';

// Helper for exponential backoff
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to update panel with processing status
export const updatePanelWithProcessingStatus = (
  panel: PipelinePanel,
  isProcessing: boolean,
  isError: boolean = false,
  status: 'processing' | 'error' | 'done' | 'idle' = 'processing',
  errorMessage?: string
): PipelinePanel => {
  return {
    ...panel,
    isProcessing,
    isError,
    status,
    errorMessage
  };
};
