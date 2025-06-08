
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Business = Tables<'businesses'>;
type BusinessInsert = TablesInsert<'businesses'>;

// Webhook function to send data to n8n
const sendToWebhook = async (businessData: any) => {
  try {
    const response = await fetch('https://harshithjella3105.app.n8n.cloud/webhook-test/Localink', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(businessData),
    });
    
    if (!response.ok) {
      console.warn('Webhook failed:', response.statusText);
    } else {
      console.log('Successfully sent data to webhook');
    }
  } catch (error) {
    console.error('Webhook error:', error);
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
    mutationFn: async (business: Omit<BusinessInsert, 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('businesses')
        .insert({
          ...business,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      
      // Send data to webhook
      await sendToWebhook({
        business: data,
        user: {
          id: user?.id,
          email: user?.email,
        },
        timestamp: new Date().toISOString(),
      });
      
      toast({
        title: "Business created!",
        description: "Your business has been successfully added.",
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
