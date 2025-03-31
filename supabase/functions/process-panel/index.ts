
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
    const hashImageUrl = (url: string) => {
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

    // Create a placeholder entry to show processing has started
    const processingMetadata = {
      imageHash,
      processing: true,
      started_at: new Date().toISOString(),
      content: "Processing image..."
    };
    
    // Start background processing
    const backgroundProcess = async () => {
      try {
        // Call the Manga109 YOLO detection endpoint
        const model = "v2023.12.07_n_yv11"; // Default model
        
        console.log(`Calling Manga109 YOLO API for panel ${panelId} with model ${model}`);
        
        try {
          // First API call to initiate the process
          console.log("Initiating API request with payload:", JSON.stringify({
            data: [
              { path: imageUrl },
              model,
              0,
              0,
              true
            ]
          }));
          
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

          if (!submitRes.ok) {
            const errorText = await submitRes.text();
            console.error(`API initialization failed with status ${submitRes.status}: ${errorText}`);
            throw new Error(`API returned ${submitRes.status}: ${errorText}`);
          }

          const submitText = await submitRes.text();
          let submitJson;
          let eventId;
          
          try {
            submitJson = JSON.parse(submitText);
            eventId = submitJson.event_id;
            
            if (!eventId) {
              throw new Error("No event ID in response");
            }
            
            console.log(`Successfully initiated processing with event ID: ${eventId}`);
          } catch (parseError) {
            console.error("Failed to parse initialization response:", parseError.message);
            console.log("Response text:", submitText);
            
            // Try to extract event_id from SSE format if present
            const eventIdMatch = submitText.match(/data: .*"event_id"\s*:\s*"([^"]+)"/);
            if (eventIdMatch && eventIdMatch[1]) {
              eventId = eventIdMatch[1];
              console.log(`Extracted event ID from SSE: ${eventId}`);
            } else {
              throw new Error("Failed to get event ID from response");
            }
          }

          // Polling for results
          let labels = [];
          const maxRetries = 20; // Increased retries
          let resultData = null;

          for (let i = 0; i < maxRetries; i++) {
            console.log(`Polling for results, attempt ${i + 1}/${maxRetries}`);
            
            try {
              const resultRes = await fetch(`https://jensin-manga109-yolo.hf.space/gradio_api/call/_gr_detect/${eventId}`);
              
              if (!resultRes.ok) {
                console.log(`Polling attempt ${i + 1} failed with status ${resultRes.status}`);
                await new Promise(r => setTimeout(r, 2000)); // Longer delay
                continue;
              }

              const responseText = await resultRes.text();
              console.log(`Response length: ${responseText.length} characters`);
              
              if (responseText.trim().length === 0) {
                console.log("Empty response, retrying...");
                await new Promise(r => setTimeout(r, 2000));
                continue;
              }
              
              // Check if the response is valid JSON
              try {
                resultData = JSON.parse(responseText);
                // Extract labels from the response
                labels = resultData.data?.[0]?.annotations ?? [];
                
                if (labels.length > 0) {
                  console.log(`Successfully retrieved ${labels.length} labels`);
                  break;
                } else {
                  console.log("No labels found in JSON response, will retry");
                }
              } catch (parseError) {
                console.log(`Failed to parse JSON: ${parseError.message}`);
                console.log(`Response sample: ${responseText.substring(0, 200)}`);
                
                // Handle server-sent events format
                if (responseText.includes('event:')) {
                  console.log('Response appears to be in server-sent events format, attempting to extract data');
                  try {
                    // Simple SSE parsing to extract the data field
                    const dataMatches = responseText.match(/data: (\{.*\})/gm);
                    if (dataMatches && dataMatches.length > 0) {
                      // Try to find a valid data match with annotations
                      for (const dataMatch of dataMatches) {
                        try {
                          const extractedData = dataMatch.replace('data: ', '');
                          const eventData = JSON.parse(extractedData);
                          if (eventData.data && eventData.data[0] && eventData.data[0].annotations) {
                            labels = eventData.data[0].annotations;
                            console.log(`Successfully extracted ${labels.length} labels from SSE format`);
                            break;
                          }
                        } catch (innerError) {
                          console.log(`Failed to parse individual SSE data entry: ${innerError.message}`);
                        }
                      }
                      
                      if (labels.length > 0) {
                        break;
                      }
                    } else {
                      console.log("No data matches found in SSE format");
                    }
                  } catch (sseError) {
                    console.log(`Failed to parse SSE data: ${sseError.message}`);
                  }
                } else if (responseText.includes('error') && responseText.includes('Processing')) {
                  console.log("Model is still processing, will retry");
                }
              }
              
              // Wait before retrying with increasing backoff
              if (i < maxRetries - 1) {
                const delay = Math.min(2000 * (i + 1), 10000); // Exponential backoff capped at 10 seconds
                console.log(`Waiting ${delay}ms before next retry`);
                await new Promise(r => setTimeout(r, delay));
              }
            } catch (fetchError) {
              console.error(`Network error during polling attempt ${i + 1}: ${fetchError.message}`);
              if (i < maxRetries - 1) {
                await new Promise(r => setTimeout(r, 3000));
              }
            }
          }
          
          if (!labels || labels.length === 0) {
            console.log("No labels found after multiple attempts");
            labels = [];
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
            processing: false
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
          return analysisResult;
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
                imageHash,
                processing: false
              },
              content: "Error processing image"
            });
            
          throw apiError;
        }
      } catch (bgError) {
        console.error("Background processing error:", bgError);
        return null;
      }
    };

    // Create the temporary entry and start background processing
    await supabase
      .from('panel_metadata')
      .upsert({
        panel_id: panelId,
        metadata: processingMetadata,
        content: "Processing image...",
        scene_type: "Processing",
        character_count: 0,
        mood: "Unknown",
        action_level: "Unknown"
      });
    
    // Start the background processing without waiting for it to complete
    if (EdgeRuntime && typeof EdgeRuntime.waitUntil === 'function') {
      EdgeRuntime.waitUntil(backgroundProcess());
      console.log(`Background processing started for panel ${panelId}`);
    } else {
      // Fallback if EdgeRuntime.waitUntil is not available
      backgroundProcess().catch(err => console.error("Background process error:", err));
      console.log(`Background processing started (fallback method) for panel ${panelId}`);
    }

    // Return immediately with a processing status
    return new Response(
      JSON.stringify({ 
        success: true, 
        result: processingMetadata,
        processing: true
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
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
