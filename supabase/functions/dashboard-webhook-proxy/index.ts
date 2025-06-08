
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
      console.log('Received webhook data:', JSON.stringify(webhookData, null, 2))
      
      // Handle the base64 image properly - look for various possible field names
      let imageUrl = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop" // fallback
      let imageBlob = null
      
      // Check for different possible image field names from n8n
      const possibleImageFields = ['Image', 'image', 'imageData', 'base64Image', 'photo', 'picture'];
      let imageData = null;
      
      for (const field of possibleImageFields) {
        if (webhookData[field] && typeof webhookData[field] === 'string' && webhookData[field].length > 100) {
          imageData = webhookData[field];
          console.log(`Found image data in field: ${field}`);
          console.log(`Image data length: ${imageData.length} characters`);
          break;
        }
      }
      
      if (imageData) {
        // Clean the base64 data - remove any data URL prefix if present
        let cleanBase64 = imageData;
        if (imageData.includes(',')) {
          cleanBase64 = imageData.split(',')[1];
        }
        
        // Remove any whitespace or newlines
        cleanBase64 = cleanBase64.replace(/\s/g, '');
        
        // Create data URL for the image
        imageUrl = `data:image/jpeg;base64,${cleanBase64}`;
        imageBlob = cleanBase64;
        console.log('Successfully processed base64 image data');
        console.log('Image URL prefix:', imageUrl.substring(0, 50));
      } else {
        console.log('No valid image data found in webhook payload');
        console.log('Available fields:', Object.keys(webhookData));
      }
      
      // Get the description/text content from n8n (handling the typo in field name and prioritizing real content)
      let textContent = webhookData.Description || webhookData.description || webhookData.Descrption || webhookData.descrption;
      
      // Only use fallback if no real content is found
      if (!textContent || textContent.trim() === '') {
        textContent = "New promotion generated from n8n workflow";
      }
      
      console.log('Using text content:', textContent.substring(0, 100) + '...');
      
      // Transform the webhook data to match dashboard expectations
      const transformedData = {
        personalizedPromotions: {
          socialMediaDescription: textContent,
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
          imageProcessed: !!imageData,
          imageSize: imageData ? `${(imageData.length / 1024 / 1024).toFixed(2)} MB` : 'No image',
          textContentLength: textContent.length,
          originalTextFields: {
            Description: webhookData.Description,
            description: webhookData.description,
            Descrption: webhookData.Descrption,
            descrption: webhookData.descrption
          }
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
      console.log('Text content stored:', textContent.substring(0, 100) + '...');
      console.log('Image URL stored:', transformedData.personalizedPromotions.imageUrl.substring(0, 50));
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Webhook data received and stored',
          transformedData: transformedData,
          imageProcessed: !!imageData,
          textProcessed: textContent.length > 0,
          realContentFound: !!(webhookData.Description || webhookData.description || webhookData.Descrption || webhookData.descrption)
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
        console.log('Text content being returned:', storedData.data.personalizedPromotions?.socialMediaDescription?.substring(0, 100) + '...');
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
