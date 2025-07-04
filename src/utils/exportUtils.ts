import * as XLSX from 'xlsx';

interface AttendeeData {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
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

// Download file
export const downloadFile = (content: string, filename: string, type: 'csv' | 'excel') => {
  if (type === 'csv') {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Export attendees data
export const exportAttendeesData = (attendees: AttendeeData[], eventName: string, format: 'csv' | 'excel') => {
  const headers = ['name', 'email', 'role', 'joined_at'];
  const headerLabels = ['Name', 'Email', 'Role', 'Joined Date'];
  
  const processedData = attendees.map(attendee => ({
    name: attendee.name || 'N/A',
    email: attendee.email || 'N/A',
    role: attendee.role || 'attendee',
    joined_at: new Date(attendee.joined_at).toLocaleDateString()
  }));

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${eventName.replace(/[^a-z0-9]/gi, '_')}_attendees_${timestamp}`;

  if (format === 'csv') {
    const csvContent = convertToCSV(processedData, headers);
    downloadFile(csvContent, `${filename}.csv`, 'csv');
  } else {
    // Excel export
    const worksheet = XLSX.utils.json_to_sheet(processedData, { header: headers });
    
    // Set column headers
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].v = headerLabels[col];
      }
    }
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendees');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }
};

// Export tickets data
export const exportTicketsData = (tickets: TicketData[], eventName: string, format: 'csv' | 'excel') => {
  const headers = ['ticket_number', 'ticket_type_name', 'price', 'attendee_name', 'attendee_email', 'check_in_status', 'checked_in_at', 'purchase_date'];
  const headerLabels = ['Ticket Number', 'Ticket Type', 'Price', 'Attendee Name', 'Attendee Email', 'Checked In', 'Check-in Date', 'Purchase Date'];
  
  const processedData = tickets.map(ticket => ({
    ticket_number: ticket.ticket_number,
    ticket_type_name: ticket.ticket_type_name,
    price: `$${ticket.price.toFixed(2)}`,
    attendee_name: ticket.user_name || ticket.guest_name || 'N/A',
    attendee_email: ticket.user_email || ticket.guest_email || 'N/A',
    check_in_status: ticket.check_in_status ? 'Yes' : 'No',
    checked_in_at: ticket.checked_in_at ? new Date(ticket.checked_in_at).toLocaleDateString() : 'N/A',
    purchase_date: new Date(ticket.purchase_date).toLocaleDateString()
  }));

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${eventName.replace(/[^a-z0-9]/gi, '_')}_tickets_${timestamp}`;

  if (format === 'csv') {
    const csvContent = convertToCSV(processedData, headers);
    downloadFile(csvContent, `${filename}.csv`, 'csv');
  } else {
    // Excel export
    const worksheet = XLSX.utils.json_to_sheet(processedData, { header: headers });
    
    // Set column headers
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].v = headerLabels[col];
      }
    }
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }
};