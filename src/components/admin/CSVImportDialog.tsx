import React, { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle2, FileSpreadsheet, Sparkles, Search, CheckCircle, XCircle, AlertTriangle, Settings2, ChevronDown } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  skippedCount: number;
  errors: { identifier: string; reason: string }[];
  skipped: { name: string; reason: string }[];
  totalProcessed: number;
}

interface ColumnMapping {
  nameColumn: number;
  emailColumn: number;
  phoneColumn: number;
}

interface PreviewData {
  headers: string[];
  rows: string[][];
  detectedMapping: ColumnMapping;
  totalRows: number;
  sampleRows: string[][];
  skippedPreview: { row: number; name: string; reason: string }[];
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
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({ nameColumn: -1, emailColumn: -1, phoneColumn: -1 });
  const [allowNameOnly, setAllowNameOnly] = useState(false);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedEventId } = useAdminEventContext();

  const handleOpenModal = () => {
    if (!selectedEventId) {
      toast.error('Please select an event first');
      return;
    }
    setModalStage('info');
    setImportResult(null);
    setPreviewData(null);
    setColumnMapping({ nameColumn: -1, emailColumn: -1, phoneColumn: -1 });
    setAllowNameOnly(false);
    setParsedRows([]);
    setProgress({ current: 0, total: 0, percentage: 0 });
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
    setPreviewData(null);
    setParsedRows([]);
    setProgress({ current: 0, total: 0, percentage: 0 });
    onImportComplete?.();
  };

  const generateUniqueQRData = (attendee: AttendeeData): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${attendee.name}|${attendee.email}|${timestamp}|${random}`;
  };

  // Convert scientific notation phone numbers back to proper strings
  const formatPhoneNumber = (value: string): string => {
    if (!value) return '';
    const strVal = String(value);
    // Check for scientific notation (e.g., "2.34091E+13")
    if (/[Ee][+-]?\d+/.test(strVal)) {
      const num = parseFloat(strVal);
      if (Number.isFinite(num) && num > 1000000) {
        return num.toFixed(0);
      }
    }
    return strVal;
  };

  const parseCSVContent = (content: string): string[][] => {
    const workbook = XLSX.read(content, { type: 'string', raw: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as string[][];
  };

  // Score-based column detection for better accuracy
  const detectColumns = async (headers: string[], sampleRows: string[][]): Promise<ColumnMapping> => {
    const lowerHeaders = headers.map(h => (h || '').toLowerCase().trim());
    
    // Pattern priorities (higher index = higher priority)
    const namePatterns = [
      /^name$/i,
      /^full\s*name$/i,
      /^fullname$/i,
      /attendee.*name/i,
      /customer.*name/i,
      /buyer.*name/i,
      /participant.*name/i,
      /^first.*name$/i,
      /name/i,
      /customer/i,
      /attendee/i,
    ];
    
    const emailPatterns = [
      /^email$/i,
      /^e-?mail$/i,
      /email.*address/i,
      /customer.*email/i,
      /buyer.*email/i,
      /mail/i,
    ];
    
    const phonePatterns = [
      /^phone$/i,
      /^mobile$/i,
      /^tel$/i,
      /phone.*number/i,
      /mobile.*number/i,
      /customer.*mobile/i,
      /customer.*phone/i,
      /contact.*number/i,
      /cell/i,
      /gsm/i,
      /whatsapp/i,
    ];

    const scoreColumn = (header: string, patterns: RegExp[]): number => {
      for (let i = patterns.length - 1; i >= 0; i--) {
        if (patterns[i].test(header)) {
          return patterns.length - i; // Higher score for earlier (more specific) patterns
        }
      }
      return 0;
    };

    // Find best matches by score
    let nameIdx = -1, emailIdx = -1, phoneIdx = -1;
    let nameScore = 0, emailScore = 0, phoneScore = 0;

    lowerHeaders.forEach((h, idx) => {
      const ns = scoreColumn(h, namePatterns);
      const es = scoreColumn(h, emailPatterns);
      const ps = scoreColumn(h, phonePatterns);

      if (ns > nameScore) { nameScore = ns; nameIdx = idx; }
      if (es > emailScore) { emailScore = es; emailIdx = idx; }
      if (ps > phoneScore) { phoneScore = ps; phoneIdx = idx; }
    });

    // Fallback: detect from data patterns
    const emailRe = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
    const phoneRe = /^(\+?\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?[\d\s-]{6,}$/;

    if (emailIdx === -1 && sampleRows.length > 0) {
      // Find column with most email-like values
      const emailCounts = headers.map((_, idx) => 
        sampleRows.filter(row => row[idx] && emailRe.test(row[idx])).length
      );
      const maxEmails = Math.max(...emailCounts);
      if (maxEmails > 0) {
        emailIdx = emailCounts.indexOf(maxEmails);
      }
    }

    if (phoneIdx === -1 && sampleRows.length > 0) {
      // Find column with most phone-like values
      const phoneCounts = headers.map((_, idx) => 
        sampleRows.filter(row => {
          const val = formatPhoneNumber(row[idx] || '');
          return val && (phoneRe.test(val) || /[Ee][+-]?\d+/.test(row[idx] || ''));
        }).length
      );
      const maxPhones = Math.max(...phoneCounts);
      if (maxPhones > 0 && phoneCounts.indexOf(maxPhones) !== emailIdx) {
        phoneIdx = phoneCounts.indexOf(maxPhones);
      }
    }

    // Try AI analysis for better detection
    try {
      const { data: aiData } = await supabase.functions.invoke('analyze-csv-import', {
        body: {
          headers,
          sampleData: sampleRows.slice(0, 50).map(r => r.join('|')).join('\n')
        }
      });

      if (aiData?.analysis) {
        const { nameColumn, emailColumn, phoneColumn } = aiData.analysis;
        if (nameColumn) {
          const aiNameIdx = lowerHeaders.indexOf(String(nameColumn).toLowerCase());
          if (aiNameIdx !== -1) nameIdx = aiNameIdx;
        }
        if (emailColumn) {
          const aiEmailIdx = lowerHeaders.indexOf(String(emailColumn).toLowerCase());
          if (aiEmailIdx !== -1) emailIdx = aiEmailIdx;
        }
        if (phoneColumn) {
          const aiPhoneIdx = lowerHeaders.indexOf(String(phoneColumn).toLowerCase());
          if (aiPhoneIdx !== -1) phoneIdx = aiPhoneIdx;
        }
      }
    } catch (e) {
      console.log('AI analysis failed, using pattern detection');
    }

    return { nameColumn: nameIdx, emailColumn: emailIdx, phoneColumn: phoneIdx };
  };

  // Calculate which rows will be skipped and why
  const calculateSkippedRows = (
    rows: string[][],
    mapping: ColumnMapping,
    allowNameOnlyImport: boolean
  ): { row: number; name: string; reason: string }[] => {
    const skipped: { row: number; name: string; reason: string }[] = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0 || row.every(c => !c?.toString().trim())) continue;
      
      const cells = row.map(v => (v ?? '').toString().trim());
      const name = mapping.nameColumn >= 0 ? cells[mapping.nameColumn] : '';
      const email = mapping.emailColumn >= 0 ? cells[mapping.emailColumn] : '';
      const phone = mapping.phoneColumn >= 0 ? formatPhoneNumber(cells[mapping.phoneColumn]) : '';

      if (!name && !email && !phone) {
        skipped.push({ row: i + 1, name: 'Empty row', reason: 'No data found' });
      } else if (!email && !phone && !allowNameOnlyImport) {
        skipped.push({ row: i + 1, name: name || 'Unknown', reason: 'No email or phone number' });
      } else if (!name && !email && phone) {
        // Has phone only - will generate placeholder
      }
    }

    return skipped;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedEventId) {
      toast.error('Please select an event first');
      return;
    }

    setIsProcessing(true);
    setModalStage('processing');
    setAnalysisStage('Reading file...');
    
    try {
      const nameLower = selectedFile.name.toLowerCase();
      const isExcel = nameLower.endsWith('.xlsx') || nameLower.endsWith('.xls');
      const isTextLike = nameLower.endsWith('.csv') || nameLower.endsWith('.tsv') || nameLower.endsWith('.txt');

      if (!isExcel && !isTextLike) {
        toast.error('Unsupported file type. Please upload CSV, TSV, TXT, or Excel files');
        setIsProcessing(false);
        setModalStage('info');
        return;
      }

      let rows: string[][] = [];
      if (isExcel) {
        const buffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array', raw: true, cellNF: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: '' }) as string[][];
      } else {
        const content = await selectedFile.text();
        rows = parseCSVContent(content);
      }

      if (!rows || rows.length < 2) {
        toast.error('File is empty or has no data rows');
        setIsProcessing(false);
        setModalStage('info');
        return;
      }

      setAnalysisStage('Detecting columns...');

      // Normalize headers
      const rawHeaders = rows[0].map(h => (h ?? '').toString().trim());
      const headers = rawHeaders.map((h, idx) => h || `Column ${idx + 1}`);
      
      // Deduplicate headers
      const headerCounts: Record<string, number> = {};
      for (let i = 0; i < headers.length; i++) {
        const base = headers[i].toLowerCase();
        const count = (headerCounts[base] = (headerCounts[base] || 0) + 1);
        if (count > 1) headers[i] = `${headers[i]} (${count})`;
      }

      const sampleRows = rows.slice(1, 101);
      const detectedMapping = await detectColumns(headers, sampleRows);
      const skippedPreview = calculateSkippedRows(rows, detectedMapping, allowNameOnly);

      setParsedRows(rows);
      setColumnMapping(detectedMapping);
      setPreviewData({
        headers,
        rows,
        detectedMapping,
        totalRows: rows.length - 1,
        sampleRows: sampleRows.slice(0, 5),
        skippedPreview
      });
      
      setModalStage('preview');
      setIsProcessing(false);
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to read file');
      setIsProcessing(false);
      setModalStage('info');
    } finally {
      event.target.value = '';
    }
  };

  const extractAttendeesFromRows = (
    rows: string[][],
    headers: string[],
    mapping: ColumnMapping,
    allowNameOnlyImport: boolean
  ): { attendees: AttendeeData[]; skipped: { name: string; reason: string }[] } => {
    const attendees: AttendeeData[] = [];
    const skipped: { name: string; reason: string }[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0 || row.every(c => !c?.toString().trim())) continue;

      const cells = row.map(v => (v ?? '').toString().trim());
      let name = mapping.nameColumn >= 0 ? cells[mapping.nameColumn] : '';
      let email = mapping.emailColumn >= 0 ? cells[mapping.emailColumn] : '';
      let phone = mapping.phoneColumn >= 0 ? formatPhoneNumber(cells[mapping.phoneColumn]) : '';

      // Validate email format
      const emailRe = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
      if (email && !emailRe.test(email)) {
        email = ''; // Invalid email
      }

      // Skip logic
      if (!name && !email && !phone) {
        continue; // Empty row
      }

      if (!email && !phone) {
        if (allowNameOnlyImport && name) {
          // Generate placeholder for name-only
          email = `nameonly_${Date.now()}_${i}@import.local`;
        } else {
          skipped.push({ name: name || `Row ${i + 1}`, reason: 'No email or phone number' });
          continue;
        }
      }

      // If phone but no email, use phone as identifier
      if (!email && phone) {
        email = `${phone.replace(/\D/g, '')}@import.local`;
      }

      // Generate name if missing
      if (!name) {
        if (email.includes('@import.local')) {
          name = phone ? `Attendee ${phone}` : `Attendee ${i}`;
        } else {
          const local = email.split('@')[0];
          name = local.replace(/[._-]+/g, ' ').replace(/\b\w/g, (s) => s.toUpperCase());
        }
      }

      const attendee: AttendeeData = { name, email };
      if (phone) attendee.phone = phone;

      // Add all other columns as form data
      headers.forEach((header, idx) => {
        const val = cells[idx];
        if (!val) return;
        if (idx === mapping.nameColumn || idx === mapping.emailColumn || idx === mapping.phoneColumn) return;
        attendee[header] = val;
      });

      attendees.push(attendee);
    }

    return { attendees, skipped };
  };

  const createTicketsFromAttendees = async (attendees: AttendeeData[]): Promise<ImportResult> => {
    if (!selectedEventId) throw new Error('No event selected');

    const result: ImportResult = {
      successCount: 0,
      errorCount: 0,
      duplicateCount: 0,
      skippedCount: 0,
      errors: [],
      skipped: [],
      totalProcessed: attendees.length
    };

    setAnalysisStage('Fetching ticket types...');

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

    setAnalysisStage('Checking for duplicates...');

    // Check for duplicates by email
    const emails = attendees.map(a => a.email).filter(e => e && !e.endsWith('@import.local'));
    const { data: existingByEmail } = await supabase
      .from('event_tickets')
      .select('guest_email')
      .eq('event_id', selectedEventId)
      .in('guest_email', emails.length > 0 ? emails : ['__none__']);

    const existingEmails = new Set((existingByEmail || []).map(t => t.guest_email?.toLowerCase()));

    // Also check for duplicates by phone number
    const phones = attendees.map(a => a.phone).filter(Boolean);
    const { data: existingByPhone } = await supabase
      .from('event_tickets')
      .select('guest_phone')
      .eq('event_id', selectedEventId)
      .in('guest_phone', phones.length > 0 ? phones : ['__none__']);

    const existingPhones = new Set((existingByPhone || []).map(t => t.guest_phone));

    const newAttendees = attendees.filter(a => {
      const emailExists = a.email && !a.email.endsWith('@import.local') && existingEmails.has(a.email.toLowerCase());
      const phoneExists = a.phone && existingPhones.has(a.phone);
      return !emailExists && !phoneExists;
    });

    result.duplicateCount = attendees.length - newAttendees.length;

    attendees.forEach(a => {
      const emailExists = a.email && !a.email.endsWith('@import.local') && existingEmails.has(a.email.toLowerCase());
      const phoneExists = a.phone && existingPhones.has(a.phone);
      if (emailExists || phoneExists) {
        result.errors.push({ identifier: a.name || a.email || a.phone || 'N/A', reason: 'Already exists in event' });
      }
    });

    if (newAttendees.length === 0) {
      return result;
    }

    setAnalysisStage('Setting up form fields...');
    
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
            result.errors.push({ identifier: a.name || a.email, reason: insertError.message });
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
        result.errorCount += batch.length;
        batch.forEach(a => {
          result.errors.push({ identifier: a.name || a.email, reason: e instanceof Error ? e.message : 'Unknown error' });
        });
      }
    }

    return result;
  };

  const handleStartImport = async () => {
    if (!previewData || !parsedRows.length) return;

    setIsProcessing(true);
    setModalStage('processing');
    setAnalysisStage('Extracting attendees...');

    try {
      const { attendees, skipped } = extractAttendeesFromRows(
        parsedRows,
        previewData.headers,
        columnMapping,
        allowNameOnly
      );

      if (attendees.length === 0) {
        setImportResult({
          successCount: 0,
          errorCount: 0,
          duplicateCount: 0,
          skippedCount: skipped.length,
          errors: [],
          skipped,
          totalProcessed: 0
        });
        setModalStage('results');
        setIsProcessing(false);
        return;
      }

      const result = await createTicketsFromAttendees(attendees);
      result.skipped = skipped;
      result.skippedCount = skipped.length;
      setImportResult(result);
      setModalStage('results');
      setAnalysisStage('Complete');
      
    } catch (error) {
      setImportResult({
        successCount: 0,
        errorCount: 1,
        duplicateCount: 0,
        skippedCount: 0,
        errors: [{ identifier: 'N/A', reason: error instanceof Error ? error.message : 'Import failed' }],
        skipped: [],
        totalProcessed: 0
      });
      setModalStage('results');
    } finally {
      setIsProcessing(false);
    }
  };

  // Update skipped preview when mapping or allowNameOnly changes
  const updateSkippedPreview = (newMapping: ColumnMapping, newAllowNameOnly: boolean) => {
    if (previewData && parsedRows.length > 0) {
      const skippedPreview = calculateSkippedRows(parsedRows, newMapping, newAllowNameOnly);
      setPreviewData({ ...previewData, skippedPreview });
    }
  };

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    const newMapping = { ...columnMapping, [field]: parseInt(value) };
    setColumnMapping(newMapping);
    updateSkippedPreview(newMapping, allowNameOnly);
  };

  const handleAllowNameOnlyChange = (checked: boolean) => {
    setAllowNameOnly(checked);
    updateSkippedPreview(columnMapping, checked);
  };

  const getPreviewValue = (rowIdx: number, colIdx: number): string => {
    if (!previewData) return '';
    const val = previewData.sampleRows[rowIdx]?.[colIdx] || '';
    return formatPhoneNumber(val);
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
      
      <Button
        variant="outline"
        className="rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        disabled={isProcessing}
        onClick={handleOpenModal}
      >
        <Upload className="h-4 w-4 mr-2" />
        AI Import CSV
      </Button>

      <Dialog open={showModal} onOpenChange={(open) => !isProcessing && setShowModal(open)}>
        <DialogContent className={`${modalStage === 'preview' ? 'sm:max-w-2xl' : 'sm:max-w-lg'} [&>button]:hidden`}>
          {/* Info Stage */}
          {modalStage === 'info' && (
            <>
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
                      <p className="text-sm font-medium">Any format works</p>
                      <p className="text-xs text-muted-foreground">
                        CSV, Excel, TSV - any column order or naming convention.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Settings2 className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Preview & adjust</p>
                      <p className="text-xs text-muted-foreground">
                        Review detected columns and manually override if needed before importing.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Search className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">All data searchable</p>
                      <p className="text-xs text-muted-foreground">
                        Extra columns saved as form fields and fully searchable.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSelectFile}>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Preview Stage */}
          {modalStage === 'preview' && previewData && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" />
                  Review Column Mapping
                </DialogTitle>
                <DialogDescription>
                  {previewData.totalRows} rows found. Verify the detected columns are correct.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Column Mapping Selectors */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Name Column</Label>
                    <Select 
                      value={columnMapping.nameColumn.toString()} 
                      onValueChange={(v) => handleMappingChange('nameColumn', v)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-1">Not found</SelectItem>
                        {previewData.headers.map((h, idx) => (
                          <SelectItem key={idx} value={idx.toString()}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email Column</Label>
                    <Select 
                      value={columnMapping.emailColumn.toString()} 
                      onValueChange={(v) => handleMappingChange('emailColumn', v)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-1">Not found</SelectItem>
                        {previewData.headers.map((h, idx) => (
                          <SelectItem key={idx} value={idx.toString()}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs">Phone Column</Label>
                    <Select 
                      value={columnMapping.phoneColumn.toString()} 
                      onValueChange={(v) => handleMappingChange('phoneColumn', v)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-1">Not found</SelectItem>
                        {previewData.headers.map((h, idx) => (
                          <SelectItem key={idx} value={idx.toString()}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Sample Data Preview */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Sample Data Preview</Label>
                  <ScrollArea className="h-[120px] rounded-md border">
                    <div className="p-2">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-1 font-medium text-muted-foreground">#</th>
                            <th className="text-left p-1 font-medium">Name</th>
                            <th className="text-left p-1 font-medium">Email</th>
                            <th className="text-left p-1 font-medium">Phone</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.sampleRows.slice(0, 5).map((_, rowIdx) => (
                            <tr key={rowIdx} className="border-b border-border/50">
                              <td className="p-1 text-muted-foreground">{rowIdx + 2}</td>
                              <td className="p-1 truncate max-w-[120px]">
                                {getPreviewValue(rowIdx, columnMapping.nameColumn) || <span className="text-muted-foreground italic">—</span>}
                              </td>
                              <td className="p-1 truncate max-w-[150px]">
                                {getPreviewValue(rowIdx, columnMapping.emailColumn) || <span className="text-muted-foreground italic">—</span>}
                              </td>
                              <td className="p-1 truncate max-w-[120px]">
                                {getPreviewValue(rowIdx, columnMapping.phoneColumn) || <span className="text-muted-foreground italic">—</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ScrollArea>
                </div>

                {/* Name-only import option */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Allow name-only import</Label>
                    <p className="text-xs text-muted-foreground">Import rows with only a name (no email/phone)</p>
                  </div>
                  <Switch checked={allowNameOnly} onCheckedChange={handleAllowNameOnlyChange} />
                </div>

                {/* Skipped rows warning */}
                {previewData.skippedPreview.length > 0 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-600">
                        {previewData.skippedPreview.length} rows will be skipped
                      </span>
                    </div>
                    <ScrollArea className="h-[80px]">
                      <div className="space-y-1">
                        {previewData.skippedPreview.slice(0, 10).map((s, idx) => (
                          <p key={idx} className="text-xs text-muted-foreground">
                            Row {s.row}: {s.name} - {s.reason}
                          </p>
                        ))}
                        {previewData.skippedPreview.length > 10 && (
                          <p className="text-xs text-muted-foreground italic">
                            ...and {previewData.skippedPreview.length - 10} more
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Import summary */}
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      Ready to import ~{previewData.totalRows - previewData.skippedPreview.length} attendees
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {previewData.headers.length - 3 > 0 && `${previewData.headers.length - 3} extra columns will be saved as form fields.`}
                    {' '}Duplicates will be detected and skipped.
                  </p>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setModalStage('info')}>
                  Back
                </Button>
                <Button onClick={handleStartImport} disabled={columnMapping.nameColumn === -1 && columnMapping.emailColumn === -1 && columnMapping.phoneColumn === -1}>
                  <Upload className="h-4 w-4 mr-2" />
                  Start Import
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
                    <p className="text-xs text-muted-foreground text-center">{progress.percentage}% complete</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                    <p className="text-sm text-muted-foreground">{analysisStage}</p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button disabled className="w-full">
                  Please wait...
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Results Stage */}
          {modalStage === 'results' && importResult && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {importResult.successCount > 0 ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Import Complete
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      Import Results
                    </>
                  )}
                </DialogTitle>
                <DialogDescription>
                  Review the import results below
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-600">{importResult.successCount}</p>
                    <p className="text-xs text-muted-foreground">Imported</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-center">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-amber-600">{importResult.duplicateCount}</p>
                    <p className="text-xs text-muted-foreground">Duplicates</p>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2 text-center">
                    <ChevronDown className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-orange-600">{importResult.skippedCount}</p>
                    <p className="text-xs text-muted-foreground">Skipped</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-center">
                    <XCircle className="h-4 w-4 text-red-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-red-600">{importResult.errorCount}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                </div>

                {/* Skipped details */}
                {importResult.skipped.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <ChevronDown className="h-4 w-4 text-orange-500" />
                      Skipped ({importResult.skipped.length})
                    </p>
                    <ScrollArea className="h-[100px] rounded-md border">
                      <div className="p-3 space-y-2">
                        {importResult.skipped.map((s, idx) => (
                          <div key={idx} className="text-xs bg-orange-500/5 rounded p-2 border border-orange-500/10">
                            <p className="font-medium text-foreground">{s.name}</p>
                            <p className="text-muted-foreground">{s.reason}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Errors/duplicates details */}
                {importResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Issues ({importResult.errors.length})
                    </p>
                    <ScrollArea className="h-[100px] rounded-md border">
                      <div className="p-3 space-y-2">
                        {importResult.errors.map((error, idx) => (
                          <div key={idx} className="text-xs bg-red-500/5 rounded p-2 border border-red-500/10">
                            <p className="font-medium text-foreground">{error.identifier}</p>
                            <p className="text-muted-foreground">{error.reason}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button onClick={handleCloseModal} className="w-full">
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
