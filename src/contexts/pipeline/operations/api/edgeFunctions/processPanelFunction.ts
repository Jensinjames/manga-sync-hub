
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { sleep } from '../../utils/panelProcessingUtils';
import { createPanelJob, updatePanelJob } from '../jobs/panelJobClient';

// Maximum number of retries for edge function calls
const MAX_RETRIES = 3;

// Call the process-panel edge function with retry logic
export const callProcessPanelFunction = async (
  panelId: string, 
  imageUrl: string
): Promise<any> => {
  // Create a job record first
  const jobId = await createPanelJob(panelId, 'process-panel', { imageUrl });
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Update job status to processing
      if (jobId) {
        await updatePanelJob(jobId, 'processing', { attempt_count: attempt + 1 });
      }
      
      // Add attempt number to the request for logging/debugging
      const { data, error } = await supabase.functions.invoke('process-panel', {
        body: {
          panelId,
          imageUrl,
          attempt: attempt + 1,
          jobId
        }
      });
      
      if (error) throw error;
      if (!data || !data.result) throw new Error('Invalid response from edge function');
      
      // Update job status to done
      if (jobId) {
        await updatePanelJob(jobId, 'done', { metadata: data.result });
      }
      
      return data;
    } catch (err) {
      console.error(`Attempt ${attempt + 1} failed:`, err);
      
      // Don't wait after the last attempt
      if (attempt < MAX_RETRIES - 1) {
        // Exponential backoff: 1s, 2s, 4s, etc.
        const backoffTime = Math.pow(2, attempt) * 1000;
        await sleep(backoffTime);
      } else {
        // Update job status to error
        if (jobId) {
          await updatePanelJob(jobId, 'error', { 
            error_message: err instanceof Error ? err.message : 'Unknown error' 
          });
        }
        throw err; // Re-throw the last error after all retries fail
      }
    }
  }
  
  throw new Error('Failed after multiple attempts');
};
