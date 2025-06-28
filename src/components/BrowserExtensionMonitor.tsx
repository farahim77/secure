import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Chrome, Globe, Monitor, Shield, AlertTriangle, CheckCircle, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { realTimeApi } from "@/services/realTimeApi";
import { useAuth } from "@/hooks/useAuth";

interface ExtensionStatus {
  isInstalled: boolean;
  version: string;
  lastHeartbeat: string;
  browserType: string;
  permissions: string[];
  status: 'active' | 'inactive' | 'error';
}

interface BrowserActivity {
  id: string;
  timestamp: string;
  domain: string;
  action: string;
  status: string;
  details: string;
}

interface DomainRule {
  id: string;
  domain: string;
  type: 'whitelist' | 'blacklist';
  created_at: string;
  status: 'active' | 'inactive';
}

// Type guard functions
const isExtensionStatus = (data: unknown): data is ExtensionStatus => {
  return typeof data === 'object' && 
    data !== null &&
    'isInstalled' in data &&
    'version' in data &&
    'status' in data;
};

const isBrowserActivityArray = (data: unknown): data is BrowserActivity[] => {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' && 
    item !== null &&
    'id' in item &&
    'timestamp' in item &&
    'domain' in item &&
    'action' in item &&
    'status' in item
  );
};

const isDomainRuleArray = (data: unknown): data is DomainRule[] => {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' && 
    item !== null &&
    'id' in item &&
    'domain' in item &&
    'type' in item &&
    'status' in item
  );
};

export function BrowserExtensionMonitor() {
  const { toast } = useToast();
  const { session } = useAuth();
  const [extensionStatus, setExtensionStatus] = useState<ExtensionStatus>({
    isInstalled: false,
    version: '',
    lastHeartbeat: '',
    browserType: '',
    permissions: [],
    status: 'inactive'
  });
  const [activities, setActivities] = useState<BrowserActivity[]>([]);
  const [domainRules, setDomainRules] = useState<DomainRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [ruleType, setRuleType] = useState<'whitelist' | 'blacklist'>('whitelist');

  useEffect(() => {
    if (session?.access_token) {
      realTimeApi.setToken(session.access_token);
      loadData();
    }
  }, [session]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statusResponse, activitiesResponse, rulesResponse] = await Promise.all([
        realTimeApi.getExtensionStatus(),
        realTimeApi.getBrowserActivities(),
        realTimeApi.getDomainRules()
      ]);

      if (statusResponse.success && statusResponse.data && isExtensionStatus(statusResponse.data)) {
        setExtensionStatus(statusResponse.data);
      }

      if (activitiesResponse.success && activitiesResponse.data && isBrowserActivityArray(activitiesResponse.data)) {
        setActivities(activitiesResponse.data);
      } else {
        setActivities([]);
      }

      if (rulesResponse.success && rulesResponse.data && isDomainRuleArray(rulesResponse.data)) {
        setDomainRules(rulesResponse.data);
      } else {
        setDomainRules([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Load failed",
        description: "Failed to load browser extension data. Make sure Flask API is running.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDomainRule = async () => {
    if (!newDomain.trim()) {
      toast({
        title: "Missing domain",
        description: "Please enter a domain name",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await realTimeApi.addDomainRule(newDomain.trim(), ruleType);
      if (response.success) {
        toast({
          title: "Rule added",
          description: `${newDomain} has been added to ${ruleType}`,
        });
        setNewDomain("");
        loadData();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Add rule error:', error);
      toast({
        title: "Failed to add rule",
        description: error instanceof Error ? error.message : "Could not add domain rule",
        variant: "destructive"
      });
    }
  };

  const handleRemoveDomainRule = async (ruleId: string) => {
    try {
      const response = await realTimeApi.removeDomainRule(ruleId);
      if (response.success) {
        toast({
          title: "Rule removed",
          description: "Domain rule has been removed successfully",
        });
        loadData();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: "Removal failed",
        description: "Failed to remove domain rule",
        variant: "destructive"
      });
    }
  };

  const sendHeartbeat = async () => {
    try {
      const browserType = navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                         navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Unknown';
      const response = await realTimeApi.sendExtensionHeartbeat(browserType, '1.0.0');
      
      if (response.success) {
        toast({
          title: "Heartbeat sent",
          description: "Extension heartbeat sent successfully",
        });
        loadData();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: "Heartbeat failed",
        description: "Failed to send extension heartbeat",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRuleTypeColor = (type: string) => {
    return type === 'whitelist' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getBrowserIcon = (browserType: string) => {
    if (browserType.toLowerCase().includes('chrome')) {
      return <Chrome className="w-4 h-4 mr-2 text-blue-600" />;
    }
    return <Globe className="w-4 h-4 mr-2 text-orange-600" />;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading extension data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Browser Extension Monitor</h2>
          <p className="text-slate-600">Monitor and manage browser extension activities</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={sendHeartbeat}>
            <Monitor className="w-4 h-4 mr-2" />
            Send Heartbeat
          </Button>
          <Button onClick={loadData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Chrome className="w-4 h-4 mr-2 text-blue-600" />
              Extension Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(extensionStatus.status)}>
              {extensionStatus.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              {getBrowserIcon(extensionStatus.browserType)}
              Browser Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {extensionStatus.browserType || 'Unknown'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Shield className="w-4 h-4 mr-2 text-orange-600" />
              Domain Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{domainRules.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
              Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity">Real-time Activity</TabsTrigger>
          <TabsTrigger value="rules">Domain Rules</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Browser Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No recent activity</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{activity.domain}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{activity.action}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{activity.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Add New Domain Rule</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="domain">Domain</Label>
                    <Input
                      id="domain"
                      placeholder="example.com"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rule-type">Type</Label>
                    <Select value={ruleType} onValueChange={(value: 'whitelist' | 'blacklist') => setRuleType(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whitelist">Whitelist</SelectItem>
                        <SelectItem value="blacklist">Blacklist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddDomainRule}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Domain Rules</CardTitle>
              </CardHeader>
              <CardContent>
                {domainRules.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No domain rules configured</p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-green-700 mb-2">Whitelisted Domains</h4>
                      <div className="space-y-2">
                        {domainRules.filter(rule => rule.type === 'whitelist').map((rule) => (
                          <div key={rule.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="font-medium">{rule.domain}</span>
                              <Badge className={getRuleTypeColor(rule.type)}>
                                {rule.type}
                              </Badge>
                            </div>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleRemoveDomainRule(rule.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-red-700 mb-2">Blacklisted Domains</h4>
                      <div className="space-y-2">
                        {domainRules.filter(rule => rule.type === 'blacklist').map((rule) => (
                          <div key={rule.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <X className="w-4 h-4 text-red-600" />
                              <span className="font-medium">{rule.domain}</span>
                              <Badge className={getRuleTypeColor(rule.type)}>
                                {rule.type}
                              </Badge>
                            </div>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleRemoveDomainRule(rule.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-slate-500 py-8">No security alerts at this time</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
