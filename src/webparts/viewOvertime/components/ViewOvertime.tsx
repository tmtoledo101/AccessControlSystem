import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { IViewOvertimeProps } from './IViewOvertimeProps';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
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

// Import services
import SharePointService from './services/SharePointService';

// Import utils
import { setCookie, getCookie } from './utils/helper';
import { IOvertimeRequest, IOvertimeDetail, IUserDept, IViewState } from './interfaces/IViewOvertime';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(1),
      borderColor: "transparent",
    }
  }),
);

// Constants
const Encoders_Group = "Encoders";
const Receptionist_Group = "Receptionist";
const SSD_Group = "SSD";
const WalkinApprover_Group = "WalkinApprover";

// Global variables
let usersPerDept: IUserDept[] = [];
let approversPerDept: IUserDept[] = [];
let walkinapprovers: IUserDept[] = [];
let user = null;
let isencoder = false;
let isapprover = false;
let iswalkinapprover = false;
let isreceptionist = false;
let isssduser = false;

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
    tabvalue: -1
  });

  // Event handlers
  const onClickCancel = (e) => {
    window.open(props.siteUrl, "_self");
  };

  const handleTabChange = (event, newValue) => {
    const tabContent = event.target.textContent;
    let from = moment(new Date()).subtract(15, 'days');
    let to = moment(new Date()).endOf('day');
    
    setCookie('ViewOverTimeTab', tabContent, 1800);
    
    // First update the state with new dates and tab value
    setState(prevState => {
      const newState = {
        ...prevState,
        selectedFromDate: from,
        selectedToDate: to,
        tabvalue: newValue
      };
      
      // For employee details tab, adjust the date range
      if (tabContent === 'By Employee Details') {
        newState.selectedFromDate = moment(new Date()).subtract(1, 'days');
        newState.selectedToDate = moment(new Date()).add(5, 'days');
        from = newState.selectedFromDate;
        to = newState.selectedToDate;
      }
      
      // For search by employee name, clear the list and set vwid
      if (tabContent === 'Search by Employee Name') {
        if (isencoder || isapprover || isreceptionist || isssduser) {
          newState.dirListItems = [];
          newState.vwid = 9;
        }
      }
      
      return newState;
    });
    
    // Use setTimeout to ensure state has been updated before calling mapUser
    setTimeout(() => {
      if (tabContent === 'By Request') {
        if (isencoder || isapprover) {
          mapUser(from, to, 1);
        } else if (isreceptionist || isssduser) {
          mapUser(from, to, 2);
        }
      } else if (tabContent === 'By Employee Details') {
        if (isencoder || isapprover) {
          mapUser(from, to, 3);
        } else if (isreceptionist || isssduser) {
          mapUser(from, to, 4);
        }
      } else if ((tabContent === 'Dept. Approver') && (isapprover)) {
        mapUser(from, to, 5);
      } else if ((tabContent === 'SSD') && (isssduser)) {
        mapUser(from, to, 6);
      }
    }, 0);
  };

  const onFromDateChange = (e) => {
    const newFromDate = moment(e).startOf('day');
    
    setState(prevState => {
      const newState = {
        ...prevState,
        selectedFromDate: newFromDate
      };
      
      setTimeout(() => {
        mapUser(newFromDate, prevState.selectedToDate, prevState.vwid);
      }, 0);
      
      return newState;
    });
  };

  const onToDateChange = (e) => {
    const newToDate = moment(e).endOf('day');
    
    setState(prevState => {
      const newState = {
        ...prevState,
        selectedToDate: newToDate
      };
      
      setTimeout(() => {
        mapUser(prevState.selectedFromDate, newToDate, prevState.vwid);
      }, 0);
      
      return newState;
    });
  };

  const handleChangeTxt = async (e) => {
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
        
        if (isreceptionist || isssduser) {
          setState(prevState => ({
            ...prevState,
            dirListItems: overtimeDetails
          }));
        } else if (isencoder || isapprover) {
          let mappedrows = [];

          overtimeDetails.map(row => {
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

  const viewAction = (event, rowData) => {
    window.open(props.siteUrl + "/SitePages/DisplayOvertimeappge.aspx?pid=" + rowData["ID"], "_self");
  };

  const viewAction2 = (event, rowData) => {
    window.open(props.siteUrl + "/SitePages/DisplayOvertimeappge.aspx?pid=" + rowData["ParentId"], "_self");
  };

  // Helper function to map users and load data
  async function mapUser(from, to, action) {
    if ((action == 1)) {
      const overtimeRequests = await SharePointService.loadOvertimeRequests(from, to);
      let mappedrows = [];

      overtimeRequests.map(row => {
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
        dirListItems: mappedrows,
        vwid: action
      }));
    } else if ((action == 2)) {
      const overtimeRequests = await SharePointService.loadOvertimeRequests(from, to);
      setState(prevState => ({
        ...prevState,
        dirListItems: overtimeRequests,
        vwid: action
      }));
    } else if ((action == 3)) {
      const overtimeDetails = await SharePointService.loadOvertimeDetails(from, to);
      let mappedrows = [];

      overtimeDetails.map(row => {
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
        dirListItems: mappedrows,
        vwid: action
      }));
    } else if ((action == 4)) {
      const overtimeDetails = await SharePointService.loadOvertimeDetails(from, to);
      setState(prevState => ({
        ...prevState,
        dirListItems: overtimeDetails,
        vwid: action
      }));
    } else if ((action == 5)) {
      const overtimeRequests = await SharePointService.loadOvertimeRequests(from, to);
      let mappedrows = [];

      overtimeRequests.map(row => {
        let filtered = approversPerDept.filter((item) => item.NameId === row.ApproverId);
        let isvalid = false;

        if ((row.StatusId == 2)) {
          isvalid = true;
        }
        
        if ((filtered.length > 0) && (isvalid)) {
          mappedrows.push(row);
        }
      });
      
      setState(prevState => ({
        ...prevState,
        dirListItems: mappedrows,
        vwid: action
      }));
    } else if ((action == 6)) {
      const overtimeRequests = await SharePointService.loadOvertimeRequests(from, to);
      let mappedrows = [];

      overtimeRequests.map(row => {
        let isvalid = false;
        
        if ((row.StatusId == 3)) {
          isvalid = true;
        }
        
        if ((isvalid)) {
          mappedrows.push(row);
        }
      });
      
      setState(prevState => ({
        ...prevState,
        dirListItems: mappedrows,
        vwid: action
      }));
    } else {
      alert("You are not authorized to access this page!");
      window.open(props.siteUrl, "_self");
    }
  }

  // Initialize component
  useEffect(() => {
    (async () => {
      try {
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
        
        // Set up tabs based on user roles
        let temptabs = [];
        
        if (isEncoder || isReceptionist || isSSDUser || isApprover) {
          temptabs = ['By Request', 'By Employee Details', 'Search by Employee Name'];
        }
        
        if (isApprover) {
          temptabs.push('Dept. Approver');
        }
        
        if (isSSDUser) {
          temptabs.push('SSD');
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
          
          setTimeout(() => {
            setState(prevState => ({
              ...prevState,
              tabvalue: index
            }));
            
            const oev = { target: { textContent: cookietab } };
            handleTabChange(oev, index);
          }, 0);
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

          {((state.vwid != 9) && (state.vwid != 0)) && (
            <DateRangeSelector 
              fromDate={state.selectedFromDate}
              toDate={state.selectedToDate}
              onFromDateChange={onFromDateChange}
              onToDateChange={onToDateChange}
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

          <Grid item xs={12}>
            <Paper variant="outlined" className={classes.paper}>
              {(((state.vwid === 1) || (state.vwid === 2) || (state.vwid === 5) || (state.vwid === 6) || (state.vwid === 7) || (state.vwid === 8)) && (state.dirListItems.length > 0)) && (
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
