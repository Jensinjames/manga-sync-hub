
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
    const { imageUrl, panelId } = await req.json();
    
    if (!imageUrl) {
      throw new Error('Image URL is required');
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
    
    // Generate a simple hash of the image URL for caching
    const hashImageUrl = (url) => {
      let hash = 0;
      for (let i = 0; i < url.length; i++) {
        const char = url.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return hash.toString();
    };
    
    const imageHash = hashImageUrl(imageUrl);
    
    // Check if we already processed this image (using URL hash)
    const { data: existingData } = await supabase
      .from('panel_metadata')
      .select('metadata')
      .eq('panel_id', panelId)
      .maybeSingle();
    
    if (existingData?.metadata?.imageHash === imageHash && existingData?.metadata?.labels) {
      console.log(`Using cached results for panel ${panelId}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          result: existingData.metadata,
          cached: true 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Call the Manga109 YOLO detection endpoint
    const model = "v2023.12.07_n_yv11"; // Default model
    
    console.log(`Calling Manga109 YOLO API for panel ${panelId} with model ${model}`);
    
    try {
      // First API call to initiate the process
      const submitRes = await fetch("https://jensin-manga109-yolo.hf.space/gradio_api/call/_gr_detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            { path: imageUrl },
            model,
            0,
            0,
            true
          ]
        })
      });

      const submitJson = await submitRes.json();
      const eventId = submitJson.event_id;

      if (!eventId) {
        throw new Error("Failed to initiate processing - no event ID returned");
      }

      // Polling for results
      let labels = [];
      const maxRetries = 5;
      for (let i = 0; i < maxRetries; i++) {
        console.log(`Polling for results, attempt ${i + 1}/${maxRetries}`);
        const resultRes = await fetch(`https://jensin-manga109-yolo.hf.space/gradio_api/call/_gr_detect/${eventId}`);
        const resultData = await resultRes.json();
        
        // Extract labels from the response
        labels = resultData.data?.[0]?.annotations ?? [];

        if (labels.length > 0) break;
        
        // Wait before retrying
        if (i < maxRetries - 1) {
          await new Promise(r => setTimeout(r, 1000)); // wait 1s before retry
        }
      }
      
      // Normalize the label format and additional metadata
      const analysisResult = {
        imageHash,
        labels,
        content: "Panel content detected via Manga109 YOLO",
        scene_type: labels.some(l => l.label.includes("scene")) ? "Complex scene" : "Character focus",
        character_count: labels.filter(l => l.label.includes("face") || l.label.includes("person")).length,
        mood: "Neutral",
        action_level: labels.length > 5 ? "High" : "Medium",
        processed_at: new Date().toISOString(),
      };
      
      // Store the full metadata in the panel_metadata table
      const { data, error } = await supabase
        .from('panel_metadata')
        .upsert({
          panel_id: panelId,
          metadata: analysisResult,
          content: analysisResult.content,
          scene_type: analysisResult.scene_type,
          character_count: analysisResult.character_count,
          mood: analysisResult.mood,
          action_level: analysisResult.action_level
        })
        .select();
      
      if (error) {
        console.error("Database error:", error);
        throw new Error(`Failed to store panel metadata: ${error.message}`);
      }
      
      console.log(`Successfully processed panel ${panelId} with ${labels.length} labels`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          result: analysisResult 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (apiError) {
      console.error("API processing error:", apiError);
      
      // Log the error in the database for tracking
      await supabase
        .from('panel_metadata')
        .upsert({
          panel_id: panelId,
          metadata: { 
            error: apiError.message, 
            error_timestamp: new Date().toISOString(),
            imageHash
          },
          content: "Error processing image"
        });
        
      throw apiError;
    }
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
