
const FLASK_API_BASE = 'http://localhost:5000/api';

interface FlaskClipboardEntry {
  id: string;
  user_id: string;
  device_id: string;
  encrypted_content: string;
  content_type: string;
  encryption_metadata: any;
  shared_with: string[];
  expires_at?: string;
  created_at: string;
}

interface FlaskResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class FlaskApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<FlaskResponse<T>> {
    try {
      console.log(`Making request to: ${FLASK_API_BASE}${endpoint}`);
      
      const response = await fetch(`${FLASK_API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.token ? `Bearer ${this.token}` : '',
          ...options.headers,
        },
        ...options,
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${errorText}`);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` };
        }
        
        return { 
          success: false, 
          error: errorData.error || errorData.message || `Request failed with status ${response.status}` 
        };
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      return { success: true, data };
    } catch (error) {
      console.error('Flask API request failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error - Make sure Flask API is running on localhost:5000' 
      };
    }
  }

  // Content Analysis
  async analyzeContent(content: string): Promise<FlaskResponse<{
    classification: 'public' | 'sensitive' | 'confidential' | 'restricted';
    confidence: number;
    detected_patterns: string[];
    recommendations: string[];
  }>> {
    return this.makeRequest('/content/analyze', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Content Scanning
  async scanContent(content: string): Promise<FlaskResponse<{
    is_safe: boolean;
    threats: string[];
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    scan_results: any;
  }>> {
    return this.makeRequest('/content/scan', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Clipboard Management
  async uploadClipboard(clipboardData: {
    user_id: string;
    device_id: string;
    encrypted_content: string;
    content_type: string;
    encryption_metadata: any;
    expires_at?: string;
  }): Promise<FlaskResponse<FlaskClipboardEntry>> {
    return this.makeRequest('/clipboard/upload', {
      method: 'POST',
      body: JSON.stringify(clipboardData),
    });
  }

  async getLatestClipboard(userId: string): Promise<FlaskResponse<FlaskClipboardEntry>> {
    return this.makeRequest(`/clipboard/latest/${userId}`);
  }

  async getClipboardHistory(
    userId: string, 
    limit = 20, 
    offset = 0
  ): Promise<FlaskResponse<FlaskClipboardEntry[]>> {
    return this.makeRequest(
      `/clipboard/history/${userId}?limit=${limit}&offset=${offset}`
    );
  }

  // Compliance Reports
  async generateComplianceReport(reportConfig: {
    compliance_standard: string;
    report_type: string;
    start_date: string;
    end_date: string;
    sections: string[];
  }): Promise<FlaskResponse<{
    report_id: string;
    download_url: string;
    file_size: number;
    format: string;
  }>> {
    return this.makeRequest('/compliance/generate-report', {
      method: 'POST',
      body: JSON.stringify(reportConfig),
    });
  }

  async downloadReport(reportId: string): Promise<FlaskResponse<Blob>> {
    try {
      const response = await fetch(`${FLASK_API_BASE}/compliance/download/${reportId}`, {
        headers: {
          'Authorization': this.token ? `Bearer ${this.token}` : '',
        },
      });

      if (!response.ok) {
        return { success: false, error: 'Failed to download report' };
      }

      const blob = await response.blob();
      return { success: true, data: blob };
    } catch (error) {
      return { success: false, error: 'Download failed' };
    }
  }

  // Team Management
  async inviteTeamMember(email: string, role: string, teams: string[]): Promise<FlaskResponse<{
    invitation_id: string;
    status: string;
  }>> {
    return this.makeRequest('/team/invite', {
      method: 'POST',
      body: JSON.stringify({ email, role, teams }),
    });
  }

  async getTeamMembers(): Promise<FlaskResponse<any[]>> {
    return this.makeRequest('/team/members');
  }

  // Domain Rules
  async addDomainRule(domain: string, rule_type: string): Promise<FlaskResponse<{
    rule_id: string;
    domain: string;
    type: string;
  }>> {
    return this.makeRequest('/domain-rules', {
      method: 'POST',
      body: JSON.stringify({ domain, rule_type }),
    });
  }

  async getDomainRules(): Promise<FlaskResponse<any[]>> {
    return this.makeRequest('/domain-rules');
  }

  async removeDomainRule(ruleId: string): Promise<FlaskResponse<any>> {
    return this.makeRequest(`/domain-rules/${ruleId}`, {
      method: 'DELETE',
    });
  }

  // Paste Control
  async validatePaste(validationData: {
    user_id: string;
    device_id: string;
    domain?: string;
    application?: string;
    content_hash: string;
  }): Promise<FlaskResponse<{ allowed: boolean; reason: string }>> {
    return this.makeRequest('/paste-control/validate', {
      method: 'POST',
      body: JSON.stringify(validationData),
    });
  }

  // Audit Logging
  async createAuditLog(logData: {
    user_id: string;
    device_id: string;
    action: string;
    target_domain?: string;
    target_application?: string;
    content_hash: string;
    status: string;
    metadata?: any;
  }): Promise<FlaskResponse<any>> {
    return this.makeRequest('/audit/log', {
      method: 'POST',
      body: JSON.stringify(logData),
    });
  }

  // Health Check
  async healthCheck(): Promise<FlaskResponse<{ status: string; version: string }>> {
    return this.makeRequest('/health');
  }
}

export const flaskApi = new FlaskApiService();
