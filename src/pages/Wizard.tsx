import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [generalHelp, setGeneralHelp] = useState("");
  const [analysisType, setAnalysisType] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    industry: "",
    location: "",
    description: "",
    goalDescription: "",
    typesOfService: [] as string[],
    consumerLocation: "",
    lookingFor: ""
  });

  const { user } = useAuth();
  const { createBusiness, isCreating: isCreatingBusiness } = useBusinesses();
  const { createConsumerData, isCreating: isCreatingConsumer } = useConsumers();
  const navigate = useNavigate();

  // Different total steps for business vs consumer
  const getTotalSteps = () => userType === 'consumer' ? 4 : 5;
  const totalSteps = getTotalSteps();
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

  const handleServiceTypeChange = (serviceType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      typesOfService: checked 
        ? [...prev.typesOfService, serviceType]
        : prev.typesOfService.filter(type => type !== serviceType)
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
        generalHelp: generalHelp,
        analysisType: analysisType,
        goalDescription: formData.goalDescription
      });
    } else if (userType === 'consumer') {
      createConsumerData({
        preferences: {
          location: formData.consumerLocation,
          typesOfService: formData.typesOfService,
        },
        generalHelp: formData.lookingFor,
        analysisType: "consumer-search",
        goalDescription: formData.lookingFor
      });
    }
    
    navigate('/dashboard');
  };

  const serviceOptions = [
    "Retail",
    "Food", 
    "Personal Service",
    "Home & Repair",
    "Health",
    "Family/ Pet",
    "Tech",
    "Event/ Entertainment"
  ];

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
        if (userType === 'consumer') {
          return (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Service Preferences</h2>
                <p className="text-muted-foreground">Tell us what you're looking for</p>
              </div>
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-4 block">Types of Service *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {serviceOptions.map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={service}
                          checked={formData.typesOfService.includes(service)}
                          onCheckedChange={(checked) => handleServiceTypeChange(service, checked as boolean)}
                        />
                        <Label htmlFor={service} className="text-sm font-normal">
                          {service}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="consumerLocation" className="text-base font-medium">Your Location (City, State) *</Label>
                  <Input
                    id="consumerLocation"
                    value={formData.consumerLocation}
                    onChange={(e) => handleInputChange('consumerLocation', e.target.value)}
                    placeholder="Enter your city and state"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Additional Help</h2>
                <p className="text-muted-foreground">Do you need any general assistance?</p>
              </div>
              <div className="max-w-md mx-auto">
                <Label htmlFor="generalHelp">General Help Options</Label>
                <Select value={generalHelp} onValueChange={setGeneralHelp}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general-help">General Help</SelectItem>
                    <SelectItem value="no-other-help">No Other Help</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        }

      case 3:
        if (userType === 'consumer') {
          return (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">What are you looking for?</h2>
                <p className="text-muted-foreground">Tell us more about what you need</p>
              </div>
              <div>
                <Label htmlFor="lookingFor">Describe what you're looking for *</Label>
                <Textarea
                  id="lookingFor"
                  value={formData.lookingFor}
                  onChange={(e) => handleInputChange('lookingFor', e.target.value)}
                  placeholder="Describe the specific service or product you're looking for..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
          );
        } else {
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
        }

      case 4:
        if (userType === 'consumer') {
          return (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Ready to Launch</h2>
                <p className="text-muted-foreground">Review your information and start your search</p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <strong>User Type:</strong> {userType}
                  </div>
                  <div>
                    <strong>Location:</strong> {formData.consumerLocation}
                  </div>
                  <div>
                    <strong>Services of Interest:</strong> {formData.typesOfService.join(', ') || 'None selected'}
                  </div>
                  <div>
                    <strong>Looking for:</strong> {formData.lookingFor || 'Not specified'}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        } else {
          return (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Analysis & Goals</h2>
                <p className="text-muted-foreground">Choose your analysis type and describe your goals</p>
              </div>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="analysisType">Analysis Type</Label>
                  <Select value={analysisType} onValueChange={setAnalysisType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select analysis type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="generate-promotions">Generate Promotions</SelectItem>
                      <SelectItem value="sale-analysis">Sale Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="goalDescription">What is Goal?</Label>
                  <Textarea
                    id="goalDescription"
                    value={formData.goalDescription}
                    onChange={(e) => handleInputChange('goalDescription', e.target.value)}
                    placeholder="Describe your specific goal or objective..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          );
        }

      case 5:
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
                <div>
                  <strong>General Help:</strong> {generalHelp || 'Not selected'}
                </div>
                <div>
                  <strong>Analysis Type:</strong> {analysisType || 'Not selected'}
                </div>
                <div>
                  <strong>Goal:</strong> {formData.goalDescription || 'Not specified'}
                </div>
                <div>
                  <strong>Business:</strong> {formData.businessName}
                </div>
                <div>
                  <strong>Industry:</strong> {formData.industry}
                </div>
                <div>
                  <strong>Location:</strong> {formData.location}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const isCreating = isCreatingBusiness || isCreatingConsumer;

  const getNextButtonDisabled = () => {
    switch (currentStep) {
      case 1:
        return !userType;
      case 2:
        if (userType === 'consumer') {
          return formData.typesOfService.length === 0 || !formData.consumerLocation;
        } else {
          return !generalHelp;
        }
      case 3:
        if (userType === 'consumer') {
          return !formData.lookingFor;
        }
        return false;
      case 4:
        if (userType === 'business') {
          return !analysisType || !formData.goalDescription;
        }
        return false;
      default:
        return false;
    }
  };

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
                        disabled={getNextButtonDisabled()}
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
