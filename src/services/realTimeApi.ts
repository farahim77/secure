const FLASK_API_BASE = 'http://localhost:5000/api';

class RealTimeApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const response = await fetch(`${FLASK_API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.token ? `Bearer ${this.token}` : '',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.error || errorData.message || 'Request failed' };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      return { success: false, error: 'Network error - Make sure Flask API is running' };
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  //for signout 
async logout() {
    return this.makeRequest('/auth/logout', {
      method: 'POST'
    });
  }






  // Dashboard
  async getDashboardStats() {
    return this.makeRequest('/dashboard/stats');
  }

  async getRecentActivity() {
    return this.makeRequest('/dashboard/activity');
  }

  // Device Management
  async getDevices() {
    return this.makeRequest('/devices');
  }

  async registerDevice(name: string, type: string, platform?: string, publicKey?: string) {
    return this.makeRequest('/devices/register', {
      method: 'POST',
      body: JSON.stringify({ 
        name, 
        type, 
        platform,
        public_key: publicKey,
        fingerprint: this.generateDeviceFingerprint(),
        browser_info: this.getBrowserInfo()
      }),
    });
  }

  async revokeDevice(deviceId: string) {
    return this.makeRequest(`/devices/${deviceId}/revoke`, {
      method: 'POST',
    });
  }

  // Browser Extension
  async getExtensionStatus() {
    return this.makeRequest('/browser-extension/status');
  }

  async sendExtensionHeartbeat(browserType: string, version: string) {
    return this.makeRequest('/browser-extension/heartbeat', {
      method: 'POST',
      body: JSON.stringify({ browser_type: browserType, version }),
    });
  }

  async getBrowserActivities() {
    return this.makeRequest('/browser-extension/activities');
  }

  // Domain Rules
  async getDomainRules() {
    return this.makeRequest('/domain-rules');
  }

  async addDomainRule(domain: string, type: string) {
    return this.makeRequest('/domain-rules', {
      method: 'POST',
      body: JSON.stringify({ domain, rule_type: type }),
    });
  }

  async removeDomainRule(ruleId: string) {
    return this.makeRequest(`/domain-rules/${ruleId}`, {
      method: 'DELETE',
    });
  }

  // Clipboard
  async uploadClipboard(data: any) {
    return this.makeRequest('/clipboard/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLatestClipboard(userId: string) {
    return this.makeRequest(`/clipboard/latest/${userId}`);
  }

  // Encryption Key Management
  // Encryption Key Management
async getEncryptionKeys() {
  return this.makeRequest('/encryption/keys');
}

async generateEncryptionKey(type = 'AES-256', name?: string) {
  return this.makeRequest('/encryption/generate', {
    method: 'POST',
    body: JSON.stringify({ type, name }),
  });
}

async exportEncryptionKey(keyId: string) {
  return this.makeRequest(`/encryption/export/${keyId}`);
}

async rotateEncryptionKey(keyId: string) {
  return this.makeRequest(`/encryption/rotate/${keyId}`, {
    method: 'POST',
  });
}

async importEncryptionKey(data: any) {
  return this.makeRequest('/encryption/import', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async exportAllPublicKeys() {
  return this.makeRequest('/encryption/export-all-public');
}

async forceKeyRotation() {
  return this.makeRequest('/encryption/force-rotation', {
    method: 'POST',
  });
}

async revokeAllKeys() {
  return this.makeRequest('/encryption/revoke-all', {
    method: 'POST',
  });
}
  // Team Management
  async getTeamMembers() {
    return this.makeRequest('/team/members');
  }

  async inviteTeamMember(email: string, role: string, teams: string[]) {
    return this.makeRequest('/team/invite', {
      method: 'POST',
      body: JSON.stringify({ email, role, teams }),
    });
  }

  // Security Policies
  async getSecurityPolicies() {
    return this.makeRequest('/policies');
  }

  async createSecurityPolicy(name: string, type: string, rules: any) {
    return this.makeRequest('/policies', {
      method: 'POST',
      body: JSON.stringify({ name, type, rules }),
    });
  }

  // Audit Logs
  async getAuditLogs(page = 1, perPage = 20) {
    return this.makeRequest(`/audit/logs?page=${page}&per_page=${perPage}`);
  }

  async createAuditLog(logData: any) {
    return this.makeRequest('/audit/logs', {
      method: 'POST',
      body: JSON.stringify(logData),
    });
  }

  // Content Analysis with OpenAI
  async analyzeContentWithAI(content: string) {
    return this.makeRequest('/content/analyze-ai', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Content Scanning
  async scanContent(content: string) {
    return this.makeRequest('/content/scan', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Compliance Reports - Added missing methods
  async getComplianceReports() {
    return this.makeRequest('/compliance/reports');
  }

  async generateComplianceReport(config: any) {
    return this.makeRequest('/compliance/generate-report', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async downloadComplianceReport(reportId: string) {
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

  // Helper methods
  private generateDeviceFingerprint(): string {
    const fingerprint = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hardwareConcurrency: navigator.hardwareConcurrency,
    };
    
    return btoa(JSON.stringify(fingerprint));
  }

  private getBrowserInfo(): any {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
    };
  }
}

export const realTimeApi = new RealTimeApiService();
