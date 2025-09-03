import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { IViewVisitorsProps } from './IViewVisitorsProps';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button'; // Import Button for the download button
import moment from 'moment';
import { sp } from "@pnp/sp";
// Import common components
import HeaderSection from './common/HeaderSection';
import TabsNavigation from './common/TabsNavigation';
import DateRangeSelector from './common/DateRangeSelector';
import SearchBox from './common/SearchBox';
import VisitorRequestsTable from './common/VisitorRequestsTable';
import VisitorDetailsTable from './common/VisitorDetailsTable';
import VisitorCountTable from './common/VisitorCountTable';
import ActionButtons from './common/ActionButtons';
// Import Material-UI components for radio buttons/filters
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
// Import services
import SharePointService from './services/SharePointService';
// Import utils
import { setCookie, getCookie } from './utils/helper';
import { IVisitor, IVisitorDetail, IUserDept, IViewState, IVisitorCount } from './interfaces/IViewVisitors';

// Import for Excel export
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
    downloadButton: { // Style for the download button
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  }),
);

// Constants
const Receptionist_Group = "Receptionist";
//const SSD_Group = "SSD";
const SSD_Group_v2 = "SSD_v2";
const HOUsers_Group = "HOUsers";
const SPCUsers_Group = "SPCUsers";

