import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Define the steps in the onboarding flow
type OnboardingStep = "projectType" | "usageDetails" | "projectSelection" | "billing";

export default function CustomerPortalPage() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("projectType");
  const [progress, setProgress] = useState(25);
  
  // Project type selection state
  const [selectedType, setSelectedType] = useState<"website" | "application" | "nerd" | null>(null);
  
  // Function to handle redirecting to dashboard
  const navigateToDashboard = () => {
    setLocation("/dashboard");
  };
  
  // Usage details state
  const [estimatedUsers, setEstimatedUsers] = useState<number>(1);
  const [allowedDowntime, setAllowedDowntime] = useState<string>("weekends");
  
  // Project selection state
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isNewProject, setIsNewProject] = useState(true);

  useEffect(() => {
    document.title = "Customer Portal - RAMLUCK-CLOUD";
    
    // If user is not new or not logged in, redirect
    if (user && user.isNewUser === false) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  // Update progress based on current step
  useEffect(() => {
    switch(currentStep) {
      case "projectType":
        setProgress(25);
        break;
      case "usageDetails":
        setProgress(50);
        break;
      case "projectSelection":
        setProgress(75);
        break;
      case "billing":
        setProgress(100);
        break;
    }
  }, [currentStep]);

  // Handle moving to the next step
  const handleNextStep = () => {
    switch(currentStep) {
      case "projectType":
        setCurrentStep("usageDetails");
        break;
      case "usageDetails":
        setCurrentStep("projectSelection");
        break;
      case "projectSelection":
        setCurrentStep("billing");
        break;
      case "billing":
        // Create the project and redirect to dashboard
        navigateToDashboard();
        break;
    }
  };

  // Handle moving to the previous step
  const handlePreviousStep = () => {
    switch(currentStep) {
      case "usageDetails":
        setCurrentStep("projectType");
        break;
      case "projectSelection":
        setCurrentStep("usageDetails");
        break;
      case "billing":
        setCurrentStep("projectSelection");
        break;
    }
  };

  // Project Type Selection Component
  const ProjectTypeSelection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">What would you like to create?</h2>
      <p className="text-muted-foreground">Select the type of project you want to set up on RAMLUCK-CLOUD.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Website Option */}
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${selectedType === "website" ? "border-primary bg-primary/5" : ""}`}
          onClick={() => setSelectedType("website")}
        >
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-300">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="M2 10h20" />
                <path d="M6 2v4" />
                <path d="M18 2v4" />
              </svg>
            </div>
            <CardTitle>Website</CardTitle>
            <CardDescription>
              Host a static or dynamic website with custom domain support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Custom domain support
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                SSL certificates
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                CDN integration
              </li>
            </ul>
          </CardContent>
        </Card>
        
        {/* Application Option */}
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${selectedType === "application" ? "border-primary bg-primary/5" : ""}`}
          onClick={() => setSelectedType("application")}
        >
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-300">
                <path d="M4 17V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
                <path d="M12 10h.01" />
                <path d="M12 14h.01" />
                <path d="M16 10h.01" />
                <path d="M16 14h.01" />
                <path d="M8 10h.01" />
                <path d="M8 14h.01" />
              </svg>
            </div>
            <CardTitle>Application</CardTitle>
            <CardDescription>
              Deploy a fullstack application with database support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Database integration
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Scaling support
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                CI/CD deployment
              </li>
            </ul>
          </CardContent>
        </Card>
        
        {/* Nerd Mode Option */}
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${selectedType === "nerd" ? "border-primary bg-primary/5" : ""}`}
          onClick={() => setSelectedType("nerd")}
        >
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-300">
                <path d="m18 16 4-4-4-4" />
                <path d="m6 8-4 4 4 4" />
                <path d="m14.5 4-5 16" />
              </svg>
            </div>
            <CardTitle>Nerd Modus</CardTitle>
            <CardDescription>
              Full access to servers with complete technical control
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Root access
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Custom software install
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                API access
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Usage Details Component
  const UsageDetailsSelection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tell us about your usage</h2>
      <p className="text-muted-foreground">Help us understand your requirements to recommend the best setup.</p>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Estimated number of users</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 5, 20, 100].map((count) => (
              <Button 
                key={count}
                type="button"
                variant={estimatedUsers === count ? "default" : "outline"}
                onClick={() => setEstimatedUsers(count)}
                className="text-center"
              >
                {count === 1 ? 'Just me' : 
                 count === 5 ? 'Small team' : 
                 count === 20 ? 'Medium org' : 
                 'Large org'}
                <span className="block text-xs text-muted-foreground mt-1">
                  {count === 1 ? '1 user' : 
                   count === 5 ? '2-10 users' : 
                   count === 20 ? '11-50 users' : 
                   '50+ users'}
                </span>
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-lg font-medium">When is downtime acceptable?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'never', label: 'Never', desc: '99.9% uptime' },
              { id: 'weekends', label: 'Weekends', desc: 'Business hours priority' },
              { id: 'anytime', label: 'Anytime', desc: 'Non-critical use' }
            ].map((option) => (
              <Button 
                key={option.id}
                type="button"
                variant={allowedDowntime === option.id ? "default" : "outline"}
                onClick={() => setAllowedDowntime(option.id)}
                className="text-center justify-center"
              >
                <div>
                  {option.label}
                  <span className="block text-xs text-muted-foreground mt-1">
                    {option.desc}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Project Selection Component
  const ProjectSelectionComponent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Select or Create a Project</h2>
      <p className="text-muted-foreground">Choose an existing project or create a new one.</p>
      
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant={isNewProject ? "default" : "outline"}
            onClick={() => setIsNewProject(true)}
          >
            Create New Project
          </Button>
          <Button 
            variant={!isNewProject ? "default" : "outline"}
            onClick={() => setIsNewProject(false)}
          >
            Select Existing Project
          </Button>
        </div>
        
        {isNewProject ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="project-name" className="block text-sm font-medium">
                Project Name
              </label>
              <input
                type="text"
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="My Awesome Project"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="project-description" className="block text-sm font-medium">
                Project Description
              </label>
              <textarea
                id="project-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Briefly describe your project"
              />
            </div>
          </div>
        ) : (
          <div className="border rounded-md p-6 text-center">
            <p className="text-muted-foreground">No existing projects found.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setIsNewProject(true)}
            >
              Create New Project Instead
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // Billing Component
  const BillingComponent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Review and Complete</h2>
      <p className="text-muted-foreground">Review your selection and proceed to setup.</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Project Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Project Type</h3>
                <p className="text-base">{selectedType ? `${selectedType.charAt(0).toUpperCase()}${selectedType.slice(1)}` : "Not selected"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Estimated Users</h3>
                <p className="text-base">
                  {estimatedUsers === 1 ? 'Just me (1 user)' : 
                   estimatedUsers === 5 ? 'Small team (2-10 users)' : 
                   estimatedUsers === 20 ? 'Medium org (11-50 users)' : 
                   'Large org (50+ users)'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Allowed Downtime</h3>
                <p className="text-base">
                  {allowedDowntime === 'never' ? 'Never (99.9% uptime)' : 
                   allowedDowntime === 'weekends' ? 'Weekends (Business hours priority)' : 
                   'Anytime (Non-critical use)'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Project Name</h3>
                <p className="text-base">{projectName || "Not specified"}</p>
              </div>
            </div>
            
            {projectDescription && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Project Description</h3>
                <p className="text-base">{projectDescription}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 border-t">
          <div className="space-y-2 w-full">
            <div className="flex justify-between text-sm">
              <span>Estimated monthly cost:</span>
              <span className="font-medium">$29.99</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Final costs will be calculated based on actual resource usage.
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );

  // Render the appropriate step component
  const renderStepContent = () => {
    switch(currentStep) {
      case "projectType":
        return <ProjectTypeSelection />;
      case "usageDetails":
        return <UsageDetailsSelection />;
      case "projectSelection":
        return <ProjectSelectionComponent />;
      case "billing":
        return <BillingComponent />;
      default:
        return <ProjectTypeSelection />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-4 py-6 sm:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="font-bold text-xl text-card-foreground">RAMLUCK-CLOUD</div>
          <div className="text-sm text-muted-foreground">
            {user ? `Logged in as ${user.username}` : "Not logged in"}
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        <div className="max-w-3xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8 flex flex-col flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome to RAMLUCK-CLOUD</h1>
            <p className="text-muted-foreground text-lg">Let's set up your cloud environment in a few easy steps.</p>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex-1 mb-8">
            {renderStepContent()}
          </div>
          
          <div className="flex justify-between mt-auto pt-6 border-t">
            <Button 
              type="button" 
              variant="outline"
              onClick={handlePreviousStep}
              disabled={currentStep === "projectType"}
            >
              Back
            </Button>
            
            <Button 
              type="button"
              onClick={handleNextStep}
              disabled={
                (currentStep === "projectType" && !selectedType) ||
                (currentStep === "projectSelection" && isNewProject && !projectName)
              }
            >
              {currentStep === "billing" ? "Complete Setup" : "Continue"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}