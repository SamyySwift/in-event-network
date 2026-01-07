import React, { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle2, FileSpreadsheet, Sparkles, Search, CheckCircle, XCircle, AlertTriangle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  hasPlaceholderEmail?: boolean;
  [key: string]: string | boolean | undefined;
}

interface ImportResult {
  successCount: number;
  errorCount: number;
  duplicateCount: number;
  skippedCount: number;
  errors: { email: string; reason: string }[];
  skippedRows: { row: number; reason: string }[];
  totalProcessed: number;
  totalInFile: number;
}

interface PreviewData {
  totalRows: number;
  withEmail: number;
  nameOnly: number;
  skipped: number;
  attendeesWithEmail: AttendeeData[];
  attendeesNameOnly: AttendeeData[];
  skippedRows: { row: number; reason: string }[];
  rawRows: string[][];
}

interface CSVImportDialogProps {
  onImportComplete?: () => void;
}

export default function CSVImportDialog({ onImportComplete }: CSVImportDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSelectingFile, setIsSelectingFile] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [showModal, setShowModal] = useState(false);
  const [modalStage, setModalStage] = useState<'info' | 'analyzing' | 'preview' | 'processing' | 'results'>('info');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [analysisStage, setAnalysisStage] = useState<string>('');
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [importNameOnly, setImportNameOnly] = useState(true);
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
    setProgress({ current: 0, total: 0, percentage: 0 });
    setImportNameOnly(true);
    setShowModal(true);
  };

  const handleSelectFile = () => {
    setIsSelectingFile(true);
    fileInputRef.current?.click();
  };

  const handleCloseModal = () => {
    if (isProcessing || isAnalyzing) return;
    setShowModal(false);
    setModalStage('info');
    setImportResult(null);
    setPreviewData(null);
    setProgress({ current: 0, total: 0, percentage: 0 });
    onImportComplete?.();
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

  const analyzeFileForPreview = async (rows: string[][]): Promise<PreviewData> => {
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

    setAnalysisStage('AI analyzing columns...');

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

    const attendeesWithEmail: AttendeeData[] = [];
    const attendeesNameOnly: AttendeeData[] = [];
    const skippedRows: { row: number; reason: string }[] = [];

    setAnalysisStage('Categorizing rows...');

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      const cells = row.map(v => (v ?? '').toString().trim());
      
      // Skip completely empty rows
      if (cells.every(c => !c)) continue;

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

      // Categorize row
      if (!email && !name) {
        skippedRows.push({ row: i + 1, reason: 'No name or email found' });
        continue;
      }

      // Derive name from email if missing
      let derivedName = name;
      if (!derivedName && email) {
        const local = email.split('@')[0];
        derivedName = local.replace(/[._-]+/g, ' ').replace(/\b\w/g, (s) => s.toUpperCase());
      }

      const attendee: AttendeeData = { 
        name: derivedName || name, 
        email: email || '',
        hasPlaceholderEmail: !email
      };
      if (phone) attendee.phone = phone;

      // Add all other columns as form data
      headers.forEach((header, idx) => {
        const val = cells[idx];
        if (!val) return;
        if (idx === nameIdx || idx === emailIdx || idx === phoneIdx) return;
        attendee[header] = val;
      });

      if (email) {
        attendeesWithEmail.push(attendee);
      } else {
        attendeesNameOnly.push(attendee);
      }
    }

    return {
      totalRows: rows.length - 1,
      withEmail: attendeesWithEmail.length,
      nameOnly: attendeesNameOnly.length,
      skipped: skippedRows.length,
      attendeesWithEmail,
      attendeesNameOnly,
      skippedRows,
      rawRows: rows
    };
  };

  const createTicketsFromAttendees = async (attendees: AttendeeData[], skippedRows: { row: number; reason: string }[], totalInFile: number): Promise<ImportResult> => {
    if (!selectedEventId) throw new Error('No event selected');

    const result: ImportResult = {
      successCount: 0,
      errorCount: 0,
      duplicateCount: 0,
      skippedCount: skippedRows.length,
      errors: [],
      skippedRows,
      totalProcessed: attendees.length,
      totalInFile
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
    
    // Collect extra fields across all attendees
    const extraFieldsSet = new Set<string>();
    attendees.forEach(a => {
      Object.keys(a).forEach(k => {
        if (k !== 'name' && k !== 'email' && k !== 'phone' && k !== 'hasPlaceholderEmail') extraFieldsSet.add(k);
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
            const responses: any[] = [];
            for (let i = 0; i < inserted.length; i++) {
              const ticket = inserted[i];
              const attendee = batch[i];
              for (const [field, fieldId] of Object.entries(fieldMapping)) {
                const value = attendee[field];
                if (value && typeof value === 'string') {
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
    if (!selectedFile) {
      setIsSelectingFile(false);
      return;
    }

    if (!selectedEventId) {
      toast.error('Please select an event first');
      setIsSelectingFile(false);
      return;
    }

    setIsAnalyzing(true);
    setIsSelectingFile(false);
    setModalStage('analyzing');
    setAnalysisStage('Reading file...');
    
    try {
      const nameLower = selectedFile.name.toLowerCase();
      const isExcel = nameLower.endsWith('.xlsx') || nameLower.endsWith('.xls');
      const isTextLike = nameLower.endsWith('.csv') || nameLower.endsWith('.tsv') || nameLower.endsWith('.txt');

      if (!isExcel && !isTextLike) {
        setImportResult({
          successCount: 0,
          errorCount: 1,
          duplicateCount: 0,
          skippedCount: 0,
          errors: [{ email: 'N/A', reason: 'Unsupported file type. Please upload CSV, TSV, TXT, or Excel files' }],
          skippedRows: [],
          totalProcessed: 0,
          totalInFile: 0
        });
        setModalStage('results');
        setIsAnalyzing(false);
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

      // Pre-analyze for preview
      const preview = await analyzeFileForPreview(rows);
      setPreviewData(preview);
      setModalStage('preview');
      
    } catch (error) {
      setImportResult({
        successCount: 0,
        errorCount: 1,
        duplicateCount: 0,
        skippedCount: 0,
        errors: [{ email: 'N/A', reason: error instanceof Error ? error.message : 'Analysis failed' }],
        skippedRows: [],
        totalProcessed: 0,
        totalInFile: 0
      });
      setModalStage('results');
    } finally {
      setIsAnalyzing(false);
      event.target.value = '';
    }
  };

  const handleStartImport = async () => {
    if (!previewData) return;

    setIsProcessing(true);
    setModalStage('processing');
    setAnalysisStage('Preparing import...');

    try {
      // Combine attendees based on toggle
      let attendeesToImport = [...previewData.attendeesWithEmail];
      
      if (importNameOnly) {
        // Generate placeholder emails for name-only entries
        const nameOnlyWithEmails = previewData.attendeesNameOnly.map((a, idx) => {
          const nameSlug = a.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
          return {
            ...a,
            email: `${nameSlug}_${Date.now()}_${idx}@import.local`
          };
        });
        attendeesToImport = [...attendeesToImport, ...nameOnlyWithEmails];
      }

      // Add name-only to skipped if not importing them
      const finalSkipped = importNameOnly 
        ? previewData.skippedRows 
        : [
            ...previewData.skippedRows,
            ...previewData.attendeesNameOnly.map((_, idx) => ({
              row: idx + 1, // Approximate row number
              reason: 'Name only - no email (toggle disabled)'
            }))
          ];

      const result = await createTicketsFromAttendees(
        attendeesToImport, 
        finalSkipped, 
        previewData.totalRows
      );
      
      setImportResult(result);
      setModalStage('results');
      setAnalysisStage('Complete');
      
    } catch (error) {
      setImportResult({
        successCount: 0,
        errorCount: 1,
        duplicateCount: 0,
        skippedCount: 0,
        errors: [{ email: 'N/A', reason: error instanceof Error ? error.message : 'Import failed' }],
        skippedRows: [],
        totalProcessed: 0,
        totalInFile: previewData.totalRows
      });
      setModalStage('results');
    } finally {
      setIsProcessing(false);
    }
  };

  const getReadyToImportCount = () => {
    if (!previewData) return 0;
    return previewData.withEmail + (importNameOnly ? previewData.nameOnly : 0);
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
        disabled={isProcessing || isAnalyzing}
      />
      
      {/* Button that opens modal */}
      <Button
        variant="outline"
        className="rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        disabled={isProcessing || isAnalyzing}
        onClick={handleOpenModal}
      >
        <Upload className="h-4 w-4 mr-2" />
        AI Import CSV
      </Button>

      {/* Single unified modal for all stages */}
      <Dialog open={showModal} onOpenChange={(open) => !isProcessing && !isAnalyzing && setShowModal(open)}>
        <DialogContent className="sm:max-w-lg [&>button]:hidden">
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
                      <p className="text-sm font-medium">Flexible data format</p>
                      <p className="text-xs text-muted-foreground">
                        Name, email, or both - we'll detect what you have. CSV, Excel, TSV, or TXT files supported.
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
                      <Users className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Name-only entries supported</p>
                      <p className="text-xs text-muted-foreground">
                        Works even without emails - we'll generate placeholder addresses for check-in.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Preview before importing</p>
                      <p className="text-xs text-muted-foreground">
                        See exactly what will be imported before committing. Duplicates are automatically filtered.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                  <strong>Tip:</strong> Your CSV can have any column structure. The AI will figure out what's what!
                </div>
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setShowModal(false)} disabled={isSelectingFile}>
                  Cancel
                </Button>
                <Button onClick={handleSelectFile} disabled={isSelectingFile}>
                  {isSelectingFile ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isSelectingFile ? 'Opening...' : 'Choose File'}
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Analyzing Stage */}
          {modalStage === 'analyzing' && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  Analyzing File
                </DialogTitle>
                <DialogDescription>
                  {analysisStage}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">{analysisStage}</p>
                <p className="text-xs text-muted-foreground mt-2">This may take a moment...</p>
              </div>

              <DialogFooter>
                <Button disabled className="w-full">
                  Please wait...
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Preview Stage */}
          {modalStage === 'preview' && previewData && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  Import Preview
                </DialogTitle>
                <DialogDescription>
                  Review what will be imported before proceeding
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium">Found {previewData.totalRows} rows in your file</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        With email addresses
                      </span>
                      <span className="font-medium text-green-600">{previewData.withEmail}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Name only (no email)
                      </span>
                      <span className="font-medium text-amber-600">{previewData.nameOnly}</span>
                    </div>
                    
                    {previewData.skipped > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          Will be skipped (no data)
                        </span>
                        <span className="font-medium text-red-600">{previewData.skipped}</span>
                      </div>
                    )}
                  </div>
                </div>

                {previewData.nameOnly > 0 && (
                  <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="import-name-only" className="text-sm font-medium cursor-pointer">
                        Import name-only entries
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Generates placeholder emails for check-in
                      </p>
                    </div>
                    <Switch
                      id="import-name-only"
                      checked={importNameOnly}
                      onCheckedChange={setImportNameOnly}
                    />
                  </div>
                )}

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Ready to import</p>
                  <p className="text-2xl font-bold text-primary">{getReadyToImportCount()} attendees</p>
                </div>

                {previewData.skippedRows.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Rows to skip ({previewData.skippedRows.length})
                    </p>
                    <ScrollArea className="h-[80px] rounded-md border">
                      <div className="p-2 space-y-1">
                        {previewData.skippedRows.slice(0, 10).map((skip, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground">
                            Row {skip.row}: {skip.reason}
                          </div>
                        ))}
                        {previewData.skippedRows.length > 10 && (
                          <div className="text-xs text-muted-foreground italic">
                            ...and {previewData.skippedRows.length - 10} more
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setModalStage('info')}>
                  Back
                </Button>
                <Button onClick={handleStartImport} disabled={getReadyToImportCount() === 0}>
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
                    <p className="text-[10px] text-muted-foreground">Imported</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-center">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-amber-600">{importResult.duplicateCount}</p>
                    <p className="text-[10px] text-muted-foreground">Duplicates</p>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2 text-center">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-orange-600">{importResult.skippedCount}</p>
                    <p className="text-[10px] text-muted-foreground">Skipped</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-center">
                    <XCircle className="h-4 w-4 text-red-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-red-600">{importResult.errorCount}</p>
                    <p className="text-[10px] text-muted-foreground">Failed</p>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                  <p><strong>Total in file:</strong> {importResult.totalInFile} rows</p>
                  {importResult.successCount > 0 && (
                    <p className="text-green-600">✓ {importResult.successCount} imported successfully</p>
                  )}
                  {importResult.duplicateCount > 0 && (
                    <p className="text-amber-600">⚠ {importResult.duplicateCount} skipped (already exist)</p>
                  )}
                  {importResult.skippedCount > 0 && (
                    <p className="text-orange-600">⚠ {importResult.skippedCount} skipped (no valid data)</p>
                  )}
                  {importResult.errorCount > 0 && (
                    <p className="text-red-600">✗ {importResult.errorCount} failed to import</p>
                  )}
                </div>

                {importResult.skippedRows.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Skipped Rows ({importResult.skippedRows.length})
                    </p>
                    <ScrollArea className="h-[100px] rounded-md border">
                      <div className="p-3 space-y-2">
                        {importResult.skippedRows.map((skip, idx) => (
                          <div key={idx} className="text-xs bg-orange-500/5 rounded p-2 border border-orange-500/10">
                            <p className="font-medium text-foreground">Row {skip.row}</p>
                            <p className="text-muted-foreground">{skip.reason}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {importResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Errors ({importResult.errors.length})
                    </p>
                    <ScrollArea className="h-[100px] rounded-md border">
                      <div className="p-3 space-y-2">
                        {importResult.errors.map((error, idx) => (
                          <div key={idx} className="text-xs bg-red-500/5 rounded p-2 border border-red-500/10">
                            <p className="font-medium text-foreground">{error.email}</p>
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
