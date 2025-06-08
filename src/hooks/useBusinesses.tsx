
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Business = Tables<'businesses'>;
type BusinessInsert = Omit<Business, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

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
    mutationFn: async (business: BusinessInsert) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
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
