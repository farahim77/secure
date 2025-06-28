
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Shield, Bell, X, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  type: "security" | "policy" | "system" | "compliance";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  timestamp: string;
  status: "active" | "acknowledged" | "resolved";
  user?: string;
  action?: string;
}

export function RealTimeAlerts() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      type: "security",
      severity: "high",
      title: "Suspicious Paste Activity Detected",
      description: "Multiple attempts to paste sensitive data to unauthorized domains from john.doe@company.com",
      timestamp: "2024-01-15 14:45:30",
      status: "active",
      user: "john.doe@company.com"
    },
    {
      id: "2",
      type: "policy",
      severity: "medium",
      title: "Domain Blacklist Violation",
      description: "User attempted to paste clipboard content to pastebin.com which is blacklisted",
      timestamp: "2024-01-15 14:32:15",
      status: "active",
      user: "jane.smith@company.com"
    },
    {
      id: "3",
      type: "system",
      severity: "critical",
      title: "Encryption Key Rotation Failed",
      description: "Automatic key rotation process encountered an error and requires manual intervention",
      timestamp: "2024-01-15 14:18:45",
      status: "active"
    },
    {
      id: "4",
      type: "compliance",
      severity: "medium",
      title: "GDPR Data Retention Warning",
      description: "5 clipboard entries are approaching the maximum retention period",
      timestamp: "2024-01-15 14:05:12",
      status: "acknowledged"
    }
  ]);

  const [alertSettings, setAlertSettings] = useState({
    realTimeNotifications: true,
    emailAlerts: true,
    slackIntegration: false,
    severityFilter: "medium" as "low" | "medium" | "high" | "critical"
  });

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, status: "acknowledged" } : alert
    ));
    toast({
      title: "Alert acknowledged",
      description: "The alert has been marked as acknowledged.",
    });
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, status: "resolved" } : alert
    ));
    toast({
      title: "Alert resolved",
      description: "The alert has been marked as resolved.",
    });
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
    toast({
      title: "Alert dismissed",
      description: "The alert has been dismissed.",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-600 bg-red-100 border-red-200";
      case "high": return "text-orange-600 bg-orange-100 border-orange-200";
      case "medium": return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "low": return "text-blue-600 bg-blue-100 border-blue-200";
      default: return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "security": return <Shield className="w-5 h-5" />;
      case "policy": return <AlertTriangle className="w-5 h-5" />;
      case "system": return <Bell className="w-5 h-5" />;
      case "compliance": return <CheckCircle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "acknowledged": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "resolved": return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const activeAlerts = alerts.filter(alert => alert.status === "active");
  const acknowledgedAlerts = alerts.filter(alert => alert.status === "acknowledged");
  const resolvedAlerts = alerts.filter(alert => alert.status === "resolved");

  // Simulate real-time alerts
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) { // 5% chance every 5 seconds
        const newAlert: Alert = {
          id: Date.now().toString(),
          type: ["security", "policy", "system", "compliance"][Math.floor(Math.random() * 4)] as any,
          severity: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as any,
          title: "Real-time Alert",
          description: "This is a simulated real-time alert",
          timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
          status: "active"
        };
        setAlerts(prev => [newAlert, ...prev]);
        
        if (alertSettings.realTimeNotifications) {
          toast({
            title: "New Security Alert",
            description: newAlert.title,
            variant: newAlert.severity === "high" || newAlert.severity === "critical" ? "destructive" : "default"
          });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [alertSettings.realTimeNotifications, toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Real-Time Security Alerts</h2>
          <p className="text-slate-600">Monitor and respond to security events in real-time</p>
        </div>
        <div className="flex space-x-2">
          <Badge variant="destructive" className="animate-pulse">
            {activeAlerts.length} Active
          </Badge>
          <Badge variant="default">
            {acknowledgedAlerts.length} Pending
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {alerts.filter(a => a.severity === "critical").length}
            </div>
            <p className="text-xs text-red-600">Immediate attention required</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">High Priority</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {alerts.filter(a => a.severity === "high").length}
            </div>
            <p className="text-xs text-orange-600">Security incidents</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Medium Priority</CardTitle>
            <Bell className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">
              {alerts.filter(a => a.severity === "medium").length}
            </div>
            <p className="text-xs text-yellow-600">Policy violations</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {resolvedAlerts.length}
            </div>
            <p className="text-xs text-green-600">Successfully handled</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {activeAlerts.map((alert) => (
                    <div key={alert.id} className={`p-4 border-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`mt-1 ${getSeverityColor(alert.severity).split(' ')[0]}`}>
                            {getTypeIcon(alert.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium">{alert.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {alert.type.toUpperCase()}
                              </Badge>
                              <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"} className="text-xs">
                                {alert.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-700 mb-2">{alert.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-slate-600">
                              <span>{alert.timestamp}</span>
                              {alert.user && <span>User: {alert.user}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {getStatusIcon(alert.status)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <Clock className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissAlert(alert.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {activeAlerts.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <p>No active alerts. System is secure.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Alert Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="real-time">Real-time Notifications</Label>
                  <Switch
                    id="real-time"
                    checked={alertSettings.realTimeNotifications}
                    onCheckedChange={(checked) => 
                      setAlertSettings(prev => ({ ...prev, realTimeNotifications: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="email">Email Alerts</Label>
                  <Switch
                    id="email"
                    checked={alertSettings.emailAlerts}
                    onCheckedChange={(checked) => 
                      setAlertSettings(prev => ({ ...prev, emailAlerts: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="slack">Slack Integration</Label>
                  <Switch
                    id="slack"
                    checked={alertSettings.slackIntegration}
                    onCheckedChange={(checked) => 
                      setAlertSettings(prev => ({ ...prev, slackIntegration: checked }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="severity-filter">Minimum Severity</Label>
                <select 
                  id="severity-filter"
                  value={alertSettings.severityFilter}
                  onChange={(e) => setAlertSettings(prev => ({ 
                    ...prev, 
                    severityFilter: e.target.value as any 
                  }))}
                  className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <Button className="w-full">
                <Bell className="w-4 h-4 mr-2" />
                Test Alert System
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
