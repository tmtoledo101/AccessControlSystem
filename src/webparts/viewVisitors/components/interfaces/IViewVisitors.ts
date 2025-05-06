export interface IVisitor {
  ID: number;
  Title: string;
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
}

export interface IVisitorDetail {
  ID: number;
  Title: string;
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
  selectedFromDate: any;
  selectedToDate: any;
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
  WalkinApprovers: any[];
  dirListItems: any[];
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
}
