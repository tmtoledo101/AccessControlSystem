/**
 * Validate date range
 * @param fromDate From date
 * @param toDate To date
 * @returns True if valid, false otherwise
 */
export function validateDateRange(fromDate: Date, toDate: Date): boolean {
  if (!fromDate || !toDate) {
    return false;
  }
  
  return fromDate <= toDate;
}

/**
 * Validate required field
 * @param value Field value
 * @returns True if valid, false otherwise
 */
export function validateRequiredField(value: string): boolean {
  return value !== null && value !== undefined && value.trim() !== '';
}

/**
 * Validate search text
 * @param searchText Search text
 * @returns True if valid, false otherwise
 */
export function validateSearchText(searchText: string): boolean {
  return searchText !== null && searchText !== undefined && searchText.trim().length >= 3;
}

/**
 * Get error message for date range
 * @param fromDate From date
 * @param toDate To date
 * @returns Error message or empty string
 */
export function getDateRangeErrorMessage(fromDate: Date, toDate: Date): string {
  if (!fromDate || !toDate) {
    return 'Please select both from and to dates';
  }
  
  if (fromDate > toDate) {
    return 'From date must be before or equal to to date';
  }
  
  return '';
}

/**
 * Get error message for required field
 * @param value Field value
 * @param fieldName Field name
 * @returns Error message or empty string
 */
export function getRequiredFieldErrorMessage(value: string, fieldName: string): string {
  if (!validateRequiredField(value)) {
    return `${fieldName} is required`;
  }
  
  return '';
}

/**
 * Get error message for search text
 * @param searchText Search text
 * @returns Error message or empty string
 */
export function getSearchTextErrorMessage(searchText: string): string {
  if (!validateSearchText(searchText)) {
    return 'Search text must be at least 3 characters';
  }
  
  return '';
}
