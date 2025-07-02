import { IDepartment } from './IDepartment';
import { IStatus } from './IStatus';
import { IUser } from './IUser';

/**
 * Interface for overtime request
 */
export interface IOvertimeRequest {
  /**
   * The ID
   */
  ID: number;
  
  /**
   * The reference number
   */
  Title: string;
  
  /**
   * The purpose
   */
  Purpose: string;
  
  /**
   * The department ID
   */
  DeptId: number;
  
  /**
   * The department
   */
  Dept: IDepartment;
  
  /**
   * The building
   */
  Bldg: string;
  
  /**
   * The others (for purpose = Others)
   */
  Others: string;
  
  /**
   * The date from
   */
  DateFrom: Date;
  
  /**
   * The date to
   */
  DateTo: Date;
  
  /**
   * The department approver remarks
   */
  Remarks1: string;
  
  /**
   * The SSD approver remarks
   */
  Remarks2: string;
  
  /**
   * The SSD approval date
   */
  SSDDate: Date;
  
  /**
   * The department approval date
   */
  DeptApproverDate: Date;
  
  /**
   * The status ID
   */
  StatusId: number;
  
  /**
   * The status
   */
  Status: IStatus;
  
  /**
   * The approver ID
   */
  ApproverId: number;
  
  /**
   * The approver
   */
  Approver: IUser;
  
  /**
   * The files
   */
  Files: any[];
  
  /**
   * The initial files
   */
  initFiles: string[];
  
  /**
   * The original files
   */
  origFiles: any[];
  
  /**
   * The SSD approver ID
   */
  SSDApproverId: number;
  
  /**
   * The SSD approver
   */
  SSDApprover: IUser;
  
  /**
   * The request date
   */
  RequestDate: Date;
  
  /**
   * The author
   */
  Author: IUser;
  
  /**
   * The author ID
   */
  AuthorId: number;
  
  /**
   * The modified date
   */
  Modified?: Date;
  
  /**
   * Additional properties
   */
  [key: string]: any;
}

/**
 * Interface for overtime request validation errors
 */
export interface IOvertimeRequestErrors {
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
   * Title error
   */
  Title: string;
  
  /**
   * Approver ID error
   */
  ApproverId: string;
  
  /**
   * Details error
   */
  Details: string;
  
  /**
   * Remarks1 error
   */
  Remarks1: string;
  
  /**
   * Remarks2 error
   */
  Remarks2: string;
  
  /**
   * Additional properties
   */
  [key: string]: string;
}
