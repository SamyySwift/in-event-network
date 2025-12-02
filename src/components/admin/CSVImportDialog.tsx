import React, { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle2, FileSpreadsheet, Sparkles, Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
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

interface CSVImportDialogProps {
  onImportComplete?: () => void;
}

export default function CSVImportDialog({ onImportComplete }: CSVImportDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [showModal, setShowModal] = useState(false);
  const [modalStage, setModalStage] = useState<'info' | 'processing' | 'results'>('info');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [analysisStage, setAnalysisStage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedEventId } = useAdminEventContext();

  const handleOpenModal = () => {
    if (!selectedEventId) {
      toast.error('Please select an event first');
      return;
    }
    setModalStage('info');
    setImportResult(null);
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
    // Check for scientific notation (e.g., "2.34091E+13")
    if (/[Ee][+-]?\d+/.test(value)) {
      const num = parseFloat(value);
      if (Number.isFinite(num) && num > 1000000) {
        return num.toFixed(0);
      }
    }
    return value;
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

    // Improved detection patterns
    const emailRe = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
    const phoneRe = /(\+?\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?[\d\s-]{6,}/;
    const namePatterns = /name|fullname|full.*name|customer|attendee|buyer|participant/i;
    const emailPatterns = /email|e-mail|mail|e_mail/i;
    const phonePatterns = /phone|mobile|contact|number|tel|cell|gsm/i;

    // Fallback: try to find columns by header patterns if AI didn't find them
    if (nameIdx === -1) {
      nameIdx = lowerHeaders.findIndex(h => namePatterns.test(h));
    }
    if (emailIdx === -1) {
      emailIdx = lowerHeaders.findIndex(h => emailPatterns.test(h));
    }
    if (phoneIdx === -1) {
      phoneIdx = lowerHeaders.findIndex(h => phonePatterns.test(h));
    }

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
      let phone = phoneIdx >= 0 ? formatPhoneNumber(cells[phoneIdx]) : '';

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
          phone = formatPhoneNumber(cells[pIdx]);
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

      // CHANGED: Allow import if we have name AND (email OR phone)
      // Previously required email, now phone is sufficient
      if (!name && !email && !phone) continue; // Skip completely empty rows
      
      // If we have phone but no email, generate a placeholder email using phone
      if (!email && phone) {
        email = `${phone.replace(/\D/g, '')}@import.local`;
      }
      
      // If still no email and no phone, skip
      if (!email) continue;
      
      // Generate name from email if missing
      if (!name) {
        if (email.includes('@import.local')) {
          name = `Attendee ${phone}`;
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
        if (idx === nameIdx || idx === emailIdx || idx === phoneIdx) return;
        attendee[header] = val;
      });

      attendees.push(attendee);
    }

    if (attendees.length === 0) {
      throw new Error('No attendees found in file. Ensure rows have at least a name with email or phone number.');
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
      .in('guest_email', emails);

    const existingEmails = new Set((existingByEmail || []).map(t => t.guest_email?.toLowerCase()));

    // Also check for duplicates by phone number
    const phones = attendees.map(a => a.phone).filter(Boolean);
    const { data: existingByPhone } = await supabase
      .from('event_tickets')
      .select('guest_phone')
      .eq('event_id', selectedEventId)
      .in('guest_phone', phones);

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
        result.errors.push({ email: a.email || a.phone || 'N/A', reason: 'Already exists in event' });
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
    setModalStage('processing');
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
          errors: [{ email: 'N/A', reason: 'Unsupported file type. Please upload CSV, TSV, TXT, or Excel files' }],
          totalProcessed: 0
        });
        setModalStage('results');
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

      setAnalysisStage('Analyzing with AI...');
      const attendees = await extractAttendeesFromCSV(rows);

      if (attendees.length === 0) {
        setImportResult({
          successCount: 0,
          errorCount: 1,
          duplicateCount: 0,
          errors: [{ email: 'N/A', reason: 'No attendees found in file. Ensure rows have at least a name with email or phone number.' }],
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
      
      {/* Button that opens modal */}
      <Button
        variant="outline"
        className="rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        disabled={isProcessing}
        onClick={handleOpenModal}
      >
        <Upload className="h-4 w-4 mr-2" />
        AI Import CSV
      </Button>

      {/* Single unified modal for all stages */}
      <Dialog open={showModal} onOpenChange={(open) => !isProcessing && setShowModal(open)}>
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
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-600">{importResult.successCount}</p>
                    <p className="text-xs text-muted-foreground">Successful</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-amber-600">{importResult.duplicateCount}</p>
                    <p className="text-xs text-muted-foreground">Duplicates</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                    <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-red-600">{importResult.errorCount}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                  <p><strong>Total processed:</strong> {importResult.totalProcessed} records</p>
                  {importResult.successCount > 0 && (
                    <p className="text-green-600">✓ {importResult.successCount} imported successfully</p>
                  )}
                  {importResult.duplicateCount > 0 && (
                    <p className="text-amber-600">⚠ {importResult.duplicateCount} skipped (already exist)</p>
                  )}
                  {importResult.errorCount > 0 && (
                    <p className="text-red-600">✗ {importResult.errorCount} failed to import</p>
                  )}
                </div>

                {importResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Issues ({importResult.errors.length})
                    </p>
                    <ScrollArea className="h-[150px] rounded-md border">
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
