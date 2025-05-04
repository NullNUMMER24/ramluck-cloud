import { useState, useEffect } from "react";
import SidebarNav from "@/components/layout/sidebar-nav";
import MobileHeader from "@/components/layout/mobile-header";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
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
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

import { Application } from "@shared/schema";

export default function ApplicationsPage() {
  const [isInstallOpen, setIsInstallOpen] = useState(false);

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
    // Transform data from external API if needed
    select: (data: any) => {
      // If the external API returns applications in a different format,
      // transform them here to match the expected Application interface
      if (Array.isArray(data)) {
        return data.map((app: any) => ({
          id: app.id?.toString() || app.application_id?.toString() || Math.random().toString(),
          name: app.name || app.application_name || 'Unknown App',
          description: app.description || app.application_description || '',
          version: app.version || app.application_version || '1.0',
          status: app.status || app.application_status || 'stopped',
          host: app.host || app.host_name || 'localhost',
          port: app.port || app.application_port || 8080,
          installedDate: app.installedDate || app.installed_date || app.created_at || new Date().toISOString(),
          type: app.type || app.application_type || 'web'
        }));
      }
      return [];
    }
  });

  useEffect(() => {
    document.title = "Application Management - RAMLUCK-CLOUD";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav activePath="/applications" />
      <MobileHeader />

      <div className="lg:pl-64 pt-0 lg:pt-0">
        <div className="max-w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-card-foreground">Application Management</h1>
            <Button onClick={() => setIsInstallOpen(true)} className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Install Application
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications && applications.map((app) => (
                <Card key={app.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle>{app.name}</CardTitle>
                      <Badge variant={
                        app.status === 'running' ? 'success' : 
                        app.status === 'stopped' ? 'default' : 'destructive'
                      }>
                        {app.status === 'running' ? 'Running' : 
                         app.status === 'stopped' ? 'Stopped' : 'Error'}
                      </Badge>
                    </div>
                    <CardDescription>{app.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Version:</span>
                        <span className="font-medium text-card-foreground">{app.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Host:</span>
                        <span className="font-medium text-card-foreground">{app.host}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Port:</span>
                        <span className="font-medium text-card-foreground">{app.port}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Installed:</span>
                        <span className="font-medium text-card-foreground">
                          {app.installedDate ? new Date(app.installedDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-4">
                    <Button variant="outline" size="sm">Configure</Button>
                    {app.status === 'running' ? (
                      <Button variant="outline" size="sm">Stop</Button>
                    ) : (
                      <Button variant="default" size="sm">Start</Button>
                    )}
                  </CardFooter>
                </Card>
              ))}

              {/* Install New App Card */}
              <Card 
                className="bg-card/50 border-2 border-dashed border-muted hover:bg-card/80 transition-colors cursor-pointer"
                onClick={() => setIsInstallOpen(true)}
              >
                <CardContent className="flex flex-col items-center justify-center h-full pt-6">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-1">Install New Application</h3>
                  <p className="text-sm text-muted-foreground text-center">Browse available applications</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Dialog open={isInstallOpen} onOpenChange={setIsInstallOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Install Application</DialogTitle>
                <DialogDescription>
                  Browse available applications or upload your own.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-6">
                {/* Search and filter */}
                <div className="flex items-center space-x-2">
                  <Input 
                    placeholder="Search applications..." 
                    className="flex-1"
                    type="search"
                  />
                  <div className="w-[160px]">
                    <p className="text-sm text-muted-foreground">All Categories</p>
                  </div>
                </div>
                
                {/* App catalog grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-1">
                  {/* Database applications */}
                  <Card className="cursor-pointer hover:border-primary transition-colors">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-card-foreground">PostgreSQL</h4>
                        <p className="text-sm text-muted-foreground">v15.3 • Database</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer hover:border-primary transition-colors">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <div className="p-2 rounded-md bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                          <line x1="6" y1="12" x2="18" y2="12"></line>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-card-foreground">MongoDB</h4>
                        <p className="text-sm text-muted-foreground">v6.0 • Database</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Web applications */}
                  <Card className="cursor-pointer hover:border-primary transition-colors">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                          <line x1="6" y1="6" x2="6.01" y2="6"></line>
                          <line x1="6" y1="18" x2="6.01" y2="18"></line>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-card-foreground">Nginx</h4>
                        <p className="text-sm text-muted-foreground">v1.24 • Web Server</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer hover:border-primary transition-colors">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <div className="p-2 rounded-md bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon>
                          <line x1="12" y1="22" x2="12" y2="15.5"></line>
                          <polyline points="22 8.5 12 15.5 2 8.5"></polyline>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-card-foreground">Node.js</h4>
                        <p className="text-sm text-muted-foreground">v18 LTS • Runtime</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* CMS applications */}
                  <Card className="cursor-pointer hover:border-primary transition-colors">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="2" y1="12" x2="22" y2="12"></line>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-card-foreground">WordPress</h4>
                        <p className="text-sm text-muted-foreground">v6.3 • CMS</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer hover:border-primary transition-colors">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <div className="p-2 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <path d="M2 15h10"></path>
                          <path d="M9 18l3-3-3-3"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-card-foreground">Drupal</h4>
                        <p className="text-sm text-muted-foreground">v10.1 • CMS</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Upload option */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-3">Or upload your own application</h3>
                  <div className="border-2 border-dashed border-muted rounded-md p-6 flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mb-2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <p className="text-sm text-muted-foreground mb-2">Drag & drop your application files here</p>
                    <p className="text-xs text-muted-foreground mb-3">Support for .zip, .tar.gz or Dockerfile</p>
                    <Button size="sm" variant="outline">Browse Files</Button>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInstallOpen(false)}>Cancel</Button>
                <Button disabled>Install Selected</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
