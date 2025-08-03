import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MapPin, 
  Briefcase, 
  Mail, 
  MessageSquare,
  UserPlus,
  ExternalLink
} from 'lucide-react';
import { FaLinkedin, FaTwitter, FaInstagram, FaGithub } from 'react-icons/fa';

interface AttendeeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendee: {
    id: string;
    name: string;
    email?: string;
    photo_url?: string;
    bio?: string;
    niche?: string;
    location?: string;
    company?: string;
    links?: {
      linkedin?: string;
      twitter?: string;
      instagram?: string;
      github?: string;
    };
  } | null;
  onConnect?: (userId: string) => void;
  onMessage?: (userId: string, userName: string, userPhoto?: string) => void;
  isConnected?: boolean;
  connectionStatus?: 'none' | 'pending' | 'connected';
}

export const AttendeeProfileModal: React.FC<AttendeeProfileModalProps> = ({
  isOpen,
  onClose,
  attendee,
  onConnect,
  onMessage,
  isConnected = false,
  connectionStatus = 'none'
}) => {
  if (!attendee) return null;

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return <FaLinkedin className="h-4 w-4" />;
      case 'twitter':
        return <FaTwitter className="h-4 w-4" />;
      case 'instagram':
        return <FaInstagram className="h-4 w-4" />;
      case 'github':
        return <FaGithub className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getConnectionButtonText = () => {
    switch (connectionStatus) {
      case 'pending':
        return 'Request Sent';
      case 'connected':
        return 'Connected';
      default:
        return 'Connect';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Attendee Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              {attendee.photo_url ? (
                <AvatarImage src={attendee.photo_url} alt={attendee.name} />
              ) : (
                <AvatarFallback className="bg-connect-100 text-connect-600 dark:bg-connect-900 dark:text-connect-300 text-xl">
                  {attendee.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {attendee.name}
            </h3>
            
            {attendee.niche && (
              <Badge variant="secondary" className="mb-3">
                {attendee.niche}
              </Badge>
            )}
          </div>

          {/* Bio */}
          {attendee.bio && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">About</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {attendee.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Professional Info */}
          <Card>
            <CardContent className="p-4 space-y-3">
              {attendee.company && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {attendee.company}
                  </span>
                </div>
              )}
              
              {attendee.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {attendee.location}
                  </span>
                </div>
              )}
              
              {attendee.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {attendee.email}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Links */}
          {attendee.links && Object.keys(attendee.links).length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Social Links</h4>
                <div className="space-y-2">
                  {Object.entries(attendee.links).map(([platform, url]) => {
                    if (!url) return null;
                    
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        {getSocialIcon(platform)}
                        <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                          {platform}
                        </span>
                        <ExternalLink className="h-3 w-3 text-gray-400 ml-auto" />
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {onConnect && (
              <Button
                onClick={() => onConnect(attendee.id)}
                disabled={connectionStatus === 'pending' || connectionStatus === 'connected'}
                className="flex-1"
                variant={connectionStatus === 'connected' ? 'secondary' : 'default'}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {getConnectionButtonText()}
              </Button>
            )}
            
            {onMessage && (
              <Button
                onClick={() => onMessage(attendee.id, attendee.name, attendee.photo_url)}
                variant="outline"
                className="flex-1"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};