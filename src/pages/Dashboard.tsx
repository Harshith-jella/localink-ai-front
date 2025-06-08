
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { ArrowUp, Search, Zap, Layout, Loader } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const aiResults = [
    {
      title: "Personalized Promotions",
      icon: <Zap className="h-6 w-6" />,
      status: "complete",
      content: "Based on your customer data, we recommend a 'Buy 2 Get 1 Free' promotion for coffee drinks during 2-4 PM to boost afternoon sales. Expected impact: 25% increase in daily revenue.",
      gradient: "from-blue-500 to-purple-600",
      available: true
    },
    {
      title: "Sales Forecast",
      icon: <ArrowUp className="h-6 w-6" />,
      status: "complete",
      content: "Q4 revenue projection: $45,000 (+18% vs Q3). Peak sales expected in November. Recommended inventory increase of 30% for best-selling items.",
      gradient: "from-purple-500 to-pink-600",
      available: true
    },
    {
      title: "Sentiment Analysis",
      icon: <Search className="h-6 w-6" />,
      status: "coming-soon",
      content: "Advanced sentiment analysis is coming soon! This feature will analyze customer reviews and social media mentions to provide insights about your business reputation.",
      gradient: "from-green-500 to-blue-600",
      available: false
    },
    {
      title: "Partnership Opportunities",
      icon: <Layout className="h-6 w-6" />,
      status: "coming-soon",
      content: "Partnership recommendation engine is coming soon! We'll help you identify complementary businesses in your area for collaboration opportunities.",
      gradient: "from-orange-500 to-red-600",
      available: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              AI <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Your personalized business insights powered by artificial intelligence
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {aiResults.map((result, index) => (
              <Card 
                key={index}
                className={`shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${!result.available ? 'opacity-75' : ''}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${result.gradient} text-white`}>
                        {result.icon}
                      </div>
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{result.title}</CardTitle>
                        {result.available ? (
                          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                    </div>
                    {result.status === "processing" && (
                      <Loader className="h-5 w-5 animate-spin text-primary" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {result.content}
                  </p>
                  {result.status === "complete" && result.available && (
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  )}
                  {result.status === "processing" && (
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-2/3 animate-pulse"></div>
                    </div>
                  )}
                  {!result.available && (
                    <Button variant="outline" size="sm" disabled>
                      Coming Soon
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
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
                    <span>Generate New Promotion</span>
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
