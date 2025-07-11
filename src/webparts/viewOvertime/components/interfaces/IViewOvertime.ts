export interface IOvertimeRequest {
  ID: number;
  Title: string;
  RequestDate: Date;
  DateFrom: Date;
  DateTo: Date;
  Purpose: string;
  StatusId: number;
  DeptId: number;
  ApproverId: number;
  SSDApproverId: number;
  Modified: Date;
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
  SSDApprover?: {
    Title: string;
  };
  Author?: {
    Title: string;
    EMail: string;
  };
}

export interface IOvertimeDetail {
  ID: number;
  Title: string;
  RefNo: string;
  RequestDate: Date;
  TimeFrom: Date;
  TimeTo: Date;
  Etype: string;
  OtherSource?: string;
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
  Author?: {
    Title: string;
    EMail: string;
  };
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
}
