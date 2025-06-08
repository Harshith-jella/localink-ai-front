
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Business = Tables<'businesses'>;
type BusinessInsert = TablesInsert<'businesses'>;

// Enhanced webhook function to send data to the dashboard webhook
const sendToWebhook = async (businessData: any) => {
  try {
    console.log('Sending business data to dashboard webhook:', businessData);
    
    const response = await fetch('https://harshithjella3105.app.n8n.cloud/webhook-test/Localink-Dashboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify(businessData),
    });
    
    if (!response.ok) {
      console.warn('Dashboard webhook failed with status:', response.status, response.statusText);
      // Try with no-cors as fallback
      await fetch('https://harshithjella3105.app.n8n.cloud/webhook-test/Localink-Dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(businessData),
      });
      console.log('Dashboard webhook sent with no-cors mode');
    } else {
      const responseData = await response.text();
      console.log('Dashboard webhook response:', responseData);
      console.log('Successfully sent business data to dashboard webhook');
    }
  } catch (error) {
    console.error('Dashboard webhook error:', error);
    // Fallback attempt with no-cors
    try {
      await fetch('https://harshithjella3105.app.n8n.cloud/webhook-test/Localink-Dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(businessData),
      });
      console.log('Dashboard webhook sent via fallback no-cors mode');
    } catch (fallbackError) {
      console.error('Fallback dashboard webhook attempt also failed:', fallbackError);
    }
  }
};

export const useBusinesses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const businessesQuery = useQuery({
    queryKey: ['businesses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createBusinessMutation = useMutation({
    mutationFn: async (business: Omit<BusinessInsert, 'user_id'> & { 
      generalHelp?: string;
      analysisType?: string;
      goalDescription?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { generalHelp, analysisType, goalDescription, ...businessData } = business;

      const { data, error } = await supabase
        .from('businesses')
        .insert({
          ...businessData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return { ...data, generalHelp, analysisType, goalDescription };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      
      // Enhanced webhook payload for dashboard
      const webhookPayload = {
        event: 'business_wizard_completed',
        business: {
          id: data.id,
          name: data.name,
          category: data.category,
          description: data.description,
          address: data.address,
          phone: data.phone,
          email: data.email,
          website: data.website,
          generalHelp: data.generalHelp || 'not-selected',
          analysisType: data.analysisType || 'not-selected',
          goalDescription: data.goalDescription || 'not-specified',
          created_at: data.created_at,
        },
        user: {
          id: user?.id,
          email: user?.email,
        },
        timestamp: new Date().toISOString(),
        source: 'localink_wizard',
      };
      
      // Send data to dashboard webhook (non-blocking)
      sendToWebhook(webhookPayload);
      
      toast({
        title: "Business created!",
        description: "Your business has been successfully added and sent to the AI dashboard.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating business",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    businesses: businessesQuery.data || [],
    isLoading: businessesQuery.isLoading,
    error: businessesQuery.error,
    createBusiness: createBusinessMutation.mutate,
    isCreating: createBusinessMutation.isPending,
  };
};
