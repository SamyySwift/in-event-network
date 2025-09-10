import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Megaphone, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority?: 'high' | 'normal' | 'low' | string;
  image_url?: string | null;
  created_at?: string;
}

interface AnnouncementPopupProps {
  isOpen: boolean;
  announcement: Announcement | null;
  onClose: () => void;
}

export function AnnouncementPopup({ isOpen, announcement, onClose }: AnnouncementPopupProps) {
  const navigate = useNavigate();

  if (!announcement) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Megaphone className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="text-base sm:text-xl">New Announcement</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">{priorityBadge}
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

          <div className="flex flex-col sm:flex-row gap-2">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}