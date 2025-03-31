
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
    const { text, voice } = await req.json();
    
    if (!text) {
      throw new Error('Text content is required');
    }

    // Validate voice type
    const allowedVoices = ['male', 'female', 'neutral'];
    const voiceType = voice || 'neutral';
    
    if (!allowedVoices.includes(voiceType)) {
      throw new Error(`Invalid voice type. Choose one of: ${allowedVoices.join(', ')}`);
    }

    // Here we would call a TTS API to generate audio
    // For now, we'll return a mock audio URL
    
    // Add artificial delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, we would generate and store the audio file
    // and return a URL to it
    const mockAudioUrl = "https://example.com/audio.mp3";

    return new Response(
      JSON.stringify({ success: true, audioUrl: mockAudioUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error generating speech:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
