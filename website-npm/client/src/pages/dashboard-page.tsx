import { useEffect } from "react";
import SidebarNav from "@/components/layout/sidebar-nav";
import MobileHeader from "@/components/layout/mobile-header";
import StatusOverview from "@/components/dashboard/status-overview";
import HostStatusChart from "@/components/dashboard/host-status-chart";
import RecentActivity from "@/components/dashboard/recent-activity";
import HostsOverview from "@/components/dashboard/hosts-overview";
import { useLocation } from "wouter";

export default function DashboardPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Dashboard - RAMLUCK-CLOUD";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav activePath="/" />
      <MobileHeader />

      <div className="lg:pl-64 pt-0 lg:pt-0">
        <div className="max-w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">Last updated: 5 minutes ago</span>
              <button 
                className="p-2 rounded-md hover:bg-muted"
                onClick={() => window.location.reload()}
              >
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
                  className="text-muted-foreground"
                >
                  <path d="M21 2v6h-6"></path>
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                  <path d="M3 22v-6h6"></path>
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                </svg>
              </button>
            </div>
          </div>

          <StatusOverview />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-lg shadow-sm border p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-card-foreground mb-4">Host Status Overview</h2>
              <HostStatusChart />
            </div>

            <RecentActivity />
          </div>

          <HostsOverview onAddHost={() => setLocation('/hosts')} />
        </div>
      </div>
    </div>
  );
}
