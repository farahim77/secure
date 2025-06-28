
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Scan, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFlaskClipboardApi } from "@/hooks/useFlaskClipboardApi";

export function FlaskClipboardScanner() {
  const [content, setContent] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const { scanContent } = useFlaskClipboardApi();

  const handleScan = async () => {
    if (!content.trim()) {
      toast({
        title: "No content to scan",
        description: "Please enter some text to scan",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    
    try {
      const result = await scanContent(content);
      
      if (result) {
        setScanResult(result);
        toast({
          title: "Scan complete",
          description: `Content scanned - ${result.is_safe ? 'Safe' : 'Threats detected'}`,
          variant: result.is_safe ? "default" : "destructive"
        });
      } else {
        toast({
          title: "Scan failed",
          description: "Failed to scan content. Make sure Flask API is running.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Scan error",
        description: "An error occurred during scanning",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Flask Clipboard Scanner</h2>
        <p className="text-slate-600">Scan clipboard content for security threats using Flask API</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Scan className="w-5 h-5" />
            <span>Security Scanner</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Enter content to scan:
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste content here to scan for security threats..."
              className="min-h-32"
            />
          </div>
          
          <Button 
            onClick={handleScan} 
            disabled={isScanning || !content.trim()}
            className="w-full"
          >
            {isScanning ? "Scanning..." : "Scan Content"}
          </Button>
        </CardContent>
      </Card>

      {scanResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                {scanResult.is_safe ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span>Scan Results</span>
              </span>
              <Badge className={getRiskLevelColor(scanResult.risk_level)}>
                {scanResult.risk_level.toUpperCase()} RISK
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Status:</span>
              <Badge variant={scanResult.is_safe ? "default" : "destructive"}>
                {scanResult.is_safe ? "SAFE" : "THREAT DETECTED"}
              </Badge>
            </div>

            {scanResult.threats && scanResult.threats.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>Detected Threats</span>
                </h4>
                <div className="space-y-1">
                  {scanResult.threats.map((threat: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-slate-700">{threat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {scanResult.scan_results && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Scan Details</h4>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(scanResult.scan_results, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
