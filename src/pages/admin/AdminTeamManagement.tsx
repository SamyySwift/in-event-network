
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Shield,
  Clock,
  Mail
} from 'lucide-react';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { AddTeamMemberDialog } from '@/components/admin/team/AddTeamMemberDialog';
import { TeamMemberCard } from '@/components/admin/team/TeamMemberCard';
import { InvitationCard } from '@/components/admin/team/InvitationCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export default function AdminTeamManagement() {
  const { currentEvent } = useAdminEventContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('members');

  const {
    invitations,
    teamMembers,
    isLoading,
    createInvitation,
    resendInvitation,
    revokeInvitation,
    updateTeamMember,
    removeTeamMember,
  } = useTeamManagement(currentEvent?.id || '');

  const filteredMembers = teamMembers.filter(member =>
    member.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvitations = invitations.filter(invitation =>
    invitation.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeMembers = teamMembers.filter(m => m.is_active && (!m.expires_at || new Date(m.expires_at) > new Date()));
  const pendingInvitations = invitations.filter(i => i.status === 'pending' && (!i.expires_at || new Date(i.expires_at) > new Date()));

  if (!currentEvent) {
    return (
      <div className="container mx-auto p-6">
        <AdminPageHeader
          title="Team Management"
          description="Manage your event team members and permissions"
        />
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Please select an event to manage team members.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AdminPageHeader
        title="Team Management"
        description="Manage your event team members and their dashboard permissions"
        action={
          <AddTeamMemberDialog
            onAddMember={(data) => createInvitation.mutate(data)}
            isLoading={createInvitation.isPending}
          />
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold">{activeMembers.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Invites</p>
                <p className="text-2xl font-bold">{pendingInvitations.length}</p>
              </div>
              <UserPlus className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Invitations</p>
                <p className="text-2xl font-bold">{invitations.length}</p>
              </div>
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold">
                  {teamMembers.filter(m => 
                    m.expires_at && 
                    new Date(m.expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
                    new Date(m.expires_at) > new Date()
                  ).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members or invitations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="members" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Members ({teamMembers.length})
              </TabsTrigger>
              <TabsTrigger value="invitations" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Invitations ({invitations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-4 mt-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading team members...</p>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No team members found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'No members match your search.' : 'Start by inviting team members to collaborate on your event.'}
                  </p>
                  {!searchTerm && (
                    <AddTeamMemberDialog
                      onAddMember={(data) => createInvitation.mutate(data)}
                      isLoading={createInvitation.isPending}
                    />
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredMembers.map((member) => (
                    <TeamMemberCard
                      key={member.id}
                      member={member}
                      onUpdate={updateTeamMember.mutate}
                      onRemove={removeTeamMember.mutate}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="invitations" className="space-y-4 mt-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading invitations...</p>
                </div>
              ) : filteredInvitations.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No invitations found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'No invitations match your search.' : 'Send invitations to add team members to your event.'}
                  </p>
                  {!searchTerm && (
                    <AddTeamMemberDialog
                      onAddMember={(data) => createInvitation.mutate(data)}
                      isLoading={createInvitation.isPending}
                    />
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredInvitations.map((invitation) => (
                    <InvitationCard
                      key={invitation.id}
                      invitation={invitation}
                      onResend={resendInvitation.mutate}
                      onRevoke={revokeInvitation.mutate}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
