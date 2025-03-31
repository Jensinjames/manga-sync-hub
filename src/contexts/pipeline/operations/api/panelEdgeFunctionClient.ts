
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { sleep } from '../utils/panelProcessingUtils';

// Maximum number of retries for edge function calls
const MAX_RETRIES = 3;

// Call the process-panel edge function with retry logic
export const callProcessPanelFunction = async (
  panelId: string, 
  imageUrl: string
): Promise<any> => {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Add attempt number to the request for logging/debugging
      const { data, error } = await supabase.functions.invoke('process-panel', {
        body: {
          panelId,
          imageUrl,
          attempt: attempt + 1
        }
      });
      
      if (error) throw error;
      if (!data || !data.result) throw new Error('Invalid response from edge function');
      
      return data;
    } catch (err) {
      console.error(`Attempt ${attempt + 1} failed:`, err);
      
      // Don't wait after the last attempt
      if (attempt < MAX_RETRIES - 1) {
        // Exponential backoff: 1s, 2s, 4s, etc.
        const backoffTime = Math.pow(2, attempt) * 1000;
        await sleep(backoffTime);
      } else {
        throw err; // Re-throw the last error after all retries fail
      }
    }
  }
  
  throw new Error('Failed after multiple attempts');
};

// Call the get-panel-metadata edge function with retry logic
export const getPanelMetadata = async (
  panelId: string
): Promise<any> => {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const { data, error } = await supabase.functions.invoke('get-panel-metadata', {
        body: {
          panelId
        }
      });
      
      if (error) throw error;
      if (!data) throw new Error('Invalid response from edge function');
      
      return data.data;
    } catch (err) {
      console.error(`Attempt ${attempt + 1} failed:`, err);
      
      // Don't wait after the last attempt
      if (attempt < MAX_RETRIES - 1) {
        // Exponential backoff: 1s, 2s, 4s, etc.
        const backoffTime = Math.pow(2, attempt) * 1000;
        await sleep(backoffTime);
      } else {
        throw err; // Re-throw the last error after all retries fail
      }
    }
  }
  
  throw new Error('Failed after multiple attempts');
};
