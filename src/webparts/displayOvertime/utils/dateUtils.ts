import moment from 'moment';

/**
 * Converts a date to ISO string
 * @param date The date to convert
 * @returns The ISO string
 */
export function toISOString(date: Date | moment.Moment | string): string {
  if (!date) {
    return null;
  }
  
  return moment(date).toISOString();
}

/**
 * Checks if a date is after another date
 * @param date1 The first date
 * @param date2 The second date
 * @returns True if date1 is after date2
 */
export function isAfter(date1: Date | moment.Moment | string, date2: Date | moment.Moment | string): boolean {
  if (!date1 || !date2) {
    return false;
  }
  
  return moment(date1).isAfter(moment(date2));
}

/**
 * Formats a date
 * @param date The date to format
 * @param format The format string
 * @returns The formatted date
 */
export function formatDate(date: Date | moment.Moment | string, format: string = 'MM/DD/YYYY'): string {
  if (!date) {
    return '';
  }
  
  return moment(date).format(format);
}

/**
 * Formats a time
 * @param date The date to format
 * @param format The format string
 * @returns The formatted time
 */
export function formatTime(date: Date | moment.Moment | string, format: string = 'HH:mm'): string {
  if (!date) {
    return '';
  }
  
  return moment(date).format(format);
}

/**
 * Formats a date and time
 * @param date The date to format
 * @param format The format string
 * @returns The formatted date and time
 */
export function formatDateTime(date: Date | moment.Moment | string, format: string = 'MM/DD/YYYY HH:mm'): string {
  if (!date) {
    return '';
  }
  
  return moment(date).format(format);
}

/**
 * Gets the start of a day
 * @param date The date
 * @returns The start of the day
 */
export function startOfDay(date: Date | moment.Moment | string = new Date()): Date {
  return new Date(moment(date).startOf('day').toISOString());
}

/**
 * Gets the end of a day
 * @param date The date
 * @returns The end of the day
 */
export function endOfDay(date: Date | moment.Moment | string = new Date()): Date {
  return new Date(moment(date).endOf('day').toISOString());
}
