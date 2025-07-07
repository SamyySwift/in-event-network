import * as XLSX from 'xlsx';

interface AttendeeData {
  id: string;
  name: string | null;
  email: string | null;
  phone?: string | null;
  role: string | null;
  ticket_type?: string | null;
  check_in_status?: string;
  event_name: string | null;
  joined_at: string;
}

interface TicketData {
  id: string;
  ticket_number: string;
  ticket_type_name: string;
  price: number;
  user_name?: string;
  user_email?: string;
  guest_name?: string;
  guest_email?: string;
  check_in_status: boolean;
  checked_in_at?: string;
  purchase_date: string;
  custom_form_data?: Record<string, any>;
}

// Convert data to CSV format
const convertToCSV = (data: any[], headers: string[]): string => {
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
};

// Download file helper
const downloadFile = (content: string | Blob, filename: string, type: 'csv' | 'excel') => {
  if (type === 'csv') {
    const blob = new Blob([content as string], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

<<<<<<< HEAD
// Generic CSV export function
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    throw new Error('No data available to export');
  }

  const headers = Object.keys(data[0]);
  const csvContent = convertToCSV(data, headers);
  
  const timestamp = new Date().toISOString().split('T')[0];
  const sanitizedFilename = filename.replace(/[^a-z0-9]/gi, '_');
  
  downloadFile(csvContent, `${sanitizedFilename}_${timestamp}.csv`, 'csv');
};

// Export attendees data - Enhanced with phone, ticket type, and check-in status
=======
// Helper function for CSV export
const exportToCSV = (data: any[], headerLabels: string[], headers: string[], filename: string) => {
  const csvContent = convertToCSV(data, headers);
  downloadFile(csvContent, `${filename}.csv`, 'csv');
};

// Helper function for Excel export
const exportToExcel = (data: any[], headerLabels: string[], headers: string[], filename: string, sheetName: string) => {
  const worksheetData = data.map(item => {
    const row: Record<string, any> = {};
    headers.forEach((header, index) => {
      row[headerLabels[index]] = item[header];
    });
    return row;
  });
  
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  
  // Set column widths
  const colWidths = headerLabels.map(() => ({ wch: 20 }));
  worksheet['!cols'] = colWidths;
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Export attendees data
>>>>>>> f15d207 (change)
export const exportAttendeesData = (attendees: AttendeeData[], eventName: string, format: 'csv' | 'excel') => {
  if (!attendees || attendees.length === 0) {
    throw new Error('No attendee data available to export');
  }

  const headers = ['name', 'email', 'phone', 'ticket_type', 'check_in_status', 'role', 'joined_at'];
  const headerLabels = ['Full Name', 'Email', 'Phone Number', 'Ticket Type', 'Check-in Status', 'Role', 'Joined Date'];
  
  const processedData = attendees.map(attendee => ({
    name: attendee.name || 'N/A',
    email: attendee.email || 'N/A',
    phone: attendee.phone || 'N/A',
    ticket_type: attendee.ticket_type || 'N/A',
    check_in_status: attendee.check_in_status || 'Not Checked In',
    role: attendee.role || 'attendee',
    joined_at: new Date(attendee.joined_at).toLocaleDateString()
  }));

  const timestamp = new Date().toISOString().split('T')[0];
  const sanitizedEventName = eventName.replace(/[^a-z0-9]/gi, '_');
  const filename = `${sanitizedEventName}_attendees_${timestamp}`;

  if (format === 'csv') {
    exportToCSV(processedData, headerLabels, headers, filename);
  } else {
    exportToExcel(processedData, headerLabels, headers, filename, 'Attendees');
  }
};

// Export tickets data with custom form fields
export const exportTicketsData = async (tickets: any[], eventName: string, format: 'csv' | 'excel') => {
  if (!tickets || tickets.length === 0) {
    throw new Error('No ticket data available to export');
  }

  // Collect all unique custom form fields
  const allFormFields = new Set<string>();
  tickets.forEach(ticket => {
    if (ticket.ticket_form_responses) {
      ticket.ticket_form_responses.forEach((response: any) => {
        allFormFields.add(response.ticket_form_fields.label);
      });
    }
  });

  const customFieldLabels = Array.from(allFormFields).sort();
  
  const headers = [
    'ticket_number', 'ticket_type', 'guest_name', 'guest_email', 'guest_phone',
    'price', 'check_in_status', 'purchase_date', ...customFieldLabels
  ];
  
  const headerLabels = [
    'Ticket Number', 'Ticket Type', 'Guest Name', 'Email', 'Phone',
    'Price', 'Check-in Status', 'Purchase Date', ...customFieldLabels
  ];

  const processedData = tickets.map(ticket => {
    const customData: Record<string, any> = {};
    
    // Process custom form responses
    if (ticket.ticket_form_responses) {
      ticket.ticket_form_responses.forEach((response: any) => {
        const fieldLabel = response.ticket_form_fields.label;
        let value = response.response_value;
        
        // Format different field types for export
        if (Array.isArray(value)) {
          value = value.join(', ');
        } else if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        
        customData[fieldLabel] = value || 'N/A';
      });
    }

    // Ensure all custom fields have values
    customFieldLabels.forEach(field => {
      if (!(field in customData)) {
        customData[field] = 'N/A';
      }
    });

    return {
      ticket_number: ticket.ticket_number || 'N/A',
      ticket_type: ticket.ticket_types?.name || 'N/A',
      guest_name: ticket.guest_name || ticket.profiles?.name || 'N/A',
      guest_email: ticket.guest_email || ticket.profiles?.email || 'N/A',
      guest_phone: ticket.guest_phone || 'N/A',
      price: `₦${ticket.price?.toLocaleString() || '0'}`,
      check_in_status: ticket.check_in_status ? 'Checked In' : 'Not Checked In',
      purchase_date: new Date(ticket.purchase_date).toLocaleDateString(),
      ...customData
    };
  });

  const timestamp = new Date().toISOString().split('T')[0];
  const sanitizedEventName = eventName.replace(/[^a-z0-9]/gi, '_');
  const filename = `${sanitizedEventName}_tickets_${timestamp}`;

  if (format === 'csv') {
    exportToCSV(processedData, headerLabels, headers, filename);
  } else {
    exportToExcel(processedData, headerLabels, headers, filename, 'Tickets');
  }
};