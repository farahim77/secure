
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Shield, Users, Monitor, AlertTriangle, CheckCircle } from "lucide-react";

export function RecentActivity() {
  const activities = [
    {
      id: "1",
      action: "Clipboard item copied",
      user: "john.doe@company.com",
      details: "Code snippet - API configuration",
      timestamp: "2 minutes ago",
      status: "success",
      device: "MacBook Pro"
    },
    {
      id: "2",
      action: "Security policy updated",
      user: "admin@company.com",
      details: "Domain blocking rules modified",
      timestamp: "15 minutes ago",
      status: "info",
      device: "Windows Desktop"
    },
    {
      id: "3",
      action: "Unauthorized paste attempt",
      user: "jane.smith@company.com",
      details: "Blocked paste to external website",
      timestamp: "32 minutes ago",
      status: "warning",
      device: "iPhone 15"
    },
    {
      id: "4",
      action: "Team member added",
      user: "admin@company.com",
      details: "mike.wilson@company.com joined dev-team",
      timestamp: "1 hour ago",
      status: "success",
      device: "Web Browser"
    },
    {
      id: "5",
      action: "Encryption key rotated",
      user: "system",
      details: "Scheduled RSA key rotation completed",
      timestamp: "3 hours ago",
      status: "info",
      device: "Server"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case "info":
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <Copy className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      success: "bg-green-100 text-green-800",
      warning: "bg-orange-100 text-orange-800",
      info: "bg-blue-100 text-blue-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className="mt-1">
                  {getStatusIcon(activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                    <Badge className={getStatusBadge(activity.status)}>
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-1">{activity.details}</p>
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span>{activity.device}</span>
                    <span>•</span>
                    <span>{activity.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
