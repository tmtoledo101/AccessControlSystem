import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { IViewOvertimeProps } from './IViewOvertimeProps';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import moment from 'moment';
import { sp } from "@pnp/sp";

// Import common components
import HeaderSection from './common/HeaderSection';
import TabsNavigation from './common/TabsNavigation';
import DateRangeSelector from './common/DateRangeSelector';
import SearchBox from './common/SearchBox';
import OvertimeRequestsTable from './common/OvertimeRequestsTable';
import OvertimeDetailsTable from './common/OvertimeDetailsTable';
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
// Ensure IViewState is imported with the new 'reportView' property
import { IOvertimeRequest, IOvertimeDetail, IUserDept, IViewState } from './interfaces/IViewOvertime';

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
    downloadButton: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  }),
);

// Constants
const Encoders_Group = "Encoders";
const Receptionist_Group = "Receptionist"; // Keep this if used elsewhere, currently not in this file's logic
const SSD_Group = "SSD";
const HOUsers_Group = "HOUsers";
const SPCUsers_Group = "SPCUsers";

// Global variables
let usersPerDept: IUserDept[] = [];
let approversPerDept: IUserDept[] = [];
let walkinapprovers: IUserDept[] = [];
let user: any = null;
let isencoder = false;
let isapprover = false;
let isreceptionist = false;
let isssduser = false;
let ishouser = false;
let isspcuser = false;

