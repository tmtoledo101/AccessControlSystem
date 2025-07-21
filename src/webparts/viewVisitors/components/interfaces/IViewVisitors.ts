import * as moment from 'moment'; // Make sure moment is imported if you're using it for types here
export interface IVisitor {
  ID: number;
  Title: string;
//not sure
FirstName: string;
  RequestDate: Date;
  DeptId: number;
  Dept: {
    Title: string;
  };
  ContactName: string;
  DateTimeVisit: Date;
  DateTimeArrival: Date;
  Purpose: string;
  StatusId: number;
  Status: {
    Title: string;
  };
  RequireParking: boolean;
  CompanyName: string;
  ApproverId: number;
  Approver: {
    Title: string;
    EMail: string;
  };
  SSDApprover: {
    Title: string;
  };
  Author: {
    Title: string;
    EMail: string;
  };
  Bldg: string;
}
export interface IVisitorDetail {
  ID: number;
  Title: string;
//not sure
  FirstName: string;
  RequestDate: Date;
  DeptId: number;
  Dept: {
    Title: string;
  };
  RefNo: string;
  DateFrom: Date;
  DateTo: Date;
  CompanyName: string;
  Car: boolean;
  AccessCard: string;
  StatusId: number;
  Status: {
    Title: string;
  };
  ParentId: number;
  Author: {
    Title: string;
    EMail: string;
  };
  // If your VisitorDetailsTable or related logic needs 'Bldg' (e.g., for reporting/filtering),
  // and it's derived from the parent IVisitor, you might consider adding it here if needed
  // for direct access on IVisitorDetail, or ensure your filtering logic handles it from IVisitor.
}
export interface IUserDept {
  DeptId: number;
  NameId: number;
}
export interface ITabItem {
  label: string;
  value: number;
}
export interface IViewState {
  selectedFromDate: moment.Moment; // Corrected type to moment.Moment
  selectedToDate: moment.Moment;   // Corrected type to moment.Moment
  selectedAgendaDate: Date;
  inputSubject: string;
  dialogMessage: string;
  txtSearch: string;
  isEncoder: boolean;
  isApprover: boolean;
  isWalkinApprover: boolean;
  isReceptionist: boolean;
  isSSDUser: boolean;
  isUser: boolean;
  vwid: number;
  WalkinApprovers: IUserDept[]; // Corrected type for better safety
  dirListItems: (IVisitor | IVisitorDetail)[]; // **CRUCIAL FIX**: This array can contain a mix of IVisitor and IVisitorDetail objects
  selectedItems: any[]; // Consider refining this type if you know what it holds
  openDialog: boolean;
  isSavingDone: boolean;
  isProgress: boolean;
  errorFields: {
    Date: string;
    Subject: string;
  };
  viewName: string;
  menuTabs: string[];
  tabvalue: number;
  reportView: 'Daily' | 'Monthly'; // Added the missing property
}