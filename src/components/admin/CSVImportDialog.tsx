import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';

interface CSVRow {
  name: string;
  email: string;
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

  const parseCSV = (content: string): CSVRow[] => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIndex = headers.findIndex(h => h.includes('name'));
    const emailIndex = headers.findIndex(h => h.includes('email'));

    if (nameIndex === -1 || emailIndex === -1) {
      throw new Error('CSV must contain "name" and "email" columns');
    }

    const data: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length >= Math.max(nameIndex, emailIndex) + 1) {
        const name = values[nameIndex];
        const email = values[emailIndex];
        
        if (name && email) {
          data.push({ name, email });
        }
      }
    }

    return data;
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
        const parsed = parseCSV(content);
        setCsvData(parsed);
        toast.success(`Parsed ${parsed.length} attendees from CSV`);
      } catch (error) {
        toast.error((error as Error).message);
        setFile(null);
        setCsvData([]);
      }
    };
    reader.readAsText(selectedFile);
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
        .select('id, guest_name, guest_email, ticket_number')
        .eq('event_id', selectedEventId);

      if (error) throw error;

      const found: DuplicateInfo[] = [];
      csvData.forEach((attendee, index) => {
        const existing = existingTickets?.find(ticket => 
          ticket.guest_email?.toLowerCase() === attendee.email.toLowerCase() ||
          ticket.guest_name?.toLowerCase() === attendee.name.toLowerCase()
        );
        
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

  const handleImport = async () => {
    if (!selectedEventId || csvData.length === 0) return;

    setIsProcessing(true);
    setImportResults(null);

    try {
      // Check for duplicates first
      await checkForDuplicates();

      // Get a default ticket type for this event
      const { data: ticketTypes, error: ticketTypeError } = await supabase
        .from('ticket_types')
        .select('id, name, price')
        .eq('event_id', selectedEventId)
        .limit(1);

      if (ticketTypeError || !ticketTypes || ticketTypes.length === 0) {
        throw new Error('No ticket types found for this event. Please create a ticket type first.');
      }

      const defaultTicketType = ticketTypes[0];
      const errors: string[] = [];
      let successCount = 0;
      let skippedCount = 0;
      let updatedCount = 0;

      // Process each attendee
      for (let i = 0; i < csvData.length; i++) {
        const attendee = csvData[i];
        const isDuplicate = duplicates.some(d => d.csvIndex === i);

        try {
          if (isDuplicate) {
            if (skipDuplicates) {
              skippedCount++;
              continue;
            } else if (updateExisting) {
              // Update existing ticket
              const duplicate = duplicates.find(d => d.csvIndex === i);
              if (duplicate) {
                const { error } = await supabase
                  .from('event_tickets')
                  .update({
                    guest_name: attendee.name,
                    guest_email: attendee.email,
                    qr_code_data: generateUniqueQRData(attendee)
                  })
                  .eq('id', duplicate.existingTicket.id);

                if (error) {
                  errors.push(`${attendee.name} (${attendee.email}): Update failed - ${error.message}`);
                } else {
                  updatedCount++;
                }
              }
              continue;
            }
          }

          // Create new ticket
          const { error } = await supabase
            .from('event_tickets')
            .insert({
              event_id: selectedEventId,
              ticket_type_id: defaultTicketType.id,
              guest_name: attendee.name,
              guest_email: attendee.email,
              price: defaultTicketType.price,
              payment_status: 'completed',
              qr_code_data: generateUniqueQRData(attendee),
              ticket_number: '' // Will be auto-generated by trigger
            });

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
                CSV should contain "name" and "email" columns. Example format:
              </p>
              <code className="block text-xs bg-muted p-2 rounded">
                name,email<br/>
                John Doe,john@example.com<br/>
                Jane Smith,jane@example.com
              </code>
            </div>
          </div>

          {/* Preview and Duplicate Options */}
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
                      <div key={index} className="text-sm p-2 bg-muted/50 rounded flex justify-between">
                        <span className="font-medium">{row.name}</span>
                        <span className="text-muted-foreground">{row.email}</span>
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