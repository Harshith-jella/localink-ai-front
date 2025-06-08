
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

interface WebhookResponse {
  personalizedPromotions?: {
    socialMediaDescription: string;
    imageUrl: string;
  };
  salesForecast?: {
    forecast: string;
    projectedRevenue: string;
    keyInsights: string[];
  };
  timestamp: string;
  source: string;
}

export const useWebhookListener = () => {
  const [webhookData, setWebhookData] = useState<WebhookResponse | null>(null);
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  // Function to poll for webhook responses
  const pollForWebhookResponse = async (businessId?: string) => {
    if (!businessId) return;
    
    try {
      setIsListening(true);
      console.log('Polling for webhook response for business:', businessId);
      
      // Poll for a response (in a real implementation, this would be a proper webhook endpoint)
      // For now, we'll simulate receiving data after a delay
      setTimeout(() => {
        const mockResponse: WebhookResponse = {
          personalizedPromotions: {
            socialMediaDescription: "🎉 Weekend Special at Naga Bakery! Get 20% off all cakes and pastries this Saturday & Sunday! Perfect for your weekend treats. 🧁🍰 #WeekendSpecial #NagaBakery #FreshBaked",
            imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop"
          },
          salesForecast: {
            forecast: "Weekend Revenue Projection: $2,800 (+35% vs regular weekends)",
            projectedRevenue: "$2,800",
            keyInsights: [
              "Weekend specials typically increase foot traffic by 35%",
              "Cake sales peak on Saturday afternoons",
              "Recommend increasing pastry inventory by 40%",
              "Social media promotion should start Friday evening"
            ]
          },
          timestamp: new Date().toISOString(),
          source: 'ai_dashboard_response'
        };
        
        setWebhookData(mockResponse);
        setIsListening(false);
        
        toast({
          title: "AI Analysis Complete!",
          description: "Your personalized promotions and sales forecast are ready.",
        });
      }, 3000); // 3 second delay to simulate processing
      
    } catch (error) {
      console.error('Error polling for webhook response:', error);
      setIsListening(false);
      toast({
        title: "Error",
        description: "Failed to receive AI analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to manually trigger AI analysis
  const triggerAIAnalysis = async (businessData: any) => {
    try {
      setIsListening(true);
      console.log('Triggering AI analysis for:', businessData);
      
      // Send request to webhook for AI analysis
      const webhookPayload = {
        event: 'ai_analysis_request',
        business: businessData,
        requestedAnalysis: ['personalized_promotions', 'sales_forecast'],
        timestamp: new Date().toISOString(),
        source: 'dashboard_request'
      };
      
      // Send to webhook
      await fetch('https://harshithjella3105.app.n8n.cloud/webhook-test/Localink-Dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(webhookPayload),
      });
      
      // Poll for response
      setTimeout(() => {
        pollForWebhookResponse(businessData.id);
      }, 1000);
      
    } catch (error) {
      console.error('Error triggering AI analysis:', error);
      setIsListening(false);
      toast({
        title: "Error",
        description: "Failed to request AI analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    webhookData,
    isListening,
    pollForWebhookResponse,
    triggerAIAnalysis,
    setWebhookData
  };
};
