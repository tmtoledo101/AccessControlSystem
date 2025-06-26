import { IOvertimeRequest, IErrorFields } from '../models/IOvertimeRequest';
import { IEmployeeDetails, IErrorDetails } from '../models/IEmployeeDetails';
import { isBefore } from '../helpers/dateHelpers';

/**
 * Validates input field
 * @param name Field name
 * @param value Field value
 * @param formState Form state
 * @param errorFields Error fields
 * @returns Updated error fields
 */
export function validateInput(
  name: string,
  value: any,
  formState: IOvertimeRequest,
  errorFields: IErrorFields
): IErrorFields {
  const updatedErrorFields = { ...errorFields };
  
  if (value === null || value === undefined || value === '') {
    updatedErrorFields[name] = 'This is a required input field';
  } else {
    if (name === 'DateFrom') {
      if (formState.DateTo && isBefore(formState.DateTo, value)) {
        updatedErrorFields[name] = 'From Date should be earlier than To Date';
      } else {
        updatedErrorFields[name] = '';
      }
    } else if (name === 'DateTo') {
      if (formState.DateFrom && isBefore(value, formState.DateFrom)) {
        updatedErrorFields[name] = 'From Date should be earlier than To Date';
      } else {
        updatedErrorFields[name] = '';
      }
    } else {
      updatedErrorFields[name] = '';
    }
  }
  
  return updatedErrorFields;
}

/**
 * Validates form on submit
 * @param formState Form state
 * @param errorFields Error fields
 * @param action Action
 * @param employeeDetailsList Employee details list
 * @returns Validation result
 */
export function validateOnSubmit(
  formState: IOvertimeRequest,
  errorFields: IErrorFields,
  action: string,
  employeeDetailsList: IEmployeeDetails[]
): { isValid: boolean; errors: IErrorFields } {
  const updatedErrorFields = { ...errorFields };
  let requiredFields: string[] = [];
  
  // Determine required fields based on user role and action
  if ((formState.StatusId === 1 || formState.StatusId === 2)) {
    requiredFields = ['Purpose', 'DeptId', 'Bldg', 'DateFrom', 'DateTo'];
    
    if (formState.Purpose === 'Others') {
      requiredFields.push('Others');
    }
    
    if (action === 'submit') {
      requiredFields.push('ApproverId');
    }
  } else if (formState.StatusId === 2 && action === 'deny') {
    requiredFields = ['Remarks1'];
  } else if (formState.StatusId === 3 && action === 'deny') {
    requiredFields = ['Remarks2'];
  }
  
  // Validate required fields
  let isValid = true;
  
  for (const field of requiredFields) {
    if (field === 'DateFrom') {
      if (formState.DateTo && isBefore(formState.DateTo, formState.DateFrom)) {
        updatedErrorFields[field] = 'From Date should be earlier than To Date';
        isValid = false;
      }
    } else if (field === 'DateTo') {
      if (formState.DateFrom && isBefore(formState.DateTo, formState.DateFrom)) {
        updatedErrorFields[field] = 'From Date should be earlier than To Date';
        isValid = false;
      }
    } else if (!formState[field]) {
      updatedErrorFields[field] = 'This is a required input field';
      isValid = false;
    }
  }
  
  // Validate employee details
  if (employeeDetailsList.length === 0) {
    updatedErrorFields.Details = 'Employee Details are required. Please add employee names by clicking the (+) button.';
    isValid = false;
  }
  
  return { isValid, errors: updatedErrorFields };
}

/**
 * Validates employee details input
 * @param name Field name
 * @param value Field value
 * @param employeeDetails Employee details
 * @param errorDetails Error details
 * @returns Updated error details
 */
export function validateEmployeeDetailsInput(
  name: string,
  value: any,
  employeeDetails: IEmployeeDetails,
  errorDetails: IErrorDetails
): IErrorDetails {
  const updatedErrorDetails = { ...errorDetails };
  
  if (value === null || value === undefined || value === '') {
    updatedErrorDetails[name] = 'This is a required input field';
  } else {
    if (name === 'TimeFrom') {
      if (employeeDetails.TimeTo && isBefore(employeeDetails.TimeTo, value)) {
        updatedErrorDetails[name] = 'From Time should be earlier than To Time';
      } else {
        updatedErrorDetails[name] = '';
      }
    } else if (name === 'TimeTo') {
      if (employeeDetails.TimeFrom && isBefore(value, employeeDetails.TimeFrom)) {
        updatedErrorDetails[name] = 'From Time should be earlier than To Time';
      } else {
        updatedErrorDetails[name] = '';
      }
    } else {
      updatedErrorDetails[name] = '';
    }
  }
  
  return updatedErrorDetails;
}

/**
 * Validates employee details on submit
 * @param employeeDetails Employee details
 * @param errorDetails Error details
 * @returns Validation result
 */
export function validateEmployeeDetailsSubmit(
  employeeDetails: IEmployeeDetails,
  errorDetails: IErrorDetails
): { isValid: boolean; errors: IErrorDetails } {
  const updatedErrorDetails = { ...errorDetails };
  let requiredFields = ['EmpNo'];
  
  if (employeeDetails.Etype === 'Others') {
    requiredFields.push('OtherSource');
  }
  
  // Validate required fields
  let isValid = true;
  
  for (const field of requiredFields) {
    if (!employeeDetails[field]) {
      updatedErrorDetails[field] = 'This is a required input field';
      isValid = false;
    }
  }
  
  // Validate time range
  if (employeeDetails.TimeFrom && employeeDetails.TimeTo && 
      isBefore(employeeDetails.TimeTo, employeeDetails.TimeFrom)) {
    updatedErrorDetails.TimeFrom = 'From Time should be earlier than To Time';
    isValid = false;
  }
  
  return { isValid, errors: updatedErrorDetails };
}
