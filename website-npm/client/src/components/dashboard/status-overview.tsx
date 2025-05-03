import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface StatusCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  change: number;
  changeText: string;
}

const StatusCard = ({ title, value, icon, change, changeText }: StatusCardProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold text-card-foreground">{value}</h3>
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <span className={`text-sm font-medium flex items-center ${
          change >= 0 ? "text-green-500" : "text-red-500"
        }`}>
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
            {change >= 0 ? (
              <polyline points="18 15 12 9 6 15"></polyline>
            ) : (
              <polyline points="6 9 12 15 18 9"></polyline>
            )}
          </svg>
          {Math.abs(change)}%
        </span>
        <span className="text-sm text-muted-foreground ml-2">{changeText}</span>
      </div>
    </CardContent>
  </Card>
);

interface StatusData {
  hosts: {
    total: number;
    change: number;
  };
  vms: {
    active: number;
    change: number;
  };
  users: {
    total: number;
    change: number;
  };
  applications: {
    total: number;
    change: number;
  };
}

export default function StatusOverview() {
  const { data: statusData, isLoading } = useQuery<StatusData>({
    queryKey: ['/api/dashboard/status'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6 flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatusCard
        title="Total Hosts"
        value={statusData?.hosts.total || 0}
        icon={
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
            <rect x="2" y="2" width="20" height="8" rx="2"></rect>
            <rect x="2" y="14" width="20" height="8" rx="2"></rect>
            <line x1="6" y1="6" x2="6.01" y2="6"></line>
            <line x1="6" y1="18" x2="6.01" y2="18"></line>
          </svg>
        }
        change={statusData?.hosts.change || 0}
        changeText="from last week"
      />
      
      <StatusCard
        title="Active VMs"
        value={statusData?.vms.active || 0}
        icon={
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
            className="text-indigo-600"
          >
            <rect x="2" y="2" width="20" height="8" rx="2"></rect>
            <rect x="2" y="14" width="20" height="8" rx="2"></rect>
            <line x1="6" y1="6" x2="6.01" y2="6"></line>
            <line x1="6" y1="18" x2="6.01" y2="18"></line>
          </svg>
        }
        change={statusData?.vms.change || 0}
        changeText="from last week"
      />
      
      <StatusCard
        title="Total Users"
        value={statusData?.users.total || 0}
        icon={
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
            className="text-blue-600"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        }
        change={statusData?.users.change || 0}
        changeText="from last week"
      />
      
      <StatusCard
        title="Applications"
        value={statusData?.applications.total || 0}
        icon={
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
            className="text-purple-600"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6zM3.8 6h16.4M16 10a4 4 0 1 1-8 0"></path>
          </svg>
        }
        change={statusData?.applications.change || 0}
        changeText="from last week"
      />
    </div>
  );
}
