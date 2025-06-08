
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { ArrowUp, Search, Zap, Layout, Loader, Copy, Download, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDashboardWebhook } from "@/hooks/useDashboardWebhook";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const { 
    dashboardData, 
    isLoading, 
    copyToClipboard, 
    downloadImage, 
    refreshData
  } = useDashboardWebhook();

  const [expandedText, setExpandedText] = useState<{[key: string]: boolean}>({});

  // Debug logging to see what image URL we're getting
  useEffect(() => {
    if (dashboardData?.personalizedPromotions?.imageUrl) {
      console.log('Dashboard rendering with image URL:', dashboardData.personalizedPromotions.imageUrl.substring(0, 50));
      console.log('Full image data available:', !!dashboardData.personalizedPromotions.imageUrl);
    }
  }, [dashboardData]);

  const toggleTextExpansion = (key: string) => {
    setExpandedText(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const aiResults = [
    {
      title: "Personalized Promotions",
      icon: <Zap className="h-6 w-6" />,
      status: "complete",
      content: dashboardData?.personalizedPromotions?.socialMediaDescription || 
        "Connect your n8n automation to see AI-generated promotional content here. Your workflow data will appear automatically.",
      gradient: "from-blue-500 to-purple-600",
      available: !!dashboardData?.personalizedPromotions?.socialMediaDescription,
      type: "promotion"
    },
    {
      title: "Sales Forecast",
      icon: <ArrowUp className="h-6 w-6" />,
      status: "complete",
      content: dashboardData?.salesForecast?.forecast || 
        "Connect your n8n automation to see sales forecasting data here. Your workflow data will appear automatically.",
      gradient: "from-purple-500 to-pink-600",
      available: !!dashboardData?.salesForecast?.forecast,
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

  const renderPromotionCard = (result: any) => {
    const textKey = 'promotion-text';
    const isExpanded = expandedText[textKey];
    const shouldShowToggle = result.content.length > 150;
    const hasRealData = result.available;

    return (
      <Card className={`shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${!hasRealData ? 'opacity-60 border-dashed' : ''}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${result.gradient} text-white`}>
                {result.icon}
              </div>
              <div className="flex items-center space-x-2">
                <CardTitle className="text-lg">{result.title}</CardTitle>
                {hasRealData ? (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    Live Data
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Waiting for Data
                  </Badge>
                )}
                {dashboardData?.source === 'n8n_webhook' && hasRealData && (
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    n8n Connected
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${hasRealData ? 'bg-muted/50' : 'bg-orange-50 border border-orange-200'}`}>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {isExpanded || !shouldShowToggle ? result.content : truncateText(result.content)}
              </p>
              {shouldShowToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTextExpansion(textKey)}
                  className="mt-2 p-0 h-auto font-normal text-primary hover:text-primary/80"
                >
                  {isExpanded ? (
                    <>Show Less <ChevronUp className="h-4 w-4 ml-1" /></>
                  ) : (
                    <>Show More <ChevronDown className="h-4 w-4 ml-1" /></>
                  )}
                </Button>
              )}
            </div>
            
            {hasRealData && dashboardData?.personalizedPromotions && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(dashboardData.personalizedPromotions!.socialMediaDescription)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Text
                  </Button>
                  {dashboardData.personalizedPromotions.imageUrl && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadImage(dashboardData.personalizedPromotions!.imageUrl, 'promotion-image')}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      {isLoading ? 'Downloading...' : 'Download Image'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderForecastCard = (result: any) => {
    const textKey = 'forecast-text';
    const isExpanded = expandedText[textKey];
    const shouldShowToggle = result.content.length > 150;
    const hasRealData = result.available;

    return (
      <Card className={`shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${!hasRealData ? 'opacity-60 border-dashed' : ''}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${result.gradient} text-white`}>
                {result.icon}
              </div>
              <div className="flex items-center space-x-2">
                <CardTitle className="text-lg">{result.title}</CardTitle>
                {hasRealData ? (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    Live Data
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Waiting for Data
                  </Badge>
                )}
                {dashboardData?.source === 'n8n_webhook' && hasRealData && (
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    n8n Connected
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${hasRealData ? 'bg-muted/50' : 'bg-orange-50 border border-orange-200'}`}>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {isExpanded || !shouldShowToggle ? result.content : truncateText(result.content)}
              </p>
              {shouldShowToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTextExpansion(textKey)}
                  className="mt-2 p-0 h-auto font-normal text-primary hover:text-primary/80"
                >
                  {isExpanded ? (
                    <>Show Less <ChevronUp className="h-4 w-4 ml-1" /></>
                  ) : (
                    <>Show More <ChevronDown className="h-4 w-4 ml-1" /></>
                  )}
                </Button>
              )}
            </div>
            
            {hasRealData && dashboardData?.salesForecast && (
              <div className="space-y-3">
                {dashboardData.salesForecast.projectedRevenue && (
                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                    <h4 className="font-semibold text-sm mb-1">Projected Revenue</h4>
                    <p className="text-2xl font-bold text-primary">{dashboardData.salesForecast.projectedRevenue}</p>
                  </div>
                )}
                
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Key Insights:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {dashboardData.salesForecast.keyInsights?.map((insight, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-primary">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const forecastText = `${dashboardData.salesForecast!.forecast}\n\nProjected Revenue: ${dashboardData.salesForecast!.projectedRevenue || 'N/A'}\n\nKey Insights:\n${dashboardData.salesForecast!.keyInsights?.join('\n') || ''}`;
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
  };

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
                  onClick={refreshData}
                  variant="outline"
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh Data
                </Button>
              </div>
            </div>
            <p className="text-xl text-muted-foreground">
              Your personalized business insights powered by n8n automation
            </p>
            {dashboardData ? (
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(dashboardData.timestamp).toLocaleString()}
                </p>
                {dashboardData.source === 'n8n_webhook' && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    🔗 n8n Automation Active
                  </Badge>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  ⏳ Waiting for n8n workflow data
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Send data from your n8n workflow to see it here
                </p>
              </div>
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
                  <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                    <Zap className="h-6 w-6" />
                    <span>Connect n8n Workflow</span>
                    <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-xs">
                      Send webhook data
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
