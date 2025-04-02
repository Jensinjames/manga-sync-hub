
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
    
    // Check for broken panel data
    if (!panel || !panel.imageUrl) {
      throw new Error('Invalid panel data - missing image URL');
    }

    // For panels that have been explicitly marked for client-side processing
    if (panel.forceClientProcessing) {
      onProgress?.('Processing with client-side ML (forced)...');
      try {
        return await processClientSide(panel, { onProgress, onSuccess });
      } catch (clientError) {
        console.error('Forced client-side processing failed:', clientError);
        throw clientError; // Let the error bubble up as this was an explicit request
      }
    }
    
    // Always try client-side processing first if preferred
    if (preferClientSide) {
      try {
        console.log('Attempting client-side processing');
        onProgress?.('Processing with client-side ML...');
        return await processClientSide(panel, { onProgress, onSuccess });
      } catch (clientError) {
        console.error('Client-side processing failed, falling back to edge function:', clientError);
        onProgress?.('Falling back to server-side processing...');
        // Fall through to edge function processing
      }
    }
    
    // Process via edge function as fallback or if client-side not preferred
    console.log('Attempting server-side processing');
    onProgress?.('Processing with server-side ML...');
    try {
      const updatedPanel = await processServerSide(panel, { onProgress, onSuccess });
      return updatedPanel;
    } catch (serverError) {
      console.error('Server-side processing failed, trying client again:', serverError);
      
      // If server-side also fails, try client-side one more time
      onProgress?.('Server processing failed, trying client-side again...');
      try {
        return await processClientSide(panel, { onProgress, onSuccess });
      } catch (finalError) {
        console.error('All processing attempts failed:', finalError);
        throw finalError;
      }
    }
  } catch (error) {
    console.error('Panel processing failed:', error);
    onError?.(error);
    toast.error('Failed to process panel');
    throw error;
  }
};
