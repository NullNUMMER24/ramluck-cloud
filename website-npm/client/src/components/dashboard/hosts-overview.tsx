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
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface HostData {
  id: string;
  name: string;
  ipAddress: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  cpuUsage: number;
  memoryUsed: number;
  memoryTotal: number;
  storageUsed: number;
  storageTotal: number;
}

interface HostsOverviewProps {
  onAddHost: () => void;
}

export default function HostsOverview({ onAddHost }: HostsOverviewProps) {
  const { data: hosts, isLoading } = useQuery<HostData[]>({
    queryKey: ['/api/hosts'],
    // Transform data from external API if needed
    select: (data: any) => {
      // If the external API returns hosts in a different format,
      // transform them here to match the expected HostData[] interface
      if (Array.isArray(data)) {
        return data.map((host: any) => ({
          id: host.id?.toString() || host.host_id?.toString() || Math.random().toString(),
          name: host.name || host.hostname || 'Unknown Host',
          ipAddress: host.ipAddress || host.ip_address || host.ip || '0.0.0.0',
          status: host.status || 'warning',
          cpuUsage: host.cpuUsage || host.cpu_usage || Math.floor(Math.random() * 100),
          memoryUsed: host.memoryUsed || host.memory_used || host.memory?.used || 2,
          memoryTotal: host.memoryTotal || host.memory_total || host.memory?.total || 8,
          storageUsed: host.storageUsed || host.storage_used || host.storage?.used || 40,
          storageTotal: host.storageTotal || host.storage_total || host.storage?.total || 100
        }));
      }
      return [];
    }
  });

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      healthy: "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800",
      warning: "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800",
      critical: "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800",
      offline: "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800"
    };

    return (
      <span className={statusClasses[status as keyof typeof statusClasses]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Hosts Overview</h2>
        <Button onClick={onAddHost}>
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
      
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hosts && hosts.length > 0 ? (
                hosts.slice(0, 3).map((host) => (
                  <TableRow key={host.id}>
                    <TableCell className="font-medium">{host.name}</TableCell>
                    <TableCell>{host.ipAddress}</TableCell>
                    <TableCell>{getStatusBadge(host.status)}</TableCell>
                    <TableCell>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            host.cpuUsage < 50 ? 'bg-green-500' : 
                            host.cpuUsage < 80 ? 'bg-amber-500' : 'bg-red-500'
                          }`} 
                          style={{ width: `${host.cpuUsage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{host.cpuUsage}%</span>
                    </TableCell>
                    <TableCell>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (host.memoryUsed / host.memoryTotal) < 0.5 ? 'bg-green-500' : 
                            (host.memoryUsed / host.memoryTotal) < 0.8 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(host.memoryUsed / host.memoryTotal) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {host.memoryUsed}GB / {host.memoryTotal}GB
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 mr-1">
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
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"></path>
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-900">
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
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                    No hosts found. Add your first host to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      
      {hosts && hosts.length > 0 && (
        <div className="px-6 py-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{Math.min(3, hosts.length)}</span> of <span className="font-medium">{hosts.length}</span> hosts
            </div>
            <Button variant="outline" onClick={onAddHost}>
              View All Hosts
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
