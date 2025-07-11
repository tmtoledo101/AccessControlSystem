/**
 * Visitor interface
 */
export interface IVisitor {
  ExternalType: string;
  Purpose: string;
  PurposeOthers?: string;
  DeptId: number;
  Bldg: string;
  RoomNo: string;
  EmpNo: string;
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
  Status?: string;
  ApproverId: number;
  Files: File[];
}
