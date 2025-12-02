import React, { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle2, FileSpreadsheet, Sparkles, Search, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import * as XLSX from 'xlsx';

interface AttendeeData {
  name: string;
  email: string;
  phone?: string;
  [key: string]: string | undefined;
}

interface CSVImportDialogProps {
  onImportComplete?: () => void;
}

export default function CSVImportDialog({ onImportComplete }: CSVImportDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedEventId } = useAdminEventContext();

  const handleOpenInfoModal = () => {
    if (!selectedEventId) {
      toast.error('Please select an event first');
      return;
    }
    setShowInfoModal(true);
  };

  const handleProceedToUpload = () => {
    setShowInfoModal(false);
    // Trigger the hidden file input
    fileInputRef.current?.click();
  };

  const generateUniqueQRData = (attendee: AttendeeData): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${attendee.name}|${attendee.email}|${timestamp}|${random}`;
  };

  const parseCSVContent = (content: string): string[][] => {
    const workbook = XLSX.read(content, { type: 'string', raw: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as string[][];
  };

  const extractAttendeesFromCSV = async (rows: string[][]): Promise<AttendeeData[]> => {
    if (!rows || rows.length === 0) {
      throw new Error('Empty file');
    }

    // Normalize and deduplicate headers
    const rawHeaders = rows[0].map(h => (h ?? '').toString().trim());
    const headers: string[] = rawHeaders.map((h, idx) => h || `Column ${idx + 1}`);
    const headerCounts: Record<string, number> = {};
    for (let i = 0; i < headers.length; i++) {
      const base = headers[i].toLowerCase();
      const count = (headerCounts[base] = (headerCounts[base] || 0) + 1);
      if (count > 1) headers[i] = `${headers[i]} (${count})`;
    }

    // Use AI to identify primary columns
    const { data: aiData, error } = await supabase.functions.invoke('analyze-csv-import', {
      body: {
        headers,
        sampleData: rows
          .slice(1, 101)
          .map(r => (r || []).map(c => (c ?? '').toString()).join('|'))
          .join('\n')
      }
    });

    if (error) throw error;

    const { nameColumn, emailColumn, phoneColumn } = (aiData as any)?.analysis || {};
    const lowerHeaders = headers.map(h => h.toLowerCase());
    let nameIdx = nameColumn ? lowerHeaders.indexOf(String(nameColumn).toLowerCase()) : -1;
    let emailIdx = emailColumn ? lowerHeaders.indexOf(String(emailColumn).toLowerCase()) : -1;
    let phoneIdx = phoneColumn ? lowerHeaders.indexOf(String(phoneColumn).toLowerCase()) : -1;

    const emailRe = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
    const phoneRe = /(\+?\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?[\d\s-]{6,}/;

    const findFirstLastNameIdx = () => {
      const f = lowerHeaders.findIndex(h => /first.*name|given.*name/i.test(h));
      const l = lowerHeaders.findIndex(h => /last.*name|surname|family.*name/i.test(h));
      return { f, l };
    };

    const { f: firstIdx, l: lastIdx } = findFirstLastNameIdx();

    const attendees: AttendeeData[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      const cells = row.map(v => (v ?? '').toString().trim());

      let name = nameIdx >= 0 ? cells[nameIdx] : '';
      let email = emailIdx >= 0 ? cells[emailIdx] : '';
      let phone = phoneIdx >= 0 ? cells[phoneIdx] : '';

      // Fallbacks: detect from cell patterns
      if (!email) {
        const eIdx = cells.findIndex(c => emailRe.test(c));
        if (eIdx !== -1) {
          email = cells[eIdx];
          emailIdx = emailIdx === -1 ? eIdx : emailIdx;
        }
      }

      if (!phone) {
        const pIdx = cells.findIndex(c => phoneRe.test(c));
        if (pIdx !== -1) {
          phone = cells[pIdx];
          phoneIdx = phoneIdx === -1 ? pIdx : phoneIdx;
        }
      }

      if (!name) {
        if (firstIdx !== -1 && lastIdx !== -1) {
          const first = cells[firstIdx] || '';
          const last = cells[lastIdx] || '';
          name = `${first} ${last}`.trim();
        } else {
          const nIdx = cells.findIndex((c, idx) => idx !== emailIdx && idx !== phoneIdx && /[A-Za-z]/.test(c));
          if (nIdx !== -1) name = cells[nIdx];
        }
      }

      if (!email) continue; // require at least an email
      if (!name) {
        const local = email.split('@')[0];
        name = local.replace(/[._-]+/g, ' ').replace(/\b\w/g, (s) => s.toUpperCase());
      }

      const attendee: AttendeeData = { name, email };
      if (phone) attendee.phone = phone;

      // Add all other columns as form data
      headers.forEach((header, idx) => {
        const val = cells[idx];
        if (!val) return;
        if (idx === nameIdx || idx === emailIdx || idx === phoneIdx) return;
        attendee[header] = val;
      });

      attendees.push(attendee);
    }

    if (attendees.length === 0) {
      throw new Error('No attendees found in file');
    }

    return attendees;
  };


  const createTicketsFromAttendees = async (attendees: AttendeeData[]) => {
    if (!selectedEventId) throw new Error('No event selected');

    // Get or create free ticket type
    let { data: ticketTypes } = await supabase
      .from('ticket_types')
      .select('id, name, price')
      .eq('event_id', selectedEventId)
      .eq('price', 0)
      .limit(1);

    if (!ticketTypes || ticketTypes.length === 0) {
      const { data: anyType } = await supabase
        .from('ticket_types')
        .select('id, name, price')
        .eq('event_id', selectedEventId)
        .limit(1);
      
      if (!anyType || anyType.length === 0) {
        throw new Error('No ticket types found. Please create a ticket type first.');
      }
      ticketTypes = anyType;
    }

    const ticketType = ticketTypes[0];

    // Check for existing tickets to avoid duplicates
    const emails = attendees.map(a => a.email).filter(Boolean);
    const { data: existingTickets } = await supabase
      .from('event_tickets')
      .select('guest_email')
      .eq('event_id', selectedEventId)
      .in('guest_email', emails);

    const existingEmails = new Set((existingTickets || []).map(t => t.guest_email?.toLowerCase()));
    const newAttendees = attendees.filter(a => !existingEmails.has(a.email.toLowerCase()));
    const duplicateCount = attendees.length - newAttendees.length;

    if (duplicateCount > 0) {
      toast.info(`Skipping ${duplicateCount} duplicate${duplicateCount !== 1 ? 's' : ''}`);
    }

    if (newAttendees.length === 0) {
      return { successCount: 0, errorCount: 0, errors: [] };
    }
    
    // Collect extra fields across all attendees
    const extraFieldsSet = new Set<string>();
    attendees.forEach(a => {
      Object.keys(a).forEach(k => {
        if (k !== 'name' && k !== 'email' && k !== 'phone') extraFieldsSet.add(k);
      });
    });
    const extraFields = Array.from(extraFieldsSet);
    
    // Create form fields for extra columns
    const fieldMapping: Record<string, string> = {};
    
    if (extraFields.length > 0) {
      const { data: existingFields } = await supabase
        .from('ticket_form_fields')
        .select('id, label')
        .eq('ticket_type_id', ticketType.id);
      
      const existingMap = new Map(
        (existingFields || []).map(f => [f.label.toLowerCase(), f.id])
      );
      
      const toCreate = extraFields.filter(f => !existingMap.has(f.toLowerCase()));
      
      if (toCreate.length > 0) {
        const { data: newFields } = await supabase
          .from('ticket_form_fields')
          .insert(
            toCreate.map((label, idx) => ({
              ticket_type_id: ticketType.id,
              label,
              field_type: 'short_answer',
              is_required: false,
              field_order: (existingFields?.length || 0) + idx
            }))
          )
          .select('id, label');
        
        newFields?.forEach(f => fieldMapping[f.label] = f.id);
      }
      
      existingFields?.forEach(f => {
        const match = extraFields.find(ef => ef.toLowerCase() === f.label.toLowerCase());
        if (match) fieldMapping[match] = f.id;
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    const BATCH_SIZE = 200;
    setProgress({ current: 0, total: newAttendees.length, percentage: 0 });

    for (let start = 0; start < newAttendees.length; start += BATCH_SIZE) {
      const batch = newAttendees.slice(start, start + BATCH_SIZE);

      const ticketRows = batch.map(attendee => ({
        event_id: selectedEventId,
        ticket_type_id: ticketType.id,
        guest_name: attendee.name,
        guest_email: attendee.email,
        guest_phone: attendee.phone || null,
        price: ticketType.price,
        payment_status: 'completed',
        qr_code_data: generateUniqueQRData(attendee),
        ticket_number: ''
      }));

      try {
        const { data: inserted, error: insertError } = await supabase
          .from('event_tickets')
          .insert(ticketRows)
          .select('id, guest_email');

        if (insertError) {
          errorCount += batch.length;
          errors.push(`Batch error: ${insertError.message}`);
          console.error('Batch insert error:', insertError);
        } else {
          // Bulk inserted OK
          successCount += inserted?.length || 0;
          setProgress({ 
            current: Math.min(start + BATCH_SIZE, newAttendees.length), 
            total: newAttendees.length,
            percentage: Math.round((Math.min(start + BATCH_SIZE, newAttendees.length) / newAttendees.length) * 100)
          });

          if (inserted && inserted.length > 0 && Object.keys(fieldMapping).length > 0) {
            const responses: any[] = [];
            for (let i = 0; i < inserted.length; i++) {
              const ticket = inserted[i];
              const attendee = batch[i];
              for (const [field, fieldId] of Object.entries(fieldMapping)) {
                const value = attendee[field];
                if (value) {
                  responses.push({
                    ticket_id: ticket.id,
                    form_field_id: fieldId,
                    response_value: value
                  });
                }
              }
            }
            if (responses.length > 0) {
              await supabase.from('ticket_form_responses').insert(responses);
            }
          }
        }
      } catch (e) {
        errorCount += batch.length;
        errors.push(`Unexpected error: ${e instanceof Error ? e.message : 'Unknown error'}`);
        console.error('Batch processing error:', e);
      }
    }

    return { successCount, errorCount, errors };
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedEventId) {
      toast.error('Please select an event first');
      return;
    }

    setIsProcessing(true);
    
    try {
      const isCSV = selectedFile.name.toLowerCase().endsWith('.csv');
      
      if (!isCSV) {
        toast.error('Only CSV files are supported');
        setIsProcessing(false);
        return;
      }

      toast.loading('Analyzing document with AI...', { id: 'processing' });

      const nameLower = selectedFile.name.toLowerCase();
      const isExcel = nameLower.endsWith('.xlsx') || nameLower.endsWith('.xls');
      const isTextLike = nameLower.endsWith('.csv') || nameLower.endsWith('.tsv') || nameLower.endsWith('.txt');

      let rows: string[][] = [];
      if (isExcel) {
        const buffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array', raw: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as string[][];
      } else if (isTextLike) {
        const content = await selectedFile.text();
        rows = parseCSVContent(content);
      } else {
        toast.error('Unsupported file type. Please upload CSV, TSV, TXT, or Excel files');
        setIsProcessing(false);
        return;
      }

      const attendees = await extractAttendeesFromCSV(rows);

      if (attendees.length === 0) {
        throw new Error('No attendees found in file');
      }

      toast.loading(`Creating ${attendees.length} tickets...`, { id: 'processing' });

      const { successCount, errorCount, errors } = await createTicketsFromAttendees(attendees);

      toast.dismiss('processing');
      setProgress({ current: attendees.length, total: attendees.length, percentage: 100 });

      if (successCount > 0) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        toast.success(
          `Successfully created ${successCount} ticket${successCount !== 1 ? 's' : ''}`,
          {
            description: errorCount > 0 
              ? `${errorCount} failed or skipped` 
              : 'All attendees imported successfully'
          }
        );
      }

      if (errors.length > 0 && errors.length <= 5) {
        errors.forEach(err => toast.error(err, { duration: 5000 }));
      } else if (errors.length > 5) {
        toast.error(`${errorCount} imports failed`, {
          description: 'Check console for details'
        });
        console.error('Import errors:', errors);
      }

      onImportComplete?.();
      
    } catch (error) {
      toast.dismiss('processing');
      toast.error(error instanceof Error ? error.message : 'Import failed');
      console.error('Import error:', error);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProgress({ current: 0, total: 0, percentage: 0 });
      }, 3000);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        id="ai-document-import"
        ref={fileInputRef}
        accept=".csv,.xlsx,.xls,.tsv,.txt"
        onChange={handleFileChange}
        className="hidden"
        disabled={isProcessing}
      />
      
      {/* Button that opens info modal */}
      <Button
        variant="outline"
        className="rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        disabled={isProcessing}
        onClick={handleOpenInfoModal}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            AI Import CSV
          </>
        )}
      </Button>

      {/* Info Modal explaining the process */}
      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Powered CSV Import
            </DialogTitle>
            <DialogDescription>
              Import attendees from any CSV file - our AI will automatically detect columns.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Prepare your file</p>
                  <p className="text-xs text-muted-foreground">
                    CSV, Excel (.xlsx, .xls), TSV, or TXT files are supported. Make sure your file has at least an email column.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">AI analyzes your data</p>
                  <p className="text-xs text-muted-foreground">
                    Our AI automatically identifies name, email, and phone columns regardless of column names or order.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Search className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">All data is searchable</p>
                  <p className="text-xs text-muted-foreground">
                    Extra columns (amount, company, etc.) are saved as form data and fully searchable in check-in.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Duplicates filtered</p>
                  <p className="text-xs text-muted-foreground">
                    Existing attendees (by email) are automatically skipped to prevent duplicates.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
              <strong>Tip:</strong> Your CSV can have any column structure. The AI will figure out what's what!
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowInfoModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleProceedToUpload}>
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isProcessing && progress.total > 0 && (
        <div className="space-y-2 p-4 rounded-lg border bg-card">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Importing attendees...
            </span>
            <span className="font-medium">
              {progress.current} / {progress.total}
            </span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {progress.percentage}% complete
          </p>
        </div>
      )}

      {showSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-lg border bg-success/10 border-success/20">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <span className="text-sm font-medium text-success">
            Import completed successfully!
          </span>
        </div>
      )}
    </div>
  );
}
