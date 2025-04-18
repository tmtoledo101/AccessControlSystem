import { IVisitorDetails } from "./IVisitorDetails";

export interface IVisitor {
    ID: number;
    RefNo?: string;
    Title: string;
    ExternalType: string;
    Purpose: string;
    PurposeOthers: string;
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
    StatusId: number;
    Status: { Title: string };
    ApproverId: number;
    Approver: { Title: string; EMail: string; ID: number };
    Files: File[];
    initFiles: string[];
    origFiles: any[];
    SSDApproverId: number;
    SSDApprover: { Title: string };
    RequestDate: Date;
    Author: { Title: string; EMail: string };
    AuthorId: number;
    Remarks1: string;
    Remarks2: string;
    SSDDate: Date;
    DeptApproverDate: Date;
    MarkCompleteDate: Date;
    Receptionist: { Title: string };
    ReceptionistId: number;
    colorAccess: string;
    Modified: Date;
}

export interface IApproverDetails {
    email: string;
    name: string;
}

export interface IErrorFields {
    ExternalType: string;
    Purpose: string;
    DeptId: string;
    Bldg: string;
    RoomNo: string;
    EmpNo: string;
    ContactName: string; // Added for contact person text input error handling
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
