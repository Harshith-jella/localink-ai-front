
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PromotionData {
  socialMediaDescription: string;
  imageUrl: string;
  imageBlob?: Blob;
}

interface SalesForecastData {
  forecast: string;
  projectedRevenue: string;
  keyInsights: string[];
  chartData?: any;
}

interface WebhookData {
  personalizedPromotions?: PromotionData;
  salesForecast?: SalesForecastData;
  timestamp: string;
}

export const useDashboardWebhook = () => {
  const [dashboardData, setDashboardData] = useState<WebhookData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Function to send data to the new Supabase proxy webhook
  const sendToWebhook = async (data: any) => {
    try {
      console.log('Sending dashboard data to Supabase proxy:', data);
      
      const { data: result, error } = await supabase.functions.invoke('dashboard-webhook-proxy', {
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      console.log('Dashboard webhook response:', result);
      
      toast({
        title: "Success!",
        description: "Data sent to webhook successfully",
      });
      
    } catch (error) {
      console.error('Dashboard webhook error:', error);
      toast({
        title: "Webhook Error",
        description: "Failed to send data to webhook",
        variant: "destructive",
      });
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  // Function to download image
  const downloadImage = async (imageUrl: string, filename: string = 'promotion-image') => {
    try {
      setIsLoading(true);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded!",
        description: "Image downloaded successfully",
      });
    } catch (error) {
      console.error('Failed to download image:', error);
      toast({
        title: "Download failed",
        description: "Unable to download image",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to trigger webhook with sample data (for testing)
  const triggerSampleWebhook = async () => {
    const sampleData = {
      event: 'dashboard_data_update',
      personalizedPromotions: {
        socialMediaDescription: "🎉 FLASH SALE ALERT! Get 25% off all coffee drinks from 2-4 PM today! Perfect for your afternoon pick-me-up. ☕ #CoffeeLovers #FlashSale #AfternoonTreat",
        imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop"
      },
      salesForecast: {
        forecast: "Q4 Revenue Projection: $45,000 (+18% vs Q3)",
        projectedRevenue: "$45,000",
        keyInsights: [
          "Peak sales expected in November",
          "30% inventory increase recommended",
          "Best-selling items: Coffee drinks and pastries",
          "Weekend sales 40% higher than weekdays"
        ]
      },
      timestamp: new Date().toISOString(),
      source: 'dashboard_webhook'
    };

    await sendToWebhook(sampleData);
    setDashboardData(sampleData);
  };

  // Function to poll for new webhook data
  const checkForNewData = async () => {
    try {
      const { data: result, error } = await supabase.functions.invoke('dashboard-webhook-proxy', {
        method: 'GET',
      });
      
      if (error) {
        console.error('Error checking for new data:', error);
        return;
      }
      
      console.log('Proxy status check:', result);
    } catch (error) {
      console.error('Error polling webhook proxy:', error);
    }
  };

  // Set up polling for new data every 30 seconds
  useEffect(() => {
    const interval = setInterval(checkForNewData, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    dashboardData,
    setDashboardData,
    isLoading,
    copyToClipboard,
    downloadImage,
    triggerSampleWebhook,
    sendToWebhook
  };
};
