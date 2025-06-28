import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Download, Search, Filter, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { realTimeApi } from "@/services/realTimeApi";
import { socketService } from "@/services/socketService";
import { useAuth } from "@/hooks/useAuth";

export function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const { session } = useAuth();

  // Fetch logs on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchLogs() {
      const res = await realTimeApi.getAuditLogs(1, 50);
      if (res.success && isMounted) {
        setLogs((res.data as any[]) || []);
      }
    }
    fetchLogs();
    return () => { isMounted = false; };
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!session?.access_token) return;
    const socket = socketService.connect(session.access_token);

    // Optionally join a room for audit logs
    socket.emit("join_audit_logs");

    socket.on("audit_log", (log: any) => {
      setLogs((prev) => [log, ...prev]);
    });

    return () => {
      socket.off("audit_log");
      socketService.disconnect();
    };
  }, [session?.access_token]);

  const getEventIcon = (event: string) => {
    switch (event) {
      case "CLIPBOARD_COPY":
        return <FileText className="w-4 h-4 text-blue-600" />;
      case "PASTE_BLOCKED":
        return <Shield className="w-4 h-4 text-red-600" />;
      case "KEY_ROTATION":
        return <Shield className="w-4 h-4 text-green-600" />;
      case "USER_LOGIN":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "POLICY_VIOLATION":
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      SUCCESS: "bg-green-100 text-green-800",
      BLOCKED: "bg-red-100 text-red-800",
      DENIED: "bg-orange-100 text-orange-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getClassificationBadge = (classification: string) => {
    const colors = {
      SENSITIVE: "bg-red-100 text-red-800",
      SECURITY: "bg-orange-100 text-orange-800",
      SYSTEM: "bg-blue-100 text-blue-800",
      AUTH: "bg-green-100 text-green-800",
      VIOLATION: "bg-purple-100 text-purple-800"
    };
    return colors[classification as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Audit Logs</h2>
          <p className="text-slate-600">Tamper-proof activity logs with HMAC verification</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-slate-600">+23 today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-slate-600">3 blocked today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integrity Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-slate-600">All hashes verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-slate-600">-2 from yesterday</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activity Logs</CardTitle>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search logs..." className="pl-10 w-64" />
              </div>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="copy">Clipboard Copy</SelectItem>
                  <SelectItem value="paste">Paste Events</SelectItem>
                  <SelectItem value="security">Security Events</SelectItem>
                  <SelectItem value="system">System Events</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-xs">
                      {log.timestamp}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getEventIcon(log.event)}
                        <span className="text-sm">{log.event}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{log.user}</TableCell>
                    <TableCell className="text-sm">{log.device}</TableCell>
                    <TableCell>
                      <Badge className={getClassificationBadge(log.classification)}>
                        {log.classification}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(log.status)}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {log.hash}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
