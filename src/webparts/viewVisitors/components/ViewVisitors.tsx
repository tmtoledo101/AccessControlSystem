import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { IViewVisitorsProps } from './IViewVisitorsProps';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import moment from 'moment';
import { sp } from '@pnp/sp';

// Common components
import HeaderSection from './common/HeaderSection';
import TabsNavigation from './common/TabsNavigation';
import DateRangeSelector from './common/DateRangeSelector';
import SearchBox from './common/SearchBox';
import VisitorRequestsTable from './common/VisitorRequestsTable';
import VisitorDetailsTable from './common/VisitorDetailsTable';
import VisitorCountTable from './common/VisitorCountTable';
import ActionButtons from './common/ActionButtons';

// Reports-only combined table
import VisitorsTable from './common/VisitorsTable';

// Radio controls
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

// Services
import SharePointService from './services/SharePointService';

// Utils
import { setCookie, getCookie } from './utils/helper';

// Types
import { IVisitor, IUserDept, IViewState, IVisitorCount, IVisitorDetailExtended } from './interfaces/IViewVisitors';

// Excel export
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// ✅ ADD THIS
import PrivacyGate from '../../../common/PrivacyGate';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { flexGrow: 1 },
    paper: { padding: theme.spacing(1), borderColor: 'transparent' },
    formControl: { margin: theme.spacing(1) },
    downloadButton: { marginTop: theme.spacing(2), marginBottom: theme.spacing(2) },
  }),
);

// Constants
const Receptionist_Group = 'Receptionist';
const SSD_Group_v2 = 'SSD';

// Status labels
const STATUS_FOR_APPROVAL = 'For Approval';
const STATUS_APPROVED_BY_DEPT_HEAD = 'Approved by Dept Head';

// Global
let usersPerDept: IUserDept[] = [];
let approversPerDept: IUserDept[] = [];
let walkinapprovers: IUserDept[] = [];
let user: any = null;
let isHOUser = false;
let isSPCUser = false;

