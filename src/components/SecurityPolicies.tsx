
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Lock, Eye, AlertTriangle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SecurityPolicies() {
  const { toast } = useToast();
  const [policies, setPolicies] = useState([
    {
      id: "1",
      name: "Domain Blocking",
      description: "Prevent clipboard data from being pasted into unauthorized domains",
      enabled: true,
      rules: ["*.malicious-site.com", "untrusted-domain.org"],
      type: "paste-control"
    },
    {
      id: "2",
      name: "Application Filtering",
      description: "Block clipboard access from specific applications",
      enabled: true,
      rules: ["notepad.exe", "untrusted-app.exe"],
      type: "app-control"
    },
    {
      id: "3",
      name: "Data Classification",
      description: "Automatic classification of sensitive clipboard content",
      enabled: true,
      rules: ["password", "api_key", "secret"],
      type: "classification"
    },
    {
      id: "4",
      name: "Encryption Enforcement",
      description: "Require AES-256 encryption for all clipboard data",
      enabled: true,
      rules: ["AES-256", "RSA-4096"],
      type: "encryption"
    }
  ]);

  const togglePolicy = (id: string) => {
    setPolicies(policies.map(policy => 
      policy.id === id ? { ...policy, enabled: !policy.enabled } : policy
    ));
    toast({
      title: "Policy updated",
      description: "Security policy has been updated successfully.",
    });
  };

  const getPolicyIcon = (type: string) => {
    switch (type) {
      case "paste-control":
        return <Shield className="w-5 h-5 text-blue-600" />;
      case "app-control":
        return <Lock className="w-5 h-5 text-purple-600" />;
      case "classification":
        return <Eye className="w-5 h-5 text-green-600" />;
      case "encryption":
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Security Policies</h2>
          <p className="text-slate-600">Configure security rules and compliance settings</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Policy
        </Button>
      </div>

      <Tabs defaultValue="policies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="policies">Active Policies</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Settings</TabsTrigger>
          <TabsTrigger value="encryption">Encryption Config</TabsTrigger>
        </TabsList>

        <TabsContent value="policies">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {policies.map((policy) => (
              <Card key={policy.id} className={`border-2 ${policy.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getPolicyIcon(policy.type)}
                      <div>
                        <CardTitle className="text-lg">{policy.name}</CardTitle>
                        <p className="text-sm text-slate-600">{policy.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={policy.enabled}
                      onCheckedChange={() => togglePolicy(policy.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Active Rules</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {policy.rules.map((rule, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {rule}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Edit Rules
                      </Button>
                      <Button variant="outline" size="sm">
                        View Logs
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>GDPR Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="gdpr-logging">Data Processing Logging</Label>
                  <Switch id="gdpr-logging" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="gdpr-retention">Auto Data Deletion</Label>
                  <Switch id="gdpr-retention" defaultChecked />
                </div>
                <div>
                  <Label htmlFor="retention-period">Retention Period (days)</Label>
                  <Input id="retention-period" type="number" defaultValue="90" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>HIPAA Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="hipaa-audit">Enhanced Audit Trail</Label>
                  <Switch id="hipaa-audit" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="hipaa-encryption">PHI Encryption</Label>
                  <Switch id="hipaa-encryption" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="hipaa-access">Access Controls</Label>
                  <Switch id="hipaa-access" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="encryption">
          <Card>
            <CardHeader>
              <CardTitle>Encryption Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="aes-key">AES Key Strength</Label>
                    <Input id="aes-key" value="AES-256" readOnly />
                  </div>
                  <div>
                    <Label htmlFor="rsa-key">RSA Key Strength</Label>
                    <Input id="rsa-key" value="RSA-4096" readOnly />
                  </div>
                  <div>
                    <Label htmlFor="key-rotation">Key Rotation Period (hours)</Label>
                    <Input id="key-rotation" type="number" defaultValue="24" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-rotation">Automatic Key Rotation</Label>
                    <Switch id="auto-rotation" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="secure-delete">Secure Data Deletion</Label>
                    <Switch id="secure-delete" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tamper-detection">Tamper Detection</Label>
                    <Switch id="tamper-detection" defaultChecked />
                  </div>
                </div>
              </div>
              <Button className="w-full">
                Update Encryption Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
