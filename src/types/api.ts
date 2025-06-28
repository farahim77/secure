
// API response types for content analysis and scanning
export interface AIAnalysis {
  summary: string;
  riskScore: number;
  detailedFindings: string[];
  complianceIssues: string[];
}

export interface ContentAnalysisResult {
  classification: 'public' | 'sensitive' | 'confidential' | 'restricted';
  confidence: number;
  detected_patterns: string[];
  recommendations: string[];
  ai_analysis?: AIAnalysis;
}

export interface ScanResults {
  malware_indicators: string[];
  suspicious_urls: string[];
  exposed_credentials: string[];
  pii_detected: string[];
  security_score: number;
}

export interface ContentScanResult {
  is_safe: boolean;
  threats: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  scan_results: ScanResults;
  ai_analysis?: {
    summary: string;
    riskScore: number;
    recommendations: string[];
  };
}

export interface ComplianceReportResponse {
  report_id: string;
  name: string;
  status: 'generating' | 'ready' | 'failed';
  download_url?: string;
  file_size?: number;
}

// Type guards
export function isContentAnalysisResult(data: unknown): data is ContentAnalysisResult {
  return typeof data === 'object' && 
         data !== null && 
         'classification' in data && 
         'confidence' in data;
}

export function isContentScanResult(data: unknown): data is ContentScanResult {
  return typeof data === 'object' && 
         data !== null && 
         'is_safe' in data && 
         'threats' in data;
}

export function isComplianceReportResponse(data: unknown): data is ComplianceReportResponse {
  return typeof data === 'object' && 
         data !== null && 
         'report_id' in data;
}
