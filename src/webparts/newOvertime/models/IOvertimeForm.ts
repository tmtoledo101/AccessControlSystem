/**
 * Overtime form interface
 */
export interface IOvertimeForm {
  /**
   * Purpose
   */
  Purpose: string;
  
  /**
   * Department ID
   */
  DeptId: number;
  
  /**
   * Building
   */
  Bldg: string;
  
  /**
   * Others
   */
  Others?: string;
  
  /**
   * Date from
   */
  DateFrom: Date;
  
  /**
   * Date to
   */
  DateTo: Date;
  
  /**
   * Status
   */
  Status?: string;
  
  /**
   * Approver ID
   */
  ApproverId?: number;
  
  /**
   * Files
   */
  Files: File[];
}

/**
 * Overtime form errors interface
 */
export interface IOvertimeFormErrors {
  /**
   * Purpose error
   */
  Purpose: string;
  
  /**
   * Department ID error
   */
  DeptId: string;
  
  /**
   * Building error
   */
  Bldg: string;
  
  /**
   * Others error
   */
  Others: string;
  
  /**
   * Date from error
   */
  DateFrom: string;
  
  /**
   * Date to error
   */
  DateTo: string;
  
  /**
   * Approver ID error
   */
  ApproverId: string;
  
  /**
   * Details error
   */
  Details: string;
}

/**
 * Default overtime form
 */
export const defaultOvertimeForm: IOvertimeForm = {
  Purpose: '',
  DeptId: null,
  Bldg: '',
  Others: '',
  DateFrom: new Date(),
  DateTo: new Date(),
  Status: '',
  ApproverId: null,
  Files: []
};

/**
 * Default overtime form errors
 */
export const defaultOvertimeFormErrors: IOvertimeFormErrors = {
  Purpose: '',
  DeptId: '',
  Bldg: '',
  Others: '',
  DateFrom: '',
  DateTo: '',
  ApproverId: '',
  Details: ''
};
