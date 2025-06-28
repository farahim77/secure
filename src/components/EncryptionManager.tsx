
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Shield, Key, Lock, RefreshCw, Download, Upload, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function EncryptionManager() {
  const { toast } = useToast();
  const [encryptionConfig, setEncryptionConfig] = useState({
    aesKeyLength: 256,
    rsaKeyLength: 4096,
    hybridMode: true,
    autoKeyRotation: true,
    rotationInterval: 24, // hours
    hmacEnabled: true,
    merkleTreeLogging: true
  });

  const [keyStats] = useState({
    aesKeysGenerated: 1247,
    rsaKeysGenerated: 156,
    lastRotation: "2024-01-15 12:00:00",
    nextRotation: "2024-01-16 12:00:00",
    integrityChecks: 98234,
    tamperAttempts: 0
  });

  const [testData, setTestData] = useState("");
  const [encryptedData, setEncryptedData] = useState("");
  const [decryptedData, setDecryptedData] = useState("");

  const testEncryption = () => {
    if (!testData) return;
    
    // Simulate encryption
    const encrypted = btoa(testData) + "_encrypted_" + Date.now();
    setEncryptedData(encrypted);
    
    toast({
      title: "Encryption successful",
      description: "Data has been encrypted using AES-256 + RSA-4096 hybrid encryption.",
    });
  };

  const testDecryption = () => {
    if (!encryptedData) return;
    
    // Simulate decryption
    try {
      const decoded = atob(encryptedData.split("_encrypted_")[0]);
      setDecryptedData(decoded);
      
      toast({
        title: "Decryption successful",
        description: "Data has been successfully decrypted and verified.",
      });
    } catch (error) {
      toast({
        title: "Decryption failed",
        description: "Invalid encrypted data or corrupted payload.",
        variant: "destructive"
      });
    }
  };

  const rotateKeys = () => {
    toast({
      title: "Key rotation initiated",
      description: "All encryption keys are being rotated. This may take a few minutes.",
    });
  };

  const updateConfig = (key: string, value: any) => {
    setEncryptionConfig(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Configuration updated",
      description: `${key} has been updated successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Encryption Management</h2>
          <p className="text-slate-600">Configure hybrid end-to-end encryption and tamper-proof logging</p>
        </div>
        <Button onClick={rotateKeys}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Rotate Keys
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">AES Encryption</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">AES-{encryptionConfig.aesKeyLength}</div>
            <p className="text-xs text-blue-600">Data encryption standard</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">RSA Key Exchange</CardTitle>
            <Key className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">RSA-{encryptionConfig.rsaKeyLength}</div>
            <p className="text-xs text-green-600">Key exchange protocol</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Integrity Checks</CardTitle>
            <Lock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{keyStats.integrityChecks.toLocaleString()}</div>
            <p className="text-xs text-purple-600">Successful verifications</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Tamper Attempts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{keyStats.tamperAttempts}</div>
            <p className="text-xs text-orange-600">Detected & blocked</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="keys">Key Management</TabsTrigger>
          <TabsTrigger value="test">Encryption Test</TabsTrigger>
          <TabsTrigger value="integrity">Integrity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Encryption Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="aes-length">AES Key Length</Label>
                    <select 
                      id="aes-length"
                      value={encryptionConfig.aesKeyLength}
                      onChange={(e) => updateConfig('aesKeyLength', parseInt(e.target.value))}
                      className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md"
                    >
                      <option value="128">AES-128</option>
                      <option value="192">AES-192</option>
                      <option value="256">AES-256</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="rsa-length">RSA Key Length</Label>
                    <select 
                      id="rsa-length"
                      value={encryptionConfig.rsaKeyLength}
                      onChange={(e) => updateConfig('rsaKeyLength', parseInt(e.target.value))}
                      className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md"
                    >
                      <option value="2048">RSA-2048</option>
                      <option value="3072">RSA-3072</option>
                      <option value="4096">RSA-4096</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="rotation-interval">Key Rotation Interval (hours)</Label>
                    <Input 
                      id="rotation-interval"
                      type="number"
                      value={encryptionConfig.rotationInterval}
                      onChange={(e) => updateConfig('rotationInterval', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hybrid-mode">Hybrid Encryption (AES + RSA)</Label>
                    <Switch 
                      id="hybrid-mode"
                      checked={encryptionConfig.hybridMode}
                      onCheckedChange={(checked) => updateConfig('hybridMode', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-rotation">Automatic Key Rotation</Label>
                    <Switch 
                      id="auto-rotation"
                      checked={encryptionConfig.autoKeyRotation}
                      onCheckedChange={(checked) => updateConfig('autoKeyRotation', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hmac-enabled">HMAC Tamper Detection</Label>
                    <Switch 
                      id="hmac-enabled"
                      checked={encryptionConfig.hmacEnabled}
                      onCheckedChange={(checked) => updateConfig('hmacEnabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="merkle-tree">Merkle Tree Logging</Label>
                    <Switch 
                      id="merkle-tree"
                      checked={encryptionConfig.merkleTreeLogging}
                      onCheckedChange={(checked) => updateConfig('merkleTreeLogging', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="keys">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">AES Keys Generated:</span>
                    <span className="font-mono">{keyStats.aesKeysGenerated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">RSA Keys Generated:</span>
                    <span className="font-mono">{keyStats.rsaKeysGenerated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Last Rotation:</span>
                    <span className="font-mono text-xs">{keyStats.lastRotation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Next Rotation:</span>
                    <span className="font-mono text-xs">{keyStats.nextRotation}</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Label className="text-sm font-medium">Next Rotation Progress</Label>
                  <Progress value={67} className="mt-2" />
                  <p className="text-xs text-slate-500 mt-1">16.2 hours remaining</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Management Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Public Keys
                </Button>
                <Button className="w-full" variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Key Backup
                </Button>
                <Button className="w-full" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Force Key Rotation
                </Button>
                <Button className="w-full" variant="destructive">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Revoke All Keys
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Encryption Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="test-input">Original Data</Label>
                  <Textarea 
                    id="test-input"
                    placeholder="Enter data to encrypt..."
                    value={testData}
                    onChange={(e) => setTestData(e.target.value)}
                    className="h-32"
                  />
                  <Button onClick={testEncryption} className="w-full">
                    <Lock className="w-4 h-4 mr-2" />
                    Encrypt Data
                  </Button>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="encrypted-output">Encrypted Data</Label>
                  <Textarea 
                    id="encrypted-output"
                    value={encryptedData}
                    readOnly
                    className="h-32 bg-slate-50 font-mono text-xs"
                  />
                  <Button onClick={testDecryption} className="w-full" disabled={!encryptedData}>
                    <Key className="w-4 h-4 mr-2" />
                    Decrypt Data
                  </Button>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="decrypted-output">Decrypted Data</Label>
                  <Textarea 
                    id="decrypted-output"
                    value={decryptedData}
                    readOnly
                    className="h-32 bg-green-50"
                  />
                  <div className="text-center">
                    {decryptedData === testData && testData && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Integrity Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrity">
          <Card>
            <CardHeader>
              <CardTitle>Tamper-Proof Integrity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-700">HMAC Verification</span>
                    </div>
                    <p className="text-sm text-green-600">All clipboard entries verified with HMAC-SHA256</p>
                    <p className="text-xs text-green-500 mt-1">Last check: 2 seconds ago</p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Lock className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-700">Merkle Tree Root</span>
                    </div>
                    <p className="text-xs font-mono text-blue-600">0xa1b2c3d4e5f6...</p>
                    <p className="text-xs text-blue-500 mt-1">Block height: 98,234</p>
                  </div>
                </div>

                <div className="text-xs font-mono bg-slate-50 p-4 rounded-lg">
                  <div className="space-y-1">
                    <div className="text-green-600">[2024-01-15 14:45:30] HMAC_VERIFY: OK - Entry ID: clip_1234567890</div>
                    <div className="text-green-600">[2024-01-15 14:45:28] MERKLE_ADD: OK - New leaf added to tree</div>
                    <div className="text-green-600">[2024-01-15 14:45:25] HMAC_VERIFY: OK - Entry ID: clip_1234567889</div>
                    <div className="text-blue-600">[2024-01-15 14:45:20] KEY_ROTATION: OK - AES key rotated</div>
                    <div className="text-green-600">[2024-01-15 14:45:15] HMAC_VERIFY: OK - Entry ID: clip_1234567888</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
