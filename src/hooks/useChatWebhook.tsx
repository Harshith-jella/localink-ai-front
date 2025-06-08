
import { useState } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface ChatMessage {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatWebhookPayload {
  event: 'chat_message_sent';
  message: {
    content: string;
    timestamp: string;
    userId: string;
    userEmail: string;
  };
  user: {
    id: string;
    email: string;
  };
  timestamp: string;
  source: 'localink_chat';
}

interface ChatbotResponse {
  response?: string;
  message?: string;
  content?: string;
  reply?: string;
}

export const useChatWebhook = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const sendChatToWebhook = async (message: string): Promise<string> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    console.log('Sending chat message to webhook:', message);

    try {
      const webhookPayload: ChatWebhookPayload = {
        event: 'chat_message_sent',
        message: {
          content: message,
          timestamp: new Date().toISOString(),
          userId: user.id,
          userEmail: user.email || '',
        },
        user: {
          id: user.id,
          email: user.email || '',
        },
        timestamp: new Date().toISOString(),
        source: 'localink_chat',
      };

      const response = await fetch('https://harshithjella3105.app.n8n.cloud/webhook/chat-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(webhookPayload),
      });

      if (!response.ok) {
        console.warn('Chat webhook failed with status:', response.status);
        throw new Error(`Webhook request failed with status ${response.status}`);
      }

      const responseData: ChatbotResponse = await response.json();
      console.log('Chat webhook response:', responseData);

      // Extract the bot response from various possible response formats
      const botResponse = responseData.response || 
                         responseData.message || 
                         responseData.content || 
                         responseData.reply ||
                         'Thank you for your message! I received it successfully.';

      return botResponse;

    } catch (error) {
      console.error('Chat webhook error:', error);
      
      // Fallback with no-cors mode
      try {
        await fetch('https://harshithjella3105.app.n8n.cloud/webhook/chat-bot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'no-cors',
          body: JSON.stringify({
            event: 'chat_message_sent',
            message: {
              content: message,
              timestamp: new Date().toISOString(),
              userId: user.id,
              userEmail: user.email || '',
            },
            timestamp: new Date().toISOString(),
          }),
        });
        
        console.log('Chat webhook sent via fallback no-cors mode');
        return 'Message sent to chatbot successfully! (Response may take a moment to process)';
        
      } catch (fallbackError) {
        console.error('Fallback chat webhook failed:', fallbackError);
        throw new Error('Failed to send message to chatbot');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendChatToWebhook,
    isLoading,
  };
};
