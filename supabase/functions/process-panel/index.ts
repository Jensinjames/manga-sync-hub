
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
    const { imageBase64, panelId } = await req.json();
    
    if (!imageBase64) {
      throw new Error('Image data is required');
    }

    if (!panelId) {
      throw new Error('Panel ID is required');
    }

    console.log(`Processing panel: ${panelId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // For now, we'll use mock analysis data
    // In production, this would call a vision AI model with the imageBase64 data
    const mockAnalysisResult = {
      content: "A character with determined expression facing an obstacle",
      scene_type: "Interior scene",
      character_count: 1,
      mood: "Serious",
      action_level: "Medium",
      details: {
        background: "Urban setting",
        lighting: "Dramatic shadows",
        perspective: "Low angle shot",
        composition: "Rule of thirds"
      }
    };
    
    // Store the full metadata in the panel_metadata table
    const { data, error } = await supabase
      .from('panel_metadata')
      .upsert({
        panel_id: panelId,
        metadata: mockAnalysisResult,
        content: mockAnalysisResult.content,
        scene_type: mockAnalysisResult.scene_type,
        character_count: mockAnalysisResult.character_count,
        mood: mockAnalysisResult.mood,
        action_level: mockAnalysisResult.action_level
      })
      .select();
    
    if (error) {
      console.error("Database error:", error);
      throw new Error(`Failed to store panel metadata: ${error.message}`);
    }
    
    console.log(`Successfully processed panel ${panelId}`);

    // Add artificial delay to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    return new Response(
      JSON.stringify({ 
        success: true, 
        result: mockAnalysisResult 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error processing panel:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
