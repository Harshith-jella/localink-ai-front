
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
    console.log('Consumer dashboard function called:', req.method)
    
    if (req.method === 'POST') {
      // Handle incoming consumer data from n8n or other sources
      const consumerData = await req.json()
      console.log('Received consumer data:', JSON.stringify(consumerData, null, 2))
      
      // Transform consumer data for dashboard
      const transformedData = {
        personalizedRecommendations: {
          title: consumerData.title || "Personalized Recommendations",
          description: consumerData.description || "Based on your preferences and local business activity",
          recommendations: consumerData.recommendations || [
            "Check out the weekend pastry sale at Local Bakery",
            "New restaurant opened nearby with great reviews",
            "Local fitness center offering trial classes"
          ]
        },
        localDeals: {
          title: "Local Deals & Promotions",
          deals: consumerData.deals || [
            {
              business: "Local Coffee Shop",
              offer: "20% off morning coffee",
              validUntil: "2025-01-15"
            },
            {
              business: "Neighborhood Bookstore", 
              offer: "Buy 2 get 1 free on selected books",
              validUntil: "2025-01-20"
            }
          ]
        },
        communityInsights: {
          title: "Community Insights",
          insights: consumerData.insights || [
            "3 new businesses opened in your area this month",
            "Local farmers market has expanded hours",
            "Community event: Art walk next weekend"
          ]
        },
        timestamp: new Date().toISOString(),
        source: 'consumer_automation',
        rawData: consumerData
      };
      
      // Store in the consumer_dashboard_data table for persistence
      const { error: insertError } = await supabase
        .from('consumer_dashboard_data')
        .upsert([
          {
            id: 'latest_consumer_data',
            data: transformedData,
            updated_at: new Date().toISOString()
          }
        ])
      
      if (insertError) {
        console.error('Error storing consumer data:', insertError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to store consumer data',
            details: insertError.message
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        )
      }
      
      console.log('Successfully stored consumer data')
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Consumer data received and stored',
          transformedData: transformedData
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
    
    if (req.method === 'GET') {
      // GET requests for consumer dashboard fetching
      const { data: storedData, error } = await supabase
        .from('consumer_dashboard_data')
        .select('data, updated_at')
        .eq('id', 'latest_consumer_data')
        .maybeSingle()
      
      if (error) {
        console.error('Error fetching consumer data:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to fetch consumer data',
            details: error.message
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        )
      }
      
      if (storedData && storedData.data) {
        console.log('Returning consumer data from database')
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
        console.log('No consumer data found in database')
        // Return default consumer data
        const defaultData = {
          personalizedRecommendations: {
            title: "Personalized Recommendations",
            description: "Connect your preferences to see personalized local business recommendations",
            recommendations: [
              "Discover local businesses tailored to your interests",
              "Get notified about deals from your favorite categories",
              "Find new places based on community activity"
            ]
          },
          localDeals: {
            title: "Local Deals & Promotions", 
            deals: [
              {
                business: "Sample Local Business",
                offer: "Connect to see real deals in your area",
                validUntil: "ongoing"
              }
            ]
          },
          communityInsights: {
            title: "Community Insights",
            insights: [
              "Connect to see insights about your local community",
              "Track new business openings in your area",
              "Stay updated on local events and activities"
            ]
          },
          timestamp: new Date().toISOString(),
          source: 'default_consumer_data'
        };
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: defaultData,
            hasNewData: false,
            message: 'No consumer data available yet - showing default content'
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
    console.error('Error in consumer dashboard function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
