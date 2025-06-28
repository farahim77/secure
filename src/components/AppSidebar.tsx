import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  FileText, 
  Monitor, 
  Globe, 
  Lock, 
  BarChart3, 
  Bell,
  Scan,
  Search,
  Code
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    url: "dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Team Management",
    url: "team",
    icon: Users,
  },
  {
    title: "Security Policies",
    url: "security",
    icon: Shield,
  },
  {
    title: "Audit Logs",
    url: "audit",
    icon: FileText,
  },
  {
    title: "Device Management",
    url: "devices",
    icon: Monitor,
  },
  {
    title: "Browser Extensions",
    url: "browser",
    icon: Globe,
  },
  {
    title: "Encryption Manager",
    url: "encryption",
    icon: Lock,
  },
  {
    title: "Compliance Reports",
    url: "compliance",
    icon: BarChart3,
  },
  {
    title: "Real-time Alerts",
    url: "alerts",
    icon: Bell,
  },
  {
    title: "Content Scanner",
    url: "scanner",
    icon: Scan,
  },
  {
    title: "Content Analyzer",
    url: "analyzer",
    icon: Search,
  },
];

const flaskMenuItems = [
  {
    title: "Flask Analyzer",
    url: "flask-analyzer",
    icon: Search,
  },
  {
    title: "Flask Scanner", 
    url: "flask-scanner",
    icon: Scan,
  },
  {
    title: "Flask Setup Guide",
    url: "flask-guide",
    icon: Code,
  },
];

interface AppSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export function AppSidebar({ activeView, setActiveView }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>SecureClip Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={activeView === item.url}
                  >
                    <button 
                      onClick={() => setActiveView(item.url)}
                      className="w-full flex items-center space-x-2"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Flask Backend</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {flaskMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={activeView === item.url}
                  >
                    <button 
                      onClick={() => setActiveView(item.url)}
                      className="w-full flex items-center space-x-2"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
