import { useState, useEffect } from "react";
import SidebarNav from "@/components/layout/sidebar-nav";
import MobileHeader from "@/components/layout/mobile-header";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
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
} from "@/components/ui/dialog";
import { Loader2, Download, FileEdit, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function OsPage() {
  const [isAddOsOpen, setIsAddOsOpen] = useState(false);

  const { data: operatingSystems, isLoading } = useQuery({
    queryKey: ['/api/operating-systems'],
  });

  useEffect(() => {
    document.title = "OS Management - RAMLUCK-CLOUD";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarNav activePath="/os" />
      <MobileHeader />

      <div className="lg:pl-64 pt-0 lg:pt-0">
        <div className="max-w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Operating System Management</h1>
            <Button onClick={() => setIsAddOsOpen(true)}>
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
              Add OS Template
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {operatingSystems && operatingSystems.map((os) => (
                <Card key={os.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        {os.type === 'linux' ? (
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
                            className="mr-2"
                          >
                            <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"></path>
                            <path d="M10 16H8"></path>
                          </svg>
                        ) : (
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
                            className="mr-2"
                          >
                            <rect x="2" y="3" width="20" height="14" rx="2"></rect>
                            <line x1="8" y1="21" x2="16" y2="21"></line>
                            <line x1="12" y1="17" x2="12" y2="21"></line>
                          </svg>
                        )}
                        {os.name}
                      </CardTitle>
                    </div>
                    <div className="text-sm text-gray-500">
                      {os.version}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Architecture:</span>
                        <span className="font-medium">{os.architecture}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Size:</span>
                        <span className="font-medium">{os.size} GB</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Usage:</span>
                          <span className="font-medium">{os.usage} VMs</span>
                        </div>
                        <Progress value={os.usagePercentage} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive border-destructive">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Deploy
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {/* Add New OS Card */}
              <Card 
                className="bg-white/50 border-2 border-dashed border-gray-300 hover:bg-white/80 transition-colors cursor-pointer"
                onClick={() => setIsAddOsOpen(true)}
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Add New OS Template</h3>
                  <p className="text-sm text-gray-500 text-center">Upload or create a new OS template</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Dialog open={isAddOsOpen} onOpenChange={setIsAddOsOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add OS Template</DialogTitle>
                <DialogDescription>
                  Add a new operating system template to deploy on virtual machines.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-gray-500">OS template form will be implemented here.</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
