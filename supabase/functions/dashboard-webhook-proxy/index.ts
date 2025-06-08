
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
      console.log('Image data type:', typeof webhookData.Image)
      console.log('Image data length:', webhookData.Image ? webhookData.Image.length : 'No image')
      
      // Handle the base64 image properly
      let imageUrl = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop" // fallback
      let imageBlob = null
      
      if (webhookData.Image) {
        // If the image is already a data URL, use it directly
        if (webhookData.Image.startsWith('data:image/')) {
          imageUrl = webhookData.Image
        } else {
          // If it's raw base64, convert to data URL
          imageUrl = `data:image/jpeg;base64,${webhookData.Image}`
        }
        imageBlob = webhookData.Image
        console.log('Processed image URL prefix:', imageUrl.substring(0, 50))
      }
      
      // Transform the webhook data to match dashboard expectations
      const transformedData = {
        personalizedPromotions: {
          socialMediaDescription: webhookData.Descrption || webhookData.Description || webhookData.description || "New promotion generated from n8n workflow",
          imageUrl: imageUrl,
          imageBlob: imageBlob
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
        rawData: {
          ...webhookData,
          image: webhookData.Image ? `${(webhookData.Image.length / 1024 / 1024).toFixed(2)} MB` : 'No image'
        }
      };
      
      // Store in the webhook_data table for persistence across function calls
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
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to store webhook data',
            details: insertError.message
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        )
      }
      
      console.log('Successfully stored transformed data in database');
      console.log('Image URL stored:', transformedData.personalizedPromotions.imageUrl.substring(0, 50));
      
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
      // Try to get data from database
      const { data: storedData, error } = await supabase
        .from('webhook_data')
        .select('data, updated_at')
        .eq('id', 'latest_dashboard_data')
        .maybeSingle()
      
      if (error) {
        console.error('Error fetching webhook data:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to fetch webhook data',
            details: error.message
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        )
      }
      
      if (storedData && storedData.data) {
        console.log('Returning stored webhook data from database to dashboard');
        console.log('Image URL being returned:', storedData.data.personalizedPromotions?.imageUrl?.substring(0, 50));
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: storedData.data,
            hasNewData: true,
            lastUpdated: storedData.updated_at
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      } else {
        console.log('No webhook data found in database');
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
