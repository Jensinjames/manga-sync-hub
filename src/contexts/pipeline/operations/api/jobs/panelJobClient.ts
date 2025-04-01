
import { supabase } from '@/integrations/supabase/client';

// Create a new job in the database
export const createPanelJob = async (
  panelId: string,
  jobType: string,
  metadata: any = {}
): Promise<string | null> => {
  try {
    // Use type assertion with 'any' to bypass TypeScript's type checking for tables
    // that aren't in the generated types yet
    const { data, error } = await (supabase as any)
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
    
    // Use type assertion with 'any' to bypass TypeScript's type checking
    const { error } = await (supabase as any)
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

// Get jobs for a specific panel
export const getPanelJobs = async (panelId: string): Promise<any[]> => {
  try {
    // Use type assertion with 'any' to bypass TypeScript's type checking
    const { data, error } = await (supabase as any)
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
