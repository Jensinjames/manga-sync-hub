
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
    const { imageBase64, tone, format } = await req.json();
    
    if (!imageBase64) {
      throw new Error('Image data is required');
    }

    // Validate tone and format
    const allowedTones = ['anime drama', 'noir', 'shonen epic', 'comedic dub'];
    const allowedFormats = ['narrative prose', 'screenplay-style'];
    
    if (!allowedTones.includes(tone)) {
      throw new Error(`Invalid tone. Choose one of: ${allowedTones.join(', ')}`);
    }
    
    if (!allowedFormats.includes(format)) {
      throw new Error(`Invalid format. Choose one of: ${allowedFormats.join(', ')}`);
    }

    // Here we would call an AI API to generate narration
    // For now, we'll return mock data based on tone and format
    
    let narration = "";
    
    if (tone === 'anime drama') {
      narration = "The weight of destiny hangs in the balance as our protagonist stands at the threshold of their greatest challenge yet. Shadows dance across their determined face, eyes reflecting an unwavering resolve that belies the storm brewing within.";
    } else if (tone === 'noir') {
      narration = "Rain pelts the grimy window, casting jagged shadows across the detective's weathered face. Another dead end. Another night drowning sorrows in cheap whiskey while the city sleeps, oblivious to the darkness that festers in its forgotten corners.";
    } else if (tone === 'shonen epic') {
      narration = "IMPOSSIBLE! His power level is off the charts! With a mighty roar, the hero channels their ultimate technique, their aura exploding with blinding intensity! This is the moment everything has been leading to!";
    } else {
      narration = "Oh great, ANOTHER life-or-death situation. Just what I needed on a Monday! *awkward silence* Is it too late to call in sick to this whole 'saving the world' gig?";
    }
    
    if (format === 'screenplay-style') {
      narration = `NARRATOR (V.O.)\n${narration}`;
    }

    // Add artificial delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    return new Response(
      JSON.stringify({ success: true, narration }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error generating narration:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
