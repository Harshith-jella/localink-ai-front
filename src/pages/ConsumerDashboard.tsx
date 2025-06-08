
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { MapPin, Gift, Users, RefreshCw, Heart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useConsumerDashboard } from "@/hooks/useConsumerDashboard";

const ConsumerDashboard = () => {
  const { 
    consumerData, 
    isLoading, 
    refreshData
  } = useConsumerDashboard();

  const sections = [
    {
      title: consumerData?.personalizedRecommendations?.title || "Personalized Recommendations",
      icon: <Heart className="h-6 w-6" />,
      content: consumerData?.personalizedRecommendations?.recommendations || [],
      description: consumerData?.personalizedRecommendations?.description || "Based on your preferences and local business activity",
      gradient: "from-pink-500 to-purple-600",
      type: "recommendations"
    },
    {
      title: consumerData?.localDeals?.title || "Local Deals & Promotions",
      icon: <Gift className="h-6 w-6" />,
      content: consumerData?.localDeals?.deals || [],
      gradient: "from-blue-500 to-cyan-600",
      type: "deals"
    },
    {
      title: consumerData?.communityInsights?.title || "Community Insights",
      icon: <Users className="h-6 w-6" />,
      content: consumerData?.communityInsights?.insights || [],
      gradient: "from-green-500 to-emerald-600",
      type: "insights"
    }
  ];

  const renderRecommendationsCard = (section: any) => (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${section.gradient} text-white`}>
              {section.icon}
            </div>
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">{section.title}</CardTitle>
              {consumerData?.source !== 'default_consumer_data' ? (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  Live Data
                </Badge>
              ) : (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Sample Data
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm mb-4">{section.description}</p>
          <div className="space-y-3">
            {section.content.map((item: string, index: number) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDealsCard = (section: any) => (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${section.gradient} text-white`}>
              {section.icon}
            </div>
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">{section.title}</CardTitle>
              {consumerData?.source !== 'default_consumer_data' ? (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  Live Data
                </Badge>
              ) : (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Sample Data
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {section.content.map((deal: any, index: number) => (
            <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-primary">{deal.business}</h4>
                <Badge variant="secondary" className="text-xs">
                  Valid until {deal.validUntil}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{deal.offer}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderInsightsCard = (section: any) => (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${section.gradient} text-white`}>
              {section.icon}
            </div>
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">{section.title}</CardTitle>
              {consumerData?.source !== 'default_consumer_data' ? (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  Live Data
                </Badge>
              ) : (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Sample Data
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {section.content.map((insight: string, index: number) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
              <MapPin className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{insight}</p>
            </div>
          ))}
        </div>
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
                Consumer <span className="gradient-text">Dashboard</span>
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
              Your personalized local business insights and recommendations
            </p>
            {consumerData ? (
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(consumerData.timestamp).toLocaleString()}
                </p>
                {consumerData.source !== 'default_consumer_data' && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    🔗 Live Data Connected
                  </Badge>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  ⏳ Loading consumer data...
                </Badge>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-1 xl:grid-cols-2 gap-8">
            {sections.map((section, index) => {
              if (section.type === "recommendations") {
                return <div key={index}>{renderRecommendationsCard(section)}</div>;
              } else if (section.type === "deals") {
                return <div key={index}>{renderDealsCard(section)}</div>;
              } else if (section.type === "insights") {
                return <div key={index}>{renderInsightsCard(section)}</div>;
              }
              return null;
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
                    <Heart className="h-6 w-6" />
                    <span>Update Preferences</span>
                    <Badge variant="secondary" className="text-xs">
                      Personalize
                    </Badge>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                    <MapPin className="h-6 w-6" />
                    <span>Explore Local</span>
                    <Badge variant="secondary" className="text-xs">
                      Discover
                    </Badge>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                    <Users className="h-6 w-6" />
                    <span>Community Events</span>
                    <Badge variant="secondary" className="text-xs">
                      Connect
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

export default ConsumerDashboard;
