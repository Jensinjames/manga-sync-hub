
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Create Supabase client with explicit schema selection
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Explicitly query the public schema for the panel_metadata table
    const { data, error } = await supabase
      .from('panel_metadata')
      .select('*')  // Select all fields to ensure we get everything we need
      .eq('panel_id', panelId)
      .maybeSingle();
      
    if (error) {
      console.error("Database error:", error);
      throw error;
    }
    
    console.log("Successfully retrieved panel metadata");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error fetching panel metadata:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
