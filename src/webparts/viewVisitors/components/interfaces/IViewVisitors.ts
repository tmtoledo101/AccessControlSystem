import * as moment from 'moment';

export interface IVisitorCount {
  ID: number;
  FirstName: string;
  LastName: string;      
  VisitCount: number;    
  CompanyName: string;

  // For collapsible table functionality
  isExpanded?: boolean;
  detailsData?: IVisitorDetailExtended[];
}

/** Base detail row from "Visitors" (parent) list */
export interface IVisitor {
  ID: number;
  Title: string;         
  FirstName: string;
  RequestDate: Date | string;
  DeptId: number;
  Dept: { Title: string };
  ContactName: string;
  DateTimeVisit: Date | string;
  DateTimeArrival: Date | string;
  Purpose: string;
  StatusId: number;
  Status: { Title: string };
  RequireParking: boolean;
  CompanyName: string;
  ApproverId: number;
  Approver: { Title: string; EMail: string };
  SSDApprover: { Title: string };
  Author: { Title: string; EMail: string };
  Bldg: string;
  VisitorType: {Title: string};
}

/** Detail row from "VisitorDetails" list */
export interface IVisitorDetail {
  ID: number;
  Title: string;         // Last Name
  FirstName: string;
  RequestDate: Date | string;
  DeptId: number;
  Dept: { Title: string };
  RefNo: string;
  /** PnP often returns ISO strings, so allow string | Date */
  DateFrom: Date | string;
  DateTo: Date | string;
  CompanyName: string;
  Car: boolean;
  //AccessCard: string;
  AccessCardId?: number; // 👈 Lookup ID from SharePoint
  AccessCard?: {
    Title: string;       // 👈 Actual title of the selected item
  };
  StatusId: number;
  Status: { Title: string };
  ParentId: number;      // FK to "Visitors" list
  Author: { Title: string; EMail: string };
  VisitorType: {Title: string};
  // Bldg is not stored here directly; it’s enriched from parent "Visitors"
}

/** Extended detail used by the detail panel (enriched from parent) */
export interface IVisitorDetailExtended extends IVisitorDetail {
  VisContactNo?: string;
  CreatedBy?: string;
  DateTimeArrival?: Date | string | null;
  DateTimeVisit?: Date | string | null;
  Bldg?: string;
  AccessCardId?: number;
  AccessCard?: { Title: string };
}

/** Department mapping */
export interface IUserDept {
  DeptId: number;
  NameId: number;
}

export interface ITabItem {
  label: string;
  value: number;
}

/** Page-level view state */
export interface IViewState {
  selectedFromDate: moment.Moment;
  selectedToDate: moment.Moment;
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
  dirListItems: (IVisitor | IVisitorDetail | IVisitorCount)[];
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
  reportView: 'Daily' | 'Monthly' | 'Custom';
}