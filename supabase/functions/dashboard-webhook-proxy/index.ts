
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// In-memory storage for webhook data (simple approach)
let latestWebhookData: any = null;

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
      
      // Transform the webhook data to match dashboard expectations
      const transformedData = {
        personalizedPromotions: {
          socialMediaDescription: webhookData.Descrption || webhookData.Description || "New promotion generated from n8n workflow",
          imageUrl: webhookData.Image ? "data:image/jpeg;base64," + webhookData.Image : "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop",
          imageBlob: webhookData.Image ? webhookData.Image : null
        },
        salesForecast: {
          forecast: webhookData.forecast || "Sales forecast updated from automation",
          projectedRevenue: webhookData.projectedRevenue || "$25,000",
          keyInsights: webhookData.keyInsights || [
            "Data updated from n8n automation",
            "Real-time webhook integration active",
            "Custom promotion generated"
          ]
        },
        timestamp: new Date().toISOString(),
        source: 'n8n_webhook',
        rawData: webhookData
      };
      
      // Store the transformed data in memory
      latestWebhookData = transformedData;
      console.log('Stored transformed data:', transformedData);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Webhook data received and stored',
          transformedData: transformedData
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
    
    if (req.method === 'GET') {
      // This endpoint returns the latest webhook data for the dashboard
      if (latestWebhookData) {
        console.log('Returning stored webhook data to dashboard');
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: latestWebhookData,
            hasNewData: true
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      } else {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'No webhook data available yet',
            hasNewData: false
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }
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
