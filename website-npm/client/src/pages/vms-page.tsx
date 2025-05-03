import { useState, useEffect } from "react";
import SidebarNav from "@/components/layout/sidebar-nav";
import MobileHeader from "@/components/layout/mobile-header";
import { useQuery } from "@tanstack/react-query";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function VmsPage() {
  const [isCreateVmOpen, setIsCreateVmOpen] = useState(false);

  const { data: vms, isLoading } = useQuery({
    queryKey: ['/api/vms'],
  });

  useEffect(() => {
    document.title = "VM Management - RAMLUCK-CLOUD";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarNav activePath="/vms" />
      <MobileHeader />

      <div className="lg:pl-64 pt-0 lg:pt-0">
        <div className="max-w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Virtual Machine Management</h1>
            <Button onClick={() => setIsCreateVmOpen(true)}>
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
              Create VM
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>VM Name</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Resources</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vms && vms.length > 0 ? (
                    vms.map((vm) => (
                      <TableRow key={vm.id}>
                        <TableCell className="font-medium">{vm.name}</TableCell>
                        <TableCell>{vm.ipAddress}</TableCell>
                        <TableCell>{vm.host}</TableCell>
                        <TableCell>
                          <div className="text-xs text-gray-500">
                            CPU: {vm.cpu} cores | RAM: {vm.memory}GB | Storage: {vm.storage}GB
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={vm.status === 'running' ? 'success' : 
                                   vm.status === 'stopped' ? 'default' : 'destructive'}
                          >
                            {vm.status === 'running' ? 'Running' : 
                             vm.status === 'stopped' ? 'Stopped' : 'Error'}
                          </Badge>
                        </TableCell>
                        <TableCell>{vm.os}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center space-x-2">
                            {vm.status === 'running' ? (
                              <Button variant="outline" size="icon" title="Stop VM">
                                <PowerOff className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button variant="outline" size="icon" title="Start VM">
                                <Power className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="outline" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No virtual machines found. Create your first VM to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          <Dialog open={isCreateVmOpen} onOpenChange={setIsCreateVmOpen}>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create New Virtual Machine</DialogTitle>
                <DialogDescription>
                  Configure the settings for your new virtual machine.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-gray-500">VM creation form will be implemented here.</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
