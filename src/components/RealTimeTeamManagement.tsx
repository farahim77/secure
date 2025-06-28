
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserPlus, Mail, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { realTimeApi } from "@/services/realTimeApi";
import { useAuth } from "@/hooks/useAuth";

interface TeamMember {
  id: string;
  email: string;
  role: string;
  teams: string[];
  status: 'active' | 'pending' | 'inactive';
  last_active?: string;
  invited_at: string;
}

// Type guard function
const isTeamMemberArray = (data: unknown): data is TeamMember[] => {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' && 
    item !== null &&
    'id' in item &&
    'email' in item &&
    'role' in item &&
    'status' in item
  );
};

export function RealTimeTeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  // Form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("developer");
  const [inviteTeams, setInviteTeams] = useState("");

  useEffect(() => {
    if (session?.access_token) {
      realTimeApi.setToken(session.access_token);
      loadTeamMembers();
    }
  }, [session]);

  const loadTeamMembers = async () => {
    setIsLoading(true);
    try {
      const response = await realTimeApi.getTeamMembers();
      
      if (response.success && response.data && isTeamMemberArray(response.data)) {
        setMembers(response.data);
      } else {
        // Fallback data for demo
        const mockMembers: TeamMember[] = [
          {
            id: '1',
            email: 'admin@company.com',
            role: 'admin',
            teams: ['security', 'development'],
            status: 'active',
            last_active: '2024-01-15T10:30:00Z',
            invited_at: '2024-01-01T00:00:00Z'
          }
        ];
        setMembers(mockMembers);
      }
    } catch (error) {
      console.error('Failed to load team members:', error);
      toast({
        title: "Load failed",
        description: "Failed to load team members. Using demo data.",
        variant: "destructive"
      });
      
      // Set demo data on error
      setMembers([
        {
          id: '1',
          email: 'admin@company.com',
          role: 'admin',
          teams: ['security', 'development'],
          status: 'active',
          last_active: '2024-01-15T10:30:00Z',
          invited_at: '2024-01-01T00:00:00Z'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Missing email",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    if (!inviteEmail.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsInviting(true);
    try {
      const teamsArray = inviteTeams.split(',').map(t => t.trim()).filter(t => t);
      
      const response = await realTimeApi.inviteTeamMember(inviteEmail, inviteRole, teamsArray);
      
      if (response.success) {
        toast({
          title: "Invitation sent",
          description: `Invitation has been sent to ${inviteEmail}`,
        });
        
        // Add the new member to the list with pending status
        const newMember: TeamMember = {
          id: Date.now().toString(),
          email: inviteEmail,
          role: inviteRole,
          teams: teamsArray,
          status: 'pending',
          invited_at: new Date().toISOString()
        };
        
        setMembers(prev => [...prev, newMember]);
        
        // Reset form
        setInviteEmail("");
        setInviteRole("developer");
        setInviteTeams("");
      } else {
        throw new Error(response.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Invite error:', error);
      toast({
        title: "Invitation failed",
        description: error instanceof Error ? error.message : "Failed to send invitation",
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'inactive':
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'developer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading team data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Team Members (Real-Time)</h2>
          <p className="text-slate-600">Manage team access and permissions</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadTeamMembers} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-600" />
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              Active Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {members.filter(m => m.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-yellow-600" />
              Pending Invites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {members.filter(m => m.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Invite New Member</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="teams">Teams (comma-separated)</Label>
                <Input
                  id="teams"
                  placeholder="security, development, qa"
                  value={inviteTeams}
                  onChange={(e) => setInviteTeams(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleInvite} 
                disabled={isInviting}
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                {isInviting ? "Sending..." : "Send Invitation"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No team members found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Teams</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(member.status)}
                            <span className="font-medium">{member.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(member.role)}>
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {member.teams.map((team, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {team}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(member.status)}>
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                            {member.status === 'pending' && (
                              <Button size="sm" variant="outline">
                                Resend
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
