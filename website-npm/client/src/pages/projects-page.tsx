import { useState, useEffect } from "react";
import SidebarNav from "@/components/layout/sidebar-nav";
import MobileHeader from "@/components/layout/mobile-header";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

import { Project } from "@shared/schema";

export default function ProjectsPage() {
  const { toast } = useToast();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const toggleBillingMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number, enabled: boolean }) => {
      const res = await apiRequest(
        "PATCH",
        `/api/projects/${id}/billing`,
        { enabled }
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Success",
        description: "Project billing status updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update billing status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    document.title = "Project Management - RAMLUCK-CLOUD";
  }, []);

  const handleToggleBilling = (id: number, currentStatus: boolean) => {
    toggleBillingMutation.mutate({ id, enabled: !currentStatus });
  };

  const openProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setIsDetailsOpen(true);
  };

  const getProjectTypeLabel = (type: string) => {
    switch(type) {
      case "website":
        return "Website";
      case "application":
        return "Application";
      case "nerd":
        return "Nerd Modus";
      default:
        return type;
    }
  };

  const getProjectTypeIcon = (type: string) => {
    switch(type) {
      case "website":
        return (
          <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="M2 10h20" />
              <path d="M6 2v4" />
              <path d="M18 2v4" />
            </svg>
          </div>
        );
      case "application":
        return (
          <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 17V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
              <path d="M12 10h.01" />
              <path d="M12 14h.01" />
              <path d="M16 10h.01" />
              <path d="M16 14h.01" />
              <path d="M8 10h.01" />
              <path d="M8 14h.01" />
            </svg>
          </div>
        );
      case "nerd":
        return (
          <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m18 16 4-4-4-4" />
              <path d="m6 8-4 4 4 4" />
              <path d="m14.5 4-5 16" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav activePath="/projects" />
      <MobileHeader />

      <div className="lg:pl-64 pt-0 lg:pt-0">
        <div className="max-w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-card-foreground">Project Management</h1>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects && projects.map((project) => (
                <Card key={project.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getProjectTypeIcon(project.type)}
                        <CardTitle>{project.name}</CardTitle>
                      </div>
                      <Badge variant={project.billingEnabled ? "success" : "outline"}>
                        {project.billingEnabled ? 'Billing Enabled' : 'Billing Disabled'}
                      </Badge>
                    </div>
                    <CardDescription>
                      {project.description || "No description available"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium text-card-foreground">{getProjectTypeLabel(project.type)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Users:</span>
                        <span className="font-medium text-card-foreground">{project.estimatedUsers || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium text-card-foreground">{formatDate(project.createdAt)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Billing:</span>
                        <Switch 
                          checked={project.billingEnabled} 
                          onCheckedChange={() => handleToggleBilling(project.id, project.billingEnabled)}
                          disabled={toggleBillingMutation.isPending}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-4">
                    <Button variant="outline" size="sm" onClick={() => openProjectDetails(project)}>
                      View Details
                    </Button>
                    <Button variant="default" size="sm">
                      Manage Resources
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {projects.length === 0 && (
                <div className="col-span-full text-center p-8 border rounded-lg">
                  <p className="text-muted-foreground mb-4">No projects found</p>
                  <p className="text-sm text-muted-foreground">New users will create projects through the customer portal.</p>
                </div>
              )}
            </div>
          )}

          {selectedProject && (
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Project Details</DialogTitle>
                  <DialogDescription>
                    Detailed information about {selectedProject.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Project Name</h3>
                      <p className="text-base">{selectedProject.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Project Type</h3>
                      <p className="text-base">{getProjectTypeLabel(selectedProject.type)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Estimated Users</h3>
                      <p className="text-base">{selectedProject.estimatedUsers || "Not specified"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Downtime Window</h3>
                      <p className="text-base">{selectedProject.allowedDowntime || "Not specified"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Created Date</h3>
                      <p className="text-base">{formatDate(selectedProject.createdAt)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                      <p className="text-base">{formatDate(selectedProject.updatedAt)}</p>
                    </div>
                  </div>
                  
                  {selectedProject.description && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                      <p className="text-base">{selectedProject.description}</p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium">Billing Status</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedProject.billingEnabled 
                            ? "Project is currently being billed" 
                            : "Billing is currently disabled for this project"}
                        </p>
                      </div>
                      <Switch 
                        checked={selectedProject.billingEnabled} 
                        onCheckedChange={() => handleToggleBilling(selectedProject.id, selectedProject.billingEnabled)}
                        disabled={toggleBillingMutation.isPending}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setIsDetailsOpen(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}