export default function ViewOvertime(props: IViewOvertimeProps) {
  const classes = useStyles();
  const inputRef = useRef(null);

  // State
  const [state, setState] = useState<IViewState>({
    selectedFromDate: moment(new Date()).subtract(15, 'days'),
    selectedToDate: moment(new Date()).endOf('day'),
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
    tabvalue: -1,
    reportView: 'Daily' // Added for Reports tab
  });

  // Event handlers
  const onClickCancel = (e: React.MouseEvent) => {
    window.open(props.siteUrl, "_self");
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    const tabContent = (event.target as HTMLElement).textContent;
    let from = moment(new Date()).subtract(15, 'days');
    let to = moment(new Date()).endOf('day');

    setCookie('ViewOverTimeTab', tabContent, 1800);

    setState(prevState => {
      const newState = {
        ...prevState,
        selectedFromDate: from,
        selectedToDate: to,
        tabvalue: newValue
      };

      if (tabContent === 'By Employee Details') {
        newState.selectedFromDate = moment(new Date()).subtract(1, 'days');
        newState.selectedToDate = moment(new Date()).add(5, 'days');
        from = newState.selectedFromDate;
        to = newState.selectedToDate;
      }

      if (tabContent === 'Search by Employee Name') {
        if (isencoder || isapprover || isreceptionist || isssduser) {
          newState.dirListItems = [];
          newState.vwid = 9;
        }
      }

      // Logic for Reports tab
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
      // Capture current state for mapUser call to ensure latest roles and reportView are used
      const currentStateForMapUser = { ...state, tabvalue: newValue };
      if (tabContent === 'By Request') {
        if (currentStateForMapUser.isEncoder || currentStateForMapUser.isApprover) {
          mapUser(from, to, 1);
        } else if (currentStateForMapUser.isReceptionist || currentStateForMapUser.isSSDUser) {
          mapUser(from, to, 2);
        }
      } else if (tabContent === 'By Employee Details') {
        if (currentStateForMapUser.isEncoder || currentStateForMapUser.isApprover) {
          mapUser(from, to, 3);
        } else if (currentStateForMapUser.isReceptionist || currentStateForMapUser.isSSDUser) {
          mapUser(from, to, 4);
        }
      } else if ((tabContent === 'Dept. Approver') && (currentStateForMapUser.isApprover)) {
        mapUser(from, to, 5);
      } else if ((tabContent === 'SSD') && (currentStateForMapUser.isSSDUser)) {
        mapUser(from, to, 6);
      } else if (tabContent === 'Reports') { // Added Reports tab action
        if (currentStateForMapUser.isEncoder || currentStateForMapUser.isApprover ||
          currentStateForMapUser.isReceptionist || currentStateForMapUser.isSSDUser) {
          mapUser(from, to, 10, currentStateForMapUser.reportView); // Use vwid 10 for reports
        }
      }
    }, 0);
  };

  // Generic date change handler that works for both picker types for reports
  const handleDateChangeForReport = (date: Date | null) => {
    if (date) {
      const momentDate = moment(date);
      const newFromDate = state.reportView === 'Monthly' ? momentDate.startOf('month') : momentDate.startOf('day');
      const newToDate = state.reportView === 'Monthly' ? momentDate.endOf('month') : momentDate.endOf('day');

      setState(prevState => ({
        ...prevState,
        selectedFromDate: newFromDate,
        selectedToDate: newToDate
      }));

      setTimeout(() => {
        mapUser(newFromDate, newToDate, 10, state.reportView); // Call mapUser with vwid 10 for reports
      }, 0);
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
          mapUser(newFromDate, prevState.selectedToDate, prevState.vwid, prevState.reportView);
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
          mapUser(prevState.selectedFromDate, newToDate, prevState.vwid, prevState.reportView);
        }, 0);

        return newState;
      });
    }
  };

  // Handler for changing Daily/Monthly report view
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
      mapUser(newFromDate, newToDate, 10, newReportView); // Call mapUser with vwid 10 and new report view
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
        const overtimeDetails = await SharePointService.searchOvertimeByName(searchText);
        let filteredDetails: IOvertimeDetail[] = overtimeDetails;

        // Filter by building for HOUsers and SPCUsers
        if (ishouser || isspcuser) {
          // Get overtime requests to map ParentId to building
          const overtimeRequests = await SharePointService.loadOvertimeRequests(
            state.selectedFromDate.toDate(),
            state.selectedToDate.toDate()
          );
          
          // Create mapping from ID to building
          const overtimeBldgMap: { [key: number]: string } = {};
          overtimeRequests.forEach(request => {
            overtimeBldgMap[request.ID] = request.Bldg;
          });
          
          // Filter overtime details based on building
          filteredDetails = overtimeDetails.filter(detail => {
            const parentBldg = overtimeBldgMap[detail.ParentId];
            if (ishouser) {
              return parentBldg === "(HO) 5-Storey Building";
            } else if (isspcuser) {
              return parentBldg === "SPC";
            }
            return true;
          });
        }

        if (isreceptionist || isssduser) {
          setState(prevState => ({
            ...prevState,
            dirListItems: filteredDetails
          }));
        } else if (isencoder || isapprover) {
          let mappedrows: IOvertimeDetail[] = [];

          filteredDetails.map(row => {
            let filtered = [];
            if (isencoder) {
              filtered = usersPerDept.filter((item) => item.DeptId === row.DeptId);
            } else if (isapprover) {
              filtered = approversPerDept.filter((item) => item.DeptId === row.DeptId);
            }

            if ((filtered.length > 0)) {
              mappedrows.push(row);
            }
          });

          setState(prevState => ({
            ...prevState,
            dirListItems: mappedrows
          }));
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const viewAction = (event: React.MouseEvent, rowData: IOvertimeRequest) => {
    window.open(props.siteUrl + "/SitePages/DisplayOvertimeappge.aspx?pid=" + rowData["ID"], "_blank");
  };

  const viewAction2 = (event: React.MouseEvent, rowData: IOvertimeDetail) => {
    window.open(props.siteUrl + "/SitePages/DisplayOvertimeappge.aspx?pid=" + rowData["ParentId"], "_blank");
  };

  // Helper function to map users and load data
  async function mapUser(from: moment.Moment, to: moment.Moment, action: number, reportView: 'Daily' | 'Monthly' = 'Daily') {
    const currentState = { ...state };
    let fetchedData: IOvertimeRequest[] | IOvertimeDetail[] = [];

    if ((action === 1)) {
      const overtimeRequests = await SharePointService.loadOvertimeRequests(from.toDate(), to.toDate());
      let mappedrows: IOvertimeRequest[] = [];

      overtimeRequests.map(row => {
        let filtered = [];
        let includeRow = true;

        // Filter by building based on user group
        if (ishouser && row.Bldg !== "(HO) 5-Storey Building") {
          includeRow = false;
        } else if (isspcuser && row.Bldg !== "SPC") {
          includeRow = false;
        }

        if (currentState.isEncoder) {
          filtered = usersPerDept.filter((item) => item.DeptId === row.DeptId);
        } else if (currentState.isApprover) {
          // Assuming ApproverId in IOvertimeRequest matches NameId in approversPerDept for filtering
          filtered = approversPerDept.filter((item) => item.NameId === row.ApproverId);
        }

        if ((filtered.length > 0) && includeRow) {
          mappedrows.push(row);
        }
      });

      fetchedData = mappedrows;
    } else if ((action === 2)) {
      const overtimeRequests = await SharePointService.loadOvertimeRequests(from.toDate(), to.toDate());
      // Filter by building based on user group
      if (ishouser || isspcuser) {
        const filteredRequests = overtimeRequests.filter(row => {
          if (ishouser) {
            return row.Bldg === "(HO) 5-Storey Building";
          } else if (isspcuser) {
            return row.Bldg === "SPC";
          }
          return true;
        });
        fetchedData = filteredRequests;
      } else {
        fetchedData = overtimeRequests;
      }
    } else if ((action === 3)) {
      const overtimeDetails = await SharePointService.loadOvertimeDetails(from.toDate(), to.toDate());
      let filteredDetails: IOvertimeDetail[] = overtimeDetails;

      // Filter by building for HOUsers and SPCUsers
      if (ishouser || isspcuser) {
        // Get overtime requests to map ParentId to building
        const overtimeRequests = await SharePointService.loadOvertimeRequests(from.toDate(), to.toDate());
        
        // Create mapping from ID to building
        const overtimeBldgMap: { [key: number]: string } = {};
        overtimeRequests.forEach(request => {
          overtimeBldgMap[request.ID] = request.Bldg;
        });
        
        // Filter overtime details based on building
        filteredDetails = overtimeDetails.filter(detail => {
          const parentBldg = overtimeBldgMap[detail.ParentId];
          if (ishouser) {
            return parentBldg === "(HO) 5-Storey Building";
          } else if (isspcuser) {
            return parentBldg === "SPC";
          }
          return true;
        });
      }

      let mappedrows: IOvertimeDetail[] = [];

      filteredDetails.map(row => {
        let filtered = [];

        if (currentState.isEncoder) {
          filtered = usersPerDept.filter((item) => item.DeptId === row.DeptId);
        } else if (currentState.isApprover) {
          filtered = approversPerDept.filter((item) => item.DeptId === row.DeptId);
        }

        if ((filtered.length > 0)) {
          mappedrows.push(row);
        }
      });

      fetchedData = mappedrows;
    } else if ((action === 4)) {
      const overtimeDetails = await SharePointService.loadOvertimeDetails(from.toDate(), to.toDate());
      let filteredDetails: IOvertimeDetail[] = overtimeDetails;

      // Filter by building for HOUsers and SPCUsers
      if (ishouser || isspcuser) {
        // Get overtime requests to map ParentId to building
        const overtimeRequests = await SharePointService.loadOvertimeRequests(from.toDate(), to.toDate());
        
        // Create mapping from ID to building
        const overtimeBldgMap: { [key: number]: string } = {};
        overtimeRequests.forEach(request => {
          overtimeBldgMap[request.ID] = request.Bldg;
        });
        
        // Filter overtime details based on building
        filteredDetails = overtimeDetails.filter(detail => {
          const parentBldg = overtimeBldgMap[detail.ParentId];
          if (ishouser) {
            return parentBldg === "(HO) 5-Storey Building";
          } else if (isspcuser) {
            return parentBldg === "SPC";
          }
          return true;
        });
      }

      fetchedData = filteredDetails;
    } else if ((action === 5)) {
      const overtimeRequests = await SharePointService.loadOvertimeRequests(from.toDate(), to.toDate());
      let mappedrows: IOvertimeRequest[] = [];

      overtimeRequests.map(row => {
        let filtered = approversPerDept.filter((item) => item.NameId === row.ApproverId);
        let isvalid = false;
        let includeRow = true;

        // Filter by building based on user group
        if (ishouser && row.Bldg !== "(HO) 5-Storey Building") {
          includeRow = false;
        } else if (isspcuser && row.Bldg !== "SPC") {
          includeRow = false;
        }

        if ((row.StatusId === 2)) {
          isvalid = true;
        }

        if ((filtered.length > 0) && (isvalid) && includeRow) {
          mappedrows.push(row);
        }
      });

      fetchedData = mappedrows;
    } else if ((action === 6)) {
      const overtimeRequests = await SharePointService.loadOvertimeRequests(from.toDate(), to.toDate());
      let mappedrows: IOvertimeRequest[] = [];

      overtimeRequests.map(row => {
        let isvalid = false;
        let includeRow = true;

        // Filter by building based on user group
        if (ishouser && row.Bldg !== "(HO) 5-Storey Building") {
          includeRow = false;
        } else if (isspcuser && row.Bldg !== "SPC") {
          includeRow = false;
        }

        if ((row.StatusId === 3)) {
          isvalid = true;
        }

        if ((isvalid) && includeRow) {
          mappedrows.push(row);
        }
      });

      fetchedData = mappedrows;
    } else if ((action === 10)) { // New action for Reports tab
      let reportData: IOvertimeRequest[] = [];
      if (reportView === 'Daily') {
        reportData = await SharePointService.loadOvertimeRequests(from.toDate(), to.toDate());
      } else if (reportView === 'Monthly') {
        reportData = await SharePointService.loadOvertimeRequests(
          moment(from).startOf('month').toDate(),
          moment(to).endOf('month').toDate()
        );
      }
      
      // Apply HO/SPC user filtering for reports
      if (ishouser || isspcuser) {
        const filteredReports = reportData.filter(row => {
          if (ishouser) {
            return row.Bldg === "(HO) 5-Storey Building";
          } else if (isspcuser) {
            return row.Bldg === "SPC";
          }
          return true;
        });
        fetchedData = filteredReports;
      } else {
        fetchedData = reportData;
      }
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

  // New function to handle report download
  const handleDownloadReport = () => {
    if (state.dirListItems.length === 0) {
      alert("No data to download.");
      return;
    }

    const reportType = state.reportView === 'Daily' ? 'Daily Overtime Report' : 'Monthly Overtime Report';
    const fileName = `${reportType} - ${state.selectedFromDate.format('YYYY-MM-DD')} to ${state.selectedToDate.format('YYYY-MM-DD')}.xlsx`;

    let dataToExport: any[] = [];

    // Determine the type of data and map accordingly
    if (state.vwid === 10 || state.vwid === 1 || state.vwid === 2 || state.vwid === 5 || state.vwid === 6) {
      // These vwid's correspond to IOvertimeRequest data
      dataToExport = (state.dirListItems as IOvertimeRequest[]).map(item => ({
        'ID': item.ID,
        'Reference Number': item.Title, // Corrected: Using Title for Employee Name
        'Department': item.Dept ? item.Dept.Title : '',
        'Request Date': moment(item.RequestDate).format('YYYY-MM-DD HH:mm'),
        'Overtime From': moment(item.DateFrom).format('YYYY-MM-DD HH:mm'), // Corrected: Using DateFrom
        'Overtime To': moment(item.DateTo).format('YYYY-MM-DD HH:mm'),     // Corrected: Using DateTo
        // 'Total Hours': item.TotalHours, // Removed: Not present in your IOvertimeRequest interface
        'Purpose': item.Purpose,
        'Status': item.Status ? item.Status.Title : '',
        'Approver': item.Approver ? item.Approver.Title : '',
        'SSD Approver': item.SSDApprover ? item.SSDApprover.Title : '', // Added: Based on your IOvertimeRequest interface
        'Requested By': item.Author ? item.Author.Title : '',           // Added: Based on your IOvertimeRequest interface
        // 'Remarks': item.Remarks, // Removed: Not explicitly present in your IOvertimeRequest interface
      }));
    } else if (state.vwid === 9 || state.vwid === 3 || state.vwid === 4) {
      // These vwid's correspond to IOvertimeDetail data (e.g., search by employee name)
      dataToExport = (state.dirListItems as IOvertimeDetail[]).map(item => ({
        'ID': item.ID,
        'Employee Name': item.Title,
        'Request No': item.RefNo, // Added: Based on your IOvertimeDetail interface
        'Department': item.Dept ? item.Dept.Title : '',
        'Request Date': moment(item.RequestDate).format('YYYY-MM-DD HH:mm'),
        'Overtime From': moment(item.TimeFrom).format('YYYY-MM-DD HH:mm'), // Corrected: Using TimeFrom
        'Overtime To': moment(item.TimeTo).format('YYYY-MM-DD HH:mm'),     // Corrected: Using TimeTo
        'Entry Type': item.Etype, // Added: Based on your IOvertimeDetail interface
        'Other Source': item.OtherSource || '', // Added: Based on your IOvertimeDetail interface
        'Status': item.Status ? item.Status.Title : '',
        // 'Approver': item.Approver ? item.Approver.Title : '', // Removed: Not present in your IOvertimeDetail interface
        'Encoded By': item.Author ? item.Author.Title : '',           // Added: Based on your IOvertimeDetail interface
        // 'Remarks': item.Remarks, // Removed: Not explicitly present in your IOvertimeDetail interface
      }));
    } else {
      console.warn("Download not supported for current view type (vwid: " + state.vwid + ")");
      alert("Download not supported for this report type.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, reportType);

    // Generate Excel file and trigger download
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
  };


  // Initialize component
  useEffect(() => {
    (async () => {
      try {
        sp.setup({ // Ensure pnp is setup
          spfxContext: props.context
        });

        // Get current user
        user = await SharePointService.getCurrentUser();

        // Get user groups
        const groups = await SharePointService.getCurrentUserGroups();

        // Get users per department
        usersPerDept = await SharePointService.getUsersPerDept(user.Id);

        // Get approvers
        approversPerDept = await SharePointService.getApprovers(user.Id);

        // Prepare state updates
        let isEncoder = usersPerDept.length > 0;
        let isApprover = approversPerDept.length > 0;
        let isReceptionist = false;
        let isSSDUser = false;

        // Update global variables
        isencoder = isEncoder;
        isapprover = isApprover;

        // Check if user is in Receptionist group
        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === Receptionist_Group) {
            isReceptionist = true;
            isreceptionist = true;
            break;
          }
        }

        // Check if user is in SSD group
        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === SSD_Group) {
            isSSDUser = true;
            isssduser = true;
            break;
          }
        }

        // Check if user is in HOUsers or SPCUsers groups
        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === HOUsers_Group) {
            ishouser = true;
          } else if (groups[i].LoginName === SPCUsers_Group) {
            isspcuser = true;
          }
        }

        // Set up tabs based on user roles
        let temptabs: string[] = [];

        if (isEncoder || isReceptionist || isSSDUser || isApprover) {
          temptabs = ['By Request', 'By Employee Details', 'Search by Employee Name'];
        }

        if (isApprover) {
          temptabs.push('Dept. Approver');
        }

        if (isSSDUser) {
          temptabs.push('SSD');
        }

        // Add Reports tab if any of these roles are active
        if (isEncoder || isReceptionist || isSSDUser || isApprover) {
          temptabs.push('Reports');
        }

        // Update state with all changes at once
        setState(prevState => ({
          ...prevState,
          viewName: "Overtime / Overstay Views",
          isEncoder,
          isApprover,
          isReceptionist,
          isSSDUser,
          menuTabs: temptabs
        }));

        // Check for saved tab in cookie after state has been updated
        const cookietab = getCookie('ViewOverTimeTab');

        if (cookietab) {
          const index = temptabs.indexOf(cookietab);

          if (index !== -1) { // Only attempt to set if the tab exists
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
          } else { // If cookie tab is not found in current available tabs, default to first tab
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
        } else if (temptabs.length > 0) { // If no cookie, set default to the first available tab
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
            <DateRangeSelector
              fromDate={state.selectedFromDate.toDate()}
              toDate={state.selectedToDate.toDate()}
              onFromDateChange={onFromDateChange}
              onToDateChange={onToDateChange}
              pickerType="date"
            />
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
                  <FormControlLabel value="Daily" control={<Radio />} label="Daily Overtime" />
                  <FormControlLabel value="Monthly" control={<Radio />} label="Monthly Overtime" />
                </RadioGroup>
              </FormControl>

              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <DateRangeSelector
                    fromDate={state.selectedFromDate.toDate()}
                    toDate={state.selectedToDate.toDate()}
                    onFromDateChange={handleDateChangeForReport}
                    onToDateChange={handleDateChangeForReport}
                    pickerType={state.reportView === 'Daily' ? 'date' : 'month'}
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

          <Grid item xs={12}>
            <Paper variant="outlined" className={classes.paper}>
              {(((state.vwid === 1) || (state.vwid === 2) || (state.vwid === 5) || (state.vwid === 6) || (state.vwid === 7) || (state.vwid === 8) || (state.vwid === 10)) && (state.dirListItems.length > 0)) && (
                <OvertimeRequestsTable
                  data={state.dirListItems as IOvertimeRequest[]}
                  onViewAction={viewAction}
                />
              )}

              {(((state.vwid === 3) || (state.vwid === 4) || (state.vwid === 9)) && (state.dirListItems.length > 0)) && (
                <OvertimeDetailsTable
                  data={state.dirListItems as IOvertimeDetail[]}
                  onViewAction={viewAction2}
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