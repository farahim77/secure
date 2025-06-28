
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { RealTimeDashboard } from "@/components/RealTimeDashboard";
import { RealTimeTeamManagement } from "@/components/RealTimeTeamManagement";
import { SecurityPolicies } from "@/components/SecurityPolicies";
import { AuditLogs } from "@/components/AuditLogs";
import { DeviceManagement } from "@/components/DeviceManagement";
import { BrowserExtensionMonitor } from "@/components/BrowserExtensionMonitor";
import { EncryptionManager } from "@/components/EncryptionManager";
import { ComplianceReporting } from "@/components/ComplianceReporting";
import { RealTimeAlerts } from "@/components/RealTimeAlerts";
import { ClipboardScanner } from "@/components/ClipboardScanner";
import { ContentAnalyzer } from "@/components/ContentAnalyzer";
import { FlaskContentAnalyzer } from "@/components/FlaskContentAnalyzer";
import { FlaskClipboardScanner } from "@/components/FlaskClipboardScanner";
import { FlaskBackendGuide } from "./FlaskBackendGuide";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const { user } = useAuth();

  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return <RealTimeDashboard />;
      case "team":
        return <RealTimeTeamManagement />;
      case "security":
        return <SecurityPolicies />;
      case "audit":
        return <AuditLogs />;
      case "devices":
        return <DeviceManagement />;
      case "browser":
        return <BrowserExtensionMonitor />;
      case "encryption":
        return <EncryptionManager />;
      case "compliance":
        return <ComplianceReporting />;
      case "alerts":
        return <RealTimeAlerts />;
      case "scanner":
        return <ClipboardScanner />;
      case "analyzer":
        return <ContentAnalyzer />;
      case "flask-analyzer":
        return <FlaskContentAnalyzer />;
      case "flask-scanner":
        return <FlaskClipboardScanner />;
      case "flask-guide":
        return <FlaskBackendGuide />;
      default:
        return <RealTimeDashboard />;
    }
  };

  if (!user) {
    return null; // This will be handled by the ProtectedRoute
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <AppSidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="flex-1 p-6">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
