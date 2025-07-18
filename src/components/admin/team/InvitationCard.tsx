
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Copy, 
  Send, 
  UserX, 
  Clock,
  Mail,
  Link,
  CheckCircle,
  Share
} from 'lucide-react';
import { TeamInvitation, DASHBOARD_SECTIONS } from '@/hooks/useTeamManagement';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface InvitationCardProps {
  invitation: TeamInvitation;
  onResend: (id: string) => void;
  onRevoke: (id: string) => void;
}

export function InvitationCard({ invitation, onResend, onRevoke }: InvitationCardProps) {
  const [showInviteLink, setShowInviteLink] = useState(false);
  
  const inviteUrl = `${window.location.origin}/team-signup?token=${invitation.token}`;
  
  const isExpired = invitation.expires_at && new Date(invitation.expires_at) < new Date();
  const isExpiring = invitation.expires_at && 
    new Date(invitation.expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('Invite link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareViaWhatsApp = () => {
    const message = `You've been invited to join our event management team! Click here to accept: ${inviteUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = 'Team Invitation - Event Management';
    const body = `You've been invited to join our event management team!\n\nClick the link below to accept the invitation:\n${inviteUrl}\n\nThis invitation will allow you to access specific sections of our event dashboard.`;
    const emailUrl = `mailto:${invitation.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl);
  };

  const getSectionLabel = (value: string) => {
    return DASHBOARD_SECTIONS.find(s => s.value === value)?.label || value;
  };

  return (
    <Card className={`${isExpired || invitation.status === 'revoked' ? 'opacity-60' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {invitation.email}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Invited {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {invitation.status === 'pending' && !isExpired ? (
            <Badge variant="outline" className="border-yellow-200 text-yellow-800">
              <Clock className="w-3 h-3 mr-1" />
              Pending
            </Badge>
          ) : invitation.status === 'accepted' ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Accepted
            </Badge>
          ) : invitation.status === 'revoked' ? (
            <Badge variant="destructive">
              <UserX className="w-3 h-3 mr-1" />
              Revoked
            </Badge>
          ) : (
            <Badge variant="outline" className="border-red-200 text-red-600">
              <Clock className="w-3 h-3 mr-1" />
              Expired
            </Badge>
          )}

          {invitation.status === 'pending' && !isExpired && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowInviteLink(!showInviteLink)}>
                  <Link className="w-4 h-4 mr-2" />
                  {showInviteLink ? 'Hide' : 'Show'} Invite Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onResend(invitation.id)}>
                  <Send className="w-4 h-4 mr-2" />
                  Resend Invitation
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRevoke(invitation.id)} className="text-red-600">
                  <UserX className="w-4 h-4 mr-2" />
                  Revoke Invitation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {invitation.expires_at && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Expires:</span>
              <span className={isExpired ? 'text-red-600' : isExpiring ? 'text-orange-600' : ''}>
                {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
              </span>
            </div>
          )}

          <div>
            <p className="text-sm font-medium mb-2">
              Access to {invitation.allowed_sections.length} section{invitation.allowed_sections.length !== 1 ? 's' : ''}:
            </p>
            <div className="flex flex-wrap gap-1">
              {invitation.allowed_sections.map((section) => (
                <Badge key={section} variant="outline" className="text-xs">
                  {getSectionLabel(section)}
                </Badge>
              ))}
            </div>
          </div>

          {showInviteLink && invitation.status === 'pending' && !isExpired && (
            <div className="space-y-3 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Invite Link:</span>
                <Button variant="outline" size="sm" onClick={copyInviteLink}>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
              <Input value={inviteUrl} readOnly className="text-xs" />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={shareViaWhatsApp} className="flex-1">
                  <Share className="w-3 h-3 mr-1" />
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm" onClick={shareViaEmail} className="flex-1">
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
