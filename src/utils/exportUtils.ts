import * as XLSX from "xlsx";

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

// Helper function to convert data to CSV format
const convertToCSV = (data: any[], headers: string[]): string => {
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(","));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) {
        return "";
      }
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const stringValue = String(value);
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(","));
  }
  
  return csvRows.join("\n");
};

// Helper function to download files
const downloadFile = (
  content: string | Blob,
  filename: string,
  type: "csv" | "excel"
) => {
  const blob = content instanceof Blob 
    ? content 
    : new Blob([content], { 
        type: type === "csv" ? "text/csv;charset=utf-8;" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
  
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export data to CSV
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    throw new Error("No data available to export");
  }

  const headers = Object.keys(data[0]);
  const csvContent = convertToCSV(data, headers);

  const timestamp = new Date().toISOString().split("T")[0];
  const sanitizedFilename = filename.replace(/[^a-z0-9]/gi, "_");

  downloadFile(csvContent, `${sanitizedFilename}_${timestamp}.csv`, "csv");
};

// Export data to Excel
export const exportToExcel = (
  data: any[], 
  headerLabels: Record<string, string>, 
  headers: string[], 
  filename: string, 
  sheetName: string = "Sheet1"
) => {
  if (!data || data.length === 0) {
    throw new Error("No data available to export");
  }

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  
  // Create header row with labels
  const headerRow = headers.map(header => headerLabels[header] || header);
  
  // Convert data to worksheet format
  const worksheetData = [headerRow, ...data.map(row => 
    headers.map(header => row[header] ?? "")
  )];
  
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  
  const timestamp = new Date().toISOString().split("T")[0];
  const sanitizedFilename = filename.replace(/[^a-z0-9]/gi, "_");
  
  downloadFile(blob, `${sanitizedFilename}_${timestamp}.xlsx`, "excel");
};

// Export attendees data - Enhanced with phone, ticket type, and check-in status
export const exportAttendeesData = (
  attendees: AttendeeData[],
  eventName: string,
  format: "csv" | "excel"
) => {
  if (!attendees || attendees.length === 0) {
    throw new Error("No attendee data available to export");
  }

  const headers = ["name", "email", "phone", "role", "ticket_type", "check_in_status", "joined_at"];
  const headerLabels = {
    name: "Name",
    email: "Email",
    phone: "Phone",
    role: "Role",
    ticket_type: "Ticket Type",
    check_in_status: "Check-in Status",
    joined_at: "Joined At"
  };

  const processedData = attendees.map(attendee => ({
    name: attendee.name || "N/A",
    email: attendee.email || "N/A",
    phone: attendee.phone || "N/A",
    role: attendee.role || "N/A",
    ticket_type: attendee.ticket_type || "N/A",
    check_in_status: attendee.check_in_status || "Not Checked In",
    joined_at: new Date(attendee.joined_at).toLocaleDateString()
  }));

  const timestamp = new Date().toISOString().split("T")[0];
  const sanitizedEventName = eventName.replace(/[^a-z0-9]/gi, "_");
  const filename = `${sanitizedEventName}_attendees_${timestamp}`;

  if (format === "csv") {
    const csvContent = convertToCSV(processedData, headers);
    downloadFile(csvContent, `${filename}.csv`, "csv");
  } else {
    exportToExcel(processedData, headerLabels, headers, filename, "Attendees");
  }
};

// Export tickets data with custom form fields
export const exportTicketsData = async (
  tickets: any[],
  eventName: string,
  format: "csv" | "excel"
) => {
  if (!tickets || tickets.length === 0) {
    throw new Error("No ticket data available to export");
  }

  // Collect all unique custom form fields
  const customFields = new Set<string>();
  tickets.forEach(ticket => {
    if (ticket.ticket_form_responses) {
      ticket.ticket_form_responses.forEach((response: any) => {
        if (response.ticket_form_fields?.label) {
          customFields.add(response.ticket_form_fields.label);
        }
      });
    }
  });

  const baseHeaders = [
    "ticket_number", "ticket_type_name", "price", "user_name", "user_email", 
    "guest_name", "guest_email", "check_in_status", "checked_in_at", "purchase_date"
  ];
  const customFieldHeaders = Array.from(customFields);
  const headers = [...baseHeaders, ...customFieldHeaders];

  const headerLabels: Record<string, string> = {
    ticket_number: "Ticket Number",
    ticket_type_name: "Ticket Type",
    price: "Price",
    user_name: "User Name",
    user_email: "User Email",
    guest_name: "Guest Name",
    guest_email: "Guest Email",
    check_in_status: "Check-in Status",
    checked_in_at: "Checked In At",
    purchase_date: "Purchase Date"
  };

  // Add custom field labels
  customFieldHeaders.forEach(field => {
    headerLabels[field] = field;
  });

  const processedData = tickets.map(ticket => {
    // Process custom form data
    const customData: Record<string, any> = {};
    if (ticket.ticket_form_responses) {
      ticket.ticket_form_responses.forEach((response: any) => {
        const fieldLabel = response.ticket_form_fields?.label;
        if (fieldLabel) {
          let value = response.response_value;
          if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value);
          }
          customData[fieldLabel] = value || "N/A";
        }
      });
    }

    // Fill missing custom fields with "N/A"
    customFieldHeaders.forEach(field => {
      if (!(field in customData)) {
        customData[field] = "N/A";
      }
    });

    return {
      ticket_number: ticket.ticket_number || "N/A",
      ticket_type_name: ticket.ticket_types?.name || "N/A",
      price: ticket.ticket_types?.price || 0,
      user_name: ticket.profiles?.name || "N/A",
      user_email: ticket.profiles?.email || "N/A",
      guest_name: ticket.guest_name || "N/A",
      guest_email: ticket.guest_email || "N/A",
      check_in_status: ticket.checked_in ? "Checked In" : "Not Checked In",
      checked_in_at: ticket.checked_in_at ? new Date(ticket.checked_in_at).toLocaleString() : "N/A",
      purchase_date: new Date(ticket.created_at).toLocaleDateString(),
      ...customData,
    };
  });

  const timestamp = new Date().toISOString().split("T")[0];
  const sanitizedEventName = eventName.replace(/[^a-z0-9]/gi, "_");
  const filename = `${sanitizedEventName}_tickets_${timestamp}`;

  if (format === "csv") {
    const csvContent = convertToCSV(processedData, headers);
    downloadFile(csvContent, `${filename}.csv`, "csv");
  } else {
    exportToExcel(processedData, headerLabels, headers, filename, "Tickets");
  }
};
