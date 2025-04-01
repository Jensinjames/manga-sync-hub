
import { PipelinePanel } from '../types';
import { toast } from 'sonner';
import { processClientSide } from './panel/clientSideProcessing';
import { processServerSide } from './panel/serverSideProcessing';

// Number of times to retry client-side processing before falling back to edge function
const MAX_CLIENT_RETRIES = 2;

// Process the panel image either client-side or server-side (via edge function)
export const processPanel = async (
  panel: PipelinePanel,
  options: {
    preferClientSide?: boolean;
    onSuccess?: (panel: PipelinePanel) => void;
    onError?: (error: any) => void;
    onProgress?: (status: string) => void;
  } = {}
): Promise<PipelinePanel> => {
  const { preferClientSide = true, onSuccess, onError, onProgress } = options;

  try {
    onProgress?.('Starting panel processing...');
    
    // Always try client-side processing first if preferred
    if (preferClientSide) {
      try {
        return await processClientSide(panel, { onProgress, onSuccess });
      } catch (clientError) {
        console.error('Client-side processing failed, falling back to edge function:', clientError);
        onProgress?.('Falling back to server-side processing...');
        // Fall through to edge function processing
      }
    }
    
    // Process via edge function as fallback or if client-side not preferred
    const updatedPanel = await processServerSide(panel, { onProgress, onSuccess });
    return updatedPanel;
  } catch (error) {
    console.error('Panel processing failed:', error);
    onError?.(error);
    toast.error('Failed to process panel');
    throw error;
  }
};
