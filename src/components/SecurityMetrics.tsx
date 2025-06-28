
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, AlertTriangle } from "lucide-react";

export function SecurityMetrics() {
  const metrics = [
    {
      title: "Encryption Strength",
      value: 100,
      status: "Excellent",
      description: "AES-256 + RSA-4096",
      icon: Shield,
      color: "text-green-600"
    },
    {
      title: "Access Control Compliance",
      value: 95,
      status: "Very Good",
      description: "RBAC policies active",
      icon: Lock,
      color: "text-blue-600"
    },
    {
      title: "Audit Trail Coverage",
      value: 100,
      status: "Complete",
      description: "All actions logged",
      icon: Eye,
      color: "text-purple-600"
    },
    {
      title: "Policy Enforcement",
      value: 87,
      status: "Good",
      description: "Domain blocking active",
      icon: AlertTriangle,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className={`h-5 w-5 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">{metric.value}%</div>
              <Badge variant="secondary" className={metric.color}>
                {metric.status}
              </Badge>
            </div>
            <Progress value={metric.value} className="mb-2" />
            <p className="text-xs text-slate-600">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Security Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">All systems secure</p>
                <p className="text-xs text-slate-600">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">New device registered</p>
                <p className="text-xs text-slate-600">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Policy violation detected</p>
                <p className="text-xs text-slate-600">1 hour ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
