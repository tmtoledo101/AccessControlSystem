import moment from 'moment';

/**
 * Formats a date time value
 * @param date Date to format
 * @param format Format string (default: MM/DD/yyyy HH:mm)
 * @returns Formatted date string
 */
export function formatDateTime(date: Date, format: string = 'MM/DD/yyyy HH:mm'): string {
  if (!date) {
    return '';
  }
  
  return moment(date).format(format);
}

/**
 * Formats a date value
 * @param date Date to format
 * @param format Format string (default: MM/DD/yyyy)
 * @returns Formatted date string
 */
export function formatDate(date: Date, format: string = 'MM/DD/yyyy'): string {
  if (!date) {
    return '';
  }
  
  return moment(date).format(format);
}

/**
 * Converts a date to ISO string format
 * @param date Date to convert
 * @returns ISO string
 */
export function toISOString(date: Date): string {
  if (!date) {
    return '';
  }
  
  return moment(date).toISOString();
}

/**
 * Creates a request number
 * @param locationCode Location code
 * @returns Request number
 */
export async function createRequestNo(locationCode: string): Promise<string> {
  // This is a placeholder for the actual implementation
  // In a real implementation, this would interact with SharePoint
  const currentDate = moment().format('YYYYMMDD');
  const lastRefNo = 1; // This would be retrieved from SharePoint
  
  const paddedNumber = String(lastRefNo).padStart(3, '0');
  return `${locationCode}-${currentDate}-${paddedNumber}`;
}
