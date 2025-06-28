
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Eye, Code, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFlaskClipboardApi } from "@/hooks/useFlaskClipboardApi";

export function FlaskContentAnalyzer() {
  const [content, setContent] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { analyzeContent } = useFlaskClipboardApi();

  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast({
        title: "No content to analyze",
        description: "Please enter some text to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const result = await analyzeContent(content);
      
      if (result) {
        setAnalysis(result);
        toast({
          title: "Analysis complete",
          description: "Content has been analyzed successfully",
        });
      } else {
        toast({
          title: "Analysis failed",
          description: "Failed to analyze content. Make sure Flask API is running.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Analysis error",
        description: "An error occurred during analysis",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case 'restricted':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'confidential':
        return <Shield className="w-4 h-4 text-orange-600" />;
      case 'sensitive':
        return <Eye className="w-4 h-4 text-yellow-600" />;
      default:
        return <FileText className="w-4 h-4 text-green-600" />;
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'restricted':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'confidential':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'sensitive':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Flask Content Analyzer</h2>
        <p className="text-slate-600">Analyze clipboard content using Flask API backend</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="w-5 h-5" />
            <span>Content Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Enter content to analyze:
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste content here to analyze for sensitive information..."
              className="min-h-32"
            />
          </div>
          
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !content.trim()}
            className="w-full"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Content"}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                {getClassificationIcon(analysis.classification)}
                <span>Analysis Results</span>
              </span>
              <Badge className={getClassificationColor(analysis.classification)}>
                {analysis.classification.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Confidence Score</h4>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${analysis.confidence * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {Math.round(analysis.confidence * 100)}% confidence
              </p>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-2">Detected Patterns</h4>
              <div className="space-y-1">
                {analysis.detected_patterns?.map((pattern: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-slate-700">{pattern}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-2">Recommendations</h4>
              <div className="space-y-1">
                {analysis.recommendations?.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
