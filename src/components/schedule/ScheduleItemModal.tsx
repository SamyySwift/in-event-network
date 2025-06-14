
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, MapPin, User, Building, Globe, Twitter, Linkedin, ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ScheduleItemModalProps {
  item: {
    id: string;
    title: string;
    description?: string | null;
    start_time: string;
    end_time?: string;
    location?: string | null;
    type: 'speaker' | 'schedule';
    speaker_name?: string;
    speaker_photo?: string;
    speaker_company?: string;
    speaker_bio?: string;
    speaker_twitter?: string;
    speaker_linkedin?: string;
    speaker_website?: string;
    priority?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const ScheduleItemModal: React.FC<ScheduleItemModalProps> = ({ item, isOpen, onClose }) => {
  if (!item) return null;

  const formatTime = (timeStr: string) => {
    try {
      return format(parseISO(timeStr), 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeStr;
    }
  };

  const formatDate = (timeStr: string) => {
    try {
      return format(parseISO(timeStr), 'EEEE, MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return timeStr;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'speaker':
        return <Badge variant="default">Speaker Session</Badge>;
      case 'schedule':
        return <Badge variant="secondary">Event Item</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low Priority</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'website':
        return <Globe className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  const renderSocialLinks = () => {
    if (item.type !== 'speaker') return null;
    
    const socialLinks = [];
    if (item.speaker_twitter) socialLinks.push({ platform: 'twitter', url: item.speaker_twitter, label: 'Twitter' });
    if (item.speaker_linkedin) socialLinks.push({ platform: 'linkedin', url: item.speaker_linkedin, label: 'LinkedIn' });
    if (item.speaker_website) socialLinks.push({ platform: 'website', url: item.speaker_website, label: 'Website' });
    
    if (socialLinks.length === 0) return null;
    
    return (
      <div className="space-y-2">
        <h3 className="font-medium text-sm text-gray-600 dark:text-gray-400">Connect with Speaker</h3>
        <div className="flex gap-2">
          {socialLinks.map((link, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => window.open(link.url, '_blank')}
            >
              {getSocialIcon(link.platform)}
              {link.label}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{item.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Type and Priority Badges */}
          <div className="flex gap-2">
            {getTypeBadge(item.type)}
            {getPriorityBadge(item.priority)}
          </div>

          {/* Speaker Information (if applicable) */}
          {item.type === 'speaker' && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  {item.speaker_photo ? (
                    <AvatarImage src={item.speaker_photo} alt={item.speaker_name} />
                  ) : (
                    <AvatarFallback className="text-lg">
                      {item.speaker_name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.speaker_name}</h3>
                  {item.speaker_company && (
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 mb-2">
                      <Building className="h-4 w-4" />
                      <span>{item.speaker_company}</span>
                    </div>
                  )}
                  {item.speaker_bio && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {item.speaker_bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Time and Date Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatDate(item.start_time)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Time</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatTime(item.start_time)}
                    {item.end_time && ` - ${formatTime(item.end_time)}`}
                  </p>
                </div>
              </div>
            </div>

            {item.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-gray-600 dark:text-gray-400">{item.location}</p>
                </div>
              </div>
            )}
          </div>

          {/* Social Links */}
          {renderSocialLinks()}

          {/* Description */}
          {item.description && (
            <div>
              <h3 className="font-medium mb-2">
                {item.type === 'speaker' ? 'Session Description' : 'Description'}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleItemModal;
