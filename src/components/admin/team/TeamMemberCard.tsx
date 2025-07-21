
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Shield, 
  Clock, 
  UserMinus, 
  Edit,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { TeamMember, DASHBOARD_SECTIONS } from '@/hooks/useTeamManagement';
import { formatDistanceToNow } from 'date-fns';

interface TeamMemberCardProps {
  member: TeamMember;
  onUpdate: (memberId: string, data: any) => void;
  onRemove: (memberId: string) => void;
}

export function TeamMemberCard({ member, onUpdate, onRemove }: TeamMemberCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isExpiring = member.expires_at && new Date(member.expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const isExpired = member.expires_at && new Date(member.expires_at) < new Date();

  const getSectionLabel = (value: string) => {
    return DASHBOARD_SECTIONS.find(s => s.value === value)?.label || value;
  };

  return (
    <Card className={`${isExpired ? 'opacity-60' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={member.user.photo_url || ''} />
            <AvatarFallback>
              {member.user.name?.charAt(0) || member.user.email?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">
              {member.user.name || 'Unnamed User'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {member.user.email}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {member.is_active ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          ) : (
            <Badge variant="secondary">
              <UserMinus className="w-3 h-3 mr-1" />
              Inactive
            </Badge>
          )}
          
          {isExpiring && !isExpired && (
            <Badge variant="destructive">
              <AlertCircle className="w-3 h-3 mr-1" />
              Expiring Soon
            </Badge>
          )}
          
          {isExpired && (
            <Badge variant="outline" className="border-red-200 text-red-600">
              <Clock className="w-3 h-3 mr-1" />
              Expired
            </Badge>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsExpanded(!isExpanded)}>
                <Edit className="w-4 h-4 mr-2" />
                {isExpanded ? 'Hide Details' : 'Edit Permissions'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onRemove(member.id)}
                className="text-red-600"
              >
                <UserMinus className="w-4 h-4 mr-2" />
                Remove Access
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Joined:</span>
            <span>
              {member.joined_at 
                ? formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })
                : 'Pending'
              }
            </span>
          </div>
          
          {member.expires_at && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Expires:</span>
              <span className={isExpired ? 'text-red-600' : isExpiring ? 'text-orange-600' : ''}>
                {formatDistanceToNow(new Date(member.expires_at), { addSuffix: true })}
              </span>
            </div>
          )}

          <div>
            <div className="flex items-center mb-2">
              <Shield className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">
                Access to {member.allowed_sections.length} section{member.allowed_sections.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {member.allowed_sections.slice(0, isExpanded ? undefined : 3).map((section) => (
                <Badge key={section} variant="outline" className="text-xs">
                  {getSectionLabel(section)}
                </Badge>
              ))}
              {!isExpanded && member.allowed_sections.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{member.allowed_sections.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
