import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Shield, Users, AlertTriangle } from "lucide-react";
import { socketService } from "@/services/socketService";
import { realTimeApi } from "@/services/realTimeApi";
import { useAuth } from "@/hooks/useAuth";

// Define proper interfaces for Flask responses
interface DashboardStats {
  totalDevices: number;
  activeDevices: number;
  totalSyncs: number;
  securityScore: number;
  threatCount: number;
  complianceScore: number;
}

interface FlaskActivity {
  id: string;
  action: string;
  user: string;
  details: string;
  timestamp: string;
  status: string;
  device: string;
}

export function RealTimeDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDevices: 0,
    activeDevices: 0,
    totalSyncs: 0,
    securityScore: 85,
    threatCount: 3,
    complianceScore: 92,
  });

  const [activities, setActivities] = useState<FlaskActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();

  // Load initial dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        realTimeApi.getDashboardStats(),
        realTimeApi.getRecentActivity()
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data as DashboardStats);
      }

      if (activityResponse.success && Array.isArray(activityResponse.data)) {
        setActivities(activityResponse.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup auth + sockets
  useEffect(() => {
    if (!session?.access_token) return;

    realTimeApi.setToken(session.access_token);
    const socket = socketService.connect(session.access_token);

    socketService.joinRoom('dashboard_updates');
    socketService.joinRoom('audit_updates');

    loadDashboardData();

    // Listen for real-time stats update
    socketService.on('dashboard_stats_updated', (newStats: unknown) => {
      if (
        typeof newStats === 'object' &&
        newStats !== null &&
        'totalDevices' in newStats &&
        'activeDevices' in newStats &&
        'totalSyncs' in newStats
      ) {
        setStats(newStats as DashboardStats);
      }
    });

    // Listen for new audit log (activity)
    socketService.on('new_audit_log', (newActivity: unknown) => {
      if (
        typeof newActivity === 'object' &&
        newActivity !== null &&
        'id' in newActivity &&
        'action' in newActivity &&
        'timestamp' in newActivity
      ) {
        const activity = newActivity as FlaskActivity;
        setActivities((prev) => [activity, ...prev.slice(0, 9)]);
      }
    });

    // Optional: Listen for device online/offline
    socketService.on('device_status_changed', (data: any) => {
      if (data.type === 'device_online') {
        setStats((prev) => ({
          ...prev,
          activeDevices: prev.activeDevices + 1,
        }));
      } else if (data.type === 'device_offline') {
        setStats((prev) => ({
          ...prev,
          activeDevices: Math.max(0, prev.activeDevices - 1),
        }));
      }
    });

    return () => {
      socketService.leaveRoom('dashboard_updates');
      socketService.leaveRoom('audit_updates');
      socketService.disconnect();
    };
  }, [session]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-green-100 text-green-800";
      case "blocked":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-50 rounded-lg">
        <p className="text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Devices</CardTitle>
            <Copy className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalDevices}</div>
            <p className="text-xs text-blue-600">Connected devices</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Active Devices</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.activeDevices}</div>
            <p className="text-xs text-green-600">Currently online</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Clipboard Syncs</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.totalSyncs}</div>
            <p className="text-xs text-purple-600">All time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Security Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.securityScore}</div>
            <p className="text-xs text-orange-600">Out of 100</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Compliance Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{stats.complianceScore}</div>
            <p className="text-xs text-yellow-600">GDPR / HIPAA</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No recent activity</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-slate-900">{activity.action || activity.id}</p>
                        <Badge className={getStatusIcon(activity.status)}>
                          {activity.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mb-1">{activity.details}</p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>{activity.user}</span>
                        <span>•</span>
                        <span>{activity.device}</span>
                        <span>•</span>
                        <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}