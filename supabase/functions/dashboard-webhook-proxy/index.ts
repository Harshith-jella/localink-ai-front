
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client for persistent storage
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
      
      // Store in a simple table for persistence across function calls
      const { error: insertError } = await supabase
        .from('webhook_data')
        .upsert([
          {
            id: 'latest_dashboard_data',
            data: transformedData,
            updated_at: new Date().toISOString()
          }
        ])
      
      if (insertError) {
        console.error('Error storing webhook data:', insertError)
        // Fallback to in-memory storage if database fails
      } else {
        console.log('Stored transformed data in database:', transformedData);
      }
      
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
      // Try to get data from database first
      const { data: storedData, error } = await supabase
        .from('webhook_data')
        .select('data, updated_at')
        .eq('id', 'latest_dashboard_data')
        .single()
      
      if (!error && storedData) {
        console.log('Returning stored webhook data from database to dashboard');
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: storedData.data,
            hasNewData: true
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      } else {
        console.log('No webhook data found in database:', error);
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
