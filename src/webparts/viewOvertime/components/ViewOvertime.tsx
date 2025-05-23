import * as React from 'react';

//import fetch from 'cross-fetch';
import { useState, useEffect, useCallback, Component, useRef, Fragment } from 'react';
import { IViewOvertimeProps } from './IViewOvertimeProps';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import MaterialTable from "material-table";
import EditIcon from '@material-ui/icons/Edit';
import EventIcon from '@material-ui/icons/Event';
import DateFnsUtils from '@date-io/date-fns';
import 'date-fns';
import { MuiPickersUtilsProvider, DatePicker, KeyboardDatePicker } from "@material-ui/pickers";
import CircularProgress from '@material-ui/core/CircularProgress';
import Backdrop from '@material-ui/core/Backdrop';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Snackbar from '@material-ui/core/Snackbar';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';

// temporary changed -- import * as moment from 'moment';
import moment from 'moment';

import { makeStyles, createStyles, Theme, styled } from '@material-ui/core/styles';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';


//import * as pnp from 'sp-pnp-js';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

import "@pnp/sp/files";
import "@pnp/sp/folders";
import { IItemAddResult } from "@pnp/sp/items";
import "@pnp/sp/folders";
import "@pnp/sp/site-users/web";
import "@pnp/sp/fields";
import "@pnp/sp/regional-settings/web";
import "@pnp/sp/site-groups";
import { ConsoleListener } from '@pnp/logging';

import Fab from '@material-ui/core/Fab';
import PageviewIcon from '@material-ui/icons/Pageview';
import VisibilityIcon from '@material-ui/icons/Visibility';
import fil from 'date-fns/esm/locale/fil/index.js';
import { TrainRounded } from '@material-ui/icons';


//import styles from './Display1.module.scss';

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,

    },
    root2: {
      padding: theme.spacing(1),
    },

    floatingbutton: {
      padding: theme.spacing(1),
      //textAlign: 'center',
      //color: theme.palette.text.secondary,
      borderColor: "transparent",

    },
    paper: {
      padding: theme.spacing(1),
      //textAlign: 'center',
      //color: theme.palette.text.secondary,
      borderColor: "transparent",

    },
    paperbutton: {
      textTransform: "none",
      margin: "5px",
      // marginLeft: theme.spacing(1),
      // marginRight: theme.spacing(1),
    },
    tabbar: {
      textTransform: "none",
      textAlign: 'left'
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 300,

    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
    previewChip: {
      minWidth: 160,
      maxWidth: 210
    },
    dropZone: {
      height: 50,

      //fullWidth: 'false',
    },
    extendedIcon: {
      marginRight: theme.spacing(1),
    },

  }),
);


var _deptId = "";
var isssduser = false;
var isapprover = false;
var iswalkinapprover = false;
var isencoder = false;
var isreceptionist = false;
var usersPerDept = [];
var approversPerDept = [];
var walkinapprovers = [];
let user = null;


