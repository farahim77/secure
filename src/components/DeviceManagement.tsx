import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Smartphone, Monitor, Laptop, Shield, AlertTriangle, CheckCircle, X, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { realTimeApi } from "@/services/realTimeApi";
import { useAuth } from "@/hooks/useAuth";

interface Device {
  id: string;
  name: string;
  type: string;
  platform: string;
  lastActive: string;
  lastClipboardSync: string | null;
  status: string;
  createdAt: string;
  publicKeyFingerprint: string;
  clipboardCount: number;
}

// Type guard function for Device array
const isDeviceArray = (data: unknown): data is Device[] => {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' && 
    item !== null &&
    'id' in item &&
    'name' in item &&
    'type' in item &&
    'platform' in item &&
    'status' in item
  );
};

export function DeviceManagement() {
  const { toast } = useToast();
  const { session } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.access_token) {
      realTimeApi.setToken(session.access_token);
      loadDevices();
    }
  }, [session]);

  const loadDevices = async () => {
    setIsLoading(true);
    try {
      const response = await realTimeApi.getDevices();
      if (response.success && response.data && isDeviceArray(response.data)) {
        setDevices(response.data);
      } else {
        setDevices([]);
      }
    } catch (error) {
      console.error('Failed to load devices:', error);
      setDevices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    try {
      const response = await realTimeApi.revokeDevice(deviceId);
      if (response.success) {
        toast({
          title: "Device revoked",
          description: "Device access has been revoked successfully.",
        });
        loadDevices();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: "Revocation failed",
        description: "Failed to revoke device access",
        variant: "destructive"
      });
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'desktop':
        return <Monitor className="w-5 h-5" />;
      case 'laptop':
      case 'browser':
        return <Laptop className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatLastActive = (lastActive: string) => {
    const date = new Date(lastActive);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading devices...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Device Management</h2>
          <p className="text-slate-600">Monitor and manage all connected devices</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          <Shield className="w-4 h-4 mr-2" />
          Refresh Devices
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              Active Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devices.filter(d => d.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <X className="w-4 h-4 mr-2 text-red-600" />
              Inactive Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devices.filter(d => d.status === 'inactive').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="w-4 h-4 mr-2 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devices.filter(d => {
                const lastActive = new Date(d.lastActive);
                const now = new Date();
                return (now.getTime() - lastActive.getTime()) < (24 * 60 * 60 * 1000);
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
              Total Syncs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devices.reduce((sum, d) => sum + d.clipboardCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead>Clipboard Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {getDeviceIcon(device.type)}
                      <div>
                        <p className="font-medium">{device.name}</p>
                        <p className="text-sm text-slate-600">
                          Key: {device.publicKeyFingerprint}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{device.platform}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {formatLastActive(device.lastActive)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {device.lastClipboardSync 
                        ? formatLastActive(device.lastClipboardSync)
                        : 'Never'
                      }
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{device.clipboardCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(device.status)}>
                      {device.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {device.status === 'active' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleRevokeDevice(device.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
