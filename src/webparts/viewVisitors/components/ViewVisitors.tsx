import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { IViewVisitorsProps } from './IViewVisitorsProps';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import moment from 'moment';
import { sp } from "@pnp/sp";

// Common components
import HeaderSection from './common/HeaderSection';
import TabsNavigation from './common/TabsNavigation';
import DateRangeSelector from './common/DateRangeSelector';
import SearchBox from './common/SearchBox';
import VisitorRequestsTable from './common/VisitorRequestsTable';
import VisitorDetailsTable from './common/VisitorDetailsTable';
import VisitorCountTable from './common/VisitorCountTable';
import ActionButtons from './common/ActionButtons';

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
import {
  IVisitor,
  IVisitorDetail,
  IUserDept,
  IViewState,
  IVisitorCount,
  IVisitorDetailExtended
} from './interfaces/IViewVisitors';

// Excel export
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(1),
      borderColor: "transparent",
    },
    formControl: {
      margin: theme.spacing(1),
    },
    downloadButton: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  }),
);

// Constants
const Receptionist_Group = "Receptionist";
const SSD_Group_v2 = "SSD_v2";

// Global (consider narrowing scope later)
let usersPerDept: IUserDept[] = [];
let approversPerDept: IUserDept[] = [];
let walkinapprovers: IUserDept[] = [];
let user: any = null;
let isHOUser = false;
let isSPCUser = false;

