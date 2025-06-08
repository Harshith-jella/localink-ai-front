import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { ArrowUp, Search, Zap, Layout, Loader, Copy, Download, RefreshCw, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDashboardWebhook } from "@/hooks/useDashboardWebhook";
import { useWebhookListener } from "@/hooks/useWebhookListener";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useEffect } from "react";

const Dashboard = () => {
  const { 
    dashboardData, 
    isLoading, 
    copyToClipboard, 
    downloadImage, 
    triggerSampleWebhook 
  } = useDashboardWebhook();
  
  const {
    webhookData,
    isListening,
    triggerAIAnalysis
  } = useWebhookListener();
  
  const { businesses } = useBusinesses();

  // Use webhook data if available, otherwise fall back to dashboard data
  const displayData = webhookData || dashboardData;

  // Get the most recent business for AI analysis
  const latestBusiness = businesses && businesses.length > 0 ? businesses[0] : null;

  const handleGenerateAIAnalysis = () => {
    if (latestBusiness) {
      triggerAIAnalysis(latestBusiness);
    } else {
      triggerSampleWebhook();
    }
  };

  const aiResults = [
    {
      title: "Personalized Promotions",
      icon: <Zap className="h-6 w-6" />,
      status: "complete",
      content: displayData?.personalizedPromotions?.socialMediaDescription || 
        "AI-generated promotional content will appear here. Click 'Generate AI Analysis' to create personalized promotions based on your business data.",
      gradient: "from-blue-500 to-purple-600",
      available: true,
      type: "promotion"
    },
    {
      title: "Sales Forecast",
      icon: <ArrowUp className="h-6 w-6" />,
      status: "complete",
      content: displayData?.salesForecast?.forecast || 
        "Sales forecasting data will appear here. Click 'Generate AI Analysis' to get revenue projections and insights.",
      gradient: "from-purple-500 to-pink-600",
      available: true,
      type: "forecast"
    },
    {
      title: "Sentiment Analysis",
      icon: <Search className="h-6 w-6" />,
      status: "coming-soon",
      content: "Advanced sentiment analysis is coming soon! This feature will analyze customer reviews and social media mentions to provide insights about your business reputation.",
      gradient: "from-green-500 to-blue-600",
      available: false,
      type: "sentiment"
    },
    {
      title: "Partnership Opportunities",
      icon: <Layout className="h-6 w-6" />,
      status: "coming-soon",
      content: "Partnership recommendation engine is coming soon! We'll help you identify complementary businesses in your area for collaboration opportunities.",
      gradient: "from-orange-500 to-red-600",
      available: false,
      type: "partnership"
    }
  ];

  const renderPromotionCard = (result: any) => (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${result.gradient} text-white`}>
              {result.icon}
            </div>
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">{result.title}</CardTitle>
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                Available
              </Badge>
            </div>
          </div>
          {isListening && (
            <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            {result.content}
          </p>
          
          {displayData?.personalizedPromotions && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(displayData.personalizedPromotions!.socialMediaDescription)}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Text
                </Button>
                {displayData.personalizedPromotions.imageUrl && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadImage(displayData.personalizedPromotions!.imageUrl, 'promotion-image')}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {isLoading ? 'Downloading...' : 'Download Image'}
                  </Button>
                )}
              </div>
              
              {displayData.personalizedPromotions.imageUrl && (
                <div className="mt-4">
                  <img 
                    src={displayData.personalizedPromotions.imageUrl} 
                    alt="Promotion visual" 
                    className="w-full max-w-sm rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderForecastCard = (result: any) => (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${result.gradient} text-white`}>
              {result.icon}
            </div>
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">{result.title}</CardTitle>
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                Available
              </Badge>
            </div>
          </div>
          {isListening && (
            <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            {result.content}
          </p>
          
          {displayData?.salesForecast && (
            <div className="space-y-3">
              <div className="bg-secondary/50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Key Insights:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {displayData.salesForecast.keyInsights?.map((insight, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const forecastText = `${displayData.salesForecast!.forecast}\n\nKey Insights:\n${displayData.salesForecast!.keyInsights?.join('\n') || ''}`;
                  copyToClipboard(forecastText);
                }}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy Forecast Data
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderRegularCard = (result: any) => (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden opacity-75">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${result.gradient} text-white`}>
              {result.icon}
            </div>
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">{result.title}</CardTitle>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed mb-4">
          {result.content}
        </p>
        <Button variant="outline" size="sm" disabled>
          Coming Soon
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl md:text-4xl font-bold">
                AI <span className="gradient-text">Dashboard</span>
              </h1>
              <div className="flex gap-2">
                <Button 
                  onClick={handleGenerateAIAnalysis}
                  disabled={isListening}
                  className="flex items-center gap-2"
                >
                  {isListening ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isListening ? 'Generating...' : 'Generate AI Analysis'}
                </Button>
                <Button 
                  onClick={triggerSampleWebhook}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Sample Data
                </Button>
              </div>
            </div>
            <p className="text-xl text-muted-foreground">
              Your personalized business insights powered by artificial intelligence
            </p>
            {displayData && (
              <p className="text-sm text-muted-foreground mt-2">
                Last updated: {new Date(displayData.timestamp).toLocaleString()}
              </p>
            )}
            {latestBusiness && (
              <p className="text-sm text-muted-foreground">
                Analyzing: {latestBusiness.name} ({latestBusiness.category})
              </p>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {aiResults.map((result, index) => {
              if (result.type === "promotion") {
                return <div key={index}>{renderPromotionCard(result)}</div>;
              } else if (result.type === "forecast") {
                return <div key={index}>{renderForecastCard(result)}</div>;
              } else {
                return <div key={index}>{renderRegularCard(result)}</div>;
              }
            })}
          </div>

          <div className="mt-12">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col space-y-2"
                    onClick={handleGenerateAIAnalysis}
                    disabled={isListening}
                  >
                    <Zap className="h-6 w-6" />
                    <span>{isListening ? 'Generating...' : 'Generate New Analysis'}</span>
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs">
                      Available
                    </Badge>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2" disabled>
                    <Search className="h-6 w-6" />
                    <span>Analyze Feedback</span>
                    <Badge variant="secondary" className="text-xs">
                      Coming Soon
                    </Badge>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2" disabled>
                    <Layout className="h-6 w-6" />
                    <span>Find Partners</span>
                    <Badge variant="secondary" className="text-xs">
                      Coming Soon
                    </Badge>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