export default function ViewVisitors(props: IViewVisitorsProps) {
  const classes = useStyles();
  const inputRef = useRef(null);

  const [state, setState] = useState<IViewState>({
    selectedFromDate: moment(new Date()).subtract(15, 'days'),
    selectedToDate: moment(new Date()).add(1, 'hours'),
    selectedAgendaDate: new Date(),
    inputSubject: '',
    dialogMessage: '',
    txtSearch: '',
    isEncoder: false,
    isApprover: false,
    isWalkinApprover: false,
    isReceptionist: false,
    isSSDUser: false,
    isUser: false,
    vwid: 0,
    WalkinApprovers: [],
    dirListItems: [],
    selectedItems: [],
    openDialog: false,
    isSavingDone: false,
    isProgress: false,
    errorFields: { Date: '', Subject: '' },
    viewName: '',
    menuTabs: [],
    tabvalue: 6,
    reportView: 'Daily' as any,

    // Reference filter applies to ALL tabs (except vwid 0 and 11)
    refFilter: 'ALL' as any,
  });

  const onClickCancel = (e: React.MouseEvent) => {
    window.open(props.siteUrl, '_self');
  };

  // Reference filter handler
  const handleRefFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as any; // 'ALL' | 'HO' | 'SPC'
    setState((prev) => ({ ...prev, refFilter: value }));
  };

  const normalizeText = (value: any): string => {
    return String(value || '').trim().toUpperCase();
  };

  const normalizeRefText = (value: any): string => {
    return normalizeText(value)
      .replace(/\s+/g, '')
      .replace(/_/g, '-');
  };

  const getRefNo = (row: any): string => {
    return normalizeRefText(
      (row && row.RefNo) ||
      (row && row.ReferenceNo) ||
      (row && row.Title) ||
      '',
    );
  };

  const getBldg = (row: any): string => {
    return normalizeText((row && row.Bldg) || '');
  };

  const isRefMatch = (row: any, filter: 'ALL' | 'HO' | 'SPC'): boolean => {
    if (filter === 'ALL') return true;

    const ref = getRefNo(row);

    if (filter === 'HO') {
      return ref.startsWith('HO-') || ref.startsWith('HO');
    }

    if (filter === 'SPC') {
      return ref.startsWith('SPC-') || ref.startsWith('SPC');
    }

    return true;
  };

  const isBldgMatch = (row: any, filter: 'ALL' | 'HO' | 'SPC'): boolean => {
    if (filter === 'ALL') return true;

    const bldg = getBldg(row);

    if (filter === 'HO') {
      return bldg.includes('HO') || bldg.includes('5-STOREY');
    }

    if (filter === 'SPC') {
      return bldg.includes('SPC');
    }

    return true;
  };

  const isAllowedForCurrentUserBuilding = (rowOrBldg: any): boolean => {
    const row = typeof rowOrBldg === 'string'
      ? { Bldg: rowOrBldg }
      : rowOrBldg;

    if (isHOUser) return isBldgMatch(row, 'HO');
    if (isSPCUser) return isBldgMatch(row, 'SPC');

    return true;
  };

  const normalizeRequestRow = (row: any): any => ({
    ...row,
    RefNo: (row && row.RefNo) || (row && row.ReferenceNo) || (row && row.Title) || '',
    ReferenceNo: (row && row.ReferenceNo) || (row && row.RefNo) || (row && row.Title) || '',
  });

  const splitLegacyVisitorName = (title: any, firstName: any) => {
    const titleText = String(title || '').trim();
    const firstText = String(firstName || '').trim();

    // Enhanced/new data:
    // Title = Last Name
    // FirstName = First Name
    if (firstText) {
      const lastName = titleText;
      const firstNameValue = firstText;

      return {
        LastName: lastName,
        FirstName: firstNameValue,
        FullName: `${firstNameValue} ${lastName}`.trim(),
        ReverseFullName: `${lastName} ${firstNameValue}`.trim(),
        SearchName: `${firstNameValue} ${lastName} ${lastName} ${firstNameValue}`.trim().toUpperCase(),
      };
    }

    // Old/legacy data:
    // Title = First Name + Last Name, example: Djerson Estrella
    // FirstName = empty
    const parts = titleText.split(/\s+/).filter(Boolean);

    if (parts.length <= 1) {
      return {
        LastName: titleText,
        FirstName: '',
        FullName: titleText,
        ReverseFullName: titleText,
        SearchName: titleText.toUpperCase(),
      };
    }

    const firstNameValue = parts[0];
    const lastName = parts.slice(1).join(' ');

    return {
      LastName: lastName,
      FirstName: firstNameValue,
      FullName: `${firstNameValue} ${lastName}`.trim(),
      ReverseFullName: `${lastName} ${firstNameValue}`.trim(),
      SearchName: `${firstNameValue} ${lastName} ${lastName} ${firstNameValue}`.trim().toUpperCase(),
    };
  };

  const normalizeVisitorDetailName = (detail: any) => {
    const name = splitLegacyVisitorName(detail.Title, detail.FirstName);

    return {
      ...detail,
      Title: name.LastName,
      FirstName: name.FirstName,
      FullName: name.FullName,
      ReverseFullName: name.ReverseFullName,
      SearchName: name.SearchName,
    };
  };

  const isVisitorNameMatch = (detail: any, searchText: string): boolean => {
    const normalized = normalizeVisitorDetailName(detail);
    const cleanSearchText = normalizeText(searchText);

    if (!cleanSearchText) return true;

    // Keep the raw values too. This is important for old records where:
    // Title = Djerson Estrella
    // FirstName = blank
    const rawTitle = normalizeText(detail.Title);
    const rawFirstName = normalizeText(detail.FirstName);

    // Normalized values support the enhanced records where:
    // Title = Estrella
    // FirstName = Djerson
    const lastName = normalizeText(normalized.Title);
    const firstName = normalizeText(normalized.FirstName);
    const fullName = normalizeText(normalized.FullName);
    const reverseFullName = normalizeText(normalized.ReverseFullName);
    const searchName = normalizeText(normalized.SearchName);

    const allSearchText = [
      rawTitle,
      rawFirstName,
      lastName,
      firstName,
      fullName,
      reverseFullName,
      searchName,
    ].join(' ');

    // Token search makes these all work:
    // Djerson Estrella
    // Estrella Djerson
    // Djerson
    // Estrella
    const searchTokens = cleanSearchText.split(/\s+/).filter(Boolean);

    return searchTokens.every((token) => allSearchText.indexOf(token) > -1);
  };

  /**
   * Reference filter behavior:
   * - By Request and request-based approval tabs: reference number only.
   * - By Visitor Details: parent request reference number and parent building.
   * - Reports: reference number and building.
   * - Search by Visitor Name: reference number only.
   */
  const filterByReference = (rows: any[], filter: 'ALL' | 'HO' | 'SPC') => {
    if (!rows || rows.length === 0) return [];
    if (filter === 'ALL') return rows;

    return rows.filter((row: any) => {
      // Reports tab
      if (state.vwid === 10) {
        return isRefMatch(row, filter) && isBldgMatch(row, filter);
      }

      // By Visitor Details tabs
      if (state.vwid === 3 || state.vwid === 4) {
        return isRefMatch(row, filter) && isBldgMatch(row, filter);
      }

      // By Request, request approval tabs, and Search by Visitor Name
      return isRefMatch(row, filter);
    });
  };

  // Apply ref filter to ALL tabs (except vwid 0 and 11)
  const displayedItems = React.useMemo(() => {
    const rows = (state.dirListItems as any[]) || [];
    if (state.vwid === 0 || state.vwid === 11) return rows;
    return filterByReference(rows, state.refFilter as any);
  }, [state.dirListItems, state.refFilter, state.vwid]);

  const viewAction = (event: React.MouseEvent, rowData: IVisitor) => {
    window.open(props.siteUrl + '/SitePages/DisplayVisitorappge.aspx?pid=' + rowData['ID'], '_blank');
  };

  const viewAction2 = (event: React.MouseEvent, rowData: any) => {
    if (rowData && rowData.ParentId) {
      window.open(props.siteUrl + '/SitePages/DisplayVisitorappge.aspx?pid=' + rowData.ParentId, '_blank');
      return;
    }
    if (rowData && rowData.ID) {
      window.open(props.siteUrl + '/SitePages/DisplayVisitorappge.aspx?pid=' + rowData.ID, '_blank');
      return;
    }
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    const tabContent = (event.target as any).textContent;
    let from = moment(new Date()).subtract(15, 'days');
    let to = moment(new Date()).endOf('day');

    setCookie('ViewVisitorTab', tabContent as string, 1800);

    setState((prevState) => {
      const newState: any = {
        ...prevState,
        selectedFromDate: from,
        selectedToDate: to,
        tabvalue: newValue,
      };

      if (tabContent === 'By Visitor Details') {
        newState.selectedFromDate = moment(new Date()).subtract(1, 'days');
        newState.selectedToDate = moment(new Date()).add(5, 'days');
        from = newState.selectedFromDate;
        to = newState.selectedToDate;
      }

      if (tabContent === 'Search by Visitor Name') {
        if (
          prevState.isEncoder ||
          prevState.isApprover ||
          prevState.isWalkinApprover ||
          prevState.isReceptionist ||
          prevState.isSSDUser
        ) {
          newState.dirListItems = [];
          newState.vwid = 9;
        }
      }

      if (tabContent === 'Reports') {
        const currentReportView = prevState.reportView as any;
        if (currentReportView === 'Daily') {
          newState.selectedFromDate = moment().startOf('day');
          newState.selectedToDate = moment().endOf('day');
        } else if (currentReportView === 'Monthly') {
          newState.selectedFromDate = moment().startOf('month');
          newState.selectedToDate = moment().endOf('month');
        }
        from = newState.selectedFromDate;
        to = newState.selectedToDate;

        if (!newState.refFilter) newState.refFilter = 'ALL';
      }

      return newState;
    });

    setState((prev) => ({ ...prev, dirListItems: [] }));

    setTimeout(() => {
      const currentStateForMapUser: any = { ...state, tabvalue: newValue };

      if (tabContent === 'By Request') {
        if (currentStateForMapUser.isEncoder || currentStateForMapUser.isApprover || currentStateForMapUser.isWalkinApprover) {
          mapUser(from.toDate(), to.toDate(), 1);
        } else if (currentStateForMapUser.isReceptionist || currentStateForMapUser.isSSDUser) {
          mapUser(from.toDate(), to.toDate(), 2);
        }
      } else if (tabContent === 'By Visitor Details') {
        if (currentStateForMapUser.isEncoder || currentStateForMapUser.isApprover || currentStateForMapUser.isWalkinApprover) {
          mapUser(from.toDate(), to.toDate(), 3);
        } else if (currentStateForMapUser.isReceptionist || currentStateForMapUser.isSSDUser) {
          mapUser(from.toDate(), to.toDate(), 4);
        }
      } else if (tabContent === 'Dept. Approver') {
        if (currentStateForMapUser.isApprover) {
          mapUser(from.toDate(), to.toDate(), 5);
        } else if (currentStateForMapUser.isWalkinApprover) {
          mapUser(from.toDate(), to.toDate(), 7);
        }
      } else if (tabContent === 'SSD' && currentStateForMapUser.isSSDUser) {
        mapUser(from.toDate(), to.toDate(), 6);
      } else if (tabContent === 'Limit Entry' && currentStateForMapUser.isSSDUser) {
        mapUser(from.toDate(), to.toDate(), 11);
      } else if (tabContent === 'Reports') {
        if (
          currentStateForMapUser.isEncoder ||
          currentStateForMapUser.isApprover ||
          currentStateForMapUser.isWalkinApprover ||
          currentStateForMapUser.isReceptionist ||
          currentStateForMapUser.isSSDUser ||
          isHOUser ||
          isSPCUser
        ) {
          mapUser(from.toDate(), to.toDate(), 10, (currentStateForMapUser.reportView as any) || 'Daily');
        }
      }
    }, 0);
  };

  const handleDateChangeForReport = (date: Date | null) => {
    if (!date) return;

    const momentDate = moment(date);

    if ((state.reportView as any) === 'Monthly') {
      const newFromDate = momentDate.startOf('month');
      const newToDate = momentDate.endOf('month');
      setState((prevState) => ({ ...prevState, selectedFromDate: newFromDate, selectedToDate: newToDate }));
      setTimeout(() => mapUser(newFromDate.toDate(), newToDate.toDate(), 10, 'Monthly'), 0);
    } else if ((state.reportView as any) === 'Daily') {
      const newFromDate = momentDate.startOf('day');
      const newToDate = momentDate.endOf('day');
      setState((prevState) => ({ ...prevState, selectedFromDate: newFromDate, selectedToDate: newToDate }));
      setTimeout(() => mapUser(newFromDate.toDate(), newToDate.toDate(), 10, 'Daily'), 0);
    }
  };

  const onFromDateChange = (date: Date | null) => {
    if (!date) return;
    const newFromDate = moment(date).startOf('day');

    setState((prevState) => {
      const newState: any = { ...prevState, selectedFromDate: newFromDate };
      setTimeout(() => {
        mapUser(newFromDate.toDate(), prevState.selectedToDate.toDate(), prevState.vwid, prevState.reportView as any);
      }, 0);
      return newState;
    });
  };

  const onToDateChange = (date: Date | null) => {
    if (!date) return;
    const newToDate = moment(date).endOf('day');

    setState((prevState) => {
      const newState: any = { ...prevState, selectedToDate: newToDate };
      setTimeout(() => {
        mapUser(prevState.selectedFromDate.toDate(), newToDate.toDate(), prevState.vwid, prevState.reportView as any);
      }, 0);
      return newState;
    });
  };

  const handleReportViewChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newReportView = event.target.value as any;

    let newFromDate = state.selectedFromDate;
    let newToDate = state.selectedToDate;

    if (newReportView === 'Daily') {
      newFromDate = moment().startOf('day');
      newToDate = moment().endOf('day');
    } else if (newReportView === 'Monthly') {
      newFromDate = moment().startOf('month');
      newToDate = moment().endOf('month');
    }

    setState((prevState) => ({
      ...prevState,
      reportView: newReportView,
      selectedFromDate: newFromDate,
      selectedToDate: newToDate,
    }));

    setTimeout(() => {
      mapUser(newFromDate.toDate(), newToDate.toDate(), 10, newReportView);
    }, 0);
  };

  const handleChangeTxt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const searchText = e.target.value;
      const cleanSearchText = normalizeText(searchText);

      setState((prevState) => {
        const newState: any = { ...prevState, txtSearch: searchText };
        if (cleanSearchText.length < 3) newState.dirListItems = [];
        return newState;
      });

      if (cleanSearchText.length < 3) return;

      const currentState: any = { ...state };

      // Load parent requests first by date range.
      // This avoids scanning the whole VisitorDetails list and helps prevent list view threshold errors.
      const visitorRequests = await SharePointService.loadVisitorRequests(
        state.selectedFromDate.toDate(),
        state.selectedToDate.toDate(),
      );

      const visitorBldgMap: { [key: number]: string } = {};
      const visitorRefMap: { [key: number]: string } = {};
      const parentIds: number[] = [];

      visitorRequests.forEach((v: any) => {
        visitorBldgMap[v.ID] = v.Bldg;
        visitorRefMap[v.ID] = v.Title;
        parentIds.push(v.ID);
      });

      if (parentIds.length === 0) {
        setState((prevState) => ({ ...prevState, dirListItems: [] }));
        return;
      }

      // Required in SharePointService.ts:
      // loadVisitorDetailsByParentIds(parentIds)
      const visitorDetails = await SharePointService.loadVisitorDetailsByParentIds(parentIds);

      let filteredDetails: any[] = visitorDetails.filter((detail: any) => {
        return isVisitorNameMatch(detail, cleanSearchText);
      });

      if (isHOUser || isSPCUser) {
        filteredDetails = filteredDetails.filter((detail: any) => {
          const parentBldg = visitorBldgMap[detail.ParentId];
          if (isHOUser) return isBldgMatch({ Bldg: parentBldg }, 'HO');
          if (isSPCUser) return isBldgMatch({ Bldg: parentBldg }, 'SPC');
          return true;
        });
      }

      const enrichedDetails: any[] = filteredDetails.map((d: any) => {
        const normalized = normalizeVisitorDetailName(d);

        return {
          ...normalized,
          Bldg: visitorBldgMap[d.ParentId] || '',
          RefNo: visitorRefMap[d.ParentId] || d.RefNo || d.ReferenceNo || '',
          ReferenceNo: visitorRefMap[d.ParentId] || d.ReferenceNo || d.RefNo || '',
        };
      });

      if (currentState.isReceptionist || currentState.isSSDUser) {
        setState((prevState) => ({ ...prevState, dirListItems: enrichedDetails }));
      } else if (currentState.isEncoder || currentState.isApprover || currentState.isWalkinApprover) {
        const mappedrows: any[] = [];

        enrichedDetails.forEach((row: any) => {
          let filtered: any[] = [];
          if (currentState.isEncoder) filtered = usersPerDept.filter((item) => item.DeptId === row.DeptId);
          else if (currentState.isApprover) filtered = approversPerDept.filter((item) => item.DeptId === row.DeptId);
          else if (currentState.isWalkinApprover) filtered = walkinapprovers.filter((item) => item.DeptId === row.DeptId);
          if (filtered.length > 0) mappedrows.push(row);
        });

        setState((prevState) => ({ ...prevState, dirListItems: mappedrows }));
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Search by visitor name error:', err);
    }
  };

  async function mapUser(from: Date, to: Date, action: number, reportView: 'Daily' | 'Monthly' | 'Custom' = 'Daily') {
    const currentState: any = { ...state };
    let fetchedData: any[] = [];

    if (action === 1) {
      // By Request must keep the full request list so the Reference Filter can work.
      // The old code filtered by the user's department first. That removed SPC rows
      // before the SPC reference filter was applied.
      const visitors = await SharePointService.loadVisitorRequests(from, to);
      fetchedData = visitors.map(normalizeRequestRow);
    } else if (action === 2) {
      const visitors = await SharePointService.loadVisitorRequests(from, to);
      let filteredVisitors: any[] = visitors;

      if (isHOUser || isSPCUser) {
        filteredVisitors = visitors.filter((row: any) => {
          if (isHOUser) return isBldgMatch(row, 'HO');
          if (isSPCUser) return isBldgMatch(row, 'SPC');
          return true;
        });
      }

      fetchedData = filteredVisitors.map(normalizeRequestRow);
    } else if (action === 3 || action === 4) {
      const visitorDetails = await SharePointService.loadVisitorDetails(from, to);
      const visitorRequests = await SharePointService.loadVisitorRequests(from, to);

      const visitorBldgMap: { [key: number]: string } = {};
      const visitorRefMap: { [key: number]: string } = {};
      visitorRequests.forEach((v: any) => {
        visitorBldgMap[v.ID] = v.Bldg;
        visitorRefMap[v.ID] = v.Title;
      });

      let filteredDetails: any[] = visitorDetails;
      if (isHOUser || isSPCUser) {
        filteredDetails = filteredDetails.filter((detail: any) => {
          const parentBldg = visitorBldgMap[detail.ParentId];
          if (isHOUser) return isBldgMatch({ Bldg: parentBldg }, 'HO');
          if (isSPCUser) return isBldgMatch({ Bldg: parentBldg }, 'SPC');
          return true;
        });
      }

      const enriched: any[] = filteredDetails.map((d: any) => {
        const normalized = normalizeVisitorDetailName(d);

        return {
          ...normalized,
          Bldg: visitorBldgMap[d.ParentId] || '',
          RefNo: visitorRefMap[d.ParentId] || d.RefNo || d.ReferenceNo || '',
          ReferenceNo: visitorRefMap[d.ParentId] || d.ReferenceNo || d.RefNo || '',
        };
      });

      if (action === 4) {
        fetchedData = enriched;
      } else {
        // By Visitor Details must keep the full enriched detail list so the
        // Reference Filter can check the parent RefNo + parent Bldg.
        // The old code filtered by the user's department first. That removed
        // SPC visitor detail rows before the SPC reference filter was applied.
        fetchedData = enriched.map(normalizeRequestRow);
      }
    } else if (action === 5) {
      // Dept. Approver (Pre-arranged) - only For Approval
      const visitors = await SharePointService.loadVisitorRequests(from, to);
      const mappedrows: any[] = [];

      visitors.forEach((row: any) => {
        let includeRow = true;

        const isForApproval = row.Status && row.Status.Title === STATUS_FOR_APPROVAL;
        if (!isForApproval) return;

        const filtered = approversPerDept.filter((a) => a.DeptId === row.DeptId);

        if (!isAllowedForCurrentUserBuilding(row)) includeRow = false;

        if (filtered.length > 0 && includeRow) mappedrows.push(row);
      });

      fetchedData = mappedrows.map(normalizeRequestRow);
    } else if (action === 6) {
      // SSD tab - only Approved by Dept Head
      const visitors = await SharePointService.loadVisitorRequests(from, to);
      let filteredVisitors: any[] = visitors;

      if (isHOUser || isSPCUser) {
        filteredVisitors = filteredVisitors.filter((row: any) => {
          if (isHOUser) return isBldgMatch(row, 'HO');
          if (isSPCUser) return isBldgMatch(row, 'SPC');
          return true;
        });
      }

      filteredVisitors = filteredVisitors.filter((row: any) => row.Status && row.Status.Title === STATUS_APPROVED_BY_DEPT_HEAD);

      fetchedData = filteredVisitors.map(normalizeRequestRow);
    } else if (action === 7) {
      // Dept. Approver (Walk-in) - only For Approval
      const visitors = await SharePointService.loadVisitorRequests(from, to);
      const mappedrows: any[] = [];

      visitors.forEach((row: any) => {
        let includeRow = true;

        const isForApproval = row.Status && row.Status.Title === STATUS_FOR_APPROVAL;
        if (!isForApproval) return;

        const filtered = walkinapprovers.filter((a) => a.DeptId === row.DeptId);

        if (!isAllowedForCurrentUserBuilding(row)) includeRow = false;

        if (filtered.length > 0 && includeRow) mappedrows.push(row);
      });

      fetchedData = mappedrows.map(normalizeRequestRow);
    } else if (action === 10) {
      // REPORTS: requests + details combined
      let reportRequests: any[] = [];

      if (reportView === 'Daily') {
        reportRequests = await SharePointService.loadVisitorRequests(from, to);
      } else if (reportView === 'Monthly') {
        reportRequests = await SharePointService.loadVisitorRequests(
          moment(from).startOf('month').toDate(),
          moment(to).endOf('month').toDate(),
        );
      } else {
        reportRequests = await SharePointService.loadVisitorRequests(from, to);
      }

      let filteredRequests: any[] = reportRequests;
      if (isHOUser || isSPCUser) {
        filteredRequests = reportRequests.filter((row: any) => {
          return isAllowedForCurrentUserBuilding(row);
        });
      }

      const details: any[] = await SharePointService.loadVisitorDetails(from, to);
      const detailsByParent: { [key: number]: any[] } = {};
      details.forEach((d: any) => {
        const pid = d.ParentId;
        if (!detailsByParent[pid]) detailsByParent[pid] = [];
        detailsByParent[pid].push(d);
      });

      const combinedReports: any[] = filteredRequests.map((req: any) => {
        const list = detailsByParent[req.ID] || [];

        const lastNames = list
          .map((x) => splitLegacyVisitorName(x.Title, x.FirstName).LastName)
          .filter(Boolean)
          .join(', ');

        const firstNames = list
          .map((x) => splitLegacyVisitorName(x.Title, x.FirstName).FirstName)
          .filter(Boolean)
          .join(', ');

        const plateNos = list.map((x) => x.PlateNo).filter(Boolean).join(', ');

        return {
          ...req,
          RefNo: req.Title,
          ReferenceNo: req.Title,
          VisitorLastName: lastNames,
          VisitorFirstName: firstNames,
          VisitorPlateNo: plateNos,
        };
      });

      fetchedData = combinedReports.map(normalizeRequestRow);
    } else if (action === 11) {
      const visitorCounts = await SharePointService.getVisitorEntryCounts(from, to, 14, 'exact');
      fetchedData = visitorCounts as any[];
    } else {
      alert('You are not authorized to access this page!');
      window.open(props.siteUrl, '_self');
      return;
    }

    setState((prevState) => ({
      ...prevState,
      dirListItems: fetchedData,
      vwid: action,
    }));
  }

  const handleDownloadReport = () => {
    if (!displayedItems || displayedItems.length === 0) {
      alert('No data to download.');
      return;
    }

    let reportType = '';
    let fileName = '';
    let dataToExport: any[] = [];

    if (state.vwid === 11) {
      reportType = 'Visitor Entry Count Report';
      fileName = reportType + ' - ' + state.selectedFromDate.format('YYYY-MM-DD') + ' to ' + state.selectedToDate.format('YYYY-MM-DD') + '.xlsx';

      dataToExport = (displayedItems as any[]).map((item: any) => ({
        'Visitor Last Name': item.LastName,
        'Visitor First Name': item.FirstName,
        'Visit Count': item.VisitCount,
      }));
    } else if (state.vwid === 10) {
      const isDaily = (state.reportView as any) === 'Daily';
      const isMonthly = (state.reportView as any) === 'Monthly';

      reportType = isDaily ? 'Daily Visitors Report' : isMonthly ? 'Monthly Visitors Report' : 'Custom Visitors Report';
      fileName = reportType + ' - ' + state.selectedFromDate.format('YYYY-MM-DD') + ' to ' + state.selectedToDate.format('YYYY-MM-DD') + '.xlsx';

      dataToExport = (displayedItems as any[]).map((item: any) => ({
        'Reference Number': item.Title,
        'Company Name': item.CompanyName,
        'Request By':
          item.Author && item.Author.Title ? item.Author.Title : item.Approver && item.Approver.Title ? item.Approver.Title : '',
        Department: item.Dept && item.Dept.Title ? item.Dept.Title : '',
        Building: item.Bldg,
        'Request Date': item.RequestDate ? new Date(item.RequestDate) : '',
        'Date & Time Visit': item.DateTimeVisit ? new Date(item.DateTimeVisit) : '',
        'Date & Time Arrival': item.DateTimeArrival ? new Date(item.DateTimeArrival) : '',
        Purpose: item.Purpose,
        Status: item.Status && item.Status.Title ? item.Status.Title : '',
        'Require Parking': item.RequireParking ? 'Yes' : 'No',
        "Visitor's Last Name": item.VisitorLastName || '',
        "Visitor's First Name": item.VisitorFirstName || '',
        'Plate No.': item.VisitorPlateNo || '',
        'Room No.': item.RoomNo || '',
      }));
    } else {
      alert('Download is only supported in Reports / Visitor Count for this setup.');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);

    const headers = Object.keys(dataToExport[0] || {});
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });

    (ws as any)['!cols'] = headers.map((h: string) => {
      let max = Math.max(12, (h || '').length + 2);
      dataToExport.forEach((row) => {
        const v = row[h];
        if (v === null || v === undefined) return;
        const s = v instanceof Date ? moment(v).format('MM/DD/YYYY HH:mm') : String(v);
        max = Math.max(max, s.length + 2);
      });
      return { wch: max };
    });

    (ws as any)['!autofilter'] = {
      ref: `A1:${XLSX.utils.encode_col(headers.length - 1)}${dataToExport.length + 1}`,
    };

    (ws as any)['!sheetViews'] = [
      {
        state: 'frozen',
        ySplit: 1,
        topLeftCell: 'A2',
        activePane: 'bottomLeft',
      },
    ];

    const dateColIndexes = [5, 6, 7];
    dateColIndexes.forEach((cIdx) => {
      for (let r = 2; r <= dataToExport.length + 1; r++) {
        const cellRef = XLSX.utils.encode_cell({ c: cIdx, r: r - 1 });
        const cell = (ws as any)[cellRef];
        if (cell && cell.t === 'd') {
          cell.z = 'mm/dd/yyyy hh:mm';
        }
      }
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, reportType);

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
  };

  useEffect(() => {
    (async () => {
      try {
        sp.setup({ spfxContext: props.context });

        user = await SharePointService.getCurrentUser();
        const groups = await SharePointService.getCurrentUserGroups();

        usersPerDept = await SharePointService.getUsersPerDept(user.Id);
        approversPerDept = await SharePointService.getApprovers(user.Id);
        walkinapprovers = await SharePointService.getWalkinApprovers(user.Id);

        const isEncoder = usersPerDept.length > 0;
        const isApprover = approversPerDept.length > 0;
        const isWalkinApprover = walkinapprovers.length > 0;

        let isReceptionist = false;
        let isSSDUser = false;

        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === Receptionist_Group) {
            isReceptionist = true;
            break;
          }
        }

        for (let j = 0; j < groups.length; j++) {
          if (groups[j].LoginName === SSD_Group_v2) {
            isSSDUser = true;
            break;
          }
        }

        let temptabs: string[] = [];
        if (isEncoder || isReceptionist || isSSDUser || isApprover || isWalkinApprover) {
          temptabs = ['By Request', 'By Visitor Details', 'Search by Visitor Name'];
        }
        if (isApprover || isWalkinApprover) temptabs.push('Dept. Approver');
        if (isSSDUser) temptabs.push('SSD');
        if (isSSDUser) temptabs.push('Limit Entry');
        if (isEncoder || isReceptionist || isSSDUser || isApprover || isWalkinApprover || isHOUser || isSPCUser) {
          temptabs.push('Reports');
        }

        setState((prevState) => ({
          ...prevState,
          viewName: 'Visitor Views',
          isEncoder: isEncoder,
          isApprover: isApprover,
          isReceptionist: isReceptionist,
          isSSDUser: isSSDUser,
          isWalkinApprover: isWalkinApprover,
          WalkinApprovers: isWalkinApprover ? walkinapprovers : [],
          menuTabs: temptabs,
        }));

        const cookietab = getCookie('ViewVisitorTab');
        if (cookietab) {
          const index = temptabs.indexOf(cookietab);
          setTimeout(() => {
            setState((prevState) => ({ ...prevState, tabvalue: index }));

            const syntheticEvent: any = {
              target: { textContent: cookietab },
              currentTarget: { textContent: cookietab },
              nativeEvent: new Event('change'),
              bubbles: false,
              cancelable: false,
              defaultPrevented: false,
              eventPhase: 2,
              isTrusted: false,
              preventDefault: () => {},
              isDefaultPrevented: () => false,
              stopPropagation: () => {},
              isPropagationStopped: () => false,
              persist: () => {},
              timeStamp: Date.now(),
              type: 'change',
            };

            handleTabChange(syntheticEvent, index);
          }, 0);
        } else if (temptabs.length > 0) {
          const defaultTabContent = temptabs[0];
          const defaultIndex = 0;

          const syntheticEvent2: any = {
            target: { textContent: defaultTabContent },
            currentTarget: { textContent: defaultTabContent },
            nativeEvent: new Event('change'),
            bubbles: false,
            cancelable: false,
            defaultPrevented: false,
            eventPhase: 2,
            isTrusted: false,
            preventDefault: () => {},
            isDefaultPrevented: () => false,
            stopPropagation: () => {},
            isPropagationStopped: () => false,
            persist: () => {},
            timeStamp: Date.now(),
            type: 'change',
          };

          handleTabChange(syntheticEvent2, defaultIndex);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      }
    })();
  }, []);

  // ✅ WRAP YOUR EXISTING UI WITH PrivacyGate
  return (
    <PrivacyGate context={props.context} siteUrl={props.siteUrl} refNo={''}>
      <form noValidate autoComplete="off">
        <div className={classes.root} style={{ padding: '12px' }}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <HeaderSection title={state.viewName} />
            </Grid>

            <Grid item xs={12}>
              <TabsNavigation tabs={state.menuTabs} value={state.tabvalue} onChange={handleTabChange} />
            </Grid>

            {state.vwid !== 9 && state.vwid !== 0 && state.vwid !== 10 && (
              <Grid item xs={12} sm={6}>
                <DateRangeSelector
                  fromDate={state.selectedFromDate.toDate()}
                  toDate={state.selectedToDate.toDate()}
                  onFromDateChange={onFromDateChange}
                  onToDateChange={onToDateChange}
                  pickerType="date"
                />
              </Grid>
            )}

            {state.vwid === 9 && (
              <Grid item xs={12} sm={12}>
                <SearchBox searchText={state.txtSearch} onSearchChange={handleChangeTxt} />
              </Grid>
            )}

            {state.vwid === 10 && (
              <Grid item xs={12}>
                <FormControl component="fieldset" className={classes.formControl}>
                  <FormLabel component="legend">Report View</FormLabel>
                  <RadioGroup row aria-label="report-view" name="report-view" value={state.reportView} onChange={handleReportViewChange}>
                    <FormControlLabel value="Daily" control={<Radio />} label="Daily Visitors" />
                    <FormControlLabel value="Monthly" control={<Radio />} label="Monthly Visitors" />
                    <FormControlLabel value="Custom" control={<Radio />} label="Custom Range" />
                  </RadioGroup>
                </FormControl>

                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <DateRangeSelector
                      fromDate={state.selectedFromDate.toDate()}
                      toDate={state.selectedToDate.toDate()}
                      onFromDateChange={(state.reportView as any) === 'Custom' ? onFromDateChange : handleDateChangeForReport}
                      onToDateChange={(state.reportView as any) === 'Custom' ? onToDateChange : handleDateChangeForReport}
                      pickerType={(state.reportView as any) === 'Monthly' ? 'month' : 'date'}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleDownloadReport}
                      className={classes.downloadButton}
                      disabled={!displayedItems || displayedItems.length === 0}
                    >
                      Download Report
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            )}

            {state.vwid === 11 && (
              <Grid item xs={12} sm={6} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDownloadReport}
                  className={classes.downloadButton}
                  disabled={!displayedItems || displayedItems.length === 0}
                >
                  Download Visitor Count Report
                </Button>
              </Grid>
            )}

            {state.vwid !== 0 && state.vwid !== 11 && (
              <Grid item xs={12}>
                <FormControl component="fieldset" className={classes.formControl}>
                  <FormLabel component="legend">Reference Filter</FormLabel>
                  <RadioGroup row aria-label="ref-filter" name="ref-filter" value={state.refFilter as any} onChange={handleRefFilterChange}>
                    <FormControlLabel value="ALL" control={<Radio />} label="All" />
                    <FormControlLabel value="HO" control={<Radio />} label="HO" />
                    <FormControlLabel value="SPC" control={<Radio />} label="SPC" />
                  </RadioGroup>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <Paper variant="outlined" className={classes.paper}>
                {state.vwid === 10 && displayedItems.length > 0 && <VisitorsTable data={displayedItems as any[]} onViewAction={viewAction2} title="Reports" />}

                {(state.vwid === 1 || state.vwid === 2 || state.vwid === 5 || state.vwid === 6 || state.vwid === 7 || state.vwid === 8) &&
                  displayedItems.length > 0 && <VisitorRequestsTable data={displayedItems as IVisitor[]} onViewAction={viewAction} />}

                {(state.vwid === 3 || state.vwid === 4 || state.vwid === 9) && displayedItems.length > 0 && (
                  <VisitorDetailsTable data={displayedItems as IVisitorDetailExtended[]} onViewAction={viewAction2} />
                )}

                {state.vwid === 11 && displayedItems.length > 0 && (
                  <VisitorCountTable
                    data={displayedItems as IVisitorCount[]}
                    title="Visitor Entry Count"
                    fromDate={state.selectedFromDate.toDate()}
                    toDate={state.selectedToDate.toDate()}
                  />
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <ActionButtons onClose={onClickCancel} />
            </Grid>
          </Grid>
        </div>
      </form>
    </PrivacyGate>
  );
}