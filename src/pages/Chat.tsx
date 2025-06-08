
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navigation from "@/components/Navigation";
import { ArrowUp, Loader, Zap } from "lucide-react";
import { useChatWebhook } from "@/hooks/useChatWebhook";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hello! I'm your LocaLink AI assistant connected to the webhook. I can help you with business promotions, sales forecasting, customer analysis, and partnership recommendations. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const { sendChatToWebhook, isLoading } = useChatWebhook();
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");

    try {
      // Send message to webhook and get response
      const botResponse = await sendChatToWebhook(currentInput);
      
      const aiResponse: Message = {
        id: messages.length + 2,
        content: botResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      toast({
        title: "Message sent!",
        description: "Your message has been processed by the chatbot.",
      });

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorResponse: Message = {
        id: messages.length + 2,
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
      
      toast({
        title: "Error",
        description: "Failed to send message to chatbot. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAsk = async (question: string) => {
    setInputValue(question);
    // Auto-send the quick ask question
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                AI <span className="gradient-text">Assistant</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Get instant insights and recommendations for your business via webhook
              </p>
            </div>

            <Card className="shadow-lg h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center space-x-2">
                  <div className="gradient-bg rounded-lg p-2">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <span>LocaLink Assistant</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Webhook Connected</span>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 p-0 flex flex-col">
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-4 rounded-lg ${
                            message.isUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="leading-relaxed">{message.content}</p>
                          <span className="text-xs opacity-70 mt-2 block">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted p-4 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Loader className="h-5 w-5 animate-spin" />
                            <span className="text-sm">Sending to chatbot...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about your business..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputValue.trim()}
                      size="icon"
                    >
                      {isLoading ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowUp className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <Card 
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleQuickAsk("Generate a promotion for the holidays")}
              >
                <p className="text-sm text-muted-foreground">Quick Ask</p>
                <p className="font-medium">Generate a promotion for the holidays</p>
              </Card>
              <Card 
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleQuickAsk("Analyze my customer feedback and provide insights")}
              >
                <p className="text-sm text-muted-foreground">Quick Ask</p>
                <p className="font-medium">Analyze my customer feedback</p>
              </Card>
              <Card 
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleQuickAsk("Find partnership opportunities in my area")}
              >
                <p className="text-sm text-muted-foreground">Quick Ask</p>
                <p className="font-medium">Find partnership opportunities</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
