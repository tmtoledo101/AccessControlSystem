import moment from 'moment';

/**
 * Formats a date to a string
 * @param date Date to format
 * @param format Format string
 * @returns Formatted date string
 */
export function formatDate(date: Date, format: string = 'MM/DD/YYYY'): string {
  return moment(date).format(format);
}

/**
 * Formats a date and time to a string
 * @param date Date to format
 * @param format Format string
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date, format: string = 'MM/DD/YYYY HH:mm'): string {
  return moment(date).format(format);
}

/**
 * Converts a date to ISO string
 * @param date Date to convert
 * @returns ISO string
 */
export function toISOString(date: Date): string {
  return moment(date).toISOString();
}

/**
 * Gets the current date
 * @returns Current date
 */
export function getCurrentDate(): Date {
  return new Date();
}

/**
 * Gets the end of day for a date
 * @param date Date
 * @returns End of day
 */
export function getEndOfDay(date: Date): Date {
  return moment(date).endOf('day').toDate();
}
