
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { sleep } from '../../utils/panelProcessingUtils';
import { MAX_RETRIES } from '../constants';

/**
 * Call the get-panel-metadata edge function with retry logic
 */
export const getPanelMetadata = async (
  panelId: string
): Promise<any> => {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(`Fetching metadata for panel ${panelId}, attempt ${attempt + 1}`);
      
      // Add timeout to the request
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      // Call the edge function
      const functionPromise = supabase.functions.invoke('get-panel-metadata', {
        body: {
          panelId
        }
      });
      
      // Use Promise.race to implement timeout
      const { data, error } = await Promise.race([functionPromise, timeout]) as any;
      
      if (error) {
        console.error(`Error fetching metadata: ${error.message || error}`);
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
        // On last attempt failure, return empty data structure instead of throwing
        // This helps the application continue working even when backend services fail
        console.warn(`Failed to fetch metadata after ${MAX_RETRIES} attempts, returning empty data`);
        return {
          success: false,
          data: {
            metadata: null,
            latestJob: null
          },
          error: err instanceof Error ? err.message : 'Failed after multiple attempts'
        };
      }
    }
  }
  
  return {
    success: false,
    data: {
      metadata: null,
      latestJob: null
    },
    error: 'Failed after multiple attempts'
  };
};
