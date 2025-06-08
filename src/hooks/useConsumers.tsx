
import { useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

// Enhanced webhook function to send data to dashboard webhook
const sendToWebhook = async (userData: any) => {
  try {
    console.log('Sending consumer data to dashboard webhook:', userData);
    
    const response = await fetch('https://harshithjella3105.app.n8n.cloud/webhook-test/Localink-Dashboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify(userData),
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
        body: JSON.stringify(userData),
      });
      console.log('Dashboard webhook sent with no-cors mode');
    } else {
      const responseData = await response.text();
      console.log('Dashboard webhook response:', responseData);
      console.log('Successfully sent consumer data to dashboard webhook');
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
        body: JSON.stringify(userData),
      });
      console.log('Dashboard webhook sent via fallback no-cors mode');
    } catch (fallbackError) {
      console.error('Fallback dashboard webhook attempt also failed:', fallbackError);
    }
  }
};

export const useConsumers = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const createConsumerDataMutation = useMutation({
    mutationFn: async (consumerData: any) => {
      if (!user) throw new Error('User not authenticated');

      // For consumers, we just process the data without storing in database
      // but we still send it to the dashboard webhook
      return {
        user_id: user.id,
        user_type: 'consumer',
        ...consumerData,
        created_at: new Date().toISOString(),
      };
    },
    onSuccess: async (data) => {
      // Enhanced webhook payload for dashboard
      const webhookPayload = {
        event: 'consumer_wizard_completed',
        consumer: {
          user_type: 'consumer',
          preferences: data.preferences || {},
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
        title: "Registration completed!",
        description: "Your information has been processed and sent to the AI dashboard.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error processing registration",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createConsumerData: createConsumerDataMutation.mutate,
    isCreating: createConsumerDataMutation.isPending,
  };
};
