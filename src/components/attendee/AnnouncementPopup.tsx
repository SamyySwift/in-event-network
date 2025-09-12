import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Megaphone, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InlineVendorForm } from '@/components/forms/InlineVendorForm';

// Top-level types and component signature changes
interface Announcement {
  id: string;
  title: string;
  content: string;
  priority?: 'high' | 'normal' | 'low' | string;
  image_url?: string | null;
  created_at?: string;
  website_link?: string | null;
  // New link fields
  whatsapp_link?: string | null;
  twitter_link?: string | null;
  instagram_link?: string | null;
  facebook_link?: string | null;
  tiktok_link?: string | null;
  vendor_form_id?: string | null;
  require_submission?: boolean | null;
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

  // Hooks must be called unconditionally to avoid React error #310
  const [clickedKeys, setClickedKeys] = React.useState<string[]>([]);
  const [formSubmitted, setFormSubmitted] = React.useState(false);

  if (!announcement) return null;

  // Derived flags to control actions and behavior
  const isCompulsory = !!announcement.require_submission;
  const hasVendorForm = !!announcement.vendor_form_id;
  // New: collect all available links
  const links = [
    announcement.website_link ? { key: 'website_link', label: 'Website', url: announcement.website_link } : null,
    (announcement as any).whatsapp_link ? { key: 'whatsapp_link', label: 'WhatsApp', url: (announcement as any).whatsapp_link } : null,
    (announcement as any).twitter_link ? { key: 'twitter_link', label: 'Twitter/X', url: (announcement as any).twitter_link } : null,
    (announcement as any).instagram_link ? { key: 'instagram_link', label: 'Instagram', url: (announcement as any).instagram_link } : null,
    (announcement as any).facebook_link ? { key: 'facebook_link', label: 'Facebook', url: (announcement as any).facebook_link } : null,
    (announcement as any).tiktok_link ? { key: 'tiktok_link', label: 'TikTok', url: (announcement as any).tiktok_link } : null,
  ].filter(Boolean) as { key: string; label: string; url: string }[];

  const allLinksClicked = links.length === 0 ? true : clickedKeys.length === links.length;
  const actionComplete = (hasVendorForm ? formSubmitted : true) && allLinksClicked;

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
    // Update Dialog close control: block closing when compulsory until actions complete
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          if (!isCompulsory || actionComplete) {
            onClose();
          }
          // else: ignore close attempt
        }
      }}
    >
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

              {/* Inline form rendering (if any) */}
              {hasVendorForm && (
                <div className="border rounded-lg p-4 bg-muted/10">
                  <h4 className="font-medium mb-3">Required Form</h4>
                  <InlineVendorForm 
                    formId={announcement.vendor_form_id!} 
                    onSubmitted={() => {
                      // Mark as submitted; auto-close only if link actions are also complete or not required
                      localStorage.setItem(`vendor_form_submitted_${announcement.vendor_form_id}`, 'true');
                      setFormSubmitted(true);
                      if (!isCompulsory || (isCompulsory && allLinksClicked)) {
                        onClose();
                      }
                    }}
                  />
                </div>
              )}

              {/* New: Show ALL links (never hide) */}
              {links.length > 0 && (
                <div className="border rounded-lg p-4 bg-muted/10">
                  <h4 className="font-medium mb-3">Links</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {links.map((l) => (
                      <Button
                        key={l.key}
                        variant="secondary"
                        className="justify-center"
                        onClick={() => {
                          window.open(l.url, "_blank", "noopener,noreferrer");
                          setClickedKeys((prev) =>
                            prev.includes(l.key) ? prev : [...prev, l.key]
                          );
                          onAcknowledge?.();
                        }}
                      >
                        Open {l.label}
                      </Button>
                    ))}
                  </div>
                  {isCompulsory && !actionComplete && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Please open all links{hasVendorForm ? " and submit the form" : ""} to continue.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 border-t sticky bottom-0 z-10 bg-white/95 backdrop-blur">
            <div className="flex flex-col sm:flex-row gap-2">
              {isCompulsory ? (
                <>
                  {/* Compulsory: close only after actions complete */}
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
                    disabled={!actionComplete}
                    onClick={() => onClose()}
                  >
                    Close
                  </Button>
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