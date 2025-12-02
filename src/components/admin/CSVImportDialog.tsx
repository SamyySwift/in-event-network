import React, { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle2, FileSpreadsheet, Search, CheckCircle, XCircle, AlertTriangle, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
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

interface ImportResult {
  successCount: number;
  errorCount: number;
  duplicateCount: number;
  errors: { email: string; reason: string }[];
  totalProcessed: number;
}

interface ColumnMapping {
  nameColumn: string | null;
  emailColumn: string | null;
  phoneColumn: string | null;
}

interface PreviewRow {
  name: string;
  email: string;
  phone: string;
  willImport: boolean;
  skipReason?: string;
  originalRow: string[];
}

interface CSVImportDialogProps {
  onImportComplete?: () => void;
}

export default function CSVImportDialog({ onImportComplete }: CSVImportDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [showModal, setShowModal] = useState(false);
  const [modalStage, setModalStage] = useState<'info' | 'preview' | 'processing' | 'results'>('info');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [analysisStage, setAnalysisStage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedEventId } = useAdminEventContext();

  // Preview state
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({ nameColumn: null, emailColumn: null, phoneColumn: null });
  const [allowNameOnly, setAllowNameOnly] = useState(false);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);

  const handleOpenModal = () => {
    if (!selectedEventId) {
      toast.error('Please select an event first');
      return;
    }
    setModalStage('info');
    setImportResult(null);
    setProgress({ current: 0, total: 0, percentage: 0 });
    setHeaders([]);
    setRawRows([]);
    setColumnMapping({ nameColumn: null, emailColumn: null, phoneColumn: null });
    setAllowNameOnly(false);
    setPreviewRows([]);
    setShowModal(true);
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleCloseModal = () => {
    if (isProcessing) return;
    setShowModal(false);
    setModalStage('info');
    setImportResult(null);
    setProgress({ current: 0, total: 0, percentage: 0 });
    onImportComplete?.();
  };

  const generatePlaceholderEmail = (name: string, index: number): string => {
    const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'attendee';
    const timestamp = Date.now();
    return `${sanitized}_${timestamp}_${index}@imported.local`;
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

  // Detect columns using pattern matching
  const detectColumns = (headers: string[]): ColumnMapping => {
    console.log('[CSV Import] Detecting columns from headers:', headers);
    
    const lowerHeaders = headers.map(h => h.toLowerCase());
    let nameCol: string | null = null;
    let emailCol: string | null = null;
    let phoneCol: string | null = null;

    // Email patterns
    const emailPatterns = ['email', 'e-mail', 'mail', 'email address'];
    for (const pattern of emailPatterns) {
      const idx = lowerHeaders.findIndex(h => h.includes(pattern));
      if (idx !== -1) { emailCol = headers[idx]; break; }
    }

    // Name patterns (check for full name first, then generic name)
    const fullNamePatterns = ['full name', 'fullname', 'guest name', 'attendee name', 'customer name', 'participant name'];
    for (const pattern of fullNamePatterns) {
      const idx = lowerHeaders.findIndex(h => h.includes(pattern));
      if (idx !== -1) { nameCol = headers[idx]; break; }
    }
    
    if (!nameCol) {
      // Try generic name patterns (but not first/last)
      const namePatterns = ['name', 'guest', 'attendee', 'customer', 'participant'];
      for (const pattern of namePatterns) {
        const idx = lowerHeaders.findIndex(h => h === pattern || (h.includes(pattern) && !h.includes('first') && !h.includes('last')));
        if (idx !== -1) { nameCol = headers[idx]; break; }
      }
    }

    // Phone patterns
    const phonePatterns = ['phone', 'mobile', 'cell', 'telephone', 'tel', 'contact number', 'phone number'];
    for (const pattern of phonePatterns) {
      const idx = lowerHeaders.findIndex(h => h.includes(pattern));
      if (idx !== -1) { phoneCol = headers[idx]; break; }
    }

    console.log('[CSV Import] Detection result:', { nameCol, emailCol, phoneCol });
    return { nameColumn: nameCol, emailColumn: emailCol, phoneColumn: phoneCol };
  };

  // Generate preview based on current mapping and settings
  const generatePreview = (
    headers: string[], 
    rows: string[][], 
    mapping: ColumnMapping, 
    allowNameOnly: boolean
  ): PreviewRow[] => {
    const lowerHeaders = headers.map(h => h.toLowerCase());
    const nameIdx = mapping.nameColumn ? lowerHeaders.indexOf(mapping.nameColumn.toLowerCase()) : -1;
    const emailIdx = mapping.emailColumn ? lowerHeaders.indexOf(mapping.emailColumn.toLowerCase()) : -1;
    const phoneIdx = mapping.phoneColumn ? lowerHeaders.indexOf(mapping.phoneColumn.toLowerCase()) : -1;

    const emailRe = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
    const phoneRe = /(\+?\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?[\d\s-]{6,}/;

    // Check for first/last name columns
    const firstIdx = lowerHeaders.findIndex(h => /first.*name|given.*name/i.test(h));
    const lastIdx = lowerHeaders.findIndex(h => /last.*name|surname|family.*name/i.test(h));

    const preview: PreviewRow[] = [];

    for (let i = 1; i < Math.min(rows.length, 100); i++) {
      const row = rows[i];
      if (!row || row.length === 0 || row.every(c => !(c ?? '').toString().trim())) continue;
      
      const cells = row.map(v => (v ?? '').toString().trim());
      
      let name = nameIdx >= 0 ? cells[nameIdx] : '';
      let email = emailIdx >= 0 ? cells[emailIdx] : '';
      let phone = phoneIdx >= 0 ? cells[phoneIdx] : '';

      // Fallback: detect from cell patterns
      if (!email) {
        const eIdx = cells.findIndex(c => emailRe.test(c));
        if (eIdx !== -1) email = cells[eIdx];
      }

      if (!phone) {
        const pIdx = cells.findIndex(c => phoneRe.test(c) && !emailRe.test(c));
        if (pIdx !== -1) {
          phone = cells[pIdx];
          // Handle scientific notation (e.g., 2.34091E+13)
          if (/^\d+\.?\d*[eE][+-]?\d+$/.test(phone)) {
            phone = Number(phone).toFixed(0);
          }
        }
      }

      if (!name) {
        if (firstIdx !== -1 && lastIdx !== -1) {
          const first = cells[firstIdx] || '';
          const last = cells[lastIdx] || '';
          name = `${first} ${last}`.trim();
        } else if (firstIdx !== -1) {
          name = cells[firstIdx] || '';
        } else {
          // Find first cell with text that's not email/phone
          const usedIdxs = [emailIdx, phoneIdx].filter(i => i >= 0);
          const nIdx = cells.findIndex((c, idx) => !usedIdxs.includes(idx) && /[A-Za-z]/.test(c) && !emailRe.test(c));
          if (nIdx !== -1) name = cells[nIdx];
        }
      }

      // Determine if row can be imported
      let willImport = false;
      let skipReason: string | undefined;

      if (email) {
        willImport = true;
        if (!name) {
          const local = email.split('@')[0];
          name = local.replace(/[._-]+/g, ' ').replace(/\b\w/g, s => s.toUpperCase());
        }
      } else if (allowNameOnly && name) {
        willImport = true;
        email = '(will generate placeholder)';
      } else if (name && !email) {
        skipReason = 'No email (enable "Allow Name Only" to import)';
      } else {
        skipReason = 'No name or email found';
      }

      preview.push({
        name: name || '—',
        email: email || '—',
        phone: phone || '—',
        willImport,
        skipReason,
        originalRow: cells
      });
    }

    return preview;
  };

  // Extract attendees for actual import
  const extractAttendeesFromCSV = (
    headers: string[], 
    rows: string[][], 
    mapping: ColumnMapping, 
    allowNameOnly: boolean
  ): AttendeeData[] => {
    const lowerHeaders = headers.map(h => h.toLowerCase());
    const nameIdx = mapping.nameColumn ? lowerHeaders.indexOf(mapping.nameColumn.toLowerCase()) : -1;
    const emailIdx = mapping.emailColumn ? lowerHeaders.indexOf(mapping.emailColumn.toLowerCase()) : -1;
    const phoneIdx = mapping.phoneColumn ? lowerHeaders.indexOf(mapping.phoneColumn.toLowerCase()) : -1;

    const emailRe = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
    const phoneRe = /(\+?\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?[\d\s-]{6,}/;

    const firstIdx = lowerHeaders.findIndex(h => /first.*name|given.*name/i.test(h));
    const lastIdx = lowerHeaders.findIndex(h => /last.*name|surname|family.*name/i.test(h));

    const attendees: AttendeeData[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      const cells = row.map(v => (v ?? '').toString().trim());

      let name = nameIdx >= 0 ? cells[nameIdx] : '';
      let email = emailIdx >= 0 ? cells[emailIdx] : '';
      let phone = phoneIdx >= 0 ? cells[phoneIdx] : '';

      // Fallbacks
      if (!email) {
        const eIdx = cells.findIndex(c => emailRe.test(c));
        if (eIdx !== -1) email = cells[eIdx];
      }

      if (!phone) {
        const pIdx = cells.findIndex(c => phoneRe.test(c) && !emailRe.test(c));
        if (pIdx !== -1) {
          phone = cells[pIdx];
          if (/^\d+\.?\d*[eE][+-]?\d+$/.test(phone)) {
            phone = Number(phone).toFixed(0);
          }
        }
      }

      if (!name) {
        if (firstIdx !== -1 && lastIdx !== -1) {
          const first = cells[firstIdx] || '';
          const last = cells[lastIdx] || '';
          name = `${first} ${last}`.trim();
        } else if (firstIdx !== -1) {
          name = cells[firstIdx] || '';
        } else {
          const usedIdxs = [emailIdx, phoneIdx].filter(idx => idx >= 0);
          const nIdx = cells.findIndex((c, idx) => !usedIdxs.includes(idx) && /[A-Za-z]/.test(c) && !emailRe.test(c));
          if (nIdx !== -1) name = cells[nIdx];
        }
      }

      // Decide if we can import
      if (!email && !allowNameOnly) continue;
      if (!email && !name) continue;

      if (!email && allowNameOnly && name) {
        email = generatePlaceholderEmail(name, i);
      }

      if (!name && email) {
        const local = email.split('@')[0];
        name = local.replace(/[._-]+/g, ' ').replace(/\b\w/g, s => s.toUpperCase());
      }

      if (!name) continue;

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

    return attendees;
  };

  const createTicketsFromAttendees = async (attendees: AttendeeData[]): Promise<ImportResult> => {
    if (!selectedEventId) throw new Error('No event selected');

    const result: ImportResult = {
      successCount: 0,
      errorCount: 0,
      duplicateCount: 0,
      errors: [],
      totalProcessed: attendees.length
    };

    setAnalysisStage('Fetching ticket types...');

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

    setAnalysisStage('Checking for duplicates...');

    const emails = attendees.map(a => a.email).filter(Boolean);
    const { data: existingTickets } = await supabase
      .from('event_tickets')
      .select('guest_email')
      .eq('event_id', selectedEventId)
      .in('guest_email', emails);

    const existingEmails = new Set((existingTickets || []).map(t => t.guest_email?.toLowerCase()));
    const newAttendees = attendees.filter(a => !existingEmails.has(a.email.toLowerCase()));
    result.duplicateCount = attendees.length - newAttendees.length;

    attendees.forEach(a => {
      if (existingEmails.has(a.email.toLowerCase())) {
        result.errors.push({ email: a.email, reason: 'Already exists in event' });
      }
    });

    if (newAttendees.length === 0) {
      return result;
    }

    setAnalysisStage('Setting up form fields...');
    
    const extraFieldsSet = new Set<string>();
    attendees.forEach(a => {
      Object.keys(a).forEach(k => {
        if (k !== 'name' && k !== 'email' && k !== 'phone') extraFieldsSet.add(k);
      });
    });
    const extraFields = Array.from(extraFieldsSet);
    
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

    setAnalysisStage('Creating tickets...');

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
          result.errorCount += batch.length;
          batch.forEach(a => {
            result.errors.push({ email: a.email, reason: insertError.message });
          });
        } else {
          result.successCount += inserted?.length || 0;
          setProgress({ 
            current: Math.min(start + BATCH_SIZE, newAttendees.length), 
            total: newAttendees.length,
            percentage: Math.round((Math.min(start + BATCH_SIZE, newAttendees.length) / newAttendees.length) * 100)
          });

          if (inserted && inserted.length > 0 && Object.keys(fieldMapping).length > 0) {
            const responses: { ticket_id: string; form_field_id: string; response_value: string }[] = [];
            for (let j = 0; j < inserted.length; j++) {
              const ticket = inserted[j];
              const attendee = batch[j];
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
        result.errorCount += batch.length;
        batch.forEach(a => {
          result.errors.push({ email: a.email, reason: e instanceof Error ? e.message : 'Unknown error' });
        });
      }
    }

    return result;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedEventId) {
      toast.error('Please select an event first');
      return;
    }

    setIsProcessing(true);
    setAnalysisStage('Reading file...');
    
    try {
      const nameLower = selectedFile.name.toLowerCase();
      const isExcel = nameLower.endsWith('.xlsx') || nameLower.endsWith('.xls');
      const isTextLike = nameLower.endsWith('.csv') || nameLower.endsWith('.tsv') || nameLower.endsWith('.txt');

      if (!isExcel && !isTextLike) {
        toast.error('Unsupported file type. Please upload CSV, TSV, TXT, or Excel files');
        setIsProcessing(false);
        return;
      }

      let rows: string[][] = [];
      if (isExcel) {
        const buffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array', raw: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as string[][];
      } else {
        const content = await selectedFile.text();
        rows = parseCSVContent(content);
      }

      if (!rows || rows.length < 2) {
        toast.error('File is empty or has no data rows');
        setIsProcessing(false);
        return;
      }

      // Normalize headers
      const rawHeaders = rows[0].map(h => (h ?? '').toString().trim());
      const normalizedHeaders: string[] = rawHeaders.map((h, idx) => h || `Column ${idx + 1}`);
      const headerCounts: Record<string, number> = {};
      for (let i = 0; i < normalizedHeaders.length; i++) {
        const base = normalizedHeaders[i].toLowerCase();
        const count = (headerCounts[base] = (headerCounts[base] || 0) + 1);
        if (count > 1) normalizedHeaders[i] = `${normalizedHeaders[i]} (${count})`;
      }

      setHeaders(normalizedHeaders);
      setRawRows(rows);

      setAnalysisStage('Detecting columns...');
      const detected = detectColumns(normalizedHeaders);
      setColumnMapping(detected);

      // Generate initial preview
      const preview = generatePreview(normalizedHeaders, rows, detected, false);
      setPreviewRows(preview);

      setModalStage('preview');
      setIsProcessing(false);
      
    } catch (error) {
      console.error('[CSV Import] Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to read file');
      setIsProcessing(false);
    } finally {
      event.target.value = '';
    }
  };

  // Update preview when mapping or allowNameOnly changes
  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    const newMapping = { ...columnMapping, [field]: value === '__none__' ? null : value };
    setColumnMapping(newMapping);
    setPreviewRows(generatePreview(headers, rawRows, newMapping, allowNameOnly));
  };

  const handleAllowNameOnlyChange = (checked: boolean) => {
    setAllowNameOnly(checked);
    setPreviewRows(generatePreview(headers, rawRows, columnMapping, checked));
  };

  const handleStartImport = async () => {
    setIsProcessing(true);
    setModalStage('processing');
    setAnalysisStage('Extracting attendees...');

    try {
      const attendees = extractAttendeesFromCSV(headers, rawRows, columnMapping, allowNameOnly);
      
      if (attendees.length === 0) {
        setImportResult({
          successCount: 0,
          errorCount: 1,
          duplicateCount: 0,
          errors: [{ email: 'N/A', reason: 'No valid attendees found. Check column mapping or enable "Allow Name Only".' }],
          totalProcessed: 0
        });
        setModalStage('results');
        setIsProcessing(false);
        return;
      }

      const result = await createTicketsFromAttendees(attendees);
      setImportResult(result);
      setModalStage('results');
      setAnalysisStage('Complete');
      
    } catch (error) {
      setImportResult({
        successCount: 0,
        errorCount: 1,
        duplicateCount: 0,
        errors: [{ email: 'N/A', reason: error instanceof Error ? error.message : 'Import failed' }],
        totalProcessed: 0
      });
      setModalStage('results');
    } finally {
      setIsProcessing(false);
    }
  };

  const importableCount = previewRows.filter(r => r.willImport).length;
  const skipCount = previewRows.filter(r => !r.willImport).length;

  return (
    <div className="space-y-4">
      <input
        type="file"
        id="csv-import"
        ref={fileInputRef}
        accept=".csv,.xlsx,.xls,.tsv,.txt"
        onChange={handleFileChange}
        className="hidden"
        disabled={isProcessing}
      />
      
      <Button
        variant="outline"
        className="rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        disabled={isProcessing}
        onClick={handleOpenModal}
      >
        <Upload className="h-4 w-4 mr-2" />
        Import CSV
      </Button>

      <Dialog open={showModal} onOpenChange={(open) => !isProcessing && setShowModal(open)}>
        <DialogContent className={`${modalStage === 'preview' ? 'sm:max-w-2xl' : 'sm:max-w-lg'} [&>button]:hidden`}>
          {/* Info Stage */}
          {modalStage === 'info' && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  CSV Import
                </DialogTitle>
                <DialogDescription>
                  Import attendees from CSV or Excel files.
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
                        CSV, Excel (.xlsx, .xls), TSV, or TXT files are supported.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Settings2 className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Column detection</p>
                      <p className="text-xs text-muted-foreground">
                        Automatically detects name, email, and phone columns. You can override if needed.
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
                        Extra columns are saved as additional information and fully searchable in check-in.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Flexible import</p>
                      <p className="text-xs text-muted-foreground">
                        Import by email, or enable "Name Only" mode for lists without emails.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSelectFile} disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Choose File
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Preview Stage */}
          {modalStage === 'preview' && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" />
                  Preview & Column Mapping
                </DialogTitle>
                <DialogDescription>
                  Review detected columns and adjust if needed before importing.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Column Mapping */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Name Column</Label>
                    <Select value={columnMapping.nameColumn || '__none__'} onValueChange={(v) => handleMappingChange('nameColumn', v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Auto-detect" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Auto-detect</SelectItem>
                        {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email Column</Label>
                    <Select value={columnMapping.emailColumn || '__none__'} onValueChange={(v) => handleMappingChange('emailColumn', v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Auto-detect" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Auto-detect</SelectItem>
                        {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Phone Column</Label>
                    <Select value={columnMapping.phoneColumn || '__none__'} onValueChange={(v) => handleMappingChange('phoneColumn', v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Auto-detect" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Auto-detect</SelectItem>
                        {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Allow Name Only Toggle */}
                <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Allow Name Only</Label>
                    <p className="text-xs text-muted-foreground">Import attendees without email (generates placeholder)</p>
                  </div>
                  <Switch checked={allowNameOnly} onCheckedChange={handleAllowNameOnlyChange} />
                </div>

                {/* Summary */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Preview (first 100 rows):</span>
                  <div className="flex gap-3">
                    <span className="text-green-600 font-medium">{importableCount} ready</span>
                    {skipCount > 0 && <span className="text-amber-600 font-medium">{skipCount} will skip</span>}
                  </div>
                </div>

                {/* Preview Table */}
                <ScrollArea className="h-[200px] rounded-md border">
                  <div className="p-2">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-1.5 font-medium">Status</th>
                          <th className="text-left p-1.5 font-medium">Name</th>
                          <th className="text-left p-1.5 font-medium">Email</th>
                          <th className="text-left p-1.5 font-medium">Phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, idx) => (
                          <tr key={idx} className={`border-b ${row.willImport ? '' : 'bg-amber-500/5'}`}>
                            <td className="p-1.5">
                            {row.willImport ? (
                              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <span title={row.skipReason}>
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                              </span>
                            )}
                            </td>
                            <td className="p-1.5 truncate max-w-[120px]">{row.name}</td>
                            <td className="p-1.5 truncate max-w-[150px]">{row.email}</td>
                            <td className="p-1.5 truncate max-w-[100px]">{row.phone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>

                {skipCount > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-xs text-amber-700">
                    <strong>{skipCount} rows</strong> will be skipped. Enable "Allow Name Only" or check column mapping.
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setModalStage('info')}>
                  Back
                </Button>
                <Button onClick={handleStartImport} disabled={importableCount === 0}>
                  Import {importableCount} Attendees
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Processing Stage */}
          {modalStage === 'processing' && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  Import in Progress
                </DialogTitle>
                <DialogDescription>
                  {analysisStage}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {progress.total > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Creating tickets...</span>
                      <span className="font-medium">{progress.current} / {progress.total}</span>
                    </div>
                    <Progress value={progress.percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      {progress.percentage}% complete
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-sm text-muted-foreground">{analysisStage}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Results Stage */}
          {modalStage === 'results' && importResult && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {importResult.successCount > 0 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  Import Complete
                </DialogTitle>
                <DialogDescription>
                  {importResult.successCount > 0 
                    ? `Successfully imported ${importResult.successCount} attendees`
                    : 'No attendees were imported'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-500/10 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{importResult.successCount}</p>
                    <p className="text-xs text-muted-foreground">Imported</p>
                  </div>
                  <div className="text-center p-3 bg-amber-500/10 rounded-lg">
                    <p className="text-2xl font-bold text-amber-600">{importResult.duplicateCount}</p>
                    <p className="text-xs text-muted-foreground">Duplicates</p>
                  </div>
                  <div className="text-center p-3 bg-destructive/10 rounded-lg">
                    <p className="text-2xl font-bold text-destructive">{importResult.errorCount}</p>
                    <p className="text-xs text-muted-foreground">Errors</p>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Issues:</p>
                    <ScrollArea className="h-[150px] rounded-md border p-2">
                      <div className="space-y-1">
                        {importResult.errors.slice(0, 50).map((error, idx) => (
                          <div key={idx} className="text-xs flex justify-between items-start gap-2 py-1 border-b last:border-0">
                            <span className="text-muted-foreground truncate max-w-[150px]">{error.email}</span>
                            <span className="text-destructive text-right">{error.reason}</span>
                          </div>
                        ))}
                        {importResult.errors.length > 50 && (
                          <p className="text-xs text-muted-foreground pt-2">
                            ...and {importResult.errors.length - 50} more
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button onClick={handleCloseModal}>
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