export default function ViewVisitors(props: IViewVisitorsProps) {
  const classes = useStyles();
  const inputRef = useRef(null);

  // State
  const [state, setState] = useState<IViewState>({
    selectedFromDate: moment(new Date()).subtract(15, 'days'),
    selectedToDate: moment(new Date()).add(1, 'hours'),
    selectedAgendaDate: new Date(),
    inputSubject: "",
    dialogMessage: "",
    txtSearch: "",
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
    errorFields: {
      Date: '',
      Subject: ''
    },
    viewName: '',
    menuTabs: [],
    tabvalue: 6,
    reportView: 'Daily' as any
  });

  // Event handlers
  const onClickCancel = (e: React.MouseEvent) => {
    window.open(props.siteUrl, "_self");
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    const tabContent = (event.target as HTMLElement).textContent;
    let from = moment(new Date()).subtract(15, 'days');
    let to = moment(new Date()).endOf('day');

    setCookie('ViewVisitorTab', tabContent as string, 1800);

    setState(prevState => {
      const newState: IViewState = {
        ...prevState,
        selectedFromDate: from,
        selectedToDate: to,
        tabvalue: newValue
      };

      if (tabContent === 'By Visitor Details') {
        newState.selectedFromDate = moment(new Date()).subtract(1, 'days');
        newState.selectedToDate = moment(new Date()).add(5, 'days');
        from = newState.selectedFromDate;
        to = newState.selectedToDate;
      }

      if (tabContent === 'Search by Visitor Name') {
        if (prevState.isEncoder || prevState.isApprover || prevState.isWalkinApprover ||
          prevState.isReceptionist || prevState.isSSDUser) {
          newState.dirListItems = [];
          (newState as any).vwid = 9;
        }
      }

      if (tabContent === 'Reports') {
        const currentReportView = prevState.reportView as 'Daily' | 'Monthly' | 'Custom';
        if (currentReportView === 'Daily') {
          newState.selectedFromDate = moment().startOf('day');
          newState.selectedToDate = moment().endOf('day');
        } else if (currentReportView === 'Monthly') {
          newState.selectedFromDate = moment().startOf('month');
          newState.selectedToDate = moment().endOf('month');
        } else {
          // Custom keeps last chosen range
        }
        from = newState.selectedFromDate;
        to = newState.selectedToDate;
      }

      return newState;
    });

    setState(prev => ({ ...prev, dirListItems: [] }));

    setTimeout(() => {
      const currentStateForMapUser = { ...state, tabvalue: newValue };
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
      } else if ((tabContent === 'SSD') && (currentStateForMapUser.isSSDUser)) {
        mapUser(from.toDate(), to.toDate(), 6);
      } else if (tabContent === 'Limit Entry' && currentStateForMapUser.isSSDUser) {
        mapUser(from.toDate(), to.toDate(), 11);
      } else if (tabContent === 'Reports') {
        if (currentStateForMapUser.isEncoder || currentStateForMapUser.isApprover || currentStateForMapUser.isWalkinApprover ||
          currentStateForMapUser.isReceptionist || currentStateForMapUser.isSSDUser || isHOUser || isSPCUser) {
          mapUser(from.toDate(), to.toDate(), 10, (currentStateForMapUser.reportView as any) || 'Daily');
        }
      }
    }, 0);
  };

  // Report date change
  const handleDateChangeForReport = (date: Date | null) => {
    if (date) {
      const momentDate = moment(date);

      if ((state.reportView as any) === 'Monthly') {
        const newFromDate = momentDate.startOf('month');
        const newToDate = momentDate.endOf('month');

        setState(prevState => ({
          ...prevState,
          selectedFromDate: newFromDate,
          selectedToDate: newToDate
        }));

        setTimeout(() => {
          mapUser(newFromDate.toDate(), newToDate.toDate(), 10, 'Monthly');
        }, 0);
      } else if ((state.reportView as any) === 'Daily') {
        const newFromDate = momentDate.startOf('day');
        const newToDate = momentDate.endOf('day');

        setState(prevState => ({
          ...prevState,
          selectedFromDate: newFromDate,
          selectedToDate: newToDate
        }));

        setTimeout(() => {
          mapUser(newFromDate.toDate(), newToDate.toDate(), 10, 'Daily');
        }, 0);
      } else {
        // Custom not routed here
      }
    }
  };

  const onFromDateChange = (date: Date | null) => {
    if (date) {
      const newFromDate = moment(date).startOf('day');
      setState(prevState => {
        const newState = {
          ...prevState,
          selectedFromDate: newFromDate
        };
        setTimeout(() => {
          mapUser(newFromDate.toDate(), prevState.selectedToDate.toDate(), prevState.vwid, (prevState.reportView as any));
        }, 0);
        return newState;
      });
    }
  };

  const onToDateChange = (date: Date | null) => {
    if (date) {
      const newToDate = moment(date).endOf('day');
      setState(prevState => {
        const newState = {
          ...prevState,
          selectedToDate: newToDate
        };
        setTimeout(() => {
          mapUser(prevState.selectedFromDate.toDate(), newToDate.toDate(), prevState.vwid, (prevState.reportView as any));
        }, 0);
        return newState;
      });
    }
  };

  const handleReportViewChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newReportView = event.target.value as 'Daily' | 'Monthly' | 'Custom';

    let newFromDate = state.selectedFromDate;
    let newToDate = state.selectedToDate;

    if (newReportView === 'Daily') {
      newFromDate = moment().startOf('day');
      newToDate = moment().endOf('day');
    } else if (newReportView === 'Monthly') {
      newFromDate = moment().startOf('month');
      newToDate = moment().endOf('month');
    } else {
      // Custom preserves current range
    }

    setState(prevState => ({
      ...prevState,
      reportView: newReportView as any,
      selectedFromDate: newFromDate,
      selectedToDate: newToDate
    }));

    setTimeout(() => {
      mapUser(newFromDate.toDate(), newToDate.toDate(), 10, newReportView);
    }, 0);
  };

  const handleChangeTxt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const searchText = e.target.value;
      setState(prevState => {
        const newState = {
          ...prevState,
          txtSearch: searchText
        };
        if (searchText.length < 3) {
          newState.dirListItems = [];
        }
        return newState;
      });

      if (searchText.length > 2) {
        const currentState = { ...state };

        // Search details
        const visitorDetails = await SharePointService.searchVisitorsByName(searchText);

        // For building level filters and enrichment, load parents in the current date window
        const visitorRequests = await SharePointService.loadVisitorRequests(
          state.selectedFromDate.toDate(),
          state.selectedToDate.toDate()
        );

        const visitorBldgMap: { [key: number]: string } = {};
        visitorRequests.forEach(visitor => {
          visitorBldgMap[visitor.ID] = visitor.Bldg;
        });

        // Apply building filter if needed
        let filteredDetails: IVisitorDetail[] = visitorDetails;
        if (isHOUser || isSPCUser) {
          filteredDetails = visitorDetails.filter(detail => {
            const parentBldg = visitorBldgMap[detail.ParentId];
            if (isHOUser) return parentBldg === "(HO) 5-Storey Building";
            if (isSPCUser) return parentBldg === "SPC";
            return true;
          });
        }

        // Enrich with Bldg for the table
        const enrichedDetails: IVisitorDetailExtended[] = filteredDetails.map(d => ({
          ...d,
          Bldg: visitorBldgMap[d.ParentId] || ''
        }));

        if (currentState.isReceptionist || currentState.isSSDUser) {
          setState(prevState => ({
            ...prevState,
            dirListItems: enrichedDetails,
          }));
        } else if (currentState.isEncoder || currentState.isApprover || currentState.isWalkinApprover) {
          const mappedrows: IVisitorDetailExtended[] = [];
          enrichedDetails.forEach(row => {
            let filtered: IUserDept[] = [];
            if (currentState.isEncoder) {
              filtered = usersPerDept.filter((item) => item.DeptId === row.DeptId);
            } else if (currentState.isApprover) {
              filtered = approversPerDept.filter((item) => item.DeptId === row.DeptId);
            } else if (currentState.isWalkinApprover) {
              filtered = walkinapprovers.filter((item) => item.DeptId === row.DeptId);
            }
            if ((filtered.length > 0)) {
              mappedrows.push(row);
            }
          });
          setState(prevState => ({
            ...prevState,
            dirListItems: mappedrows,
          }));
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const viewAction = (event: React.MouseEvent, rowData: IVisitor) => {
    window.open(props.siteUrl + "/SitePages/DisplayVisitorappge.aspx?pid=" + rowData["ID"], "_blank");
  };

  const viewAction2 = (event: React.MouseEvent, rowData: IVisitorDetail | IVisitor) => {
    if ('ParentId' in rowData) {
      window.open(props.siteUrl + "/SitePages/DisplayVisitorappge.aspx?pid=" + rowData.ParentId, "_blank");
    } else {
      window.open(props.siteUrl + "/SitePages/DisplayVisitorappge.aspx?pid=" + rowData.ID, "_blank");
    }
  };

  async function mapUser(
    from: Date,
    to: Date,
    action: number,
    reportView: 'Daily' | 'Monthly' | 'Custom' = 'Daily'
  ) {
    const currentState = { ...state };

    let fetchedData: IVisitor[] | IVisitorDetail[] | IVisitorDetailExtended[] | IVisitorCount[] = [];

    if ((action === 1)) {
      const visitors = await SharePointService.loadVisitorRequests(from, to);
      const mappedrows: IVisitor[] = [];
      visitors.map(row => {
        let filtered: IUserDept[] = [];
        let includeRow = true;
        if (currentState.isEncoder) {
          filtered = usersPerDept.filter((item) => item.DeptId === row.DeptId);
        } else if (currentState.isApprover) {
          filtered = approversPerDept.filter((item) => item.DeptId === row.DeptId);
        } else if (currentState.isWalkinApprover) {
          filtered = walkinapprovers.filter((item) => item.DeptId === row.DeptId);
        }

        if (isHOUser && row.Bldg !== "(HO) 5-Storey Building") {
          includeRow = false;
        } else if (isSPCUser && row.Bldg !== "SPC") {
          includeRow = false;
        }

        if ((filtered.length > 0) && includeRow) {
          mappedrows.push(row);
        }
      });
      fetchedData = mappedrows;
    } else if ((action === 2)) {
      const visitors = await SharePointService.loadVisitorRequests(from, to);
      let filteredVisitors = visitors;
      if (isHOUser || isSPCUser) {
        filteredVisitors = visitors.filter(row => {
          if (isHOUser) {
            return row.Bldg === "(HO) 5-Storey Building";
          } else if (isSPCUser) {
            return row.Bldg === "SPC";
          }
          return true;
        });
      }
      fetchedData = filteredVisitors;
    } else if ((action === 3)) {
      const visitorDetails = await SharePointService.loadVisitorDetails(from, to);

      // Load parents for building map once
      const visitorRequests = await SharePointService.loadVisitorRequests(from, to);
      const visitorBldgMap: { [key: number]: string } = {};
      visitorRequests.forEach(visitor => { visitorBldgMap[visitor.ID] = visitor.Bldg; });

      // Building filter
      let filteredDetails: IVisitorDetail[] = visitorDetails;
      if (isHOUser || isSPCUser) {
        filteredDetails = filteredDetails.filter(detail => {
          const parentBldg = visitorBldgMap[detail.ParentId];
          if (isHOUser) return parentBldg === "(HO) 5-Storey Building";
          if (isSPCUser) return parentBldg === "SPC";
          return true;
        });
      }

      // Enrich with Bldg
      const enriched: IVisitorDetailExtended[] = filteredDetails.map(d => ({
        ...d,
        Bldg: visitorBldgMap[d.ParentId] || ''
      }));

      // Role filter
      const mappedrows: IVisitorDetailExtended[] = [];
      enriched.forEach(row => {
        let filtered: IUserDept[] = [];
        if (currentState.isEncoder) {
          filtered = usersPerDept.filter((item) => item.DeptId === row.DeptId);
        } else if (currentState.isApprover) {
          filtered = approversPerDept.filter((item) => item.DeptId === row.DeptId);
        } else if (currentState.isWalkinApprover) {
          filtered = walkinapprovers.filter((item) => item.DeptId === row.DeptId);
        }
        if ((filtered.length > 0)) {
          mappedrows.push(row);
        }
      });

      fetchedData = mappedrows;
    } else if ((action === 4)) {
      const visitorDetails = await SharePointService.loadVisitorDetails(from, to);
      const visitorRequests = await SharePointService.loadVisitorRequests(from, to);

      const visitorBldgMap: { [key: number]: string } = {};
      visitorRequests.forEach(visitor => { visitorBldgMap[visitor.ID] = visitor.Bldg; });

      let filteredDetails: IVisitorDetail[] = visitorDetails;
      if (isHOUser || isSPCUser) {
        filteredDetails = filteredDetails.filter(detail => {
          const parentBldg = visitorBldgMap[detail.ParentId];
          if (isHOUser) return parentBldg === "(HO) 5-Storey Building";
          if (isSPCUser) return parentBldg === "SPC";
          return true;
        });
      }

      // Enrich with Bldg
      const enriched: IVisitorDetailExtended[] = filteredDetails.map(d => ({
        ...d,
        Bldg: visitorBldgMap[d.ParentId] || ''
      }));

      fetchedData = enriched;
    } else if ((action === 5)) {
      const visitors = await SharePointService.loadVisitorRequests(from, to);
      const mappedrows: IVisitor[] = [];
      visitors.map(row => {
        const filtered = approversPerDept.filter((item) => item.NameId === row.ApproverId);
        let isvalid = false;
        let includeRow = true;
        if ((row.StatusId === 2)) {
          isvalid = true;
        }
        if (isHOUser && row.Bldg !== "(HO) 5-Storey Building") {
          includeRow = false;
        } else if (isSPCUser && row.Bldg !== "SPC") {
          includeRow = false;
        }
        if ((filtered.length > 0) && (isvalid) && includeRow) {
          mappedrows.push(row);
        }
      });
      fetchedData = mappedrows;
    } else if ((action === 6)) {
      const visitors = await SharePointService.loadVisitorRequests(from, to);
      const mappedrows: IVisitor[] = [];
      visitors.map(row => {
        let isvalid = false;
        let includeRow = true;
        if ((row.StatusId === 3)) {
          isvalid = true;
        }
        if (isHOUser && row.Bldg !== "(HO) 5-Storey Building") {
          includeRow = false;
        } else if (isSPCUser && row.Bldg !== "SPC") {
          includeRow = false;
        }
        if ((isvalid) && includeRow) {
          mappedrows.push(row);
        }
      });
      fetchedData = mappedrows;
    } else if ((action === 7)) {
      const visitors = await SharePointService.loadVisitorRequests(from, to);
      const mappedrows: IVisitor[] = [];
      visitors.map(row => {
        const filtered = walkinapprovers.filter((item) => item.NameId === row.ApproverId);
        let isvalid = false;
        let includeRow = true;
        if ((row.StatusId === 2)) {
          isvalid = true;
        }
        if (isHOUser && row.Bldg !== "(HO) 5-Storey Building") {
          includeRow = false;
        } else if (isSPCUser && row.Bldg !== "SPC") {
          includeRow = false;
        }
        if ((filtered.length > 0) && (isvalid) && includeRow) {
          mappedrows.push(row);
        }
      });
      fetchedData = mappedrows;
    } else if ((action === 10)) {
      let reportData: IVisitor[] = [];
      if (reportView === 'Daily') {
        reportData = await SharePointService.loadVisitorRequests(from, to);
      } else if (reportView === 'Monthly') {
        reportData = await SharePointService.loadVisitorRequests(
          moment(from).startOf('month').toDate(),
          moment(to).endOf('month').toDate()
        );
      } else {
        reportData = await SharePointService.loadVisitorRequests(from, to);
      }
      let filteredReports: IVisitor[] = reportData;
      if (isHOUser || isSPCUser) {
        filteredReports = reportData.filter(row => {
          return row.Bldg === (isHOUser ? "(HO) 5-Storey Building" : "SPC");
        });
      }
      fetchedData = filteredReports;
    } else if ((action === 11)) {
      const visitorCounts = await SharePointService.getVisitorEntryCounts(from, to, 14, 'exact');
      fetchedData = visitorCounts;
    } else {
      alert("You are not authorized to access this page!");
      window.open(props.siteUrl, "_self");
      return;
    }

    setState(prevState => ({
      ...prevState,
      dirListItems: fetchedData,
      vwid: action
    }));
  }

  const handleDownloadReport = () => {
    if (state.dirListItems.length === 0) {
      alert("No data to download.");
      return;
    }

    let reportType = '';
    let fileName = '';
    let dataToExport: any[] = [];

    if (state.vwid === 11) {
      reportType = 'Visitor Entry Count Report';
      fileName = `${reportType} - ${state.selectedFromDate.format('YYYY-MM-DD')} to ${state.selectedToDate.format('YYYY-MM-DD')}.xlsx`;

      dataToExport = (state.dirListItems as IVisitorCount[]).map(item => ({
        'Visitor Last Name': item.LastName,
        'Visitor First Name': item.FirstName,
        'Visit Count': item.VisitCount
      }));
    } else {
      const isDaily = (state.reportView as any) === 'Daily';
      const isMonthly = (state.reportView as any) === 'Monthly';
      reportType = isDaily
        ? 'Daily Visitors Report'
        : isMonthly
          ? 'Monthly Visitors Report'
          : 'Custom Visitors Report';
      fileName = `${reportType} - ${state.selectedFromDate.format('YYYY-MM-DD')} to ${state.selectedToDate.format('YYYY-MM-DD')}.xlsx`;

      if (state.vwid === 10 || state.vwid === 1 || state.vwid === 2 || state.vwid === 5 || state.vwid === 6 || state.vwid === 7 || state.vwid === 8) {
        dataToExport = (state.dirListItems as IVisitor[]).map(item => ({
          'Reference Number': item.Title,
          'Company Name': item.CompanyName,
          'Request By': item.Approver ? item.Approver.Title : '',
          'Department': item.Dept ? item.Dept.Title : '',
          'Building': item.Bldg,
          'Request Date': item.RequestDate ? new Date(item.RequestDate) : '',
          'Date & Time Visit': item.DateTimeVisit
            ? new Date(item.DateTimeVisit).toLocaleString()
            : '',
          'Date & Time Arrival': item.DateTimeArrival
            ? new Date(item.DateTimeArrival).toLocaleString()
            : '',
          'Purpose': item.Purpose,
          'Status': item.Status ? item.Status.Title : '',
          'Requires Parking': item.RequireParking ? 'Yes' : 'No',
        }));
      } else if (state.vwid === 9 || state.vwid === 3 || state.vwid === 4) {
        const list = state.dirListItems as IVisitorDetailExtended[];
        dataToExport = list.map(item => ({
          'ID': item.ID,
          'Visitor Last Name': item.Title,
          'Visitor First Name': item.FirstName,
          'Request Date': item.RequestDate ? new Date(item.RequestDate) : '',
          'Department': item.Dept ? item.Dept.Title : '',
          'Reference No.': item.RefNo,
          'Date From': item.DateFrom ? new Date(item.DateFrom) : '',
          'Date To': item.DateTo ? new Date(item.DateTo) : '',
          'Company Name': item.CompanyName,
          'Car': item.Car ? 'Yes' : 'No',
          'Access Card': item.AccessCard,
          'Building': item.Bldg || '',
          'Status': item.Status ? item.Status.Title : '',
          'Parent ID': item.ParentId,
          'Author': item.Author ? item.Author.Title : '',
        }));
      } else {
        alert("Download not supported for this report type.");
        return;
      }
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const headers = Object.keys(dataToExport[0] || {});
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });

    const colWidths = headers.map((header) => {
      let maxLength = header.length;
      dataToExport.forEach((row) => {
        let value = row[header];
        if (value && (header.includes("Date") || header.includes("Time"))) {
          value = moment(value).format("MM/DD/YYYY HH:mm");
        }
        if (value) {
          const cellLength = value.toString().length;
          if (cellLength > maxLength) {
            maxLength = cellLength;
          }
        }
      });
      return { wch: maxLength + 2 };
    });
    (ws as any)['!cols'] = colWidths;

    (ws as any)['!autofilter'] = { ref: `A1:${String.fromCharCode(64 + headers.length)}${dataToExport.length + 1}` };

    headers.forEach((header, idx) => {
      if (header.toLowerCase().includes("date") || header.toLowerCase().includes("time")) {
        for (let r = 2; r <= dataToExport.length + 1; r++) {
          const cellRef = XLSX.utils.encode_cell({ c: idx, r: r - 1 });
          const cell = (ws as any)[cellRef];
          if (cell && cell.t === "d") {
            cell.z = "yyyy-mm-dd hh:mm";
          }
        }
      }
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, reportType);

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
  };

  // Initialize component
  useEffect(() => {
    (async () => {
      try {
        sp.setup({
          spfxContext: props.context
        });
        user = await SharePointService.getCurrentUser();
        const groups = await SharePointService.getCurrentUserGroups();
        const from = state.selectedFromDate;
        const to = state.selectedToDate;

        usersPerDept = await SharePointService.getUsersPerDept(user.Id);
        approversPerDept = await SharePointService.getApprovers(user.Id);
        walkinapprovers = await SharePointService.getWalkinApprovers(user.Id);

        let isEncoder = usersPerDept.length > 0;
        let isApprover = approversPerDept.length > 0;
        let isReceptionist = false;
        let isSSDUser = false;
        let isWalkinApprover = walkinapprovers.length > 0;

        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === Receptionist_Group) {
            isReceptionist = true;
            break;
          }
        }

        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === SSD_Group_v2) {
            isSSDUser = true;
            break;
          }
        }

        let temptabs: string[] = [];
        if (isEncoder || isReceptionist || isSSDUser || isApprover || isWalkinApprover) {
          temptabs = ['By Request', 'By Visitor Details', 'Search by Visitor Name'];
        }
        if (isApprover || isWalkinApprover) {
          temptabs.push('Dept. Approver');
        }

        if (isSSDUser) {
          temptabs.push('Limit Entry');
        }
        if (isEncoder || isReceptionist || isSSDUser || isApprover || isWalkinApprover || isHOUser || isSPCUser) {
          temptabs.push('Reports');
        }

        setState(prevState => ({
          ...prevState,
          viewName: "Visitor Views",
          isEncoder,
          isApprover,
          isReceptionist,
          isSSDUser,
          isWalkinApprover,
          WalkinApprovers: isWalkinApprover ? walkinapprovers : [],
          menuTabs: temptabs
        }));

        const cookietab = getCookie('ViewVisitorTab');
        if (cookietab) {
          const index = temptabs.indexOf(cookietab);
          setTimeout(() => {
            setState(prevState => ({
              ...prevState,
              tabvalue: index
            }));
            const syntheticEvent: React.ChangeEvent<{}> = {
              target: { textContent: cookietab } as EventTarget & { textContent: string },
              currentTarget: { textContent: cookietab } as EventTarget & { textContent: string },
              nativeEvent: new Event('change'),
              bubbles: false,
              cancelable: false,
              defaultPrevented: false,
              eventPhase: 2,
              isTrusted: false,
              preventDefault: () => { },
              isDefaultPrevented: () => false,
              stopPropagation: () => { },
              isPropagationStopped: () => false,
              persist: () => { },
              timeStamp: Date.now(),
              type: 'change'
            };
            handleTabChange(syntheticEvent, index);
          }, 0);
        } else if (temptabs.length > 0) {
          const defaultTabContent = temptabs[0];
          const defaultIndex = 0;
          const syntheticEvent: React.ChangeEvent<{}> = {
            target: { textContent: defaultTabContent } as EventTarget & { textContent: string },
            currentTarget: { textContent: defaultTabContent } as EventTarget & { textContent: string },
            nativeEvent: new Event('change'),
            bubbles: false,
            cancelable: false,
            defaultPrevented: false,
            eventPhase: 2,
            isTrusted: false,
            preventDefault: () => { },
            isDefaultPrevented: () => false,
            stopPropagation: () => { },
            isPropagationStopped: () => false,
            persist: () => { },
            timeStamp: Date.now(),
            type: 'change'
          };
          handleTabChange(syntheticEvent, defaultIndex);
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);

  return (
    <form noValidate autoComplete="off">
      <div className={classes.root} style={{ padding: '12px' }}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <HeaderSection title={state.viewName} />
          </Grid>
          <Grid item xs={12}>
            <TabsNavigation
              tabs={state.menuTabs}
              value={state.tabvalue}
              onChange={handleTabChange}
            />
          </Grid>

          {((state.vwid !== 9) && (state.vwid !== 0) && (state.vwid !== 10)) && (
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

          {((state.vwid === 9)) && (
            <Grid item xs={12} sm={12}>
              <SearchBox
                searchText={state.txtSearch}
                onSearchChange={handleChangeTxt}
              />
            </Grid>
          )}

          {((state.vwid === 10)) && (
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
                    disabled={state.dirListItems.length === 0}
                  >
                    Download Report
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          )}

          {((state.vwid === 11)) && (
            <Grid item xs={12} sm={6} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDownloadReport}
                className={classes.downloadButton}
                disabled={state.dirListItems.length === 0}
              >
                Download Visitor Count Report
              </Button>
            </Grid>
          )}

          <Grid item xs={12}>
            <Paper variant="outlined" className={classes.paper}>
              {(((state.vwid === 1) || (state.vwid === 2) || (state.vwid === 5) || (state.vwid === 6) || (state.vwid === 7) || (state.vwid === 8) || (state.vwid === 10)) && (state.dirListItems.length > 0)) && (
                <VisitorRequestsTable
                  data={state.dirListItems as IVisitor[]}
                  onViewAction={state.vwid === 10 ? viewAction2 : viewAction}
                />
              )}
              {(((state.vwid === 3) || (state.vwid === 4) || (state.vwid === 9)) && (state.dirListItems.length > 0)) && (
                <VisitorDetailsTable
                  data={state.dirListItems as IVisitorDetailExtended[]}
                  onViewAction={viewAction2}
                />
              )}
              {((state.vwid === 11) && (state.dirListItems.length > 0)) && (
                <VisitorCountTable
                  data={state.dirListItems as IVisitorCount[]}
                  title={`Visitor Entry Count`}
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
  );
}
