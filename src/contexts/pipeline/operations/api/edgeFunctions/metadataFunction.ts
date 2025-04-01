
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { sleep } from '../../utils/panelProcessingUtils';

// Maximum number of retries for edge function calls
const MAX_RETRIES = 3;

// Call the get-panel-metadata edge function with retry logic
export const getPanelMetadata = async (
  panelId: string
): Promise<any> => {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(`Fetching metadata for panel ${panelId}, attempt ${attempt + 1}`);
      const { data, error } = await supabase.functions.invoke('get-panel-metadata', {
        body: {
          panelId
        }
      });
      
      if (error) {
        console.error(`Error fetching metadata: ${error.message}`);
        throw error;
      }
      
      if (!data) {
        console.error('No data returned from edge function');
        throw new Error('Invalid response from edge function');
      }
      
      console.log('Metadata fetch successful:', data);
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
