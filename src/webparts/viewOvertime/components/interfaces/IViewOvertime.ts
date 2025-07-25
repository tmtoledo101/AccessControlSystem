import * as moment from 'moment';
export interface IOvertimeRequest {
  ID: number;
  Title: string; // This is likely the EmployeeName for the report
  RequestDate: Date;
  DateFrom: Date; // Corrected: Used DateFrom instead of From
  DateTo: Date;   // Corrected: Used DateTo instead of To
  Purpose: string;
  StatusId: number;
  DeptId: number;
  ApproverId: number;
  SSDApproverId: number;
  Modified: Date;
  Bldg: string; // Added for building filtering
  Dept?: {
    Title: string;
  };
  Status?: {
    Title: string;
  };
  Approver?: {
    Title: string;
    EMail: string;
  };
  SSDApprover?: { // Added based on your IOvertimeRequest
    Title: string;
  };
  Author?: { // Added based on your IOvertimeRequest
    Title: string;
    EMail: string;
  };
}

export interface IOvertimeDetail {
  ID: number;
  Title: string; // Employee Name
  RefNo: string; // Added based on your IOvertimeDetail
  RequestDate: Date;
  TimeFrom: Date; // Corrected: Used TimeFrom instead of OvertimeFrom
  TimeTo: Date;   // Corrected: Used TimeTo instead of OvertimeTo
  Etype: string;  // Added based on your IOvertimeDetail
  OtherSource?: string; // Added based on your IOvertimeDetail
  StatusId: number;
  DeptId: number;
  ParentId: number;
  Modified: Date;
  Dept?: {
    Title: string;
  };
  Status?: {
    Title: string;
  };
  Author?: { // Added based on your IOvertimeDetail
    Title: string;
    EMail: string;
  };
  // Note: Approver and Remarks are not in your IOvertimeDetail, so they will be excluded from export.
}

export interface IUserDept {
  ID: number;
  NameId: number;
  DeptId: number;
  Name?: {
    Title: string;
  };
  Dept?: {
    Title: string;
  };
}

export interface IViewState {
  selectedFromDate: moment.Moment; // Corrected type to moment.Moment
  selectedToDate: moment.Moment;   // Corrected type to moment.Moment
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
  WalkinApprovers: IUserDept[];
  dirListItems: (IOvertimeRequest | IOvertimeDetail)[];
  selectedItems: any[];
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
  reportView: 'Daily' | 'Monthly'; // <--- NEW PROPERTY ADDED HERE
}
