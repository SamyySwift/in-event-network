
import { format, parseISO, addMinutes, isValid } from 'date-fns';

/**
 * Parse time allocation strings like "30min", "1hr", "2h", "90 minutes", "1hour 20min" into minutes
 */
export const parseTimeAllocation = (allocation: string): number => {
  if (!allocation) return 0;
  
  const cleaned = allocation.toLowerCase().trim();
  let totalMinutes = 0;
  
  // Extract hours component (matches: 1hr, 2hour, 3hours, 1h)
  const hourMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(?:hr|hour|hours|h)(?:\s|$)/);
  if (hourMatch) {
    totalMinutes += Math.round(parseFloat(hourMatch[1]) * 60);
  }
  
  // Extract minutes component (matches: 30min, 45minute, 20minutes, 15m)
  const minuteMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(?:min|minute|minutes|m)(?:\s|$)/);
  if (minuteMatch) {
    totalMinutes += Math.round(parseFloat(minuteMatch[1]));
  }
  
  // If no components found, try decimal hours format (like "1.5 hours")
  if (totalMinutes === 0) {
    const decimalHourMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*(?:hr|hour|hours|h)$/);
    if (decimalHourMatch) {
      totalMinutes = Math.round(parseFloat(decimalHourMatch[1]) * 60);
    }
  }
  
  return totalMinutes;
};

/**
 * Format time consistently - handles both ISO strings and time-only strings
 */
export const formatDisplayTime = (timeStr: string | null | undefined): string => {
  if (!timeStr) return '';
  
  try {
    // If it's a full ISO string, parse it directly
    if (timeStr.includes('T') || timeStr.includes('Z')) {
      return format(parseISO(timeStr), 'h:mm a');
    }
    
    // If it's just time (HH:MM format), create a date object for today with that time
    if (timeStr.match(/^\d{2}:\d{2}$/)) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const today = new Date();
      today.setHours(hours, minutes, 0, 0);
      return format(today, 'h:mm a');
    }
    
    // Try to parse as ISO and format
    const parsed = parseISO(timeStr);
    if (isValid(parsed)) {
      return format(parsed, 'h:mm a');
    }
    
    return timeStr; // Return as-is if we can't parse it
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeStr || '';
  }
};

/**
 * Format date consistently
 */
export const formatDisplayDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  
  try {
    // Handle different date formats
    let date: Date;
    
    if (dateStr.includes('T') || dateStr.includes('Z')) {
      date = parseISO(dateStr);
    } else {
      // Assume it's a date string like "2024-01-01"
      date = new Date(dateStr + 'T00:00:00');
    }
    
    if (isValid(date)) {
      return format(date, 'MMM d, yyyy');
    }
    
    return dateStr;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr || '';
  }
};

/**
 * Calculate end time based on start time and duration
 */
export const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  if (!startTime || !durationMinutes) return '';
  
  try {
    let startDate: Date;
    
    // Handle different start time formats
    if (startTime.includes('T') || startTime.includes('Z')) {
      startDate = parseISO(startTime);
    } else if (startTime.match(/^\d{2}:\d{2}$/)) {
      // Time only format - use today's date
      const [hours, minutes] = startTime.split(':').map(Number);
      startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
    } else {
      return '';
    }
    
    if (!isValid(startDate)) return '';
    
    const endDate = addMinutes(startDate, durationMinutes);
    
    // Return in the same format as the input
    if (startTime.match(/^\d{2}:\d{2}$/)) {
      return format(endDate, 'HH:mm');
    } else {
      return endDate.toISOString();
    }
  } catch (error) {
    console.error('Error calculating end time:', error);
    return '';
  }
};

/**
 * Format duration in a human-readable way
 */
export const formatDuration = (minutes: number): string => {
  if (!minutes || minutes === 0) return '';
  
  if (minutes < 60) {
    return `${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}hr`;
  }
  
  return `${hours}hr ${remainingMinutes}min`;
};
