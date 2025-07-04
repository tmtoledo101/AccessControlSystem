import { IOvertimeForm, IOvertimeFormErrors } from '../models/IOvertimeForm';
import { IOvertimeEmployee, IOvertimeEmployeeErrors } from '../models/IOvertimeEmployee';
import { isDateAfter } from './dateUtils';

/**
 * Validate form
 * @param form Form
 * @param submitMode Whether in submit mode
 * @param employeeCount Employee count
 * @returns Form errors
 */
export const validateForm = (
  form: IOvertimeForm,
  submitMode: boolean,
  employeeCount: number
): IOvertimeFormErrors => {
  const errors: IOvertimeFormErrors = {
    Purpose: '',
    DeptId: '',
    Bldg: '',
    Others: '',
    DateFrom: '',
    DateTo: '',
    ApproverId: '',
    Details: ''
  };

  // Required fields
  if (!form.Purpose) {
    errors.Purpose = 'This is a required input field';
  }

  if (!form.DeptId) {
    errors.DeptId = 'This is a required input field';
  }

  if (!form.Bldg) {
    errors.Bldg = 'This is a required input field';
  }

  if (form.Purpose === 'Others' && !form.Others) {
    errors.Others = 'This is a required input field';
  }

  // Date validation
  if (isDateAfter(form.DateFrom, form.DateTo)) {
    errors.DateFrom = 'From Date should be earlier than To Date';
    errors.DateTo = 'From Date should be earlier than To Date';
  }

  // Approver validation
  if (submitMode && !form.ApproverId) {
    errors.ApproverId = 'This is a required input field';
  }

  // Employee details validation
  if (employeeCount === 0) {
    errors.Details = 'Employee Details are required. Please add employees by clicking the (+) button.';
  }

  return errors;
};

/**
 * Validate employee
 * @param employee Employee
 * @returns Employee errors
 */
export const validateEmployee = (employee: IOvertimeEmployee): IOvertimeEmployeeErrors => {
  const errors: IOvertimeEmployeeErrors = {
    Title: '',
    TimeFrom: '',
    TimeTo: '',
    OtherSource: '',
    EmpNo: '',
    Etype: '',
    ParentId: ''
  };

  // Required fields
  if (!employee.EmpNo) {
    errors.EmpNo = 'This is a required input field';
  }

  if (employee.Etype === 'Others' && !employee.OtherSource) {
    errors.OtherSource = 'This is a required input field';
  }

  // Time validation
  if (isDateAfter(employee.TimeFrom, employee.TimeTo)) {
    errors.TimeFrom = 'From Time should be earlier than To Time';
    errors.TimeTo = 'From Time should be earlier than To Time';
  }

  return errors;
};

/**
 * Check if form has errors
 * @param errors Form errors
 * @returns Whether form has errors
 */
export const hasFormErrors = (errors: IOvertimeFormErrors): boolean => {
  return Object.values(errors).some(error => error !== '');
};

/**
 * Check if employee has errors
 * @param errors Employee errors
 * @returns Whether employee has errors
 */
export const hasEmployeeErrors = (errors: IOvertimeEmployeeErrors): boolean => {
  return Object.values(errors).some(error => error !== '');
};
