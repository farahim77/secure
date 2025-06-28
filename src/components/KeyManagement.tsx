import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Key, Download, RotateCcw, Upload, Plus, Shield, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { realTimeApi } from "@/services/realTimeApi";
import { useAuth } from "@/hooks/useAuth";

interface EncryptionKey {
  id: string;
  name: string;
  type: string;
  created_at: string;
  expires_at: string | null;
  status: string;
  fingerprint: string;
}

interface ExportKeyData {
  key_id: string;
  name: string;
  type: string;
  public_key: string;
  created_at: string;
  fingerprint: string;
}

// Type guard function for EncryptionKey array
const isEncryptionKeyArray = (data: unknown): data is EncryptionKey[] => {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' && 
    item !== null &&
    'id' in item &&
    'name' in item &&
    'type' in item &&
    'created_at' in item &&
    'status' in item &&
    'fingerprint' in item
  );
};

// Type guard function for export key data
const isExportKeyData = (data: unknown): data is ExportKeyData => {
  return typeof data === 'object' && 
    data !== null &&
    'key_id' in data &&
    'name' in data &&
    'type' in data &&
    'public_key' in data &&
    'created_at' in data &&
    'fingerprint' in data;
};

export function KeyManagement() {
  const { toast } = useToast();
  const { session } = useAuth();
  const [keys, setKeys] = useState<EncryptionKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newKeyType, setNewKeyType] = useState("AES-256");
  const [newKeyName, setNewKeyName] = useState("");

  useEffect(() => {
    if (session?.access_token) {
      realTimeApi.setToken(session.access_token);
      loadKeys();
    }
  }, [session]);

  const loadKeys = async () => {
    setIsLoading(true);
    try {
      const response = await realTimeApi.getEncryptionKeys();
      if (response.success && response.data && isEncryptionKeyArray(response.data)) {
        setKeys(response.data);
      } else {
        setKeys([]);
      }
    } catch (error) {
      console.error('Failed to load keys:', error);
      setKeys([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a name for the key",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await realTimeApi.generateEncryptionKey(newKeyType, newKeyName);
      if (response.success) {
        toast({
          title: "Key generated",
          description: "New encryption key has been generated successfully.",
        });
        setNewKeyName("");
        loadKeys();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate encryption key",
        variant: "destructive"
      });
    }
  };

  const handleExportKey = async (keyId: string) => {
    try {
      const response = await realTimeApi.exportEncryptionKey(keyId);
      if (response.success && response.data && isExportKeyData(response.data)) {
        const key = response.data;
        const exportData = {
          id: key.key_id,
          name: key.name,
          type: key.type,
          public_key: key.public_key,
          created_at: key.created_at,
          fingerprint: key.fingerprint
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${key.name || 'encryption-key'}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Key exported",
          description: "Public key has been exported successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export encryption key",
        variant: "destructive"
      });
    }
  };

  const handleRotateKey = async (keyId: string) => {
    try {
      const response = await realTimeApi.rotateEncryptionKey(keyId);
      if (response.success) {
        toast({
          title: "Key rotated",
          description: "Encryption key has been rotated successfully.",
        });
        loadKeys();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: "Rotation failed",
        description: "Failed to rotate encryption key",
        variant: "destructive"
      });
    }
  };

  const handleExportAllPublicKeys = async () => {
    try {
      const response = await realTimeApi.exportAllPublicKeys();
      if (response.success && response.data) {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'all-public-keys.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "All public keys exported",
          description: "All public keys have been exported successfully.",
        });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export all public keys",
        variant: "destructive"
      });
    }
  };

  const handleForceKeyRotation = async () => {
    try {
      const response = await realTimeApi.forceKeyRotation();
      if (response.success) {
        toast({
          title: "Key rotation completed",
          description: "All encryption keys have been rotated successfully.",
        });
        loadKeys();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: "Rotation failed",
        description: "Failed to rotate all keys",
        variant: "destructive"
      });
    }
  };

  const handleRevokeAllKeys = async () => {
    if (!confirm("Are you sure you want to revoke ALL encryption keys? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await realTimeApi.revokeAllKeys();
      if (response.success) {
        toast({
          title: "All keys revoked",
          description: "All encryption keys have been revoked successfully.",
          variant: "destructive"
        });
        loadKeys();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: "Revocation failed",
        description: "Failed to revoke all keys",
        variant: "destructive"
      });
    }
  };

  const handleImportKey = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const keyData = JSON.parse(text);
          
          const response = await realTimeApi.importEncryptionKey(keyData);
          if (response.success) {
            toast({
              title: "Key imported",
              description: "Encryption key has been imported successfully.",
            });
            loadKeys();
          } else {
            throw new Error(response.error);
          }
        } catch (error) {
          toast({
            title: "Import failed",
            description: "Failed to import encryption key",
            variant: "destructive"
          });
        }
      }
    };
    input.click();
  };

  const getKeyTypeColor = (type: string) => {
    switch (type) {
      case 'RSA-2048':
        return 'bg-blue-100 text-blue-800';
      case 'AES-256':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading keys...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Key Management</h2>
          <p className="text-slate-600">Manage encryption keys and security credentials</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleImportKey}>
            <Upload className="w-4 h-4 mr-2" />
            Import Key
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Key className="w-4 h-4 mr-2 text-blue-600" />
              Total Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keys.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Shield className="w-4 h-4 mr-2 text-green-600" />
              Active Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {keys.filter(k => k.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <RotateCcw className="w-4 h-4 mr-2 text-orange-600" />
              RSA Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {keys.filter(k => k.type.includes('RSA')).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Encryption Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Fingerprint</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      <div className="font-medium">{key.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getKeyTypeColor(key.type)}>
                        {key.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(key.created_at)}</TableCell>
                    <TableCell>
                      {key.expires_at ? formatDate(key.expires_at) : 'Never'}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {key.fingerprint}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleExportKey(key.id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRotateKey(key.id)}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Generate New Key</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="keyName">Key Name</Label>
              <Input 
                id="keyName" 
                placeholder="Enter key name" 
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="keyType">Key Type</Label>
              <Select value={newKeyType} onValueChange={setNewKeyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select key type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AES-256">AES-256 (Symmetric)</SelectItem>
                  <SelectItem value="RSA-2048">RSA-2048 (Asymmetric)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleGenerateKey} className="w-full">
              <Key className="w-4 h-4 mr-2" />
              Generate Key
            </Button>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Key Management Actions</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={handleExportAllPublicKeys}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Public Keys
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start" 
                  onClick={handleImportKey}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Key Backup
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={handleForceKeyRotation}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Force Key Rotation
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={handleRevokeAllKeys}
                >
                  <X className="w-4 h-4 mr-2" />
                  Revoke All Keys
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