function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export default function Approval(props: IViewOvertimeProps) {

  const inputRef = useRef();
  const classes = useStyles();
  const Encoders_Group = "Encoders";
  const Receptionist_Group = "Receptionist";
  const SSD_Group = "SSD";
  const WalkinApprover_Group = "WalkinApprover";
  const [selectedFromDate, handleFromDateChange] = useState(moment(new Date()).subtract(15, 'days'));
  const [selectedToDate, handleToDateChange] = useState(moment(new Date()).endOf('day'));
  const [selectedAgendaDate, handleAgendaDateChange] = useState(new Date());
  const [inputSubject, setSubject] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [txtSearch, settxtSearch] = useState("");
  const [menuTabs, setTabs] = useState([]);
  const [isEncoder, setEncoder] = useState(false);
  const [isApprover, setApprover] = useState(false);
  const [isWalkinApprover, setWalkinApprover] = useState(false);
  const [isReceptionist, setReceptionist] = useState(false);
  const [isSSDUser, setSSDUser] = useState(false);
  const [isUser, setUser] = useState(false);
  //const [vwid, setViewId] = useState(  getUrlParameter('vwid') ?  parseInt(getUrlParameter('vwid'))  :  0);
  const [vwid, setViewId] = useState(0);
  const [WalkinApprovers, setWalkinApprovers] = useState([]);

  const [dirListItems, setDirs] = useState([]);

  const [selectedItems, setSelectedItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSavingDone, setSavingDone] = useState(false);
  const [isProgress, setProgress] = useState(false);
  const [errorFields, setError] = useState(
    { Date: '', Subject: '' }
  );
  const [viewName, setViewName] = useState('');


  const onClickCancel = (e) => {

    window.open(props.siteUrl, "_self");

  };

  const [tabvalue, settabValue] = React.useState(-1);

  const handletabChange = (event, newValue) => {
    let from = moment(new Date()).subtract(15, 'days');
    let to = moment(new Date()).endOf('day');
    handleFromDateChange(moment(new Date()).subtract(15, 'days'));
    handleToDateChange(moment(new Date()).endOf('day'));
    settabValue(newValue);
    setCookie('ViewOverTimeTab', event.target.textContent, 1800);


    if (event.target.textContent === 'By Request') {

      if (isencoder || isapprover) {
        mapUser(from, to, 1);
        setViewId(1);


      } else if (isreceptionist || isssduser) {

        mapUser(from, to, 2);
        setViewId(2);

      }

    } else if (event.target.textContent === 'By Employee Details') {
      handleFromDateChange(moment(new Date()).subtract(1, 'days'));
      handleToDateChange(moment(new Date()).add(5, 'days'));
      from = moment(new Date()).subtract(1, 'days');
      to = moment(new Date()).add(5, 'days');
      if (isencoder || isapprover) {
        mapUser(from, to, 3);
        setViewId(3);


      } else if (isreceptionist || isssduser) {

        mapUser(from, to, 4);
        setViewId(4);

      }
    } else if (event.target.textContent === 'Search by Employee Name') {
      if (isencoder || isapprover || isreceptionist || isssduser ) {

        setDirs([]);
        setViewId(9);
      }
    } else if ((event.target.textContent === 'Dept. Approver') && (isapprover)) {
      mapUser(from, to, 5);
      setViewId(5);

    } else if ((event.target.textContent === 'SSD') && (isssduser)) {
      mapUser(from, to, 6);
      setViewId(6);

    }





  };
  async function loadDirs(from: Date, to) {
    try {

      let visitors = await sp.web.lists.getByTitle("Overtime")
        .items
        .select("*,Approver/Title,Approver/EMail, Status/Title,Dept/Title,SSDApprover/Title,Author/Title,Author/EMail")
        .expand('Approver,Dept,Status,SSDApprover,Author').top(5000)
        .orderBy("Modified", false)
        .filter(`Modified ge '${from.toISOString()}' and Modified le '${to.toISOString()}'`)
        .get();

      return visitors;

    } catch (e) {
      console.log(e);
      alert('There was an error encountered while retreiving data.');

    }

  }
  async function loadDetails(from: Date, to) {
    try {

      let visitors = await sp.web.lists.getByTitle("OvertimeDetails")
        .items
        .select("*, Status/Title,Dept/Title,Author/Title,Author/EMail")
        .expand('Dept,Status,Author').top(5000)
        .orderBy("Modified", false)
        .filter(`TimeFrom ge '${from.toISOString()}' and TimeFrom le '${to.toISOString()}'`)
        .get();

      return visitors;

    } catch (e) {
      console.log(e);
      alert('There was an error encountered while retreiving data.');

    }

  }

  const onFromDateChange = (e) => {

    handleFromDateChange(moment(e).startOf('day'));
    mapUser(moment(e).startOf('day'), selectedToDate, vwid);
  };
  const onToDateChange = (e) => {
    
    handleToDateChange(moment(e).endOf('day'));
    mapUser(selectedFromDate, moment(e).endOf('day'), vwid);
  };
  const handleChangeTxt = async (e) => {
    try {

      settxtSearch(e.target.value);
      if (e.target.value.length > 2) {
        let visitors = await sp.web.lists.getByTitle("OvertimeDetails")
          .items
          .select("*, Status/Title,Dept/Title,Author/Title,Author/EMail")
          .expand('Dept,Status,Author').top(5000)
          .orderBy("Modified", false)
          .filter(`substringof('${e.target.value}', Title) `)
          .get();
        if (isreceptionist || isssduser) {
          setDirs(visitors);
        } else if (isencoder || isapprover) {
          let mappedrows = [];


          visitors.map(row => {
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
          setDirs(mappedrows);

        }
      } else if (e.target.value.length < 3) {
        setDirs([]);
      }

    } catch (e) {
      console.log(e);
    }



  };


  const theme = {
    spacing: 8,
  };

  async function mapUser(from, to, action) {


    if ((action == 1)) {

      let visitors = await loadDirs(from, to);
      let mappedrows = [];

      visitors.map(row => {
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
      setDirs(mappedrows);


    } else if ((action == 2)) {
      let visitors = await loadDirs(from, to);
      setDirs(visitors);
    } else if ((action == 3)) {
      let visitors = await loadDetails(from, to);
      let mappedrows = [];

      visitors.map(row => {

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

      setDirs(mappedrows);
    } else if ((action == 4)) {
      let visitors = await loadDetails(from, to);
      setDirs(visitors);

    } else if ((action == 5)) {
      let visitors = await loadDirs(from, to);
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
      setDirs(mappedrows);
    } else if ((action == 6)) {
      let visitors = await loadDirs(from, to);
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
      setDirs(mappedrows);

    } else {

      alert("You are not authorized to access this page!");
      window.open(props.siteUrl, "_self");
    }


  }
  useEffect(() => {  //initialize loading, load data once.

    // let d = new Date();
    // d.setMonth(d.getMonth() - 1);
    // let d  = Date.parse( moment().subtract(10, 'days').calendar());
    // handleFromDateChange(d);
    //let d = selectedFromDate;
    (async () => {

      try {
        /*
        if (getCookie('chkurl') != window.location.href) {
          setCookie('chkurl', window.location.href, 1800);
            window.open(window.location.href, "_self");
        }*/

        setViewName("Overtime / Overstay Views");
        user = await sp.web.currentUser();
        let groups = await sp.web.currentUser.groups();


        usersPerDept = await sp.web.lists.getByTitle("UsersPerDept").items.select("*,Name/Title,Dept/Title").expand('Name,Dept').top(5000).orderBy("Modified", true).filter("NameId eq " + user.Id).get();

        if (usersPerDept.length > 0) {
          setEncoder(true);
          isencoder = true;

        }

        approversPerDept = await sp.web.lists.getByTitle("Approvers")
          .items
          .select("*,Name/Title, Dept/Title")
          .expand('Name,Dept').top(5000)
          .filter(`NameId eq ${user.Id}`)
          .get();

        if (approversPerDept.length > 0) {

          isapprover = true;
          setApprover(true);


        }



        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === Receptionist_Group) {
            setReceptionist(true);
            isreceptionist = true;


            break;
          }
        }
        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === SSD_Group) {
            isssduser = true;
            setSSDUser(true);
            break;
          }

        }
        let temptabs = [];
        if (isencoder || isreceptionist || isssduser || isapprover ) {
          temptabs = ['By Request', 'By Employee Details', 'Search by Employee Name'];
        }
        if (isapprover ) {
          temptabs.push('Dept. Approver');
        }
        if (isssduser) {
          temptabs.push('SSD');
        }
        setTabs(temptabs);
        /*
        if ((vwid === 5)) {
          settabValue(3);
          mapUser(selectedFromDate, selectedToDate, vwid);
        } else if ((vwid === 6)) {
          settabValue(4);
          mapUser(selectedFromDate, selectedToDate, vwid);
        }*/
        // setCookie('ViewOverTimeTab',2,2000);




        let cookietab = getCookie('ViewOverTimeTab');

        if (cookietab) {
          let index = temptabs.indexOf(cookietab);
          settabValue(index);
          let oev = { target: { textContent: cookietab } };
          handletabChange(oev, index);

        }







      } catch (e) {
        console.log(e);
      }


    })();


  }, []);



  function ViewAction(event, rowData) {


    window.open(props.siteUrl + "/SitePages/DisplayOvertimeappge.aspx?pid=" + rowData["ID"], "_self");




  }
  function ViewAction2(event, rowData) {


    window.open(props.siteUrl + "/SitePages/DisplayOvertimeappge.aspx?pid=" + rowData["ParentId"], "_self");




  }

  function customDateRender(value, renderType, field, format) {
    let dt = null;

    if (renderType === 'row') {
      if (moment(value[field]).isValid()) {
        dt = moment(value[field]).format(format);
      }
      return dt;
    }
    if (renderType === 'group') {
      if (moment(value).isValid()) {
        dt = moment(value).format(format);
      }
      return dt;
    }
  }

  return (
    <form noValidate autoComplete="off">

      <div className={classes.root} style={{ padding: '12px' }}>
        <Grid container spacing={1}>

          <Grid item xs={12}>
            <Paper variant="outlined" className={classes.paper}>
              <Box style={{ fontSize: "1.5rem" }} >
                {viewName}
              </Box>

            </Paper>
          </Grid>
          <Grid item xs={12}>

            <Paper square className={classes.paper}>
              <AppBar position="static" color="default"  >

                <Tabs
                  value={tabvalue}
                  indicatorColor="primary"
                  textColor="primary"
                  onChange={handletabChange}
                  aria-label="tabs example"
                  variant="scrollable"
                  scrollButtons="auto"                >
                  {menuTabs.map((item) => (

                    <Tab label={item} className={classes.tabbar} />
                  ))}

                </Tabs>
              </AppBar>

            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            {((vwid != 9) && (vwid != 0)) && <span>
              <Paper variant="outlined" className={classes.paper}>

                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <DatePicker
                    //disableFuture
                    format="MM/dd/yyyy"
                    label="From"
                    value={selectedFromDate}
                    onChange={onFromDateChange}
                    name='fromdate'
                  //autoOk
                  />
                </MuiPickersUtilsProvider>
              </Paper>
            </span>}
          </Grid>
          <Grid item xs={12} sm={6}>
            {((vwid != 9) && (vwid != 0)) && <span>
              <Paper variant="outlined" className={classes.paper}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <DatePicker

                    format="MM/dd/yyyy"
                    label="To"
                    value={selectedToDate}
                    onChange={onToDateChange}
                    name='todate'

                  //autoOk

                  />
                </MuiPickersUtilsProvider>

              </Paper>
            </span>}
          </Grid>


          <Grid item xs={12} sm={12}>
            {((vwid === 9)) && <span>
              <Paper variant="outlined" className={classes.paper}>
                <TextField
                  inputProps={{ maxLength: 255 }}
                  label="Input Employee Name" name="Title" onChange={handleChangeTxt} value={txtSearch}
                  variant="standard" className={classes.textField}
                />

              </Paper>
            </span>}
          </Grid>



          <Grid item xs={12} >
            <Paper variant="outlined" className={classes.paper}>

              {(((vwid === 1) || (vwid === 2) || (vwid === 5) || (vwid === 6) || (vwid === 7) || (vwid === 8)) && (dirListItems.length > 0)) &&
                <div >
                  <MaterialTable

                    title="Requests"
                    columns={[
                      {
                        title: 'Request Date', field: "RequestDate", type: 'date',defaultSort: 'desc',                        
                        render: (value, renderType) => customDateRender(value, renderType, 'RequestDate', 'MM/DD/yyyy')

                      },
                      { title: 'Requesting Dept.', field: "Dept.Title", },
                      { title: 'Reference No.', field: 'Title' },
                      {
                        title: 'OT/Overstay From', field: "DateFrom", type: 'date',                        
                        render: (value, renderType) => customDateRender(value, renderType, 'DateFrom', 'MM/DD/yyyy')

                      },
                      {
                        title: 'OT/Overstay To', field: "DateTo", type: 'date',                       
                        render: (value, renderType) => customDateRender(value, renderType, 'DateTo', 'MM/DD/yyyy')

                      },
                      { title: 'Purpose', field: 'Purpose' },
                      { title: 'Status', field: "Status.Title" },

                    ]}
                    data={dirListItems}

                    options={{
                      filtering: true,
                      pageSize: 5,
                      pageSizeOptions: [5, 10, dirListItems.length],
                      search: false,
                      grouping: true,
                      selection: false
                    }}

                    actions={[

                      {
                        icon: () => <VisibilityIcon />,
                        tooltip: 'View Record',
                        onClick: (event, rowData) => { ViewAction('view', rowData); }
                      },

                    ]}

                  />

                </div>
              }
              {(((vwid === 3) || (vwid === 4) || (vwid === 9)) && (dirListItems.length > 0)) &&
                <div >
                  <MaterialTable

                    title="Employees"
                    columns={[
                      {
                        title: 'Request Date', field: "RequestDate", type: 'date',defaultSort: 'desc',
                        render: (value, renderType) => customDateRender(value, renderType, 'RequestDate', 'MM/DD/yyyy')

                      },
                      { title: 'Requesting Dept.', field: "Dept.Title", },
                      { title: 'Reference No.', field: 'RefNo' },

                      {
                        title: 'OT/Overstay From', field: "TimeFrom", type: 'date',                        
                        render: (value, renderType) => customDateRender(value, renderType, 'TimeFrom', 'MM/DD/yyyy HH:mm:ss')

                      },
                      {
                        title: 'OT/Overstay To', field: "TimeTo", type: 'date',
                        render: (value, renderType) => customDateRender(value, renderType, 'TimeTo', 'MM/DD/yyyy HH:mm:ss')

                      },
                      { title: "Name", field: 'Title' },
                      { title: "Personnel Type", field: 'Etype' },
                      {
                        title: 'Others', field: "OtherSource",
                        render: rowData => <span>{rowData.OtherSource ? rowData.OtherSource : null}</span>
                      },

                    ]}
                    data={dirListItems}

                    options={{
                      filtering: true,
                      pageSize: 5,
                      pageSizeOptions: [5, 10, dirListItems.length],
                      search: false,
                      grouping: true,
                      selection: false
                    }}

                    actions={[

                      {
                        icon: () => <VisibilityIcon />,
                        tooltip: 'View Record',
                        onClick: (event, rowData) => { ViewAction2('view', rowData); }
                      },

                    ]}

                  />

                </div>
              }

            </Paper>
          </Grid>


          < Grid container justify="flex-end" >
            {/* <Paper variant="outlined" className={classes.paper}> */}
            <ButtonGroup >


              <Button className={classes.paperbutton} variant="contained" color="default" onClick={onClickCancel}>
                Close
              </Button>
            </ButtonGroup>
            {/*  </Paper> */}
          </Grid>




        </Grid>

      </div>

    </form >
  );

}
