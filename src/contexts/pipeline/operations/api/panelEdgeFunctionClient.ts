
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { sleep } from '../utils/panelProcessingUtils';

// Maximum number of retries for edge function calls
const MAX_RETRIES = 3;

// Create a new job in the database
export const createPanelJob = async (
  panelId: string,
  jobType: string,
  metadata: any = {}
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('panel_jobs')
      .insert({
        panel_id: panelId,
        job_type: jobType,
        status: 'queued',
        metadata
      })
      .select('id')
      .single();
    
    if (error) {
      console.error(`Failed to create ${jobType} job:`, error);
      return null;
    }
    
    return data.id;
  } catch (err) {
    console.error(`Error creating ${jobType} job:`, err);
    return null;
  }
};

// Update a job's status
export const updatePanelJob = async (
  jobId: string,
  status: 'processing' | 'done' | 'error',
  details: any = {}
): Promise<boolean> => {
  try {
    const updateData: any = {
      status,
      ...details
    };
    
    // Add completed_at timestamp if the job is done or errored
    if (status === 'done' || status === 'error') {
      updateData.completed_at = new Date().toISOString();
    }
    
    // Add error message if provided
    if (status === 'error' && details.error_message) {
      updateData.error_message = details.error_message;
    }
    
    const { error } = await supabase
      .from('panel_jobs')
      .update(updateData)
      .eq('id', jobId);
    
    if (error) {
      console.error(`Failed to update job ${jobId}:`, error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error(`Error updating job ${jobId}:`, err);
    return false;
  }
};

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

// Get jobs for a specific panel
export const getPanelJobs = async (panelId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('panel_jobs')
      .select('*')
      .eq('panel_id', panelId)
      .order('started_at', { ascending: false });
    
    if (error) {
      console.error(`Failed to get jobs for panel ${panelId}:`, error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error(`Error getting jobs for panel ${panelId}:`, err);
    return [];
  }
};
