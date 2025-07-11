import { IOvertimeRequest, IOvertimeRequestErrors } from '../models/IOvertimeRequest';
import { IEmployeeDetails, IEmployeeDetailsErrors } from '../models/IEmployeeDetails';
import { isAfter } from './dateUtils';
import { STATUS } from '../constants/status';
import moment from 'moment';

/**
 * Validates an overtime request
 * @param data The request data
 * @param action The action being performed
 * @param detailsList The employee details list
 * @returns The validation result
 */
export function validateOvertimeRequest(
  data: IOvertimeRequest,
  action: string,
  detailsList: IEmployeeDetails[]
): { isValid: boolean; errors: IOvertimeRequestErrors } {
  const errors: IOvertimeRequestErrors = {
    Purpose: '',
    DeptId: '',
    Bldg: '',
    Others: '',
    DateFrom: '',
    DateTo: '',
    Title: '',
    ApproverId: '',
    Details: '',
    Remarks1: '',
    Remarks2: ''
  };
  
  let requiredFields: string[] = [];
  
  // Determine required fields based on user role and action
  if (data.StatusId === STATUS.DRAFT || data.StatusId === STATUS.PENDING_DEPT_APPROVAL) {
    requiredFields = ['Purpose', 'DeptId', 'Bldg', 'DateFrom', 'DateTo'];
    
    if (data.Purpose === 'Others') {
      requiredFields.push('Others');
    }
    
    if (action === 'submit') {
      requiredFields.push('ApproverId');
    }
  } else if (data.StatusId === STATUS.PENDING_DEPT_APPROVAL && action === 'deny') {
    requiredFields = ['Remarks1'];
  } else if (data.StatusId === STATUS.PENDING_SSD_APPROVAL && action === 'deny') {
    requiredFields = ['Remarks2'];
  }
  
  // Validate required fields
  for (const field of requiredFields) {
    if (!data[field]) {
      errors[field] = 'This is a required input field';
    }
  }
  
  // Validate date range
  if (data.DateFrom && data.DateTo) {
    if (isAfter(data.DateFrom, data.DateTo)) {
      errors.DateFrom = 'From Date should be earlier than To Date';
    }
  }
  
  // Validate employee details
  if (detailsList.length === 0) {
    errors.Details = 'Employee Details are required. Please add employee names by clicking the (+) button.';
  }
  
  // Check if there are any errors
  const isValid = !Object.values(errors).some(error => error !== '');
  
  return { isValid, errors };
}

/**
 * Validates a single overtime request field
 * @param name The field name
 * @param value The field value
 * @param data The request data
 * @returns The error message
 */
export function validateOvertimeField(name: string, value: any, data: IOvertimeRequest): string {
  let error = '';
  
  if (value === null || value === undefined || value === '') {
    error = 'This is a required input field';
  } else {
    if (name === 'DateFrom') {
      if (data.DateTo && isAfter(value, data.DateTo)) {
        error = 'From Date should be earlier than To Date';
      }
    } else if (name === 'DateTo') {
      if (data.DateFrom && isAfter(data.DateFrom, value)) {
        error = 'From Date should be earlier than To Date';
      }
    }
  }
  
  return error;
}

/**
 * Validates a single employee details field
 * @param name The field name
 * @param value The field value
 * @param data The employee details
 * @returns The error message
 */
export function validateEmployeeDetailsField(name: string, value: any, data: IEmployeeDetails): string {
  let error = '';
  
  if (value === null || value === undefined || value === '') {
    error = 'This is a required input field';
  } else {
    if (name === 'TimeFrom') {
      if (data.TimeTo && isAfter(value, data.TimeTo)) {
        error = 'From Time should be earlier than To Time';
      }
    } else if (name === 'TimeTo') {
      if (data.TimeFrom && isAfter(data.TimeFrom, value)) {
        error = 'From Time should be earlier than To Time';
      }
    }
  }
  
  return error;
}

/**
 * Validates employee details
 * @param data The employee details
 * @returns The validation result
 */
export function validateEmployeeDetails(
  data: IEmployeeDetails
): { isValid: boolean; errors: IEmployeeDetailsErrors } {
  const errors: IEmployeeDetailsErrors = {
    TimeFrom: '',
    TimeTo: '',
    OtherSource: '',
    EmpNo: '',
    Etype: '',
    Title: ''
  };
  
  let requiredFields = ['EmpNo'];
  
  if (data.Etype === 'Others') {
    requiredFields.push('OtherSource');
  }
  
  // Validate required fields
  for (const field of requiredFields) {
    if (!data[field]) {
      errors[field] = 'This is a required input field';
    }
  }
  
  // Validate time range
  if (data.TimeFrom && data.TimeTo) {
    if (isAfter(data.TimeFrom, data.TimeTo)) {
      errors.TimeFrom = 'From Time should be earlier than To Time';
    }
  }
  
  // Check if there are any errors
  const isValid = !Object.values(errors).some(error => error !== '');
  
  return { isValid, errors };
}
