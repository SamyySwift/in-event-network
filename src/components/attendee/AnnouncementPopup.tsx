// File-scope imports and types
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Megaphone, Clock, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InlineVendorForm } from '@/components/forms/InlineVendorForm';
import { FaInstagram, FaTiktok, FaFacebook } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

// Top-level types and component signature changes
interface Announcement {
  id: string;
  title: string;
  content: string;
  priority?: 'high' | 'normal' | 'low' | string;
  image_url?: string | null;
  created_at?: string;
  website_link?: string | null;
  vendor_form_id?: string | null;
  require_submission?: boolean | null;
  twitter_link?: string | null;
  instagram_link?: string | null;
  facebook_link?: string | null;
  tiktok_link?: string | null;
}

interface AnnouncementPopupProps {
  isOpen: boolean;
  announcement: Announcement | null;
  onClose: () => void;
  onNeverShowAgain?: () => void;
  onAcknowledge?: () => void;
  allowDismiss?: boolean;
}

export function AnnouncementPopup({ isOpen, announcement, onClose, onNeverShowAgain, onAcknowledge, allowDismiss = true }: AnnouncementPopupProps) {
  const navigate = useNavigate();

  if (!announcement) return null;

  // Derived flags to control actions and behavior
  const isCompulsory = !!announcement.require_submission;
  const hasVendorForm = !!announcement.vendor_form_id;
  const hasExternalLink = !!announcement.website_link;

  const priority = (announcement.priority || 'normal').toLowerCase();
  const priorityBadge = (() => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-gradient-to-r from-red-500 to-yellow-400 text-white"><AlertTriangle className="w-4 h-4 mr-1" /> High</Badge>;
      case 'low':
        return <Badge className="bg-gradient-to-r from-slate-400 to-gray-200 text-white">Low</Badge>;
      default:
        return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white">Normal</Badge>;
    }
  })();

  return (
    // Update the Dialog onOpenChange logic
    <Dialog open={isOpen} onOpenChange={allowDismiss && !hasVendorForm ? onClose : () => {}}>
      <DialogContent className="max-w-[95vw] sm:max-w-md w-full p-0 overflow-hidden rounded-xl">
        <div className="flex flex-col max-h-[90dvh] sm:max-h-[85vh]">
          <DialogHeader className="px-4 sm:px-6 pt-4 pb-3 border-b sticky top-0 z-10 bg-white/95 backdrop-blur">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Megaphone className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-base sm:text-xl">New Announcement</span>
            </DialogTitle>
          </DialogHeader>

          <div className="px-4 sm:px-6 pt-4 pb-20 sm:pb-6 overflow-y-auto overscroll-contain">
            <div className="space-y-4">
              {/* priority badge + timestamp */}
              <div className="flex items-center gap-2">
                {priorityBadge}
                {announcement.created_at && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(announcement.created_at).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{announcement.title}</h3>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{announcement.content}</div>
              </div>

              {announcement.image_url && (
                <img
                  src={announcement.image_url}
                  alt="Announcement"
                  className="w-full h-40 object-cover rounded-xl border"
                />
              )}

              {/* Social link buttons */}
              {(announcement.twitter_link ||
                announcement.instagram_link ||
                announcement.facebook_link ||
                announcement.tiktok_link ||
                announcement.website_link) && (
                <div className="mt-1 sm:mt-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                    <ExternalLink className="h-4 w-4" />
                    <span>Connect & Follow:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {announcement.twitter_link && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs sm:text-sm"
                        onClick={() => window.open(announcement.twitter_link!, '_blank', 'noopener,noreferrer')}
                      >
                        <FaXTwitter className="h-3.5 w-3.5 mr-1" />
                        Open X
                      </Button>
                    )}
                    {announcement.instagram_link && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs sm:text-sm"
                        onClick={() => window.open(announcement.instagram_link!, '_blank', 'noopener,noreferrer')}
                      >
                        <FaInstagram className="h-3.5 w-3.5 mr-1" />
                        Visit Instagram
                      </Button>
                    )}
                    {announcement.facebook_link && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs sm:text-sm"
                        onClick={() => window.open(announcement.facebook_link!, '_blank', 'noopener,noreferrer')}
                      >
                        <FaFacebook className="h-3.5 w-3.5 mr-1" />
                        Open Facebook
                      </Button>
                    )}
                    {announcement.tiktok_link && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs sm:text-sm"
                        onClick={() => window.open(announcement.tiktok_link!, '_blank', 'noopener,noreferrer')}
                      >
                        <FaTiktok className="h-3.5 w-3.5 mr-1" />
                        Open TikTok
                      </Button>
                    )}
                    {announcement.website_link && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs sm:text-sm"
                        onClick={() => window.open(announcement.website_link!, '_blank', 'noopener,noreferrer')}
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        Visit Website
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Inline form rendering (if required) */}
              {hasVendorForm && (
                <div className="border rounded-lg p-4 bg-muted/10">
                  <h4 className="font-medium mb-3">Required Form</h4>
                  <InlineVendorForm 
                    formId={announcement.vendor_form_id!} 
                    onSubmitted={() => {
                      localStorage.setItem(`vendor_form_submitted_${announcement.vendor_form_id}`, 'true');
                      onClose();
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 border-t sticky bottom-0 z-10 bg-white/95 backdrop-blur">
            <div className="flex flex-col sm:flex-row gap-2">
              {isCompulsory ? (
                <>
                  {hasVendorForm ? (
                    null
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          onAcknowledge?.();
                        }}
                      >
                        Acknowledge
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Optional announcements */}
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => {
                      navigate('/attendee/announcements');
                      onClose();
                    }}
                  >
                    View All Announcements
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={onClose}>
                    Close
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => onNeverShowAgain?.()}
                  >
                    Do not show again
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}