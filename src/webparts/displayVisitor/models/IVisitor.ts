/**
 * Visitor interface
 */
export interface IVisitor {
  ID: number;
  Title: string;
  ExternalType: string;
  Purpose: string;
  DeptId: number;
  Dept: { Title: string };
  Bldg: string;
  RoomNo: string;
  EmpNo: string;
  ContactName: string;
  Position: string;
  DirectNo: string;
  LocalNo: string;
  DateTimeVisit: Date;
  DateTimeArrival: Date;
  CompanyName: string;
  Address: string;
  VisContactNo: string;
  VisLocalNo: string;
  RequireParking: boolean;
  Remarks1: string;
  Remarks2: string;
  StatusId: number;
  Status: { Title: string };
  ApproverId: number;
  Approver: { Title: string; EMail: string; ID: number };
  Files: any[];
  initFiles: any[];
  origFiles: any[];
  SSDApproverId: number;
  SSDApprover: { Title: string };
  RequestDate: Date;
  Author: { Title: string; EMail: string };
  AuthorId: number;
  colorAccess: string;
  SSDDate: Date;
  DeptApproverDate: Date;
  MarkCompleteDate: Date;
  Receptionist: { Title: string };
  ReceptionistId: number;
  PurposeOthers: string;
}

/**
 * Form error interface
 */
export interface IFormError {
  ExternalType: string;
  Purpose: string;
  DeptId: string;
  Bldg: string;
  RoomNo: string;
  EmpNo: string;
  Title: string;
  Position: string;
  DirectNo: string;
  LocalNo: string;
  DateTimeVisit: string;
  DateTimeArrival: string;
  CompanyName: string;
  Address: string;
  VisContactNo: string;
  VisLocalNo: string;
  RequireParking: string;
  ApproverId: string;
  Details: string;
  Remarks1: string;
  Remarks2: string;
  PurposeOthers: string;
}

/**
 * Approver details interface
 */
export interface IApproverDetails {
  email: string;
  name: string;
}
