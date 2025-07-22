
import React from 'react';
import { Calendar, Clock, MapPin, User, X, ExternalLink, Linkedin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import XLogo from "@/components/icons/XLogo";

interface ScheduleItemModalProps {
  item: {
    id: string;
    title: string;
    description?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    location?: string | null;
    type: 'schedule' | 'speaker';
    speaker_name?: string;
    speaker_photo?: string;
    speaker_company?: string;
    speaker_bio?: string;
    speaker_twitter?: string;
    speaker_linkedin?: string;
    speaker_website?: string;
    speaker_instagram?: string;
    speaker_tiktok?: string;
    speaker_topic?: string;
    priority?: string;
    image_url?: string;
    time_allocation?: string | null; // Add time allocation
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const ScheduleItemModal: React.FC<ScheduleItemModalProps> = ({ item, isOpen, onClose }) => {
  if (!item) return null;

  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return '';
    try {
      return new Date(timeStr).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return timeStr;
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'x':
        return <XLogo size={16} />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'website':
        return <Globe className="w-4 h-4" />;
      case 'instagram':
        return <User className="w-4 h-4" />; // Using User icon as placeholder for Instagram
      case 'tiktok':
        return <ExternalLink className="w-4 h-4" />; // Using ExternalLink as placeholder for TikTok
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  const renderSocialLinks = () => {
    if (item.type !== 'speaker') return null;

    const socialLinks = [];
    if (item.speaker_twitter) socialLinks.push({ platform: 'x', url: item.speaker_twitter });
    if (item.speaker_linkedin) socialLinks.push({ platform: 'linkedin', url: item.speaker_linkedin });
    if (item.speaker_website) socialLinks.push({ platform: 'website', url: item.speaker_website });
    if (item.speaker_instagram) socialLinks.push({ platform: 'instagram', url: item.speaker_instagram });
    if (item.speaker_tiktok) socialLinks.push({ platform: 'tiktok', url: item.speaker_tiktok });

    if (socialLinks.length === 0) return null;

    return (
      <div className="flex items-center gap-2 mt-4">
        <span className="text-sm font-medium">Connect:</span>
        <div className="flex gap-2">
          {socialLinks.map((link, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => window.open(link.url, '_blank')}
              className="flex items-center gap-2"
            >
              {getSocialIcon(link.platform)}
              {link.platform === 'x' ? 'X' : link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold pr-8">{item.title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Event/Speaker Image */}
          {(item.image_url || item.speaker_photo) && (
            <div className="w-full h-64 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src={item.image_url || item.speaker_photo} 
                alt={item.title}
                className="w-full h-full object-cover object-top"
              />
            </div>
          )}

          {/* Time and Location Info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {item.start_time && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {formatTime(item.start_time)}
                  {item.end_time && ` - ${formatTime(item.end_time)}`}
                </span>
              </div>
            )}
            
            {item.time_allocation && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Duration: {item.time_allocation}</span>
              </div>
            )}
            
            {item.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{item.location}</span>
              </div>
            )}
          </div>

          {/* Type and Priority Badges */}
          <div className="flex gap-2">
            <Badge variant={item.type === 'speaker' ? 'default' : 'secondary'}>
              {item.type === 'speaker' ? (
                <>
                  <User className="w-3 h-3 mr-1" />
                  Speaker Session
                </>
              ) : (
                <>
                  <Calendar className="w-3 h-3 mr-1" />
                  Event Item
                </>
              )}
            </Badge>
            
            {item.priority && (
              <Badge variant="outline">{item.priority} Priority</Badge>
            )}
          </div>

          {/* Speaker Info */}
          {item.type === 'speaker' && item.speaker_name && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-4">
                {item.speaker_photo && (
                  <img 
                    src={item.speaker_photo} 
                    alt={item.speaker_name}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{item.speaker_name}</h3>
                  {item.speaker_company && (
                    <p className="text-muted-foreground">{item.speaker_company}</p>
                  )}
                </div>
              </div>
              
              {item.speaker_bio && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">About the Speaker</h4>
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
                    {item.speaker_bio}
                  </div>
                </div>
              )}

              {renderSocialLinks()}
            </div>
          )}

          {/* Description - Only show for non-speaker items or if speaker has specific session description */}
          {item.description && item.type !== 'speaker' && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
                {item.description}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleItemModal;
