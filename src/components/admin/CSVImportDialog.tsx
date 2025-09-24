import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';

interface CSVRow {
  name: string;
  email: string;
  [key: string]: string;
}

interface FormField {
  id: string;
  label: string;
  field_type: string;
  field_order: number;
}

interface DuplicateInfo {
  csvIndex: number;
  existingTicket: any;
  attendee: CSVRow;
}

interface CSVImportDialogProps {
  onImportComplete?: () => void;
}

export default function CSVImportDialog({ onImportComplete }: CSVImportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateInfo[]>([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: string[];
    skipped: number;
    updated: number;
  } | null>(null);

  const { selectedEventId } = useAdminEventContext();

  const parseCSV = (content: string): { data: CSVRow[], headers: string[] } => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const headerLowerCase = headers.map(h => h.toLowerCase());
    const nameIndex = headerLowerCase.findIndex(h => h.includes('name'));
    const emailIndex = headerLowerCase.findIndex(h => h.includes('email'));

    if (nameIndex === -1 || emailIndex === -1) {
      throw new Error('CSV must contain "name" and "email" columns');
    }

    const data: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length >= headers.length && values[nameIndex] && values[emailIndex]) {
        const row: CSVRow = {
          name: values[nameIndex],
          email: values[emailIndex]
        };
        
        // Add all other columns as additional properties
        headers.forEach((header, index) => {
          if (index !== nameIndex && index !== emailIndex && values[index]) {
            row[header] = values[index];
          }
        });
        
        data.push(row);
      }
    }

    return { data, headers };
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const { data, headers } = parseCSV(content);
        setCsvData(data);
        setCsvHeaders(headers);
        
        // Fetch form fields for this event (done separately to avoid type issues)
        toast.success(`Parsed ${data.length} attendees from CSV with ${headers.length} columns`);
        
      } catch (error) {
        toast.error((error as Error).message);
        setFile(null);
        setCsvData([]);
        setCsvHeaders([]);
        setFormFields([]);
      }
    };
    reader.readAsText(selectedFile);
    
    // Form fields will be fetched when dialog opens
  };

  const generateUniqueQRData = (attendee: CSVRow): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${attendee.name}|${attendee.email}|${timestamp}|${random}`;
  };

  const checkForDuplicates = async () => {
    if (!selectedEventId || csvData.length === 0) return;

    try {
      // Check for existing tickets with same email or name
      const { data: existingTickets, error } = await supabase
        .from('event_tickets')
        .select(`
          id,
          guest_name,
          guest_email,
          ticket_number,
          user_id,
          profiles:profiles!event_tickets_user_id_fkey (
            email,
            name
          )
        `)
        .eq('event_id', selectedEventId);

      if (error) throw error;

      const found: DuplicateInfo[] = [];
      csvData.forEach((attendee, index) => {
        const attendeeEmail = attendee.email?.toLowerCase();
        const attendeeName = attendee.name?.toLowerCase();
        const existing = existingTickets?.find(ticket => {
          const profile = ticket.profiles as any;
          return (
            (ticket.guest_email && ticket.guest_email.toLowerCase() === attendeeEmail) ||
            (profile?.email && profile.email.toLowerCase() === attendeeEmail) ||
            (ticket.guest_name && ticket.guest_name.toLowerCase() === attendeeName) ||
            (profile?.name && profile.name.toLowerCase() === attendeeName)
          );
        });
        
        if (existing) {
          found.push({
            csvIndex: index,
            existingTicket: existing,
            attendee
          });
        }
      });
  
      setDuplicates(found);
    } catch (error) {
      console.error('Error checking duplicates:', error);
    }
  };

  // Auto-create/find form fields for extra CSV headers and return a header->form_field_id mapping
  const ensureAutoFieldMapping = async (ticketTypeId: string, headers: string[]): Promise<Record<string, string>> => {
    // Only headers beyond "name" and "email" are included in mapping (phone is also included in Form Data)
    const extraHeaders = headers.filter(h => {
      const hl = h.trim().toLowerCase();
      return hl !== 'name' && hl !== 'email' && hl !== '';
    });
  
    if (extraHeaders.length === 0) return {};
  
    const { data: existingFields, error: fieldsErr } = await supabase
      .from('ticket_form_fields')
      .select('id, label, field_order')
      .eq('ticket_type_id', ticketTypeId)
      .order('field_order', { ascending: true });
  
    if (fieldsErr) {
      console.error('Error fetching existing form fields:', fieldsErr);
      return {};
    }
  
    const mapByLabel = new Map<string, { id: string; label: string }>();
    (existingFields || []).forEach(f => {
      mapByLabel.set(f.label.trim().toLowerCase(), { id: f.id, label: f.label });
    });
  
    let nextOrder = (existingFields?.length || 0);
    const toInsert: any[] = [];
  
    for (const header of extraHeaders) {
      const key = header.trim().toLowerCase();
      if (!mapByLabel.has(key)) {
        toInsert.push({
          ticket_type_id: ticketTypeId,
          field_type: 'short_answer',
          label: header.trim(),
          is_required: false,
          field_order: nextOrder++
        });
      }
    }
  
    if (toInsert.length > 0) {
      const { data: created, error: insertErr } = await supabase
        .from('ticket_form_fields')
        .insert(toInsert)
        .select('id, label');
  
      if (insertErr) {
        console.error('Error creating form fields:', insertErr);
      } else {
        created?.forEach((f: any) => {
          mapByLabel.set(f.label.trim().toLowerCase(), { id: f.id, label: f.label });
        });
      }
    }
  
    const mapping: Record<string, string> = {};
    extraHeaders.forEach(h => {
      const match = mapByLabel.get(h.trim().toLowerCase());
      if (match) mapping[h] = match.id;
    });
  
    // reflect in UI mapping (optional)
    setFieldMapping(prev => ({ ...prev, ...mapping }));
    return mapping;
  };

  const handleImport = async () => {
    if (!selectedEventId || csvData.length === 0) return;

    setIsProcessing(true);
    setImportResults(null);

    try {
      // Check for duplicates first
      await checkForDuplicates();

      // Prefer free (₦0) ticket type; fall back to any ticket type
      let defaultTicketType: { id: string; name: string; price: number } | null = null;
  
      const { data: freeTypes, error: freeTypeError } = await supabase
        .from('ticket_types')
        .select('id, name, price')
        .eq('event_id', selectedEventId)
        .eq('price', 0)
        .limit(1);
  
      if (freeTypeError) {
        throw new Error('Failed to fetch ticket types for this event.');
      }
  
      if (freeTypes && freeTypes.length > 0) {
        defaultTicketType = freeTypes[0];
      } else {
        const { data: anyTypes, error: anyTypeError } = await supabase
          .from('ticket_types')
          .select('id, name, price')
          .eq('event_id', selectedEventId)
          .limit(1);
        
        if (anyTypeError || !anyTypes || anyTypes.length === 0) {
          throw new Error('No ticket types found for this event. Please create a ticket type first.');
        }
        defaultTicketType = anyTypes[0];
      }
  
      // Auto-create/find form fields for extra CSV columns and build a mapping
      const autoMapping = await ensureAutoFieldMapping(defaultTicketType.id, csvHeaders);
  
      const errors: string[] = [];
      let successCount = 0;
      let skippedCount = 0;
      let updatedCount = 0; // will remain zero since we no longer update existing
  
      // Process each attendee
      for (let i = 0; i < csvData.length; i++) {
        const attendee = csvData[i];
        const isDuplicate = duplicates.some(d => d.csvIndex === i);
  
        try {
          if (isDuplicate) {
            // Always skip duplicates to avoid overwriting any existing ticket purchases
            skippedCount++;
            continue;
          }
  
          // Map possible phone columns
          const phoneValue =
            attendee['phone'] ||
            attendee['phone_number'] ||
            attendee['phone number'] ||
            attendee['mobile'] ||
            attendee['mobile_number'] ||
            attendee['mobile number'] ||
            null;
  
          // Create new ticket
          const { data: ticketData, error } = await supabase
            .from('event_tickets')
            .insert({
              event_id: selectedEventId,
              ticket_type_id: defaultTicketType.id,
              guest_name: attendee.name,
              guest_email: attendee.email,
              guest_phone: phoneValue,
              price: defaultTicketType.price,
              payment_status: 'completed',
              qr_code_data: generateUniqueQRData(attendee),
              ticket_number: '' // Will be auto-generated by trigger
            })
            .select()
            .single();
  
          if (error) {
            // Provide more specific error messages
            if (error.code === '23505' && error.message.includes('qr_code_data')) {
              errors.push(`${attendee.name} (${attendee.email}): Duplicate entry detected`);
            } else if (error.code === '23505') {
              errors.push(`${attendee.name} (${attendee.email}): Already exists in system`);
            } else {
              errors.push(`${attendee.name} (${attendee.email}): ${error.message}`);
            }
          } else {
            successCount++;
            
            // Build form responses for ALL extra CSV columns (auto mapping)
            const responses: any[] = [];
            Object.entries(autoMapping).forEach(([csvHeader, formFieldId]) => {
              const value = attendee[csvHeader];
              if (value !== undefined && value !== null && value !== '') {
                responses.push({
                  ticket_id: ticketData.id,
                  form_field_id: formFieldId,
                  response_value: value
                });
              }
            });
  
            if (responses.length > 0) {
              const { error: formError } = await supabase
                .from('ticket_form_responses')
                .insert(responses);
              
              if (formError) {
                console.error('Error creating form responses:', formError);
              }
            }
          }
        } catch (err) {
          errors.push(`${attendee.name} (${attendee.email}): Unexpected error occurred`);
        }
      }
  
      setImportResults({
        success: successCount,
        errors,
        skipped: skippedCount,
        updated: updatedCount
      });
  
      const totalProcessed = successCount + updatedCount;
      if (totalProcessed > 0) {
        toast.success(`Successfully processed ${totalProcessed} attendees (${successCount} new, ${updatedCount} updated)`);
        onImportComplete?.();
      }
  
      if (skippedCount > 0) {
        toast.info(`Skipped ${skippedCount} duplicate entries`);
      }
  
      if (errors.length > 0) {
        toast.error(`${errors.length} imports failed`);
      }
  
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setFormFields([]);
    setFieldMapping({});
    setDuplicates([]);
    setImportResults(null);
    setSkipDuplicates(true);
    setUpdateExisting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import Attendees from CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">Upload CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="rounded-xl"
            />
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800">📝 Important Note</p>
                <p className="text-xs text-blue-700 mt-1">
                  Before importing attendees, please create a <strong>free ticket type</strong> (₦0.00) in the Tickets page. 
                  This will be used to assign imported attendees to the event.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                CSV should contain "name" and "email" columns. Additional columns will be available for mapping to form fields. Example format:
              </p>
              <code className="block text-xs bg-muted p-2 rounded">
                name,email,company,phone<br/>
                John Doe,john@example.com,Tech Corp,+1234567890<br/>
                Jane Smith,jane@example.com,Design Ltd,+0987654321
              </code>
            </div>
          </div>

          {/* Preview and Options */}
          {csvData.length > 0 && !importResults && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Preview ({csvData.length} attendees)</h3>
                    <Badge variant="secondary">{csvData.length} records</Badge>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {csvData.slice(0, 10).map((row, index) => (
                      <div key={index} className="text-sm p-2 bg-muted/50 rounded">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{row.name}</span>
                          <span className="text-muted-foreground">{row.email}</span>
                        </div>
                        {csvHeaders.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            {csvHeaders
                              .filter(h => !['name', 'email'].some(basic => 
                                h.toLowerCase().includes(basic.toLowerCase())
                              ))
                              .map(header => `${header}: ${row[header] || 'N/A'}`)
                              .join(' • ')
                            }
                          </div>
                        )}
                      </div>
                    ))}
                    {csvData.length > 10 && (
                      <div className="text-sm text-muted-foreground text-center">
                        ... and {csvData.length - 10} more
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Column Mapping for Form Fields */}
              {formFields.length > 0 && csvHeaders.length > 2 && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Map CSV Columns to Form Fields</h3>
                    <div className="space-y-3">
                      {csvHeaders
                        .filter(header => !['name', 'email'].some(basicField => 
                          header.toLowerCase().includes(basicField.toLowerCase())
                        ))
                        .map((header) => (
                          <div key={header} className="flex items-center justify-between">
                            <Label className="text-sm font-medium">{header}</Label>
                            <Select
                              value={fieldMapping[header] || ''}
                              onValueChange={(value) => {
                                setFieldMapping(prev => ({
                                  ...prev,
                                  [header]: value === 'none' ? '' : value
                                }));
                              }}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select form field" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Don't map</SelectItem>
                                {formFields.map((field) => (
                                  <SelectItem key={field.id} value={field.id}>
                                    {field.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Map additional CSV columns to form fields to save as form responses.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Duplicate Handling Options */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Duplicate Handling</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="skip-duplicates"
                        checked={skipDuplicates}
                        onCheckedChange={(checked) => {
                          setSkipDuplicates(checked as boolean);
                          if (checked) setUpdateExisting(false);
                        }}
                      />
                      <Label htmlFor="skip-duplicates" className="text-sm">
                        Skip duplicate entries (recommended)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="update-existing"
                        checked={updateExisting}
                        onCheckedChange={(checked) => {
                          setUpdateExisting(checked as boolean);
                          if (checked) setSkipDuplicates(false);
                        }}
                      />
                      <Label htmlFor="update-existing" className="text-sm">
                        Update existing attendees with new information
                      </Label>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Duplicates are detected by matching email addresses or names.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Import Results */}
          {importResults && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Import Complete</span>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="default" className="text-green-600 bg-green-100">
                      {importResults.success} new
                    </Badge>
                    {importResults.updated > 0 && (
                      <Badge variant="default" className="text-blue-600 bg-blue-100">
                        {importResults.updated} updated
                      </Badge>
                    )}
                    {importResults.skipped > 0 && (
                      <Badge variant="secondary">
                        {importResults.skipped} skipped
                      </Badge>
                    )}
                    {importResults.errors.length > 0 && (
                      <Badge variant="destructive">
                        {importResults.errors.length} failed
                      </Badge>
                    )}
                  </div>

                  {importResults.errors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-600 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Errors:
                      </h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {importResults.errors.map((error, index) => (
                          <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              disabled={csvData.length === 0 || isProcessing || !selectedEventId}
              className="flex-1"
            >
              {isProcessing ? 'Importing...' : `Import ${csvData.length} Attendees`}
            </Button>
            <Button variant="outline" onClick={handleClose}>
              {importResults ? 'Close' : 'Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}