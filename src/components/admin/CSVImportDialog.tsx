import React, { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const { selectedEventId } = useAdminEventContext();

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

  const extractAttendeesFromCSV = async (content: string): Promise<AttendeeData[]> => {
    const jsonData = parseCSVContent(content);
    
    if (jsonData.length < 2) {
      throw new Error('File must have at least a header row and one data row');
    }

    const headers = jsonData[0].map(h => (h || '').toString().trim());
    
    // Use AI to identify columns
    const { data: aiData, error } = await supabase.functions.invoke('analyze-csv-import', {
      body: { headers, sampleData: jsonData.slice(1, 6).map(row => row.join('|')).join('\n') }
    });

    if (error) throw error;

    const { nameColumn, emailColumn, phoneColumn } = aiData.analysis;
    
    const nameIdx = headers.indexOf(nameColumn);
    const emailIdx = headers.indexOf(emailColumn);
    const phoneIdx = phoneColumn ? headers.indexOf(phoneColumn) : -1;

    if (nameIdx === -1 || emailIdx === -1) {
      throw new Error('Could not identify name and email columns');
    }

    const attendees: AttendeeData[] = [];
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length === 0) continue;
      
      const name = (row[nameIdx] || '').toString().trim();
      const email = (row[emailIdx] || '').toString().trim();
      
      if (!name || !email) continue;
      
      const attendee: AttendeeData = { name, email };
      
      if (phoneIdx !== -1 && row[phoneIdx]) {
        attendee.phone = row[phoneIdx].toString().trim();
      }
      
      // Add all other columns as form data
      headers.forEach((header, idx) => {
        if (idx !== nameIdx && idx !== emailIdx && idx !== phoneIdx && row[idx]) {
          attendee[header] = row[idx].toString().trim();
        }
      });
      
      attendees.push(attendee);
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
    
    // Get extra fields from first attendee
    const extraFields = Object.keys(attendees[0]).filter(k => 
      k !== 'name' && k !== 'email' && k !== 'phone'
    );
    
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

    for (const attendee of attendees) {
      try {
        const { data: ticket, error } = await supabase
          .from('event_tickets')
          .insert({
            event_id: selectedEventId,
            ticket_type_id: ticketType.id,
            guest_name: attendee.name,
            guest_email: attendee.email,
            guest_phone: attendee.phone || null,
            price: ticketType.price,
            payment_status: 'completed',
            qr_code_data: generateUniqueQRData(attendee),
            ticket_number: ''
          })
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            errors.push(`${attendee.name}: Already exists (skipped)`);
          } else {
            errors.push(`${attendee.name}: ${error.message}`);
          }
          errorCount++;
          continue;
        }

        // Create form responses for extra fields
        const responses = Object.entries(fieldMapping)
          .map(([field, fieldId]) => {
            const value = attendee[field];
            if (value) {
              return {
                ticket_id: ticket.id,
                form_field_id: fieldId,
                response_value: value
              };
            }
            return null;
          })
          .filter(Boolean);

        if (responses.length > 0) {
          await supabase.from('ticket_form_responses').insert(responses);
        }

        successCount++;
      } catch (err) {
        errorCount++;
        errors.push(`${attendee.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
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

      const content = await selectedFile.text();
      const attendees = await extractAttendeesFromCSV(content);

      if (attendees.length === 0) {
        throw new Error('No attendees found in file');
      }

      toast.loading(`Creating ${attendees.length} tickets...`, { id: 'processing' });

      const { successCount, errorCount, errors } = await createTicketsFromAttendees(attendees);

      toast.dismiss('processing');

      if (successCount > 0) {
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
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        id="ai-document-import"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
        disabled={isProcessing}
      />
      <label htmlFor="ai-document-import">
        <Button
          variant="outline"
          className="rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          disabled={isProcessing}
          asChild
        >
          <span>
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
          </span>
        </Button>
      </label>
    </>
  );
}
