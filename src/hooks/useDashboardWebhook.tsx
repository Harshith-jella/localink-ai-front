
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

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

  // Function to send data to the new webhook
  const sendToWebhook = async (data: any) => {
    try {
      console.log('Sending dashboard data to webhook:', data);
      
      const response = await fetch('https://harshithjella3105.app.n8n.cloud/webhook-test/Localink-Dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        console.warn('Dashboard webhook failed with status:', response.status);
        // Try with no-cors as fallback
        await fetch('https://harshithjella3105.app.n8n.cloud/webhook-test/Localink-Dashboard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'no-cors',
          body: JSON.stringify(data),
        });
        console.log('Dashboard webhook sent with no-cors mode');
      } else {
        const responseData = await response.text();
        console.log('Dashboard webhook response:', responseData);
      }
    } catch (error) {
      console.error('Dashboard webhook error:', error);
      // Fallback attempt
      try {
        await fetch('https://harshithjella3105.app.n8n.cloud/webhook-test/Localink-Dashboard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'no-cors',
          body: JSON.stringify(data),
        });
        console.log('Dashboard webhook sent via fallback');
      } catch (fallbackError) {
        console.error('Fallback dashboard webhook failed:', fallbackError);
      }
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
