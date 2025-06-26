/**
 * Error details interface
 */
export interface IErrorDetails {
  TimeFrom: string;
  TimeTo: string;
  OtherSource: string;
  EmpNo: string;
  Etype: string;
  Title: string;
}

/**
 * Employee details interface
 */
export interface IEmployeeDetails {
  ID: number | null;
  Title: string;
  ParentId?: number | null;
  TimeFrom: Date;
  TimeTo: Date;
  OtherSource?: string;
  EmpNo: string;
  Etype: string;
  Files?: File[];
  initFiles?: string[];
  origFiles?: any[];
  RefNo?: string;
  RequestDate?: Date;
  DeptId?: number;
  StatusId?: number;
}

/**
 * User roles interface
 */
export interface IUserRoles {
  isEncoder: boolean;
  isReceptionist: boolean;
  isApproverUser: boolean;
  isSSDUser: boolean;
  isWalkinApproverUser: boolean;
}

/**
 * Employee details dialog state interface
 */
export interface IEmployeeDetailsDialogState {
  open: boolean;
  mode: 'add' | 'edit';
  currentIndex: number;
  employeeDetails: IEmployeeDetails;
}

/**
 * Employee types
 */
export const EMPLOYEE_TYPES = [
  { value: 'BSP', label: 'BSP' },
  { value: 'Others', label: 'Others' }
];
