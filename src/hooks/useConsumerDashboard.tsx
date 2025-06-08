
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PersonalizedRecommendations {
  title: string;
  description: string;
  recommendations: string[];
}

interface LocalDeal {
  business: string;
  offer: string;
  validUntil: string;
}

interface LocalDeals {
  title: string;
  deals: LocalDeal[];
}

interface CommunityInsights {
  title: string;
  insights: string[];
}

interface ConsumerDashboardData {
  personalizedRecommendations?: PersonalizedRecommendations;
  localDeals?: LocalDeals;
  communityInsights?: CommunityInsights;
  timestamp: string;
  source?: string;
  rawData?: any;
}

export const useConsumerDashboard = () => {
  const [consumerData, setConsumerData] = useState<ConsumerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(null);
  const { toast } = useToast();

  // Function to fetch consumer dashboard data
  const fetchConsumerData = async () => {
    try {
      console.log('Fetching consumer data...');
      
      const { data: result, error } = await supabase.functions.invoke('consumer-dashboard', {
        method: 'GET',
      });
      
      if (error) {
        console.error('Error fetching consumer data:', error);
        return;
      }
      
      console.log('Consumer dashboard response:', result);
      
      if (result.hasNewData && result.data) {
        const newData = result.data;
        console.log('Processing consumer data:', newData);
        
        setConsumerData(newData);
        setLastFetchTime(newData.timestamp);
        
        // Only show toast if this is truly new data
        if (!lastFetchTime || newData.timestamp !== lastFetchTime) {
          toast({
            title: "Consumer Data Updated!",
            description: "Your dashboard has been updated with fresh recommendations",
          });
        }
      } else if (result.data) {
        // Set default data without toast
        setConsumerData(result.data);
      }
      
    } catch (error) {
      console.error('Error fetching consumer data:', error);
    }
  };

  // Function to refresh data manually
  const refreshData = async () => {
    setIsLoading(true);
    await fetchConsumerData();
    setIsLoading(false);
  };

  // Set up polling for new data every 10 seconds
  useEffect(() => {
    // Fetch immediately on mount
    fetchConsumerData();
    
    // Set up interval for polling
    const interval = setInterval(fetchConsumerData, 10000);
    return () => clearInterval(interval);
  }, []);

  return {
    consumerData,
    setConsumerData,
    isLoading,
    refreshData,
    fetchConsumerData
  };
};
