
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      throw new Error('Image data is required');
    }

    // Here we would call a vision API to analyze the image
    // For now, we'll return mock data
    
    const mockAnalysisResult = {
      content: "A manga panel showing a character looking determined",
      scene: "Interior scene",
      characters: 1,
      mood: "Serious",
      actionLevel: "Medium"
    };

    // Add artificial delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    return new Response(
      JSON.stringify({ success: true, result: mockAnalysisResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
