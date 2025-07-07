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
}

// Convert data to CSV format
export const convertToCSV = (data: any[], headers: string[]): string => {
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

// Download file - Fixed to handle both CSV and Excel
export const downloadFile = (content: string | Blob, filename: string, type: 'csv' | 'excel') => {
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
    const csvContent = convertToCSV(processedData, headers);
    downloadFile(csvContent, `${filename}.csv`, 'csv');
  } else {
    // Enhanced Excel export with all fields
    const worksheetData = processedData.map(item => ({
      'Full Name': item.name,
      'Email': item.email,
      'Phone Number': item.phone,
      'Ticket Type': item.ticket_type,
      'Check-in Status': item.check_in_status,
      'Role': item.role,
      'Joined Date': item.joined_at
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    
    // Set column widths
    const colWidths = [
      { wch: 20 }, // Full Name
      { wch: 30 }, // Email
      { wch: 15 }, // Phone Number
      { wch: 20 }, // Ticket Type
      { wch: 15 }, // Check-in Status
      { wch: 15 }, // Role
      { wch: 15 }  // Joined Date
    ];
    worksheet['!cols'] = colWidths;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendees');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }
};

// Export tickets data - Fixed Excel functionality
export const exportTicketsData = (tickets: TicketData[], eventName: string, format: 'csv' | 'excel') => {
  if (!tickets || tickets.length === 0) {
    throw new Error('No ticket data available to export');
  }

  const headers = ['ticket_number', 'ticket_type_name', 'price', 'attendee_name', 'attendee_email', 'check_in_status', 'checked_in_at', 'purchase_date'];
  const headerLabels = ['Ticket Number', 'Ticket Type', 'Price', 'Attendee Name', 'Attendee Email', 'Checked In', 'Check-in Date', 'Purchase Date'];
  
  const processedData = tickets.map(ticket => ({
    ticket_number: ticket.ticket_number,
    ticket_type_name: ticket.ticket_type_name,
    price: `₦${ticket.price.toLocaleString()}`,
    attendee_name: ticket.user_name || ticket.guest_name || 'N/A',
    attendee_email: ticket.user_email || ticket.guest_email || 'N/A',
    check_in_status: ticket.check_in_status ? 'Yes' : 'No',
    checked_in_at: ticket.checked_in_at ? new Date(ticket.checked_in_at).toLocaleDateString() : 'N/A',
    purchase_date: new Date(ticket.purchase_date).toLocaleDateString()
  }));

  const timestamp = new Date().toISOString().split('T')[0];
  const sanitizedEventName = eventName.replace(/[^a-z0-9]/gi, '_');
  const filename = `${sanitizedEventName}_tickets_${timestamp}`;

  if (format === 'csv') {
    const csvContent = convertToCSV(processedData, headers);
    downloadFile(csvContent, `${filename}.csv`, 'csv');
  } else {
    // Fixed Excel export
    const worksheetData = processedData.map(item => ({
      'Ticket Number': item.ticket_number,
      'Ticket Type': item.ticket_type_name,
      'Price': item.price,
      'Attendee Name': item.attendee_name,
      'Attendee Email': item.attendee_email,
      'Checked In': item.check_in_status,
      'Check-in Date': item.checked_in_at,
      'Purchase Date': item.purchase_date
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    
    // Set column widths
    const colWidths = [
      { wch: 15 }, // Ticket Number
      { wch: 20 }, // Ticket Type
      { wch: 12 }, // Price
      { wch: 20 }, // Attendee Name
      { wch: 30 }, // Attendee Email
      { wch: 12 }, // Checked In
      { wch: 15 }, // Check-in Date
      { wch: 15 }  // Purchase Date
    ];
    worksheet['!cols'] = colWidths;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }
};