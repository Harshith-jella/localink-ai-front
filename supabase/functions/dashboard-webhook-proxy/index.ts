
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Dashboard webhook proxy called:', req.method)
    
    if (req.method === 'POST') {
      // This is incoming webhook data from n8n
      const webhookData = await req.json()
      console.log('Received webhook data:', webhookData)
      
      // Store the webhook data in a simple way that the frontend can access
      // For now, we'll just log it and return success
      // In a real implementation, you might want to store this in a database
      // or use Supabase Realtime to push it to connected clients
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Webhook data received',
          data: webhookData 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
    
    if (req.method === 'GET') {
      // This endpoint can be used by the frontend to check for new data
      // For now, return a simple response
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Dashboard webhook proxy is running' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    )

  } catch (error) {
    console.error('Error in dashboard webhook proxy:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
