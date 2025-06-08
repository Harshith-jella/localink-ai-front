
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Zap, Layout, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FeaturesSection = () => {
  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Personalized Promotions",
      description: "AI generates targeted marketing campaigns based on customer behavior and local market trends.",
      gradient: "from-blue-500 to-purple-600",
      available: true
    },
    {
      icon: <ArrowUp className="h-8 w-8" />,
      title: "Sales Forecasting",
      description: "Predict future revenue with machine learning models trained on local business data.",
      gradient: "from-purple-500 to-pink-600",
      available: true
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: "Sentiment Analysis",
      description: "Understand customer feedback and market perception through advanced text analysis.",
      gradient: "from-green-500 to-blue-600",
      available: false
    },
    {
      icon: <Layout className="h-8 w-8" />,
      title: "Partnership Recommendations",
      description: "Discover collaboration opportunities with complementary local businesses.",
      gradient: "from-orange-500 to-red-600",
      available: false
    }
  ];

  return (
    <section id="features" className="py-20 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Powerful Features for{" "}
            <span className="gradient-text">Smart Growth</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to transform your local business with AI-driven insights and automation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg ${!feature.available ? 'opacity-75' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="text-center pb-4">
                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${feature.gradient} text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  {feature.available ? (
                    <Badge className="absolute -top-2 -right-2 bg-green-500 hover:bg-green-600">
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="absolute -top-2 -right-2">
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
