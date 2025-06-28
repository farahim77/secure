import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Eye, Code, FileText, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ContentAnalysisResult, isContentAnalysisResult } from "@/types/api";

export function ContentAnalyzer() {
  const [content, setContent] = useState("");
  const [analysis, setAnalysis] = useState<ContentAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const { toast } = useToast();
  const { session } = useAuth();

  const analyzeContent = async () => {
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
      if (useAI && session?.access_token) {
        // Use AI-powered analysis via Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('content-analysis', {
          body: { content }
        });
        
        if (error) throw error;
        
        if (data && isContentAnalysisResult(data)) {
          setAnalysis(data);
          toast({
            title: "Analysis complete",
            description: "AI-powered analysis completed successfully",
          });
        } else {
          throw new Error('Invalid response format from analysis service');
        }
      } else {
        // Fallback to local pattern matching
        const result = await performLocalAnalysis(content);
        setAnalysis(result);
        toast({
          title: "Analysis complete",
          description: "Pattern analysis completed",
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze content",
        variant: "destructive"
      });
      
      // Fallback to local analysis
      const fallbackResult = await performLocalAnalysis(content);
      setAnalysis(fallbackResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performLocalAnalysis = async (content: string): Promise<ContentAnalysisResult> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const patterns = [];
    const recommendations = [];
    let classification: ContentAnalysisResult['classification'] = 'public';
    let confidence = 0.75;

    if (/\b(?:password|pwd|pass)\b/i.test(content)) {
      patterns.push('Password detected');
      classification = 'restricted';
      recommendations.push('Never share passwords in plain text');
      confidence = 0.95;
    }

    if (/\b[A-Za-z0-9]{20,}\b/.test(content)) {
      patterns.push('API key or token detected');
      classification = classification === 'restricted' ? 'restricted' : 'confidential';
      recommendations.push('Use secure credential management');
      confidence = Math.max(confidence, 0.88);
    }

    if (/\b(?:private|secret|confidential|internal)\b/i.test(content)) {
      patterns.push('Sensitive keywords detected');
      classification = classification === 'restricted' ? 'restricted' : 'sensitive';
      recommendations.push('Verify before sharing externally');
    }

    if (/\b\d{3}-\d{2}-\d{4}\b/.test(content)) {
      patterns.push('SSN pattern detected');
      classification = 'restricted';
      recommendations.push('Handle personal data with extreme care');
      confidence = 0.92;
    }

    if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(content)) {
      patterns.push('Email addresses found');
      classification = classification === 'public' ? 'sensitive' : classification;
      recommendations.push('Ensure email sharing complies with privacy policies');
    }

    if (patterns.length === 0) {
      patterns.push('No sensitive patterns detected');
      recommendations.push('Content appears safe for general sharing');
    }

    return {
      classification,
      confidence,
      detected_patterns: patterns,
      recommendations
    };
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
        <h2 className="text-2xl font-bold text-slate-900">Content Analyzer</h2>
        <p className="text-slate-600">Analyze clipboard content for sensitive information</p>
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

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="use-ai"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="use-ai" className="text-sm font-medium text-slate-700 flex items-center space-x-1">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Use AI Analysis</span>
              </label>
            </div>
          </div>
          
          <Button 
            onClick={analyzeContent} 
            disabled={isAnalyzing || !content.trim()}
            className="w-full"
          >
            {isAnalyzing ? "Analyzing..." : useAI ? "Analyze with AI" : "Analyze Content"}
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

            {analysis.ai_analysis && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Analysis Summary</span>
                </h4>
                <p className="text-sm text-purple-800 mb-2">{analysis.ai_analysis.summary}</p>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-purple-900">Risk Score:</span>
                  <Badge variant="outline" className="text-purple-800">
                    {analysis.ai_analysis.riskScore}/10
                  </Badge>
                </div>
                {analysis.ai_analysis.detailedFindings.length > 0 && (
                  <div>
                    <h5 className="font-medium text-purple-900 mb-1">Detailed Findings:</h5>
                    <ul className="text-sm text-purple-800 space-y-1">
                      {analysis.ai_analysis.detailedFindings.map((finding, index) => (
                        <li key={index}>• {finding}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div>
              <h4 className="font-medium text-slate-900 mb-2">Detected Patterns</h4>
              <div className="space-y-1">
                {analysis.detected_patterns.map((pattern, index) => (
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
                {analysis.recommendations.map((rec, index) => (
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
