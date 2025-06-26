/**
 * Error fields interface
 */
export interface IErrorFields {
  Purpose: string;
  DeptId: string;
  Bldg: string;
  Others: string;
  DateFrom: string;
  DateTo: string;
  Title: string;
  ApproverId: string;
  Details: string;
  Remarks1: string;
  Remarks2: string;
}

/**
 * Overtime request interface
 */
export interface IOvertimeRequest {
  ID: number;
  Title: string;
  Purpose: string;
  DeptId: number;
  Dept?: {
    Title: string;
  };
  Bldg: string;
  Others?: string;
  DateFrom: Date;
  DateTo: Date;
  Remarks1?: string;
  Remarks2?: string;
  SSDDate?: Date;
  DeptApproverDate?: Date;
  StatusId: number;
  Status?: {
    Title: string;
  };
  ApproverId?: number;
  Approver?: {
    Title: string;
    EMail: string;
  };
  SSDApproverId?: number;
  SSDApprover?: {
    Title: string;
  };
  RequestDate: Date;
  Author?: {
    Title: string;
    EMail: string;
  };
  AuthorId?: number;
  Files?: File[];
  initFiles?: string[];
  origFiles?: any[];
  Modified?: string;
}
