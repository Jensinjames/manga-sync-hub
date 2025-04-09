
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { sleep } from '../../utils/panelProcessingUtils';
import { MAX_RETRIES } from '../constants';

/**
 * Call the get-panel-metadata edge function with improved retry logic and error handling
 */
export const getPanelMetadata = async (
  panelId: string
): Promise<any> => {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(`Fetching metadata for panel ${panelId}, attempt ${attempt + 1}`);
      
      // Add timeout to the request
      const timeoutMs = 15000;
      const timeout = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
      );
      
      // Call the edge function with explicit timeout
      const functionPromise = supabase.functions.invoke('get-panel-metadata', {
        body: { panelId }
      });
      
      // Use Promise.race to implement timeout
      const response = await Promise.race([functionPromise, timeout]);
      
      // Type assertion to ensure TypeScript knows response has data and error properties
      const typedResponse = response as { data: any, error: any };
      
      if (typedResponse.error) {
        console.error(`Error fetching metadata: ${typedResponse.error.message || JSON.stringify(typedResponse.error)}`);
        throw typedResponse.error;
      }
      
      if (!typedResponse.data) {
        console.error('No data returned from edge function');
        throw new Error('Invalid response from edge function');
      }
      
      console.log('Metadata fetch successful:', typedResponse.data);
      return typedResponse.data;
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
