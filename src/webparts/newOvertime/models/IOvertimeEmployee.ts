/**
 * Employee mode enum
 */
export enum EmployeeMode {
  /**
   * Add mode
   */
  Add = 'add',
  
  /**
   * Edit mode
   */
  Edit = 'edit'
}

/**
 * Overtime employee interface
 */
export interface IOvertimeEmployee {
  /**
   * Title
   */
  Title: string;
  
  /**
   * Time from
   */
  TimeFrom: Date;
  
  /**
   * Time to
   */
  TimeTo: Date;
  
  /**
   * Other source
   */
  OtherSource?: string;
  
  /**
   * Employee number
   */
  EmpNo: string;
  
  /**
   * Employee type
   */
  Etype: string;
  
  /**
   * Parent ID
   */
  ParentId?: number;
}

/**
 * Overtime employee errors interface
 */
export interface IOvertimeEmployeeErrors {
  /**
   * Title error
   */
  Title: string;
  
  /**
   * Time from error
   */
  TimeFrom: string;
  
  /**
   * Time to error
   */
  TimeTo: string;
  
  /**
   * Other source error
   */
  OtherSource: string;
  
  /**
   * Employee number error
   */
  EmpNo: string;
  
  /**
   * Employee type error
   */
  Etype: string;
  
  /**
   * Parent ID error
   */
  ParentId: string;
}

/**
 * Default overtime employee
 * @param dateFrom Date from
 * @param dateTo Date to
 * @returns Default overtime employee
 */
export const createDefaultOvertimeEmployee = (dateFrom: Date, dateTo: Date): IOvertimeEmployee => ({
  Title: '',
  TimeFrom: dateFrom,
  TimeTo: dateTo,
  OtherSource: '',
  EmpNo: '',
  Etype: 'BSP',
  ParentId: null
});

/**
 * Default overtime employee errors
 */
export const defaultOvertimeEmployeeErrors: IOvertimeEmployeeErrors = {
  Title: '',
  TimeFrom: '',
  TimeTo: '',
  OtherSource: '',
  EmpNo: '',
  Etype: '',
  ParentId: ''
};
