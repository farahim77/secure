
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Copy, Lock, Users, Clock, AlertTriangle } from "lucide-react";
import { ClipboardItem } from "@/components/ClipboardItem";
import { SecurityMetrics } from "@/components/SecurityMetrics";
import { RecentActivity } from "@/components/RecentActivity";

export function ClipboardDashboard() {
  const [clipboardItems] = useState([
    {
      id: "1",
      content: "const apiKey = 'sk-1234567890abcdef';",
      type: "code",
      timestamp: "2 minutes ago",
      encrypted: true,
      sharedWith: ["dev-team"],
      classification: "sensitive"
    },
    {
      id: "2",
      content: "Meeting notes: Q4 security review scheduled for...",
      type: "text",
      timestamp: "15 minutes ago",
      encrypted: true,
      sharedWith: ["security-team"],
      classification: "confidential"
    },
    {
      id: "3",
      content: "Password: TempPass123!@#",
      type: "password",
      timestamp: "1 hour ago",
      encrypted: true,
      sharedWith: ["admin-team"],
      classification: "restricted"
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Active Clips</CardTitle>
            <Copy className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">23</div>
            <p className="text-xs text-blue-600">+3 from last hour</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Encrypted Items</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">100%</div>
            <p className="text-xs text-green-600">All items secured</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Team Members</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">12</div>
            <p className="text-xs text-purple-600">8 online now</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Security Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">2</div>
            <p className="text-xs text-orange-600">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="clipboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clipboard">Clipboard Items</TabsTrigger>
          <TabsTrigger value="metrics">Security Metrics</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="clipboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Active Clipboard Items
                <Button size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  New Clip
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {clipboardItems.map((item) => (
                    <ClipboardItem key={item.id} item={item} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <SecurityMetrics />
        </TabsContent>

        <TabsContent value="activity">
          <RecentActivity />
        </TabsContent>
      </Tabs>
    </div>
  );
}
