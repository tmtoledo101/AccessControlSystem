import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { IViewVisitorsProps } from './IViewVisitorsProps';
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
import VisitorRequestsTable from './common/VisitorRequestsTable';
import VisitorDetailsTable from './common/VisitorDetailsTable';
import ActionButtons from './common/ActionButtons';

// Import services
import SharePointService from './services/SharePointService';

// Import utils
import { setCookie, getCookie } from './utils/helper';
import { IVisitor, IVisitorDetail, IUserDept, IViewState } from './interfaces/IViewVisitors';

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
    tabvalue: 6
  });

  // Event handlers
  const onClickCancel = (e) => {
    window.open(props.siteUrl, "_self");
  };

  const handleTabChange = (event, newValue) => {
    let from = moment(new Date()).subtract(15, 'days');
    let to = moment(new Date()).endOf('day');
    
    setState(prevState => ({
      ...prevState,
      selectedFromDate: from,
      selectedToDate: to,
      tabvalue: newValue
    }));
    
    setCookie('ViewVisitorTab', event.target.textContent, 1800);
    
    if (event.target.textContent === 'By Request') {
      if (state.isEncoder || state.isApprover || state.isWalkinApprover) {
        mapUser(from, to, 1);
      } else if (state.isReceptionist || state.isSSDUser) {
        mapUser(from, to, 2);
      }
    } else if (event.target.textContent === 'By Visitor Details') {
      from = moment(new Date()).subtract(1, 'days');
      to = moment(new Date()).add(5, 'days');
      
      setState(prevState => ({
        ...prevState,
        selectedFromDate: from,
        selectedToDate: to
      }));
      
      if (state.isEncoder || state.isApprover || state.isWalkinApprover) {
        mapUser(from, to, 3);
      } else if (state.isReceptionist || state.isSSDUser) {
        mapUser(from, to, 4);
      }
    } else if (event.target.textContent === 'Search by Visitor Name') {
      if (state.isEncoder || state.isApprover || state.isWalkinApprover || state.isReceptionist || state.isSSDUser) {
        setState(prevState => ({
          ...prevState,
          dirListItems: [],
          vwid: 9
        }));
      }
    } else if (event.target.textContent === 'Dept. Approver') {
      if (state.isApprover) {
        mapUser(from, to, 5);
      } else if (state.isWalkinApprover) {
        mapUser(from, to, 7);
      }
    } else if ((event.target.textContent === 'SSD') && (state.isSSDUser)) {
      mapUser(from, to, 6);
    }
  };

  const onFromDateChange = (e) => {
    const newFromDate = moment(e).startOf('day');
    setState(prevState => ({
      ...prevState,
      selectedFromDate: newFromDate
    }));
    mapUser(newFromDate, state.selectedToDate, state.vwid);
  };

  const onToDateChange = (e) => {
    const newToDate = moment(e).endOf('day');
    setState(prevState => ({
      ...prevState,
      selectedToDate: newToDate
    }));
    mapUser(state.selectedFromDate, newToDate, state.vwid);
  };

  const handleChangeTxt = async (e) => {
    try {
      const searchText = e.target.value;
      setState(prevState => ({
        ...prevState,
        txtSearch: searchText
      }));

      if (searchText.length > 2) {
        const visitors = await SharePointService.searchVisitorsByName(searchText);
        
        if (state.isReceptionist || state.isSSDUser) {
          setState(prevState => ({
            ...prevState,
            dirListItems: visitors
          }));
        } else if (state.isEncoder || state.isApprover || state.isWalkinApprover) {
          let mappedrows = [];

          visitors.map(row => {
            let filtered = [];
            if (state.isEncoder) {
              filtered = usersPerDept.filter((item) => item.DeptId === row.DeptId);
            } else if (state.isApprover) {
              filtered = approversPerDept.filter((item) => item.DeptId === row.DeptId);
            } else if (state.isWalkinApprover) {
              filtered = walkinapprovers.filter((item) => item.DeptId === row.DeptId);
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
      } else if (searchText.length < 3) {
        setState(prevState => ({
          ...prevState,
          dirListItems: []
        }));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const viewAction = (event, rowData) => {
    window.open(props.siteUrl + "/SitePages/DisplayVisitorappge.aspx?pid=" + rowData["ID"], "_self");
  };

  const viewAction2 = (event, rowData) => {
    window.open(props.siteUrl + "/SitePages/DisplayVisitorappge.aspx?pid=" + rowData["ParentId"], "_self");
  };

  // Helper function to map users and load data
  async function mapUser(from, to, action) {
    if ((action == 1)) {
      const visitors = await SharePointService.loadVisitorRequests(from, to);
      let mappedrows = [];

      visitors.map(row => {
        let filtered = [];

        if (state.isEncoder) {
          filtered = usersPerDept.filter((item) => item.DeptId === row.DeptId);
        } else if (state.isApprover) {
          filtered = approversPerDept.filter((item) => item.DeptId === row.DeptId);
        } else if (state.isWalkinApprover) {
          filtered = walkinapprovers.filter((item) => item.DeptId === row.DeptId);
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
      const visitors = await SharePointService.loadVisitorRequests(from, to);
      setState(prevState => ({
        ...prevState,
        dirListItems: visitors,
        vwid: action
      }));
    } else if ((action == 3)) {
      const visitors = await SharePointService.loadVisitorDetails(from, to);
      let mappedrows = [];

      visitors.map(row => {
        let filtered = [];

        if (state.isEncoder) {
          filtered = usersPerDept.filter((item) => item.DeptId === row.DeptId);
        } else if (state.isApprover) {
          filtered = approversPerDept.filter((item) => item.DeptId === row.DeptId);
        } else if (state.isWalkinApprover) {
          filtered = walkinapprovers.filter((item) => item.DeptId === row.DeptId);
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
      const visitors = await SharePointService.loadVisitorDetails(from, to);
      setState(prevState => ({
        ...prevState,
        dirListItems: visitors,
        vwid: action
      }));
    } else if ((action == 5)) {
      const visitors = await SharePointService.loadVisitorRequests(from, to);
      let mappedrows = [];

      visitors.map(row => {
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
      const visitors = await SharePointService.loadVisitorRequests(from, to);
      let mappedrows = [];

      visitors.map(row => {
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
    } else if ((action == 7)) {
      const visitors = await SharePointService.loadVisitorRequests(from, to);
      let mappedrows = [];

      visitors.map(row => {
        let filtered = walkinapprovers.filter((item) => item.NameId === row.ApproverId);
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
    } else {
      alert("You are not authorized to access this page!");
      window.open(props.siteUrl, "_self");
    }
  }

  // Initialize component
  useEffect(() => {
    console.log('loaded view visitors');
    
    (async () => {
      try {
        // Get current user
        user = await SharePointService.getCurrentUser();
        
        // Get user groups
        const groups = await SharePointService.getCurrentUserGroups();
        
        // Get default date range
        const from = state.selectedFromDate;
        const to = state.selectedToDate;

        // Get users per department
        usersPerDept = await SharePointService.getUsersPerDept(user.Id);
        
        setState(prevState => ({
          ...prevState,
          viewName: "Visitor Views"
        }));
        
        if (usersPerDept.length > 0) {
          setState(prevState => ({
            ...prevState,
            isEncoder: true
          }));
        }

        // Get approvers
        approversPerDept = await SharePointService.getApprovers(user.Id);
        
        if (approversPerDept.length > 0) {
          setState(prevState => ({
            ...prevState,
            isApprover: true
          }));
        }

        // Check if user is in Receptionist group
        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === Receptionist_Group) {
            setState(prevState => ({
              ...prevState,
              isReceptionist: true
            }));
            break;
          }
        }
        
        // Check if user is in SSD group
        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === SSD_Group) {
            setState(prevState => ({
              ...prevState,
              isSSDUser: true
            }));
            break;
          }
        }

        // Get walkin approvers
        walkinapprovers = await SharePointService.getWalkinApprovers(user.Id);
        
        if (walkinapprovers.length > 0) {
          setState(prevState => ({
            ...prevState,
            isWalkinApprover: true,
            WalkinApprovers: walkinapprovers
          }));
        }

        // Set up tabs based on user roles
        let temptabs = [];
        
        if (state.isEncoder || state.isReceptionist || state.isSSDUser || state.isApprover || state.isWalkinApprover) {
          temptabs = ['By Request', 'By Visitor Details', 'Search by Visitor Name'];
        }
        
        if (state.isApprover || state.isWalkinApprover) {
          temptabs.push('Dept. Approver');
        }
        
        if (state.isSSDUser) {
          temptabs.push('SSD');
        }
        
        setState(prevState => ({
          ...prevState,
          menuTabs: temptabs
        }));

        // Check for saved tab in cookie
        const cookietab = getCookie('ViewVisitorTab');
        
        if (cookietab) {
          const index = temptabs.indexOf(cookietab);
          setState(prevState => ({
            ...prevState,
            tabvalue: index
          }));
          
          const oev = { target: { textContent: cookietab } };
          handleTabChange(oev, index);
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
            <>
              <Grid item xs={12} sm={6}>
                <DateRangeSelector 
                  fromDate={state.selectedFromDate}
                  toDate={state.selectedToDate}
                  onFromDateChange={onFromDateChange}
                  onToDateChange={onToDateChange}
                />
              </Grid>
            </>
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
                <VisitorRequestsTable 
                  data={state.dirListItems} 
                  onViewAction={viewAction} 
                />
              )}
              
              {(((state.vwid === 3) || (state.vwid === 4) || (state.vwid === 9)) && (state.dirListItems.length > 0)) && (
                <VisitorDetailsTable 
                  data={state.dirListItems} 
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
