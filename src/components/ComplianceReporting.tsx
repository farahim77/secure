import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, FileText, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { realTimeApi } from "@/services/realTimeApi";
import { useAuth } from "@/hooks/useAuth";
import { ComplianceReportResponse, isComplianceReportResponse } from "@/types/api";

interface ComplianceReport {
  id: string;
  name: string;
  type: string;
  status: 'generating' | 'ready' | 'failed';
  created_at: string;
  download_url?: string;
  file_size?: number;
}

interface ReportMetrics {
  totalCompliance: number;
  violations: number;
  lastAudit: string;
  dataProtectionScore: number;
}

export function ComplianceReporting() {
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [metrics, setMetrics] = useState<ReportMetrics>({
    totalCompliance: 85,
    violations: 3,
    lastAudit: '2024-01-15',
    dataProtectionScore: 92
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { session } = useAuth();

  // Form state
  const [complianceStandard, setComplianceStandard] = useState("gdpr");
  const [reportType, setReportType] = useState("audit");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reportSections, setReportSections] = useState({
    executiveSummary: true,
    accessControls: true,
    policyViolations: true,
    securityIncidents: true,
    auditLogs: true,
    encryptionStatus: false,
    dataMapping: false,
    riskAssessment: false
  });

  useEffect(() => {
    if (session?.access_token) {
      realTimeApi.setToken(session.access_token);
      loadReports();
    }
  }, [session]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const response = await realTimeApi.getComplianceReports();
      if (response.success && response.data) {
        // Type check the response data
        if (Array.isArray(response.data)) {
          setReports(response.data as ComplianceReport[]);
        } else {
          // If not an array, use mock data
          const mockReports: ComplianceReport[] = [
            {
              id: '1',
              name: 'GDPR Compliance Report - Q1 2024',
              type: 'GDPR',
              status: 'ready',
              created_at: '2024-01-15T10:30:00Z',
              download_url: '/reports/gdpr-q1-2024.pdf',
              file_size: 2048576
            },
            {
              id: '2',
              name: 'SOX Audit Trail Report',
              type: 'SOX',
              status: 'ready',
              created_at: '2024-01-10T14:20:00Z',
              download_url: '/reports/sox-audit-2024.pdf',
              file_size: 1536000
            }
          ];
          setReports(mockReports);
        }
      } else {
        // Mock data fallback
        const mockReports: ComplianceReport[] = [
          {
            id: '1',
            name: 'GDPR Compliance Report - Q1 2024',
            type: 'GDPR',
            status: 'ready',
            created_at: '2024-01-15T10:30:00Z',
            download_url: '/reports/gdpr-q1-2024.pdf',
            file_size: 2048576
          },
          {
            id: '2',
            name: 'SOX Audit Trail Report',
            type: 'SOX',
            status: 'ready',
            created_at: '2024-01-10T14:20:00Z',
            download_url: '/reports/sox-audit-2024.pdf',
            file_size: 1536000
          }
        ];
        setReports(mockReports);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast({
        title: "Load failed",
        description: "Failed to load compliance reports",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing dates",
        description: "Please select both start and end dates",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const selectedSections = Object.entries(reportSections)
        .filter(([_, selected]) => selected)
        .map(([section, _]) => section);

      const reportConfig = {
        compliance_standard: complianceStandard,
        report_type: reportType,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        sections: selectedSections
      };

      const response = await realTimeApi.generateComplianceReport(reportConfig);
      
      if (response.success && response.data && isComplianceReportResponse(response.data)) {
        toast({
          title: "Report generated",
          description: "Compliance report has been generated successfully",
        });
        
        // Add the new report to the list
        const newReport: ComplianceReport = {
          id: response.data.report_id,
          name: `${complianceStandard.toUpperCase()} ${reportType} Report - ${format(new Date(), 'MMM yyyy')}`,
          type: complianceStandard.toUpperCase(),
          status: 'ready',
          created_at: new Date().toISOString(),
          download_url: response.data.download_url,
          file_size: response.data.file_size
        };
        
        setReports(prev => [newReport, ...prev]);
      } else {
        throw new Error(response.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate compliance report",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = async (report: ComplianceReport) => {
    try {
      if (report.download_url) {
        const response = await realTimeApi.downloadComplianceReport(report.id);
        
        if (response.success && response.data) {
          const blob = response.data as Blob;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `${report.name}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          toast({
            title: "Download started",
            description: "Report download has started",
          });
        } else {
          throw new Error(response.error);
        }
      } else {
        // Mock download for demo
        toast({
          title: "Download started",
          description: "Report download has started (demo mode)",
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Failed to download compliance report",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'generating':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading compliance data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Compliance Reporting</h2>
          <p className="text-slate-600">Generate and manage compliance reports</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadReports} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Shield className="w-4 h-4 mr-2 text-green-600" />
              Overall Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.totalCompliance}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
              Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.violations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="w-4 h-4 mr-2 text-blue-600" />
              Data Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.dataProtectionScore}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-purple-600" />
              Last Audit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{metrics.lastAudit}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="metrics">Compliance Metrics</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="compliance-standard">Compliance Standard</Label>
                  <Select value={complianceStandard} onValueChange={setComplianceStandard}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gdpr">GDPR - General Data Protection Regulation</SelectItem>
                      <SelectItem value="sox">SOX - Sarbanes-Oxley Act</SelectItem>
                      <SelectItem value="hipaa">HIPAA - Health Insurance Portability</SelectItem>
                      <SelectItem value="pci">PCI DSS - Payment Card Industry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="audit">Audit Trail Report</SelectItem>
                      <SelectItem value="compliance">Compliance Assessment</SelectItem>
                      <SelectItem value="risk">Risk Analysis Report</SelectItem>
                      <SelectItem value="incident">Incident Response Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold">Report Sections</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {Object.entries(reportSections).map(([section, checked]) => (
                    <div key={section} className="flex items-center space-x-2">
                      <Checkbox
                        id={section}
                        checked={checked}
                        onCheckedChange={(checked) => 
                          setReportSections(prev => ({ ...prev, [section]: !!checked }))
                        }
                      />
                      <Label htmlFor={section} className="text-sm">
                        {section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={generateReport} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? "Generating..." : "Generate & Download Report"}
              </Button>
            </CardContent>
          </Card>

          {reports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(report.status)}
                        <div>
                          <h4 className="font-medium">{report.name}</h4>
                          <p className="text-sm text-slate-600">
                            {format(new Date(report.created_at), 'PPP')}
                            {report.file_size && ` • ${formatFileSize(report.file_size)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                        {report.status === 'ready' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => downloadReport(report)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-slate-500 py-8">No scheduled reports configured</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-slate-500 py-8">Compliance metrics dashboard coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations">
          <Card>
            <CardHeader>
              <CardTitle>Policy Violations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-slate-500 py-8">No policy violations detected</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
