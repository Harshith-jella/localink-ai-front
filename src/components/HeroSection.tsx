
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowDown, Zap } from "lucide-react";
import SplineBackground from "./SplineBackground";

const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Spline Background */}
      <div className="absolute inset-0">
        <SplineBackground />
      </div>
      
      {/* Minimal overlay for text readability - removed whitish background */}
      <div className="absolute inset-0 bg-black/10" style={{ zIndex: 2 }} />

      {/* Animated background elements - reduced opacity */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-purple-500/3" style={{ zIndex: 3 }} />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" style={{ zIndex: 3 }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ zIndex: 3, animationDelay: '1s' }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative" style={{ zIndex: 4 }}>
        <div className="animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="gradient-bg rounded-full p-4">
              <Zap className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-primary-foreground">
            AI-Powered Growth for{" "}
            <span className="gradient-text">Local Businesses</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            LocaLink uses artificial intelligence to generate personalized promotions, 
            forecast sales, analyze sentiment, and recommend strategic partnerships for your business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link to="/wizard">Start Your Journey</Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-lg px-8 py-6">
              <Link to="#features">Learn More</Link>
            </Button>
          </div>
          
          <div className="animate-bounce">
            <ArrowDown className="h-6 w-6 mx-auto text-muted-foreground" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
