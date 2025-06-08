
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import { ArrowUp, Layout } from "lucide-react";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useConsumers } from "@/hooks/useConsumers";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";

const Wizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    industry: "",
    location: "",
    description: "",
    goals: "",
    challenges: ""
  });

  const { user } = useAuth();
  const { createBusiness, isCreating: isCreatingBusiness } = useBusinesses();
  const { createConsumerData, isCreating: isCreatingConsumer } = useConsumers();
  const navigate = useNavigate();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLaunch = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (userType === 'business' && formData.businessName && formData.industry) {
      createBusiness({
        name: formData.businessName,
        category: formData.industry,
        description: formData.description,
        address: formData.location,
      });
    } else if (userType === 'consumer') {
      createConsumerData({
        goals: formData.goals,
        challenges: formData.challenges,
        preferences: {
          location: formData.location,
        }
      });
    }
    
    navigate('/dashboard');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Welcome to LocaLink</h2>
              <p className="text-muted-foreground">First, tell us about yourself</p>
            </div>
            <RadioGroup value={userType} onValueChange={setUserType}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={`cursor-pointer transition-all ${userType === 'business' ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="p-6">
                    <RadioGroupItem value="business" id="business" className="sr-only" />
                    <Label htmlFor="business" className="cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <Layout className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-semibold">Business Owner</h3>
                          <p className="text-sm text-muted-foreground">I own or manage a local business</p>
                        </div>
                      </div>
                    </Label>
                  </CardContent>
                </Card>
                
                <Card className={`cursor-pointer transition-all ${userType === 'consumer' ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="p-6">
                    <RadioGroupItem value="consumer" id="consumer" className="sr-only" />
                    <Label htmlFor="consumer" className="cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <ArrowUp className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-semibold">Consumer</h3>
                          <p className="text-sm text-muted-foreground">I'm looking for local businesses</p>
                        </div>
                      </div>
                    </Label>
                  </CardContent>
                </Card>
              </div>
            </RadioGroup>
          </div>
        );

      case 2:
        if (userType === 'business') {
          return (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Business Information</h2>
                <p className="text-muted-foreground">Tell us about your business</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    placeholder="Enter your business name"
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    placeholder="e.g., Restaurant, Retail, Services"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, State"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what your business does..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Consumer Information</h2>
                <p className="text-muted-foreground">Tell us about your preferences</p>
              </div>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="location">Preferred Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, State where you're looking for businesses"
                  />
                </div>
                <div>
                  <Label htmlFor="description">What are you looking for?</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what kind of local businesses or services you're interested in..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          );
        }

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Goals & Challenges</h2>
              <p className="text-muted-foreground">Help us understand your objectives</p>
            </div>
            <div className="space-y-6">
              <div>
                <Label htmlFor="goals">
                  {userType === 'business' ? 'What are your main business goals?' : 'What are you hoping to find?'}
                </Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => handleInputChange('goals', e.target.value)}
                  placeholder={
                    userType === 'business' 
                      ? "e.g., Increase sales, expand customer base, improve marketing..."
                      : "e.g., Find quality local services, discover new restaurants, support local businesses..."
                  }
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="challenges">
                  {userType === 'business' ? 'What challenges are you facing?' : 'What challenges do you face when finding local businesses?'}
                </Label>
                <Textarea
                  id="challenges"
                  value={formData.challenges}
                  onChange={(e) => handleInputChange('challenges', e.target.value)}
                  placeholder={
                    userType === 'business'
                      ? "e.g., Competition, customer acquisition, marketing budget..."
                      : "e.g., Finding reliable reviews, discovering hidden gems, comparing options..."
                  }
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Launch</h2>
              <p className="text-muted-foreground">Review your information and start your AI analysis</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <strong>User Type:</strong> {userType}
                </div>
                {userType === 'business' && (
                  <>
                    <div>
                      <strong>Business:</strong> {formData.businessName}
                    </div>
                    <div>
                      <strong>Industry:</strong> {formData.industry}
                    </div>
                    <div>
                      <strong>Location:</strong> {formData.location}
                    </div>
                  </>
                )}
                {userType === 'consumer' && (
                  <div>
                    <strong>Location:</strong> {formData.location}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const isCreating = isCreatingBusiness || isCreatingConsumer;

  return (
    <>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-muted-foreground">
                    Step {currentStep} of {totalSteps}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <Card className="shadow-lg">
                <CardContent className="p-8">
                  {renderStep()}

                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep === 1}
                    >
                      Previous
                    </Button>
                    {currentStep === totalSteps ? (
                      <Button 
                        onClick={handleLaunch}
                        disabled={isCreating}
                      >
                        {isCreating ? "Processing..." : "Launch Dashboard"}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        disabled={currentStep === 1 && !userType}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default Wizard;
