
// File: AnnouncementCard.tsx
// Component: AnnouncementCard
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, FileDown, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { exportToCSV } from '@/utils/exportUtils';

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "high":
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-yellow-400 text-white">
          <AlertTriangle className="inline-block w-4 h-4 mr-1" /> High
        </Badge>
      );
    case "normal":
      return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white">Normal</Badge>;
    case "low":
      return <Badge className="bg-gradient-to-r from-slate-400 to-gray-200 text-white">Low</Badge>;
    default:
      return <Badge>Normal</Badge>;
  }
}

interface AnnouncementCardProps {
  announcement: any;
  onEdit: (announcement: any) => void;
  onDelete: (id: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

// Component: AnnouncementCard
export default function AnnouncementCard({
  announcement,
  onEdit,
  onDelete,
  isUpdating,
  isDeleting,
}: AnnouncementCardProps) {
  const isMobile = useIsMobile();

  const handleExportResponses = async () => {
    try {
      if (!announcement.vendor_form_id) return;

      const formId = announcement.vendor_form_id as string;

      // Columns from migration: field_id, label
      const { data: fields, error: fieldsError } = await supabase
        .from('vendor_form_fields')
        .select('field_id,label')
        .eq('form_id', formId);

      if (fieldsError) throw fieldsError;

      // Columns from migration: id, vendor_name, vendor_email, responses, submitted_at
      const { data: submissions, error: subsError } = await supabase
        .from('vendor_submissions')
        .select('id, vendor_name, vendor_email, responses, submitted_at')
        .eq('form_id', formId);

      if (subsError) throw subsError;

      const fieldDefs = (fields || []) as { field_id: string; label: string }[];

      const processed = (submissions || []).map((s) => {
        const row: Record<string, any> = {
          submission_id: s.id,
          vendor_name: (s as any).vendor_name,
          vendor_email: (s as any).vendor_email,
          submitted_at: (s as any).submitted_at
            ? new Date((s as any).submitted_at as string).toLocaleString()
            : '',
        };
        fieldDefs.forEach((f) => {
          const header = (f.label || f.field_id || '').trim() || f.field_id;
          row[header] = (s as any).responses?.[f.field_id] ?? '';
        });
        return row;
      });

      if (!processed.length) {
        const emptyRow: Record<string, any> = {
          submission_id: '',
          vendor_name: '',
          vendor_email: '',
          submitted_at: '',
        };
        fieldDefs.forEach((f) => {
          const header = (f.label || f.field_id || '').trim() || f.field_id;
          emptyRow[header] = '';
        });
        exportToCSV([emptyRow], `${announcement.title}_form_submissions`);
      } else {
        exportToCSV(processed, `${announcement.title}_form_submissions`);
      }
    } catch (e: any) {
      console.error('Failed to export form responses:', e?.message || e);
      alert(`Failed to export form responses: ${e?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="glass-card p-4 rounded-xl shadow-md">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <h3 className="font-semibold text-lg">{announcement.title}</h3>
          {getPriorityBadge(announcement.priority)}
          {announcement.send_immediately && (
            <Badge className="bg-gradient-to-r from-green-400 to-green-600 text-white">Immediate</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-2 break-words">{announcement.content}</p>
        {announcement.image_url && (
          <img
            src={announcement.image_url}
            alt="Announcement"
            className="w-full h-32 object-cover rounded-xl mb-2 border-2 border-primary/20"
          />
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-4 h-4" />
          Created: {new Date(announcement.created_at).toLocaleString()}
        </div>
      </div>

      {/* Mobile: Horizontal button layout, Desktop: Vertical */}
      <div className={cn(
        "flex gap-2",
        isMobile ? "flex-row justify-end flex-wrap w-full" : "flex-col"
      )}>
        <div className="mt-2 flex flex-wrap gap-2">
          {/* Existing priority badge */}
          {getPriorityBadge(announcement.priority)}
          {/* New badges for form attachment */}
          {!!announcement.vendor_form_id && (
            <Badge variant="secondary">
              Attached Form
            </Badge>
          )}
          {!!announcement.vendor_form_id && !!announcement.require_submission && (
            <Badge variant="destructive">
              Submission Required
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size={isMobile ? "sm" : "icon"}
          onClick={() => onEdit(announcement)}
          disabled={isUpdating}
          className="hover:bg-gradient-to-tr from-primary/10 to-primary/30"
        >
          <Pencil className="h-4 w-4" />
          {isMobile && <span className="ml-1 text-xs">Edit</span>}
        </Button>
        <Button
          variant="ghost"
          size={isMobile ? "sm" : "icon"}
          onClick={() => onDelete(announcement.id)}
          disabled={isDeleting}
          className="hover:bg-gradient-to-tr from-destructive/10 to-destructive/30"
        >
          <Trash2 className="h-4 w-4" />
          {isMobile && <span className="ml-1 text-xs">Delete</span>}
        </Button>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-2 justify-end">
        {!!announcement.vendor_form_id && (
          <Button
            type="button"
            variant="outline"
            onClick={handleExportResponses}
            className="w-full sm:w-auto"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export Responses (CSV)
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => onEdit(announcement)}
          disabled={isUpdating}
          className="w-full sm:w-auto"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => onDelete(announcement.id)}
          disabled={isDeleting}
          className="w-full sm:w-auto"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
}
