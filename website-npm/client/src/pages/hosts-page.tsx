import { useState, useEffect } from "react";
import SidebarNav from "@/components/layout/sidebar-nav";
import MobileHeader from "@/components/layout/mobile-header";
import AddHostDialog from "@/components/hosts/add-host-dialog";
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
import { Input } from "@/components/ui/input";
import { Loader2, Edit, Trash2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function HostsPage() {
  const [isAddHostOpen, setIsAddHostOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: hosts, isLoading } = useQuery({
    queryKey: ['/api/hosts'],
  });

  useEffect(() => {
    document.title = "Host Management - RAMLUCK-CLOUD";
  }, []);

  const filteredHosts = hosts?.filter(host => 
    host.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    host.ipAddress.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarNav activePath="/hosts" />
      <MobileHeader />

      <div className="lg:pl-64 pt-0 lg:pt-0">
        <div className="max-w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Host Management</h1>
            <Button onClick={() => setIsAddHostOpen(true)}>
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
              Add Host
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <div className="relative max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search hosts..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Host Name</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>CPU Usage</TableHead>
                    <TableHead>Memory</TableHead>
                    <TableHead>Storage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHosts && filteredHosts.length > 0 ? (
                    filteredHosts.map((host) => (
                      <TableRow key={host.id}>
                        <TableCell className="font-medium">{host.name}</TableCell>
                        <TableCell>{host.ipAddress}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              host.status === 'healthy' ? 'success' : 
                              host.status === 'warning' ? 'warning' : 
                              host.status === 'critical' ? 'destructive' : 'default'
                            }
                          >
                            {host.status === 'healthy' ? 'Healthy' : 
                             host.status === 'warning' ? 'Warning' : 
                             host.status === 'critical' ? 'Critical' : 'Offline'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="w-full max-w-24">
                            <Progress value={host.cpuUsage} className="h-2" />
                            <span className="text-xs text-gray-500 mt-1">{host.cpuUsage}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-full max-w-24">
                            <Progress value={(host.memoryUsed / host.memoryTotal) * 100} className="h-2" />
                            <span className="text-xs text-gray-500 mt-1">
                              {host.memoryUsed}GB / {host.memoryTotal}GB
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-full max-w-24">
                            <Progress value={(host.storageUsed / host.storageTotal) * 100} className="h-2" />
                            <span className="text-xs text-gray-500 mt-1">
                              {host.storageUsed}GB / {host.storageTotal}GB
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center space-x-2">
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
                        {searchQuery ? 'No hosts match your search.' : 'No hosts found. Add your first host to get started.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          <AddHostDialog 
            isOpen={isAddHostOpen} 
            onClose={() => setIsAddHostOpen(false)} 
          />
        </div>
      </div>
    </div>
  );
}