// Global variables (consider moving these into state or using React Context if they are shared and mutable)
let usersPerDept: IUserDept[] = [];
let approversPerDept: IUserDept[] = [];
let walkinapprovers: IUserDept[] = [];
let user: any = null; // Type this more specifically if possible
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
    reportView: 'Daily'
  });

  // Event handlers
  const onClickCancel = (e: React.MouseEvent) => {
    window.open(props.siteUrl, "_self"); // This one remains _self as it's a cancel action
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    const tabContent = (event.target as HTMLElement).textContent;
    let from = moment(new Date()).subtract(15, 'days');
    let to = moment(new Date()).endOf('day');

    setCookie('ViewVisitorTab', tabContent, 1800);

    setState(prevState => {
      const newState = {
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
          newState.vwid = 9;
        }
      }

      if (tabContent === 'Reports') {
        const currentReportView = prevState.reportView;
        if (currentReportView === 'Daily') {
          newState.selectedFromDate = moment().startOf('day');
          newState.selectedToDate = moment().endOf('day');
        } else { // Monthly
          newState.selectedFromDate = moment().startOf('month');
          newState.selectedToDate = moment().endOf('month');
        }
        from = newState.selectedFromDate;
        to = newState.selectedToDate;
      }

      return newState;
    });

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
      } else if (tabContent === 'MultiEntry' && currentStateForMapUser.isSSDUser) {
        mapUser(from.toDate(), to.toDate(), 11);
      } else if (tabContent === 'Reports') {
        if (currentStateForMapUser.isEncoder || currentStateForMapUser.isApprover || currentStateForMapUser.isWalkinApprover ||
          currentStateForMapUser.isReceptionist || currentStateForMapUser.isSSDUser || isHOUser || isSPCUser) {
          mapUser(from.toDate(), to.toDate(), 10, currentStateForMapUser.reportView);
        }
      }
    }, 0);
  };

  // Generic date change handler that works for both picker types
  // This handler receives a native Date object from DateRangeSelector
  const handleDateChangeForReport = (date: Date | null) => { // Parameter 'date' is now typed as Date | null
    if (date) {
      // Convert the native Date object back to a moment object for internal state
      const momentDate = moment(date);
      const newFromDate = state.reportView === 'Monthly' ? momentDate.startOf('month') : momentDate.startOf('day');
      const newToDate = state.reportView === 'Monthly' ? momentDate.endOf('month') : momentDate.endOf('day');

      setState(prevState => ({
        ...prevState,
        selectedFromDate: newFromDate,
        selectedToDate: newToDate
      }));

      setTimeout(() => {
        mapUser(newFromDate.toDate(), newToDate.toDate(), 10, state.reportView);
      }, 0);
    }
  };


  // These handlers will now receive a native Date object from DateRangeSelector
  const onFromDateChange = (date: Date | null) => { // Parameter 'date' is now typed as Date | null
    if (date) {
      const newFromDate = moment(date).startOf('day'); // Convert to moment object
      setState(prevState => {
        const newState = {
          ...prevState,
          selectedFromDate: newFromDate
        };
        setTimeout(() => {
          mapUser(newFromDate.toDate(), prevState.selectedToDate.toDate(), prevState.vwid, prevState.reportView);
        }, 0);
        return newState;
      });
    }
  };

  // These handlers will now receive a native Date object from DateRangeSelector
  const onToDateChange = (date: Date | null) => { // Parameter 'date' is now typed as Date | null
    if (date) {
      const newToDate = moment(date).endOf('day'); // Convert to moment object
      setState(prevState => {
        const newState = {
          ...prevState,
          selectedToDate: newToDate
        };
        setTimeout(() => {
          mapUser(prevState.selectedFromDate.toDate(), newToDate.toDate(), prevState.vwid, prevState.reportView);
        }, 0);
        return newState;
      });
    }
  };

  const handleReportViewChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newReportView = event.target.value as 'Daily' | 'Monthly';

    let newFromDate: moment.Moment;
    let newToDate: moment.Moment;

    if (newReportView === 'Daily') {
      newFromDate = moment().startOf('day');
      newToDate = moment().endOf('day');
    } else { // Monthly
      newFromDate = moment().startOf('month');
      newToDate = moment().endOf('month');
    }

    setState(prevState => ({
      ...prevState,
      reportView: newReportView,
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
        const visitorDetails = await SharePointService.searchVisitorsByName(searchText);
        let filteredDetails: IVisitorDetail[] = visitorDetails;
        if (isHOUser || isSPCUser) {
          const visitorRequests = await SharePointService.loadVisitorRequests(
            state.selectedFromDate.toDate(),
            state.selectedToDate.toDate()
          );
          const visitorBldgMap: { [key: number]: string } = {};
          visitorRequests.forEach(visitor => {
            visitorBldgMap[visitor.ID] = visitor.Bldg;
          });
          filteredDetails = visitorDetails.filter(detail => {
            // Note: Your IVisitorDetail interface doesn't have 'Bldg' directly,
            // but your SharePointService.searchVisitorsByName or related logic
            // might be adding it or you're relying on ParentId to get Bldg.
            // Ensure this logic holds true if Bldg is critical for filtering here.
            const parentBldg = visitorBldgMap[detail.ParentId];
            if (isHOUser) {
              return parentBldg === "(HO) 5-Storey Building";
            } else if (isSPCUser) {
              return parentBldg === "SPC";
            }
            return true;
          });
        }
        if (currentState.isReceptionist || currentState.isSSDUser) {
          setState(prevState => ({
            ...prevState,
            dirListItems: filteredDetails,
          }));
        } else if (currentState.isEncoder || currentState.isApprover || currentState.isWalkinApprover) {
          let mappedrows: IVisitorDetail[] = [];
          filteredDetails.map(row => {
            let filtered = [];
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
    window.open(props.siteUrl + "/SitePages/DisplayVisitorappge.aspx?pid=" + rowData["ID"], "_blank"); // MODIFIED HERE
  };

  const viewAction2 = (event: React.MouseEvent, rowData: IVisitorDetail | IVisitor) => {
    if ('ParentId' in rowData) {
      window.open(props.siteUrl + "/SitePages/DisplayVisitorappge.aspx?pid=" + rowData.ParentId, "_blank"); // MODIFIED HERE
    } else {
      window.open(props.siteUrl + "/SitePages/DisplayVisitorappge.aspx?pid=" + rowData.ID, "_blank"); // MODIFIED HERE
    }
  };

  async function mapUser(from: Date, to: Date, action: number, reportView: 'Daily' | 'Monthly' = 'Daily') {
    const currentState = { ...state };
    let fetchedData: IVisitor[] | IVisitorDetail[] = [];

    if ((action === 1)) {
      const visitors = await SharePointService.loadVisitorRequests(from, to);
      let mappedrows: IVisitor[] = [];
      visitors.map(row => {
        let filtered = [];
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
      let filteredDetails: IVisitorDetail[] = visitorDetails;
      if (isHOUser || isSPCUser) {
        const visitorRequests = await SharePointService.loadVisitorRequests(from, to);
        const visitorBldgMap: { [key: number]: string } = {};
        visitorRequests.forEach(visitor => {
          visitorBldgMap[visitor.ID] = visitor.Bldg;
        });
        filteredDetails = visitorDetails.filter(detail => {
          const parentBldg = visitorBldgMap[detail.ParentId];
          if (isHOUser) {
            return parentBldg === "(HO) 5-Storey Building";
          } else if (isSPCUser) {
            return parentBldg === "SPC";
          }
          return true;
        });
      }
      let mappedrows: IVisitorDetail[] = [];
      filteredDetails.map(row => {
        let filtered = [];
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
      let filteredDetails: IVisitorDetail[] = visitorDetails;
      if (isHOUser || isSPCUser) {
        const visitorRequests = await SharePointService.loadVisitorRequests(from, to);
        const visitorBldgMap: { [key: number]: string } = {};
        visitorRequests.forEach(visitor => {
          visitorBldgMap[visitor.ID] = visitor.Bldg;
        });
        filteredDetails = visitorDetails.filter(detail => {
          const parentBldg = visitorBldgMap[detail.ParentId];
          if (isHOUser) {
            return parentBldg === "(HO) 5-Storey Building";
          } else if (isSPCUser) {
            return parentBldg === "SPC";
          }
          return true;
        });
      }
      fetchedData = filteredDetails;
    } else if ((action === 5)) {
      const visitors = await SharePointService.loadVisitorRequests(from, to);
      let mappedrows: IVisitor[] = [];
      visitors.map(row => {
        let filtered = approversPerDept.filter((item) => item.NameId === row.ApproverId);
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
      let mappedrows: IVisitor[] = [];
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
      let mappedrows: IVisitor[] = [];
      visitors.map(row => {
        let filtered = walkinapprovers.filter((item) => item.NameId === row.ApproverId);
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
      }
      let filteredReports: IVisitor[] = reportData;
      if (isHOUser || isSPCUser) {
        filteredReports = reportData.filter(row => {
          return row.Bldg === (isHOUser ? "(HO) 5-Storey Building" : "SPC");
        });
      }
      fetchedData = filteredReports;
    } else if ((action === 11)) {
      // MultiEntry tab - get visitor counts
      const visitorCounts = await SharePointService.getVisitorEntryCounts(from, to);
      fetchedData = visitorCounts as any; // Cast to any to avoid type issues
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

  // New function to handle report download with better formatting
  const handleDownloadReport = () => {
    if (state.dirListItems.length === 0) {
      alert("No data to download.");
      return;
    }

    let reportType = '';
    let fileName = '';
    let dataToExport: any[] = [];

    if (state.vwid === 11) {
      // MultiEntry tab export
      reportType = 'Visitor Entry Count Report';
      fileName = `${reportType} - ${state.selectedFromDate.format('YYYY-MM-DD')} to ${state.selectedToDate.format('YYYY-MM-DD')}.xlsx`;
      
      dataToExport = (state.dirListItems as IVisitorCount[]).map(item => ({
        //'ID': item.ID,
        'Visitor Last Name': item.LastName,
        'Visitor First Name': item.FirstName,
        'Company Name': item.CompanyName,
        'Visit Count': item.VisitCount
      }));
    } else {
      // Regular reports export
      reportType = state.reportView === 'Daily' ? 'Daily Visitors Report' : 'Monthly Visitors Report';
      fileName = `${reportType} - ${state.selectedFromDate.format('YYYY-MM-DD')} to ${state.selectedToDate.format('YYYY-MM-DD')}.xlsx`;

      // Determine the type of data and map accordingly
      if (state.vwid === 10 || state.vwid === 1 || state.vwid === 2 || state.vwid === 5 || state.vwid === 6 || state.vwid === 7 || state.vwid === 8) {
        dataToExport = (state.dirListItems as IVisitor[]).map(item => ({
          //'ID': item.ID,
          'Reference Number': item.Title,
          'Company Name': item.CompanyName,
          'Request By': item.Approver ? item.Approver.Title : '',
          'Department': item.Dept ? item.Dept.Title : '',
          'Building': item.Bldg,
          'Request Date': item.RequestDate ? new Date(item.RequestDate) : '',
          'Date & Time Visit': item.DateTimeVisit ? new Date(item.DateTimeVisit) : '',
          'Date & Time Arrival': item.DateTimeArrival ? new Date(item.DateTimeArrival) : '',
          'Purpose': item.Purpose,
          'Status': item.Status ? item.Status.Title : '',
          'Requires Parking': item.RequireParking ? 'Yes' : 'No',
        }));
      } else if (state.vwid === 9 || state.vwid === 3 || state.vwid === 4) {
        dataToExport = (state.dirListItems as IVisitorDetail[]).map(item => ({
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
          'Status': item.Status ? item.Status.Title : '',
          'Parent ID': item.ParentId,
          'Author': item.Author ? item.Author.Title : '',
        }));
      } else {
        alert("Download not supported for this report type.");
        return;
      }
    }

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(dataToExport);

  // Add headers formatting (bold)
  const headers = Object.keys(dataToExport[0] || {});
  XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });

  // AutoFit column widths based on formatted values
  const colWidths = headers.map((header) => {
    let maxLength = header.length;
    dataToExport.forEach((row) => {
      let value = row[header];

      //Format date fields before measuring
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
  ws['!cols'] = colWidths;

  // Add autofilter
  ws['!autofilter'] = { ref: `A1:${String.fromCharCode(64 + headers.length)}${dataToExport.length + 1}` };

  // Apply date formatting
  headers.forEach((header, idx) => {
    if (header.toLowerCase().includes("date") || header.toLowerCase().includes("time")) {
      for (let r = 2; r <= dataToExport.length + 1; r++) {
        const cellRef = XLSX.utils.encode_cell({ c: idx, r: r - 1 });
        const cell = ws[cellRef];
        if (cell && cell.t === "d") {
          cell.z = "yyyy-mm-dd hh:mm";
        }
      }
    }
  });

  // Build workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, reportType);

  // Save file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
};

  // Initialize component
  useEffect(() => {
    console.log('loaded view visitors');
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
        //for (let i = 0; i < groups.length; i++) {
        //  if (groups[i].LoginName === SSD_Group) {
        //    isSSDUser = true;
        //    break;
        //  }

        //MultipleEntry
        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === SSD_Group_v2) {
            isSSDUser = true;
            break;
          }
        }
        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === HOUsers_Group) {
            isHOUser = true;
          } else if (groups[i].LoginName === SPCUsers_Group) {
            isSPCUser = true;
          }
        }

        let temptabs: string[] = [];
        if (isEncoder || isReceptionist || isSSDUser || isApprover || isWalkinApprover) {
          temptabs = ['By Request', 'By Visitor Details', 'Search by Visitor Name'];
        }
        if (isApprover || isWalkinApprover) {
          temptabs.push('Dept. Approver');
        }

        //if (isSSDUser) {
        //  temptabs.push('SSD');
        //}

        //MultipleEntry
        if (isSSDUser) {
          temptabs.push('MultiEntry');
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

          {/* Conditional rendering for DateRangeSelector based on vwid */}
          {((state.vwid !== 9) && (state.vwid !== 0) && (state.vwid !== 10)) && (
            <Grid item xs={12} sm={6}>
              <DateRangeSelector
                fromDate={state.selectedFromDate.toDate()}
                toDate={state.selectedToDate.toDate()}
                // These handlers now correctly expect Date | null
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

          {/* Reports Tab UI */}
          {((state.vwid === 10)) && (
            <Grid item xs={12}>
              <FormControl component="fieldset" className={classes.formControl}>
                <FormLabel component="legend">Report View</FormLabel>
                <RadioGroup row aria-label="report-view" name="report-view" value={state.reportView} onChange={handleReportViewChange}>
                  <FormControlLabel value="Daily" control={<Radio />} label="Daily Visitors" />
                  <FormControlLabel value="Monthly" control={<Radio />} label="Monthly Visitors" />
                </RadioGroup>
              </FormControl>

              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <DateRangeSelector
                    fromDate={state.selectedFromDate.toDate()}
                    toDate={state.selectedToDate.toDate()}
                    // These handlers now correctly expect Date | null
                    onFromDateChange={handleDateChangeForReport}
                    onToDateChange={handleDateChangeForReport}
                    pickerType={state.reportView === 'Daily' ? 'date' : 'month'}
                  />
                </Grid>
                {/* Download Button */}
                <Grid item xs={12} sm={6} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleDownloadReport}
                    className={classes.downloadButton}
                    disabled={state.dirListItems.length === 0} // Disable if no data
                  >
                    Download Report
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          )}

          {/* MultiEntry Tab UI - Download Button */}
          {((state.vwid === 11)) && (
            <Grid item xs={12} sm={6} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDownloadReport}
                className={classes.downloadButton}
                disabled={state.dirListItems.length === 0} // Disable if no data
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
                  data={state.dirListItems as IVisitorDetail[]}
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
