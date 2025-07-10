import moment from 'moment';

/**
 * Format date to ISO string
 * @param date Date
 * @returns ISO string
 */
export const formatISODate = (date: Date): string => {
  return moment(date).toISOString();
};

/**
 * Format date to string
 * @param date Date
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  return moment(date).format('MM/DD/YYYY');
};

/**
 * Format date and time to string
 * @param date Date
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date): string => {
  return moment(date).format('MM/DD/YYYY HH:mm');
};

/**
 * Compare dates
 * @param date1 Date 1
 * @param date2 Date 2
 * @returns Whether date1 is after date2
 */
export const isDateAfter = (date1: Date, date2: Date): boolean => {
  return moment(date1).isAfter(moment(date2));
};

/**
 * Compare dates
 * @param date1 Date 1
 * @param date2 Date 2
 * @returns Whether date1 is before date2
 */
export const isDateBefore = (date1: Date, date2: Date): boolean => {
  return moment(date1).isBefore(moment(date2));
};

/**
 * Get start of day
 * @param date Date
 * @returns Start of day
 */
export const startOfDay = (date: Date): Date => {
  return moment(date).startOf('day').toDate();
};

/**
 * Get end of day
 * @param date Date
 * @returns End of day
 */
export const endOfDay = (date: Date): Date => {
  return moment(date).endOf('day').toDate();
};
