
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Terminal, Download, Play, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { flaskApi } from "@/services/flaskApi";

export function FlaskBackendGuide() {
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const response = await flaskApi.healthCheck();
      setConnectionStatus(response.success ? 'connected' : 'disconnected');
    } catch {
      setConnectionStatus('disconnected');
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Command copied successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Flask Backend Setup Guide</h2>
          <p className="text-slate-600">Complete setup guide for the Flask API backend</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className={getStatusColor()}>
            {connectionStatus === 'checking' ? 'Checking...' : 
             connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </Badge>
          <Button onClick={checkConnection} variant="outline" size="sm">
            Check Connection
          </Button>
        </div>
      </div>

      {connectionStatus === 'connected' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Flask backend is running and connected successfully! All endpoints are available.
          </AlertDescription>
        </Alert>
      )}

      {connectionStatus === 'disconnected' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Flask backend is not running. Please follow the setup instructions below.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="installation" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="installation">Installation</TabsTrigger>
          <TabsTrigger value="setup">Setup & Run</TabsTrigger>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        <TabsContent value="installation">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Step 1: Install Dependencies</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">
                  First, make sure you have Python 3.8+ installed on your system.
                </p>
                
                <div className="bg-slate-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Terminal</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-slate-400 hover:text-white"
                      onClick={() => copyToClipboard('pip install flask flask-cors openai')}
                    >
                      Copy
                    </Button>
                  </div>
                  <code className="text-green-400">pip install flask flask-cors openai</code>
                </div>

                <p className="text-slate-600 text-sm">
                  This will install Flask web framework, CORS support, and OpenAI client library.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Step 2: Create Backend Directory</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">
                  Create a new directory for your Flask backend and navigate to it.
                </p>
                
                <div className="bg-slate-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Terminal</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-slate-400 hover:text-white"
                      onClick={() => copyToClipboard('mkdir flask-backend\ncd flask-backend')}
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <div><code className="text-green-400">mkdir flask-backend</code></div>
                    <div><code className="text-green-400">cd flask-backend</code></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="setup">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Terminal className="w-5 h-5" />
                  <span>Step 3: Create app.py File</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">
                  The Flask backend code is already created in your project. Copy it to your flask-backend directory:
                </p>
                
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    The complete Flask backend code is available in your project at <code>flask-backend/app.py</code>
                  </AlertDescription>
                </Alert>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Features included:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✅ Authentication endpoints</li>
                    <li>✅ Dashboard statistics</li>
                    <li>✅ Device management</li>
                    <li>✅ Browser extension support</li>
                    <li>✅ Team management & invitations</li>
                    <li>✅ Domain rules management</li>
                    <li>✅ Content analysis with OpenAI</li>
                    <li>✅ Content security scanning</li>
                    <li>✅ Clipboard management</li>
                    <li>✅ Encryption key management</li>
                    <li>✅ Audit logging</li>
                    <li>✅ Compliance reporting</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Step 4: Run the Flask Server</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">
                  Start the Flask development server:
                </p>
                
                <div className="bg-slate-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Terminal</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-slate-400 hover:text-white"
                      onClick={() => copyToClipboard('python app.py')}
                    >
                      Copy
                    </Button>
                  </div>
                  <code className="text-green-400">python app.py</code>
                </div>

                <p className="text-slate-600 text-sm">
                  The server will start on <code>http://localhost:5000</code> and you should see all available endpoints listed.
                </p>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Once running, the Flask backend will be accessible at <code>http://localhost:5000</code> with CORS enabled for your frontend.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>Available API Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900">Authentication</h4>
                  <div className="text-sm space-y-1">
                    <div><Badge variant="outline" className="mr-2">POST</Badge>/api/auth/login</div>
                    <div><Badge variant="outline" className="mr-2">POST</Badge>/api/auth/register</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900">Dashboard</h4>
                  <div className="text-sm space-y-1">
                    <div><Badge variant="outline" className="mr-2">GET</Badge>/api/health</div>
                    <div><Badge variant="outline" className="mr-2">GET</Badge>/api/dashboard/stats</div>
                    <div><Badge variant="outline" className="mr-2">GET</Badge>/api/dashboard/activity</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900">Device Management</h4>
                  <div className="text-sm space-y-1">
                    <div><Badge variant="outline" className="mr-2">GET</Badge>/api/devices</div>
                    <div><Badge variant="outline" className="mr-2">POST</Badge>/api/devices/register</div>
                    <div><Badge variant="outline" className="mr-2">POST</Badge>/api/devices/[id]/revoke</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900">Browser Extension</h4>
                  <div className="text-sm space-y-1">
                    <div><Badge variant="outline" className="mr-2">GET</Badge>/api/browser-extension/status</div>
                    <div><Badge variant="outline" className="mr-2">POST</Badge>/api/browser-extension/heartbeat</div>
                    <div><Badge variant="outline" className="mr-2">GET</Badge>/api/browser-extension/activities</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900">Team Management</h4>
                  <div className="text-sm space-y-1">
                    <div><Badge variant="outline" className="mr-2">GET</Badge>/api/team/members</div>
                    <div><Badge variant="outline" className="mr-2">POST</Badge>/api/team/invite</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900">Content Analysis</h4>
                  <div className="text-sm space-y-1">
                    <div><Badge variant="outline" className="mr-2">POST</Badge>/api/content/analyze</div>
                    <div><Badge variant="outline" className="mr-2">POST</Badge>/api/content/scan</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900">Clipboard</h4>
                  <div className="text-sm space-y-1">
                    <div><Badge variant="outline" className="mr-2">POST</Badge>/api/clipboard/upload</div>
                    <div><Badge variant="outline" className="mr-2">GET</Badge>/api/clipboard/latest/[user_id]</div>
                    <div><Badge variant="outline" className="mr-2">GET</Badge>/api/clipboard/history/[user_id]</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900">Compliance</h4>
                  <div className="text-sm space-y-1">
                    <div><Badge variant="outline" className="mr-2">GET</Badge>/api/compliance/reports</div>
                    <div><Badge variant="outline" className="mr-2">POST</Badge>/api/compliance/generate-report</div>
                    <div><Badge variant="outline" className="mr-2">GET</Badge>/api/compliance/download/[id]</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Common Issues & Solutions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Port Already in Use</h4>
                  <p className="text-slate-600 text-sm mb-2">
                    If port 5000 is already in use, you can change it in app.py:
                  </p>
                  <div className="bg-slate-100 p-2 rounded text-sm">
                    <code>app.run(debug=True, host='0.0.0.0', port=5001)</code>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-2">CORS Issues</h4>
                  <p className="text-slate-600 text-sm">
                    CORS is pre-configured for localhost:3000, localhost:5173, and localhost:8080. 
                    If you're running on a different port, update the CORS configuration in app.py.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-2">OpenAI API Errors</h4>
                  <p className="text-slate-600 text-sm">
                    The OpenAI API key is already configured in the backend. If you encounter errors, 
                    the system will fall back to mock responses for content analysis and scanning.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Module Import Errors</h4>
                  <p className="text-slate-600 text-sm mb-2">
                    Make sure all dependencies are installed:
                  </p>
                  <div className="bg-slate-100 p-2 rounded text-sm">
                    <code>pip install flask flask-cors openai</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
