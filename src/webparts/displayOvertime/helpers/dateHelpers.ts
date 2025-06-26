import moment from 'moment';

/**
 * Converts date to ISO string
 * @param date Date
 * @returns ISO string
 */
export function toISOString(date: Date | string | moment.Moment): string {
  return moment(date).toISOString();
}

/**
 * Formats date
 * @param date Date
 * @param format Format
 * @returns Formatted date
 */
export function formatDate(date: Date | string | moment.Moment, format: string = 'MM/DD/YYYY'): string {
  return moment(date).format(format);
}

/**
 * Formats date time
 * @param date Date
 * @param format Format
 * @returns Formatted date time
 */
export function formatDateTime(date: Date | string | moment.Moment, format: string = 'MM/DD/YYYY HH:mm'): string {
  return moment(date).format(format);
}

/**
 * Formats time
 * @param date Date
 * @param format Format
 * @returns Formatted time
 */
export function formatTime(date: Date | string | moment.Moment, format: string = 'HH:mm'): string {
  return moment(date).format(format);
}

/**
 * Gets start of day
 * @param date Date
 * @returns Start of day
 */
export function startOfDay(date: Date | string | moment.Moment): moment.Moment {
  return moment(date).startOf('day');
}

/**
 * Gets end of day
 * @param date Date
 * @returns End of day
 */
export function endOfDay(date: Date | string | moment.Moment): moment.Moment {
  return moment(date).endOf('day');
}

/**
 * Checks if date is valid
 * @param date Date
 * @returns Is valid
 */
export function isValidDate(date: Date | string | moment.Moment): boolean {
  return moment(date).isValid();
}

/**
 * Checks if date is before another date
 * @param date1 Date 1
 * @param date2 Date 2
 * @returns Is before
 */
export function isBefore(date1: Date | string | moment.Moment, date2: Date | string | moment.Moment): boolean {
  return moment(date1).isBefore(date2);
}

/**
 * Checks if date is after another date
 * @param date1 Date 1
 * @param date2 Date 2
 * @returns Is after
 */
export function isAfter(date1: Date | string | moment.Moment, date2: Date | string | moment.Moment): boolean {
  return moment(date1).isAfter(date2);
}

/**
 * Gets current date
 * @returns Current date
 */
export function getCurrentDate(): moment.Moment {
  return moment();
}

/**
 * Gets date difference in days
 * @param date1 Date 1
 * @param date2 Date 2
 * @returns Difference in days
 */
export function getDaysDifference(date1: Date | string | moment.Moment, date2: Date | string | moment.Moment): number {
  return moment(date1).diff(moment(date2), 'days');
}
