
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserPlus, Shield, Settings, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function TeamManagement() {
  const { toast } = useToast();
  const [teamMembers] = useState([
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@company.com",
      role: "Admin",
      teams: ["dev-team", "security-team"],
      lastActive: "2 minutes ago",
      status: "online"
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@company.com",
      role: "Developer",
      teams: ["dev-team"],
      lastActive: "15 minutes ago",
      status: "online"
    },
    {
      id: "3",
      name: "Mike Wilson",
      email: "mike.wilson@company.com",
      role: "Viewer",
      teams: ["qa-team"],
      lastActive: "1 hour ago",
      status: "offline"
    }
  ]);

  const handleInviteUser = () => {
    toast({
      title: "Invitation sent",
      description: "Team member invitation has been sent successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-slate-600">+2 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-slate-600">dev, security, qa, admin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Now</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-slate-600">67% availability</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
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
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-slate-600">{member.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={member.role === "Admin" ? "default" : "secondary"}
                        className={member.role === "Admin" ? "bg-blue-100 text-blue-800" : ""}
                      >
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.teams.map((team) => (
                          <Badge key={team} variant="outline" className="text-xs">
                            {team}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          member.status === "online" ? "bg-green-500" : "bg-gray-400"
                        }`} />
                        <span className="text-sm">{member.lastActive}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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
              <Input id="email" type="email" placeholder="user@company.com" />
            </div>
            
            <div>
              <Label htmlFor="role">Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="teams">Teams</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dev-team">Development Team</SelectItem>
                  <SelectItem value="security-team">Security Team</SelectItem>
                  <SelectItem value="qa-team">QA Team</SelectItem>
                  <SelectItem value="admin-team">Admin Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleInviteUser} className="w-full">
              <UserPlus className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
