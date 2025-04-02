
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { sleep } from '../../utils/panelProcessingUtils';
import { createPanelJob, updatePanelJob } from '../jobs/panelJobClient';
import { MAX_RETRIES, REQUEST_TIMEOUT } from '../constants';

// Call the process-panel edge function with retry logic
export const callProcessPanelFunction = async (
  panelId: string, 
  imageUrl: string
): Promise<any> => {
  // Create a job record first
  let jobId;
  try {
    jobId = await createPanelJob(panelId, 'process-panel', { imageUrl });
  } catch (jobError) {
    console.error('Failed to create panel job:', jobError);
    // Continue without job tracking if it fails
  }
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Update job status to processing
      if (jobId) {
        try {
          await updatePanelJob(jobId, 'processing', { attempt_count: attempt + 1 });
        } catch (updateError) {
          console.error('Failed to update job status:', updateError);
          // Continue despite update error
        }
      }
      
      // Add timeout to the request
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT)
      );
      
      // Call the edge function with the request
      const functionPromise = supabase.functions.invoke('process-panel', {
        body: {
          panelId,
          imageUrl,
          attempt: attempt + 1,
          jobId
        }
      });
      
      // Use Promise.race to implement timeout
      const { data, error } = await Promise.race([functionPromise, timeout]) as any;
      
      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      if (!data || !data.result) {
        console.error('Invalid response from edge function:', data);
        throw new Error('Invalid response from edge function');
      }
      
      // Update job status to done
      if (jobId) {
        try {
          await updatePanelJob(jobId, 'done', { metadata: data.result });
        } catch (updateError) {
          console.error('Failed to update job status to done:', updateError);
          // Continue despite update error
        }
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
          try {
            await updatePanelJob(jobId, 'error', { 
              error_message: err instanceof Error ? err.message : 'Unknown error' 
            });
          } catch (updateError) {
            console.error('Failed to update job status to error:', updateError);
            // Continue despite update error
          }
        }
        
        throw err; // Re-throw the last error after all retries fail
      }
    }
  }
  
  throw new Error('Failed after multiple attempts');
};
