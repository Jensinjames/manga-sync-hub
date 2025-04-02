
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { panelId } = await req.json();
    
    if (!panelId) {
      throw new Error('Panel ID is required');
    }

    console.log(`Fetching metadata for panel: ${panelId}`);

    // Initialize Supabase client with proper credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Create Supabase client with explicit schema setting
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch both panel metadata and the latest job status
    const [metadataResult, jobsResult] = await Promise.all([
      // Get panel metadata
      supabase
        .from('panel_metadata')
        .select('*')
        .eq('panel_id', panelId)
        .maybeSingle(),
      
      // Get latest job for this panel
      supabase
        .from('panel_jobs')
        .select('*')
        .eq('panel_id', panelId)
        .order('started_at', { ascending: false })
        .limit(1)
    ]);
    
    if (metadataResult.error) {
      console.error("Database error (metadata):", metadataResult.error);
      throw metadataResult.error;
    }
    
    if (jobsResult.error) {
      console.error("Database error (jobs):", jobsResult.error);
      throw jobsResult.error;
    }
    
    // Combine the data
    const responseData = {
      metadata: metadataResult.data,
      latestJob: jobsResult.data && jobsResult.data.length > 0 ? jobsResult.data[0] : null
    };
    
    console.log("Successfully retrieved panel metadata");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: responseData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error fetching panel metadata:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        // Include more detailed error information for debugging
        errorDetails: typeof error === 'object' ? JSON.stringify(error) : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
