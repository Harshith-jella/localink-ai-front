
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Business = Tables<'businesses'>;
type BusinessInsert = TablesInsert<'businesses'>;

// Enhanced webhook function to send data to n8n
const sendToWebhook = async (businessData: any) => {
  try {
    console.log('Sending data to webhook:', businessData);
    
    const response = await fetch('https://harshithjella3105.app.n8n.cloud/webhook-test/Localink', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors', // Try CORS first
      body: JSON.stringify(businessData),
    });
    
    if (!response.ok) {
      console.warn('Webhook failed with status:', response.status, response.statusText);
      // Try with no-cors as fallback
      await fetch('https://harshithjella3105.app.n8n.cloud/webhook-test/Localink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(businessData),
      });
      console.log('Webhook sent with no-cors mode');
    } else {
      const responseData = await response.text();
      console.log('Webhook response:', responseData);
      console.log('Successfully sent data to webhook');
    }
  } catch (error) {
    console.error('Webhook error:', error);
    // Fallback attempt with no-cors
    try {
      await fetch('https://harshithjella3105.app.n8n.cloud/webhook-test/Localink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(businessData),
      });
      console.log('Webhook sent via fallback no-cors mode');
    } catch (fallbackError) {
      console.error('Fallback webhook attempt also failed:', fallbackError);
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
    mutationFn: async (business: Omit<BusinessInsert, 'user_id'> & { generalHelp?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { generalHelp, ...businessData } = business;

      const { data, error } = await supabase
        .from('businesses')
        .insert({
          ...businessData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return { ...data, generalHelp };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      
      // Enhanced webhook payload
      const webhookPayload = {
        event: 'business_created',
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
          created_at: data.created_at,
        },
        user: {
          id: user?.id,
          email: user?.email,
        },
        timestamp: new Date().toISOString(),
        source: 'localink_wizard',
      };
      
      // Send data to webhook (non-blocking)
      sendToWebhook(webhookPayload);
      
      toast({
        title: "Business created!",
        description: "Your business has been successfully added and sent to the webhook.",
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
