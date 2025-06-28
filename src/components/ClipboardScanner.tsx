import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Scan, Shield, AlertTriangle, CheckCircle, Play, Pause, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRealTimeClipboard } from "@/hooks/useRealTimeClipboard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ContentScanResult, isContentScanResult } from "@/types/api";

interface ScanResult {
  timestamp: string;
  content: string;
  classification: 'safe' | 'warning' | 'blocked';
  threats: string[];
  action: 'allowed' | 'blocked' | 'quarantined';
  aiAnalysis?: {
    summary: string;
    riskScore: number;
    recommendations: string[];
  };
}

export function ClipboardScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [autoScan, setAutoScan] = useState(true);
  const [useAI, setUseAI] = useState(true);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const { toast } = useToast();
  const { clipboardState, isAuthenticated } = useRealTimeClipboard();
  const { session } = useAuth();

  useEffect(() => {
    if (autoScan && isAuthenticated && clipboardState.content) {
      performScan(clipboardState.content);
    }
  }, [clipboardState.content, autoScan, isAuthenticated]);

  const performScan = async (content: string) => {
    if (!content.trim()) return;

    setIsScanning(true);
    
    try {
      let result: ScanResult;

      if (useAI && session?.access_token) {
        // Use AI-powered scanning via Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('content-scanner', {
          body: { content }
        });
        
        if (error) throw error;
        
        if (data && isContentScanResult(data)) {
          result = {
            timestamp: new Date().toLocaleString(),
            content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
            classification: data.is_safe ? 'safe' : 'blocked',
            threats: data.threats || [],
            action: data.is_safe ? 'allowed' : 'blocked',
            aiAnalysis: data.ai_analysis
          };
        } else {
          throw new Error('Invalid response format from scanner service');
        }
      } else {
        // Fallback to local pattern matching
        result = await performLocalScan(content);
      }

      setScanHistory(prev => [result, ...prev.slice(0, 9)]);
      
      if (result.classification === 'blocked') {
        toast({
          title: "Threat Detected",
          description: "Clipboard content has been blocked due to security concerns",
          variant: "destructive"
        });
      } else if (result.classification === 'warning') {
        toast({
          title: "Warning",
          description: "Potentially sensitive content detected in clipboard",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Scan failed",
        description: error instanceof Error ? error.message : "Failed to scan content",
        variant: "destructive"
      });
      
      // Fallback to local scan
      const fallbackResult = await performLocalScan(content);
      setScanHistory(prev => [fallbackResult, ...prev.slice(0, 9)]);
    } finally {
      setIsScanning(false);
    }
  };

  const performLocalScan = async (content: string): Promise<ScanResult> => {
    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const threats = [];
    let classification: ScanResult['classification'] = 'safe';
    let action: ScanResult['action'] = 'allowed';

    // Simple threat detection
    if (/\b(?:malware|virus|trojan|ransomware)\b/i.test(content)) {
      threats.push('Potential malware reference detected');
      classification = 'blocked';
      action = 'blocked';
    }

    if (/javascript:|data:|vbscript:/i.test(content)) {
      threats.push('Potentially dangerous script detected');
      classification = 'blocked';
      action = 'blocked';
    }

    if (/\b(?:password|secret|token)\s*[:=]\s*\S+/i.test(content)) {
      threats.push('Exposed credentials detected');
      classification = 'warning';
      action = 'quarantined';
    }

    if (/https?:\/\/[^\s]+\.(?:exe|bat|cmd|scr|com|pif)/i.test(content)) {
      threats.push('Suspicious executable download link');
      classification = 'blocked';
      action = 'blocked';
    }

    if (/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/.test(content)) {
      threats.push('Credit card number pattern detected');
      classification = 'warning';
      action = 'quarantined';
    }

    if (threats.length === 0) {
      threats.push('No threats detected');
    }

    return {
      timestamp: new Date().toLocaleString(),
      content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      classification,
      threats,
      action
    };
  };

  const manualScan = async () => {
    try {
      const text = await navigator.clipboard.readText();
      await performScan(text);
    } catch (error) {
      toast({
        title: "Scan failed",
        description: "Could not access clipboard for scanning",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (classification: string) => {
    switch (classification) {
      case 'blocked':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <Shield className="w-4 h-4 text-yellow-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
  };

  const getStatusColor = (classification: string) => {
    switch (classification) {
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Clipboard Scanner</h2>
        <p className="text-slate-600">Real-time security scanning of clipboard content</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Scan className="w-5 h-5" />
              <span>Scanner Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-scan" className="text-sm font-medium">
                Auto-scan clipboard
              </Label>
              <Switch 
                id="auto-scan"
                checked={autoScan}
                onCheckedChange={setAutoScan}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="use-ai" className="text-sm font-medium flex items-center space-x-1">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Use AI Scanning</span>
              </Label>
              <Switch 
                id="use-ai"
                checked={useAI}
                onCheckedChange={setUseAI}
              />
            </div>

            <div className="flex items-center space-x-2">
              {autoScan ? <Play className="w-4 h-4 text-green-600" /> : <Pause className="w-4 h-4 text-gray-600" />}
              <span className="text-sm text-slate-600">
                {autoScan ? 'Auto-scanning enabled' : 'Auto-scanning disabled'}
              </span>
            </div>

            <Button 
              onClick={manualScan} 
              disabled={isScanning}
              className="w-full"
            >
              {isScanning ? "Scanning..." : useAI ? "AI Scan Clipboard" : "Scan Clipboard Now"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scanner Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Scanner Status:</span>
                <Badge variant={autoScan ? "default" : "secondary"}>
                  {autoScan ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>AI Enhancement:</span>
                <Badge variant={useAI ? "default" : "outline"}>
                  {useAI ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Last Scan:</span>
                <span className="text-slate-600">
                  {scanHistory[0]?.timestamp || 'Never'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Scans:</span>
                <span className="text-slate-600">{scanHistory.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Threats Blocked:</span>
                <span className="text-red-600">
                  {scanHistory.filter(s => s.classification === 'blocked').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scan History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scanHistory.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No scans performed yet</p>
            ) : (
              scanHistory.map((scan, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(scan.classification)}
                      <Badge className={getStatusColor(scan.classification)}>
                        {scan.action.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-500">{scan.timestamp}</span>
                  </div>
                  
                  <div className="bg-slate-50 p-2 rounded text-sm font-mono mb-2">
                    {scan.content}
                  </div>

                  {scan.aiAnalysis && (
                    <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-2">
                      <h5 className="font-medium text-purple-900 mb-1 flex items-center space-x-1">
                        <Sparkles className="w-4 h-4" />
                        <span>AI Analysis</span>
                      </h5>
                      <p className="text-sm text-purple-800 mb-1">{scan.aiAnalysis.summary}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-purple-700">Risk Score:</span>
                        <Badge variant="outline" className="text-purple-800">
                          {scan.aiAnalysis.riskScore}/10
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    {scan.threats.map((threat, threatIndex) => (
                      <div key={threatIndex} className="flex items-center space-x-2 text-sm">
                        <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                        <span className="text-slate-600">{threat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
