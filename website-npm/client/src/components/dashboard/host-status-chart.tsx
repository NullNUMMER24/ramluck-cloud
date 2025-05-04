import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Import Chart.js from CDN in index.html
declare global {
  interface Window {
    Chart: any;
  }
}

interface HostStatusData {
  healthy: number;
  warning: number;
  critical: number;
  offline: number;
}

export default function HostStatusChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  const { data: hostStatusData, isLoading } = useQuery<HostStatusData>({
    queryKey: ['/api/dashboard/host-status'],
    // Transform data from external API if needed
    select: (data: any) => {
      // If your external API returns data in a different format,
      // transform it here to match the expected HostStatusData interface
      return {
        healthy: data?.healthy || data?.healthy_hosts || 0,
        warning: data?.warning || data?.warning_hosts || 0,
        critical: data?.critical || data?.critical_hosts || 0,
        offline: data?.offline || data?.offline_hosts || 0
      };
    }
  });

  useEffect(() => {
    // Load Chart.js script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!hostStatusData || !chartRef.current || !window.Chart) return;

    // Clean up previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Healthy', 'Warning', 'Critical', 'Offline'],
        datasets: [{
          data: [
            hostStatusData.healthy,
            hostStatusData.warning,
            hostStatusData.critical,
            hostStatusData.offline
          ],
          backgroundColor: [
            'hsl(var(--chart-1))',
            'hsl(var(--chart-2))',
            'hsl(var(--chart-3))',
            'hsl(var(--chart-4))'
          ],
          borderWidth: 0
        }]
      },
      options: {
        cutout: '70%',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                const label = context.label || '';
                const value = context.formattedValue;
                return `${label}: ${value}`;
              }
            }
          }
        }
      }
    });
  }, [hostStatusData]);

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row items-center justify-center">
        <div className="w-64 h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-center">
      <div className="w-64 h-64 relative">
        <canvas ref={chartRef} width="256" height="256" />
      </div>
      <div className="md:ml-8 mt-6 md:mt-0">
        <ul className="space-y-4">
          <li className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-[hsl(var(--chart-1))] mr-3"></span>
            <span className="text-sm font-medium">
              Healthy ({hostStatusData?.healthy || 0} hosts)
            </span>
          </li>
          <li className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-[hsl(var(--chart-2))] mr-3"></span>
            <span className="text-sm font-medium">
              Warning ({hostStatusData?.warning || 0} hosts)
            </span>
          </li>
          <li className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-[hsl(var(--chart-3))] mr-3"></span>
            <span className="text-sm font-medium">
              Critical ({hostStatusData?.critical || 0} hosts)
            </span>
          </li>
          <li className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-[hsl(var(--chart-4))] mr-3"></span>
            <span className="text-sm font-medium">
              Offline ({hostStatusData?.offline || 0} hosts)
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
