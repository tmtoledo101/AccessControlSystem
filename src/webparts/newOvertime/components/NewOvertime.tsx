import * as React from 'react';
import $ from 'jquery';
//import styles from './NewVisitor.module.scss';
//import fetch from 'cross-fetch';
import { ISPHttpClientOptions, SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { useState, useEffect, useCallback, Component, useRef } from 'react';
import { INewOvertimeProps } from './INewOvertimeProps';
import Box from '@material-ui/core/Box';
import { escape } from '@microsoft/sp-lodash-subset';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import SendIcon from '@material-ui/icons/Send';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import ButtonGroup from '@material-ui/core/ButtonGroup';

import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';

import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';

import CircularProgress from '@material-ui/core/CircularProgress';
import Backdrop from '@material-ui/core/Backdrop';
import MaterialTable from "material-table";

import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, DatePicker, DateTimePicker, TimePicker } from "@material-ui/pickers";
import 'date-fns';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { makeStyles, createStyles, Theme, styled } from '@material-ui/core/styles';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import MenuItem from '@material-ui/core/MenuItem';
import { DropzoneArea } from 'material-ui-dropzone';
import { DropzoneDialog } from 'material-ui-dropzone';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Fab from '@material-ui/core/Fab';
import VisibilityIcon from '@material-ui/icons/Visibility';

import AddIcon from '@material-ui/icons/Add';


//import * as pnp from 'sp-pnp-js';
import { sp } from "@pnp/sp";
import "@pnp/sp/profiles";
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
import { ConsoleListener } from '@pnp/logging';
import "@pnp/sp/sputilities";
import { IEmailProperties } from "@pnp/sp/sputilities";
import "@pnp/sp/site-groups";


// temporary changed -- import * as moment from 'moment';
import moment from 'moment';
import vi from 'date-fns/esm/locale/vi/index.js';

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

//import { BasePeoplePicker } from 'office-ui-fabric-react';


//import styles from './Display1.module.scss';

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
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
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 300,

    },
    dateField: {

      width: 300,

    },
    datelabel: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    labeltop: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      fontSize: '12px',
      color: '#0000008A',

    },
    labelbottom: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      fontSize: '18px',
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
    previewChip: {
      minWidth: 160,
      maxWidth: 210
    },
    floatingbutton: {
      padding: theme.spacing(1),
      //textAlign: 'center',
      //color: theme.palette.text.secondary,
      borderColor: "transparent",

    },



  }),
);
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};
var _idx = -1;
var _deptName = "";
var _purpose = "";
var _user;
var _itemId = 0;
var _submit = 1;
var _refno = "";

export default function Approval(props: INewOvertimeProps) {




  const inputRef = useRef();
  const classes = useStyles();
  const Encoders_Group = "Encoders";
  const Receptionist_Group = "Receptionist";


  const [openDialog, setOpenDialog] = useState(false);
  const [approverDetails, setApproverDetails] = useState({ email: '', name: '' });
  const [isSavingDone, setSavingDone] = useState(false);
  const [isProgress, setProgress] = useState(false);
  const [selectedDate, handleDateChange] = useState(new Date());
  const [dialogMessage, setDialogMessage] = useState("");
  const [selectedResDate, setResDate] = useState(new Date());
  const [isEncoder, setEncoder] = useState(false);
  const [isReceptionist, setReceptionist] = useState(false);
  const [VisitorDetailsMode, setVisitorDetailsMode] = useState('add');
  const [WalkinApprovers, setWalkinApprovers] = useState([]);


  const [VisitorDetailsFiles, setVisitorDetailsFiles] = useState([]);
  const [VisitorFiles, setVisitorFiles] = useState([]);
  const [idropzoneCounter, setDropzoneCounter] = useState(0);
  const [idropzoneCounter2, setDropzoneCounter2] = useState(0);


  const [inputFields, setInputs] = useState(
    {
      Purpose: '', DeptId: null, Bldg: '', Others: '',
      DateFrom: moment().startOf('day'), DateTo: moment().startOf('day'),
      Status: '', ApproverId: null, Files: []
    }
  );
  const [errorFields, setError] = useState(
    {
      Purpose: '', DeptId: '', Bldg: '', Others: '',
      DateFrom: '', DateTo: '',
      ApproverId: '', Details: ''
    }
  );
  const [visitorDetails, setVisitorDetails] = useState(
    {
      Title: '', TimeFrom: inputFields.DateFrom, TimeTo: inputFields.DateTo, OtherSource: '',
      EmpNo: '', Etype: 'BSP', ParentId: null
    }
  );
  const [visitorDetailsList, setVisitorDetailsList] = useState([]);


  const [errorDetails, setErrorDetails] = useState(
    {
      Title: '', TimeFrom: '', TimeTo: '', OtherSource: '',
      EmpNo: '', Etype: '', ParentId: ''
    }

  );
  const [isAC1Open, setAC1Open] = React.useState(false);
  const [purposeList, setPurpose] = useState([]);
  const [deptList, setDept] = useState([]);
  const [bldgList, setBldg] = useState([]);
  const [approverList, setApprovers] = useState([]);
  const [contactList, setContacts] = React.useState([]);


  const [OutsourceList, setOutsource] = React.useState([]);
  const [PersonnelTypeList, setPersonnel] = React.useState([]);
  const [usersPerDept, setUsersPerDept] = React.useState([]);
  const [openDialogFab, setOpenDialogFab] = useState(false);
  const [fullWidth, setFullWidth] = React.useState(true);
  const [maxWidth, setMaxWidth] = React.useState<DialogProps['maxWidth']>('md');


  const handleACSelectedValue = (event, value) => {

    //let contactsfiltered = contactList.filter((item) => item.EmpNo === value);

    const tempProps = { ...visitorDetails };
    if (value) {

      if (visitorDetails.Etype === 'BSP') {
        tempProps.EmpNo = value.EmpNo;
        tempProps.Title = value.Name;

      } else {
        tempProps.EmpNo = value.Id.toString();
        tempProps.Title = value.Title;
      }

      validateInputsDetails('EmpNo', tempProps.EmpNo);

    } else {

      tempProps.EmpNo = "";
      if (visitorDetails.Etype === 'BSP') {
        setContacts([]);
      } else {
        setOutsource([]);
      }
      validateInputsDetails('EmpNo', "");

    }
    setVisitorDetails(tempProps);






  };
  const capitalize = (name) => {
    return name[0].toUpperCase() + name.slice(1);
  };
  const sendEmail = async () => {
    let toEmail = [];
    let subject = "";
    let strbody = "";

    if (isEncoder) {
      toEmail.push(approverDetails.email);
      subject = `BSP ACCESS CONTROL SYSTEM : For Approval ${_refno} - ${inputFields.Purpose}`;
      strbody = `BSP Access Control System Request Notification.</br></br>Ref No.:${_refno}</br>Purpose:${inputFields.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${_itemId}">link</a>`;


    } else if (isReceptionist) {
      toEmail.push(approverDetails.email);
      subject = `BSP ACCESS CONTROL SYSTEM : For Confirmation ${_refno} - ${inputFields.Purpose}`;
      strbody = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${_refno}</br>Purpose:${inputFields.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${_itemId}">link</a>`;

      /*
      toEmail = SSDUsers.map(row => {
        return row.Email;
      });
      subject = "Access Control - For SSD";*/


    }


    const emailProps: IEmailProperties = {
      From: _user.Email,
      To: toEmail,
      //CC: ["user2@site.com", "user3@site.com"],
      //BCC: ["user4@site.com", "user5@site.com"],
      Subject: subject,
      Body: strbody,
      AdditionalHeaders: {
        "content-type": "text/html"
      }
    };

    await sp.utility.sendEmail(emailProps);

  };

  const findUser = async (e) => {
    //setFirstname(e.target.value);
    const tempProps = { ...visitorDetails };

    tempProps.EmpNo = "";
    tempProps.Title = "";
    setVisitorDetails(tempProps);
    if (e.target.value.length > 2) {

      //const url: string = props.siteUrl + `/_api/web/siteusers?$top=5000&$filter=substringof('${e.target.value}', Title) and PrincipalType%20eq%201`;
      //const response = await props.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
      //const result = await response.json();
      // let options =  $.map(result.value, function(obj) {
      //   return { Id: obj.Id, Title: obj.Title };    //replace Id to id and Title to text for select2 to accept
      // });

      if (visitorDetails.Etype === 'BSP') {
        let options = await sp.web.lists.getByTitle("Employees").items.select("*").top(5000).filter(`substringof('${e.target.value}', Name) and Dept eq '${_deptName}'`).get();
        setContacts(options);
      } else {
        let options = await sp.web.lists.getByTitle("Outsource").items.select("*,PersonnelType/Title,Dept/Title").expand('PersonnelType,Dept').top(5000).filter(`substringof('${e.target.value}', Title) and DeptId eq ${inputFields.DeptId} and PersonnelType/Title eq '${visitorDetails.OtherSource}'`).get();
        setOutsource(options);

      }



    } else if (e.target.value.length < 3) {
      if (visitorDetails.Etype === 'BSP') {
        setContacts([]);
      } else {
        setOutsource([]);
      }



    }
  };
  const addVisitor = async () => {


    if (VisitorDetailsMode === 'add') {

      setVisitorDetailsList([...visitorDetailsList, visitorDetails]);
      const tempProps = { ...errorFields };
      tempProps.Details = "";
      setError(tempProps);

    } else {
      const tempList = [...visitorDetailsList];
      tempList[_idx] = { ...visitorDetails };
      setVisitorDetailsList(tempList);

    }



  };

  const handleChangeTxt = (e) => {
    const { name, value } = e.target;
    const tempProps = { ...inputFields };

    tempProps[name] = value;

    setInputs(tempProps);
    validateInputs(name, value);

  };
  const handleChangeTxtDetails = (e) => {
    const { name, value } = e.target;
    const tempProps = { ...visitorDetails };


    tempProps[name] = value;
    if (name === 'Etype') {
      tempProps.EmpNo = '';
      tempProps.Title = '';
      setContacts([]);
      setOutsource([]);
    }
    setVisitorDetails(tempProps);
    validateInputsDetails(name, value);

  };

  const onDateTimeVisitChange = (e, name) => {
    const tempProps = { ...inputFields };
    tempProps[name] = moment(e).startOf('day');
    setInputs(tempProps);
    validateInputs(name, e);
    console.log(e);

  };
  const onTimeChange = (e, name) => {
    const tempProps = { ...visitorDetails };
    tempProps[name] = e;
    setVisitorDetails(tempProps);
    validateInputsDetails(name, e);
    console.log(e);

  };
  const handleChangeDropZone = (files) => {
    const tempProps = { ...inputFields };
    tempProps.Files = files;
    setInputs(tempProps);

  };
  const onClickFab = (e) => {
    console.log(e);
    if (e.currentTarget.id === 'addFab') {
      if (inputFields.DeptId) {
        setVisitorDetailsMode('add');
        const tempProps = { ...visitorDetails };
        tempProps.Title = '';
        tempProps.EmpNo = '';


        if (visitorDetailsList.length === 0) {
          tempProps.TimeFrom = inputFields.DateFrom;
          tempProps.TimeTo = inputFields.DateTo;
        } else {
          tempProps.TimeFrom =visitorDetailsList[visitorDetailsList.length-1].TimeFrom;
          tempProps.TimeTo = visitorDetailsList[visitorDetailsList.length-1].TimeTo;
          tempProps.Etype =  visitorDetailsList[visitorDetailsList.length-1].Etype;
          tempProps.OtherSource =  visitorDetailsList[visitorDetailsList.length-1].OtherSource;
        }




        setVisitorDetails(tempProps);
        setOpenDialogFab(true);
      } else {
        alert('Please select a department before adding employees!');
      }

    }
  };
  const handleCloseDialogFab = (e) => {


    if (e.target.innerText === "OK") {

      if (validateOnSubmitDetails()) {
        setOpenDialogFab(false);
        addVisitor();
      }
    } else {
      setOpenDialogFab(false);

    }


  };

  function validateInputs(name, value) {

    const tempProps = { ...errorFields };
    if (value.length === 0) {

      tempProps[name] = "This is a required input field";
      setError(tempProps);

    } else {
      if (name === "DateFrom") {
        if (value >  inputFields.DateTo) {
          tempProps[name] = "From Date should be earlier than To Date";
          setError(tempProps);
        } else {
          tempProps[name] = "";
          setError(tempProps);

        }

      } else if (name === "DateTo") {
        if (inputFields.DateFrom > value) {
          tempProps[name] = "From Date should be earlier than To Date";
          setError(tempProps);
        } else {
          tempProps[name] = "";
          setError(tempProps);

        }


      } else {
        tempProps[name] = "";
        setError(tempProps);

      }

      /*
      if ((name == "MBResNo") && (value.length > 2)) {
        find(value);
      }*/
    }




  }
  function validateInputsDetails(name, value) {

    const tempProps = { ...errorDetails };
    if (value.length === 0) {
      tempProps[name] = "This is a required input field";
      setErrorDetails(tempProps);
    } else {
      if (name === "TimeFrom") {
        if (value > visitorDetails.TimeTo) {
          tempProps[name] = "From Time should be earlier than To Time";
          setErrorDetails(tempProps);
        } else {
          tempProps[name] = "";
          setErrorDetails(tempProps);

        }

      } else if (name === "TimeTo") {
        if ( visitorDetails.TimeFrom > value) {
          tempProps[name] = "From Time should be earlier than To Time";
          setErrorDetails(tempProps);
        } else {
          tempProps[name] = "";
          setErrorDetails(tempProps);

        }


      } else {
        tempProps[name] = "";
        setErrorDetails(tempProps);
      }

    }
  }
  /*
  const createRequestNo = async (loc: string) => {

    let refno: string = '';
    const url: string = `${props.siteUrl}/_vti_bin/listdata.svc/Overtime/$count?$filter=substringof('${loc}-${moment(new Date()).format('YYYYMMDD')}',Title)`;

    let response = await fetch(url);
    let result = await response.json();
    let lastrefno = "" + (Number(result) + 1);
    var pad = "000";
    refno = loc + '-' + moment().format('YYYYMMDD') + '-' + pad.substring(0, pad.length - lastrefno.length) + lastrefno;

    return refno;
  };*/
  const createRequestNo = async (loc: string) => {
    let list = sp.web.lists.getByTitle("RefNoCount");
    let RefNoCount = await sp.web.lists.getByTitle("RefNoCount")
    .items
    .select("*")
     .top(5000)
    .filter(`Title eq 'Overtime'`)
    .get();
   let last = 0;
  
   if (RefNoCount.length > 0){

    let dt=  moment(RefNoCount[0].DateRef).endOf('day').toISOString();
    let dt2 = moment().endOf('day').toISOString();
       
    if (dt === dt2){
      last = parseInt(RefNoCount[0].LastNum) + 1;

      const iar = await list.items.getById(RefNoCount[0].ID).update({
        LastNum: last,
        DateRef: moment().endOf('day').toISOString()      

      });
      
    } else {
      last = 1;
      const iar = await list.items.getById(RefNoCount[0].ID).update({
        LastNum: last,
        DateRef: moment().endOf('day').toISOString()     

      });

    }

   }
    let refno: string = '';
    let lastrefno = "" + (Number(last));
    var pad = "000";
    refno = loc + '-' + moment().format('YYYYMMDD') + '-' + pad.substring(0, pad.length - lastrefno.length) + lastrefno;

    return refno;
  };
 
  function validateOnSubmit() {
    let isValid = false;
    const tempProps = { ...errorFields };


    let required = ["Purpose", "DeptId", "Bldg", "DateFrom", "DateTo"];

    if (inputFields.Purpose === "Others") {
      required.push('Others');
    }
    if (_submit === 2) {
      required.push('ApproverId');
    }
    let validbit = [];
    for (let i = 0; i < required.length; i++) {
      //alert(required[i]);
      if (required[i] === "DateFrom") {
        if (Date.parse( inputFields.DateFrom.toString()) > Date.parse( inputFields.DateTo.toString())) {
          tempProps[required[i]] = "From Date should be earlier than To Date";
          validbit.push(required[i]);

        }
      } else if (required[i] === "DateTo") {
        if (Date.parse(inputFields.DateFrom.toString()) > Date.parse(inputFields.DateTo.toString())) {
          tempProps[required[i]] = "From Date should be earlier than To Date";
          validbit.push(required[i]);
        }

      } else {
        if (!inputFields[required[i]]) {   // set error messages if invalid
          tempProps[required[i]] = "This is a required input field";
          validbit.push(required[i]);
        }
      }
    }
    if (visitorDetailsList.length === 0) {
      tempProps.Details = "Employee Details are required. Please add employees by clicking the (+) button.";
      validbit.push('Details');

    }

    if (validbit.length === 0) { //check all fields if valid
      isValid = true;

    }

    setError(tempProps);
    return isValid;

  }
  function validateOnSubmitDetails() {
    let isValid = false;
    const tempProps = { ...errorDetails };

    let required = ['EmpNo'];
    if (visitorDetails.Etype === 'Others') {
      required = ['EmpNo', 'OtherSource'];
    }
    let validbit = [];
    for (let i = 0; i < required.length; i++) {
      //alert(required[i]);

      if (!visitorDetails[required[i]]) {   // set error messages if invalid
        tempProps[required[i]] = "This is a required input field";
        validbit.push(required[i]);
      }

    }


    if (visitorDetails.TimeFrom > visitorDetails.TimeTo) {
      tempProps.TimeFrom = "From Time should be earlier than To Time";
      validbit.push('TimeFrom');
    }



    if (validbit.length === 0) { //check all fields if valid
      isValid = true;

    }

    setErrorDetails(tempProps);
    return isValid;

  }

  const onClickSubmit = (e, action) => {
    let msg = "";
    if (action === 'save') {
      _submit = 1;
      msg = "Do you want to save and exit?";
    } else if (action==='submit'){
      _submit = 2;
      msg = "Do you want to submit this form?";
    }
    const isValid = validateOnSubmit();
    if (isValid) {
      setDialogMessage(msg);
      setOpenDialog(true);
    }
  };

  const onClickCancel = (e) => {
    setDialogMessage("Do you want to discard changes and exit?");
    setOpenDialog(true);

  };
  const theme = {
    spacing: 8,
  };
  function Alert(props1: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props1} />;
  }

  useEffect(() => {  //initialize loading, load data once.


    (async () => {

      try {
        /*
        if (getCookie('chkurl') != window.location.href) {
          setCookie('chkurl', window.location.href, 1800);
            window.open(window.location.href, "_self");
        }*/


        _user = await sp.web.currentUser();


        let groups = await sp.web.currentUser.groups();
        let isUser = false;
        let isencoder = false;
        let isreceptionist = false;

        let users_per_dept = await sp.web.lists.getByTitle("UsersPerDept").items.select("*,Name/Title,Dept/Title").expand('Name,Dept').top(5000).orderBy("Modified", true).filter("NameId eq " + _user.Id).get();
        if (users_per_dept.length > 0) {
          setEncoder(true);
          isUser = true;
          isencoder = true;
          setEncoder(true);

        }
        setUsersPerDept(users_per_dept);






        if (isUser) {

          let purpose = await sp.web.lists.getByTitle("Purpose")
            .items
            .select("*")
            .top(5000)
            .filter(`Group eq 'Organic'`)
            .get();
          setPurpose(purpose);
          let building = await sp.web.lists.getByTitle("Building")
            .items
            .select("*")
            .top(5000)
            .orderBy("Title", true)
            .get();
          setBldg(building);
          let depts = await sp.web.lists.getByTitle("Departments")
            .items
            .select("*")
            .top(5000)
            .get();

          let mappedrows = [];
          depts.map(row => {
            let filtered = users_per_dept.filter((item) => item.DeptId === row.Id);
            if (filtered.length > 0) {
              mappedrows.push(row);
            }
          });
          setDept(mappedrows);
          /*
          if (mappedrows.length > 0) {
            const tempProps = { ...inputFields };
            //alert(mappedrows[0].Id);
            tempProps.DeptId = mappedrows[0].Id;
            setInputs(tempProps);
          }*/




          let personneltype = await sp.web.lists.getByTitle("PersonnelType")
            .items
            .select("*")
            .top(5000)
            .get();
          setPersonnel(personneltype);

        } else {
          alert("You are not authorized to access this page!");
          window.open(props.siteUrl, "_self");

        }


      } catch (e) {
        console.log(e);
      }

    })();



  }, []);
  function ViewAction(event, rowData) {
    if (event === 'view') {

      _idx = visitorDetailsList.indexOf(rowData);
      const tempProps = { ...visitorDetails };


      setVisitorDetails(rowData);
      setVisitorDetailsMode('edit');

      setOpenDialogFab(true);
    } else if (event === 'delete') {
      const idx = visitorDetailsList.indexOf(rowData);
      const tempProps = [...visitorDetailsList];
      tempProps.splice(idx, 1);
      setVisitorDetailsList(tempProps);
      if (tempProps.length === 0) {
        const tempProps2 = { ...errorFields };
        tempProps2.Details = "Employee Details are required. Please add employees.";
        setError(tempProps2);
      }
    }




  }
  const mapSelect = (array, value, key, col, property) => {

    try {

      let filtered = array.filter((item) => item[key] === value);

      if (col === 'ApproverId') {
        // const tempProps = { ...inputFields };
        //  tempProps.ApproverId = filtered[0][property];
        //  setInputs(tempProps);
        //   return filtered[0]['Name'][property];
        return filtered[0]['Name']['Id'];
      } else if (col === 'OSMB_Status') {


      } else if (col === 'Status') {

      }
    } catch
    {
      alert("User not found on the current sector user mapping!");
    }
    return null;
  };
  const handleCloseDialog = (e) => {
    setOpenDialog(false);
    if ((dialogMessage.indexOf("submit") > 0) || (dialogMessage.indexOf("save") > 0)) {
      if (e.target.innerText === "OK") {
        save();
      }
    } else if (dialogMessage.indexOf("discard") > 0) {
      if (e.target.innerText === "OK") {
        window.open(props.siteUrl, "_self");
      }

    }
  };
  const handleChangeCbo = async (event) => {
    const { name, value } = event.target;


    if (name === "DeptId") {
      let deptfiltered = deptList.filter((item) => item.Id === value);
      _deptName = deptfiltered[0].Title;

      let approvers = await sp.web.lists.getByTitle("Approvers")
        .items
        .select("*,Name/Title, Dept/Title")
        .expand('Name,Dept').top(5000)
        .filter(`DeptId eq ${value}`)
        .get();
      //setApprovers(approvers);

      let filteredapprovers = [];

      approvers.map(item => {
        if (item.NameId != _user.Id) {
          filteredapprovers.push(item);
        }
      });
      setApprovers(filteredapprovers);


      //validateInputs(name, value);
    }
    if (name === "ApproverId") {

      const url: string = props.siteUrl + `/_api/web/siteusers?$top=5000&$filter=ID eq ${value}`;
      const response = await props.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
      const result = await response.json();


      let aprop = { ...approverDetails };
      aprop.email = result.value[0].Email;
      aprop.name = result.value[0].Title;
      setApproverDetails(aprop);

    }


    if (name === 'OtherSource') {
      const tempProps = { ...visitorDetails };
      tempProps[name] = value;
      tempProps.EmpNo = '';
      tempProps.Title = '';
      setContacts([]);
      setOutsource([]);
      setVisitorDetails(tempProps);
      validateInputsDetails(name, value);

    } else {
      const tempProps = { ...inputFields };
      tempProps[name] = value;
      setInputs(tempProps);
      validateInputs(name, value);

    }



  };
  async function save() {
    let contact = "";
    setProgress(true);
    /*
    let contactsfiltered = contactList.filter((item) => item.EmpNo === inputFields.EmpNo);
    if (contactsfiltered.length > 0) {
      contact = contactsfiltered[0].Name;
    }*/

    let bldgfiltered = bldgList.filter((item) => item.Title === inputFields.Bldg);


    if (_submit === 2) {
      _refno = await createRequestNo(bldgfiltered[0].LocationCode);
    }

    let requestdate = ((_submit === 2) ? moment().toISOString() : null);
    const iar: IItemAddResult = await sp.web.lists.getByTitle("Overtime").items.add({
      Title: _refno,

      Purpose: inputFields.Purpose,
      DeptId: inputFields.DeptId,
      Bldg: inputFields.Bldg,
      Others: ((inputFields.Purpose === 'Others') ? inputFields.Others : null),
      DateFrom: moment(inputFields.DateFrom).toISOString(),
      DateTo: moment(inputFields.DateTo).toISOString(),
      ApproverId: inputFields.ApproverId,
      StatusId: _submit,
      RequestDate: requestdate

    });
    _itemId = iar.data.ID;
    if (_submit === 2) {
      await sendEmail();

    }

    const f = props.siteRelativeUrl + "/OvertimeLib/" + iar.data.ID;
    const folderAddResult = await sp.web.lists.getByTitle("OvertimeLib").rootFolder.folders.add(iar.data.ID.toString());

    await Promise.all(inputFields.Files.map(async (file) => {
      if (file.size <= 10485760) {
        // small upload
        await sp.web.getFolderByServerRelativeUrl(f).files.add(file.name, file, true);
      } else {
        // large upload
        await sp.web.getFolderByServerRelativeUrl(f).files.addChunked(file.name, file, d1 => {
          console.log({ data: d1 });
        }, true);
      }
    }));

    await Promise.all(visitorDetailsList.map(async (visitor) => {


      const iar2: IItemAddResult = await sp.web.lists.getByTitle("OvertimeDetails").items.add({
        ParentId: iar.data.ID,
        Title: visitor.Title,
        TimeFrom: moment(visitor.TimeFrom).toISOString(),
        TimeTo: moment(visitor.TimeTo).toISOString(),
        Etype: visitor.Etype,
        OtherSource: ((visitor.Etype === 'Others') ? visitor.OtherSource : null),
        EmpNo: visitor.EmpNo.toString(),
        RequestDate: requestdate,
        DeptId: inputFields.DeptId,
        RefNo: _refno,
        StatusId: _submit
      });

    }));

    setSavingDone(true);
    setTimeout(
      () => {
        //setProgress(false);
        window.open(props.siteUrl, "_self");
      },
      1000
    );






  }
  setTimeout(
    () => {
      //setProgress(false);

      $(".MuiDropzoneArea-root").css("min-height", "10px");

    },
    10
  );


  return (
    <form noValidate autoComplete="off">
      <div className={classes.root} style={{ padding: '12px' }}>

        <Grid container spacing={1}   >
          <Grid item xs={12}>
            <Paper variant="outlined" className={classes.paper}>
              <Box style={{ fontSize: "1.5rem" }} >
                New Overtime / Overstay
              </Box>

            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} >
            <Paper variant="outlined" className={classes.paper}>
              <FormControl className={classes.textField} error={errorFields.DeptId.length === 0 ? false : true}>
                <InputLabel id="deptLabel"   >Requesting Department *</InputLabel>
                <Select
                  labelId="deptLabel"
                  id="Dept"
                  value={inputFields.DeptId}
                  onChange={handleChangeCbo}
                  name='DeptId'
                //renderValue={(value) => mapSelect(deptList, value, 'ID', 'DeptId', 'Title')}
                >
                  {deptList.map((item) => (
                    <MenuItem key={item.Id} value={item.Id}    >
                      {item.Title}
                    </MenuItem>
                  ))}

                </Select>


                <FormHelperText id="error-Attach">{errorFields.DeptId}</FormHelperText>

              </FormControl>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} >
            <Paper variant="outlined" className={classes.paper}>
              <FormControl className={classes.textField} error={errorFields.Bldg.length === 0 ? false : true}>
                <InputLabel id="bldgLabel"   >Building *</InputLabel>
                <Select
                  labelId="bldgLabel"
                  id="bldg"
                  value={inputFields.Bldg}
                  onChange={handleChangeCbo}
                  name='Bldg'
                //renderValue={(value) => mapSelect(bldgList, value, 'ID', 'BldgId', 'Title')}
                >
                  {bldgList.map((item) => (
                    <MenuItem key={item.Title} value={item.Title}    >
                      {item.Title}
                    </MenuItem>
                  ))}

                </Select>

                <FormHelperText id="error-Attach">{errorFields.Bldg}</FormHelperText>

              </FormControl>

            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} >
            <Paper variant="outlined" className={classes.paper}>
              <FormControl className={classes.textField} error={errorFields.DateFrom.length === 0 ? false : true}>


                <MuiPickersUtilsProvider utils={DateFnsUtils}>

                  <DatePicker
                    error={errorFields.DateFrom.length === 0 ? false : true}
                    disablePast
                    format="MM/dd/yyyy"
                    label="Entry Permit Valid From"
                    value={inputFields.DateFrom}
                    onChange={(d) => onDateTimeVisitChange(d, 'DateFrom')}
                    InputProps={{ className: classes.dateField }}
                  //autoOk
                  />
                </MuiPickersUtilsProvider>

                <FormHelperText id="error-Attach">{errorFields.DateFrom}</FormHelperText>

              </FormControl>



            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} >
            <Paper variant="outlined" className={classes.paper}>
              <FormControl className={classes.textField} error={errorFields.DateTo.length === 0 ? false : true}>


                <MuiPickersUtilsProvider utils={DateFnsUtils}>

                  <DatePicker
                    error={errorFields.DateTo.length === 0 ? false : true}
                    disablePast
                    format="MM/dd/yyyy"
                    label="Entry Permit Valid To"
                    value={inputFields.DateTo}
                    onChange={(d) => onDateTimeVisitChange(d, 'DateTo')}
                    InputProps={{ className: classes.dateField }}
                  //autoOk
                  />
                </MuiPickersUtilsProvider>
                <FormHelperText id="error-Attach">{errorFields.DateTo}</FormHelperText>
              </FormControl>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} >
            <Paper variant="outlined" className={classes.paper}>
              <FormControl className={classes.textField} error={errorFields.Purpose.length === 0 ? false : true}>
                <InputLabel id="purposeLabel"   >Purpose *</InputLabel>
                <Select
                  labelId="purposeLabel"
                  id="Purpose"
                  value={inputFields.Purpose}
                  onChange={handleChangeCbo}
                  name='Purpose'
                //renderValue={(value) => mapSelect(purposeList, value, 'ID', 'Purpose', 'Title')}
                >
                  {purposeList.map((item) => (
                    <MenuItem key={item.Title} value={item.Title}    >
                      {item.Title}
                    </MenuItem>
                  ))}

                </Select>
                <FormHelperText id="error-Attach">{errorFields.Purpose}</FormHelperText>

              </FormControl>

            </Paper>
          </Grid>


          <Grid item xs={12} sm={6} >
            <Paper variant="outlined" className={classes.paper}>
              {(inputFields.Purpose === 'Others') && <span>
                <TextField

                  inputProps={{ maxLength: 255 }}
                  error={errorFields.Others.length === 0 ? false : true} required label="Others" name="Others" onChange={handleChangeTxt} value={inputFields.Others}
                  variant="standard" className={classes.textField}
                  helperText={errorFields.Others}
                />
              </span>}
            </Paper>
          </Grid>
          <Grid item xs={12} sm={12} >

            <Paper variant="outlined" className={classes.paper}>
              <DropzoneArea
                acceptedFiles={['.docx', '.xlsx', '.xls', 'doc', '.mov', 'image/*', 'video/*', ' application/*']}
                showFileNames={true}
                showPreviews={true}
                maxFileSize={70000000}
                onChange={handleChangeDropZone}
                filesLimit={10}
                //showPreviews={false}
                showPreviewsInDropzone={false}
                useChipsForPreview
                previewGridProps={{ container: { spacing: 1, direction: 'row' } }}
                previewChipProps={{ classes: { root: classes.previewChip } }}
                previewText="Selected files"
                dropzoneText="Add an attachment"
              />

            </Paper>

          </Grid>



          <Grid item xs={12}>
            <Paper variant="outlined" className={classes.paper}>
              <Box style={{ fontSize: "1 rem" }} >
                Employee Details
              </Box>

            </Paper>
          </Grid>


          <Grid item xs={12}>
            <Paper variant="outlined" className={classes.paper}>
              <Box component="div" style={{ display: 'inline' }} className={classes.floatingbutton}>
                <Tooltip title="Add Employee Details" >
                  <Fab id='addFab' size="medium" color="primary" onClick={onClickFab} >
                    <AddIcon />
                  </Fab>
                </Tooltip>
              </Box>

            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper variant="outlined" className={classes.paper}>
              {(visitorDetailsList.length > 0) &&
                <div >
                  <MaterialTable

                    title="Employees"
                    columns={[

                      { title: 'Name', field: 'Title' },
                      {
                        title: 'Time From', field: "TimeFrom", type: 'date',
                        render: rowData => <span>{moment(rowData.TimeFrom).format("MM/DD/yyyy HH:mm")}</span>
                      },
                      {
                        title: 'Time To', field: "TimeTo", type: 'date',
                        render: rowData => <span>{moment(rowData.TimeTo).format("MM/DD/yyyy HH:mm")}</span>
                      },



                    ]}
                    data={visitorDetailsList}

                    options={{
                      filtering: false,
                      paging: false,
                      search: false,
                      grouping: false,
                      selection: false
                    }}

                    actions={[

                      {
                        icon: () => <VisibilityIcon />,
                        tooltip: 'View',
                        onClick: (event, rowData) => { ViewAction('view', rowData); },

                      },
                      {
                        icon: 'delete',
                        tooltip: 'Delete',
                        onClick: (event, rowData) => { ViewAction('delete', rowData); }
                      },

                    ]}

                  />


                </div>
              }
              <FormControl className={classes.textField} error={errorFields.Details.length === 0 ? false : true}>
                <FormHelperText id="error-Attach">{errorFields.Details}</FormHelperText>
              </FormControl>


            </Paper>
          </Grid>
          <Grid item xs={12} sm={12} >


            <Paper variant="outlined" className={classes.paper}>
              <FormControl className={classes.textField} error={errorFields.ApproverId.length === 0 ? false : true}>
                <InputLabel id="approversLabel"   >Forward for Approval *</InputLabel>
                <Select
                  labelId="approversLabel"
                  id=""
                  value={inputFields.ApproverId}
                  onChange={handleChangeCbo}
                  name='ApproverId'
                // renderValue={(value) => mapSelect(approverList, value, 'NameId', 'ApproverId', 'Title')}
                >
                  {approverList.map((item) => (
                    <MenuItem key={item.NameId} value={item.NameId}    >
                      {item.Name.Title}
                    </MenuItem>
                  ))}

                </Select>
                <FormHelperText id="error-Attach">{errorFields.ApproverId}</FormHelperText>

              </FormControl>


            </Paper>


          </Grid>




          < Grid container justify="flex-end" >
            {/* <Paper variant="outlined" className={classes.paper}> */}
            <ButtonGroup >
              <Button className={classes.paperbutton} startIcon={<CancelIcon />} variant="contained" color="secondary" onClick={onClickCancel}>
                Close
              </Button>
              <Button name="savedraft" className={classes.paperbutton} startIcon={<SaveIcon />} variant="contained" color="default" onClick={(e) => onClickSubmit(e, 'save')}>
                Save
              </Button>


              <Button name="submit" className={classes.paperbutton} endIcon={<SendIcon />} variant="contained" color="primary" onClick={(e) => onClickSubmit(e, 'submit')}>
                Submit
              </Button>
            </ButtonGroup>
            {/*  </Paper> */}
          </Grid>


        </Grid>
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {dialogMessage}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="default" >
              Cancel
            </Button>
            <Button onClick={handleCloseDialog} color="primary" autoFocus >
              OK
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          fullWidth={fullWidth}
          maxWidth={maxWidth}
          open={openDialogFab}
          onClose={handleCloseDialogFab}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Add Employee Details</DialogTitle>
          <DialogContent >
            <form noValidate autoComplete="off">
              <div className={classes.root} style={{ padding: '0px' }}>

                <Grid container spacing={1}   >
                  <Grid item xs={12} sm={6} >
                    <Paper variant="outlined" className={classes.paper}>
                      <div className={classes.datelabel}>
                        <FormControl component="fieldset">

                          <RadioGroup row aria-label="Etype" name="Etype" value={visitorDetails.Etype} onChange={handleChangeTxtDetails}>

                            <FormControlLabel value="BSP" control={<Radio color="primary" />} label="BSP" />\
                            <FormControlLabel value="Others" control={<Radio color="primary" />} label="Others" />
                          </RadioGroup>
                        </FormControl>


                      </div>


                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} >
                    <Paper variant="outlined" className={classes.paper}>
                      {(visitorDetails.Etype === 'Others') && <span>
                        <FormControl className={classes.textField} error={errorDetails.OtherSource.length === 0 ? false : true}>
                          <InputLabel id="othersOutsourceLabel"   >Others *</InputLabel>
                          <Select
                            labelId="othersOutsourceLabel"
                            id="OtherSource"
                            value={visitorDetails.OtherSource}
                            onChange={handleChangeCbo}
                            name='OtherSource'
                          //renderValue={(value) => mapSelect(deptList, value, 'ID', 'DeptId', 'Title')}
                          >
                            {PersonnelTypeList.map((item) => (
                              <MenuItem key={item.Title} value={item.Title}    >
                                {item.Title}
                              </MenuItem>
                            ))}

                          </Select>


                          <FormHelperText id="error-Attach">{errorDetails.OtherSource}</FormHelperText>

                        </FormControl>
                      </span>}
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={12} >
                    <Paper variant="outlined" className={classes.paper}>
                      {(visitorDetails.Etype === 'BSP') && <span>
                        <FormControl className={classes.textField} error={errorDetails.EmpNo.length === 0 ? false : true}>

                          <Autocomplete

                            freeSolo={true}
                            id="Contact"
                            style={{ width: 300 }}
                            open={isAC1Open}
                            onChange={handleACSelectedValue
                            }
                            onOpen={() => {
                              setAC1Open(true);
                            }}
                            onClose={(event, reason) => {
                              setAC1Open(false);
                            }}
                            getOptionSelected={(option, value) =>
                              option.EmpNo === value.EmpNo
                            }
                            getOptionLabel={(option) =>
                              option.Name
                            }
                            options={contactList}
                            // loading={loading}
                            //defaultValue={{EmpNo:'2', Name:"Michael Jordan"}}
                            defaultValue={{ EmpNo: visitorDetails.EmpNo, Name: visitorDetails.Title }}

                            renderInput={(params) => (
                              <TextField
                                {...params}

                                onChange={findUser}
                                label="Employee Name"
                                variant="standard"
                                helperText={errorDetails.EmpNo}
                                error={errorDetails.EmpNo.length === 0 ? false : true}
                              />
                            )}
                          />
                        </FormControl>
                      </span>}
                      {(visitorDetails.Etype === 'Others') && <span>
                        <FormControl className={classes.textField} error={errorDetails.EmpNo.length === 0 ? false : true}>

                          <Autocomplete

                            freeSolo={true}
                            id="OutsourceList"
                            style={{ width: 300 }}
                            open={isAC1Open}
                            onChange={handleACSelectedValue
                            }
                            onOpen={() => {
                              setAC1Open(true);
                            }}
                            onClose={(event, reason) => {
                              setAC1Open(false);
                            }}
                            getOptionSelected={(option, value) =>
                              option.Id === value.Id
                            }
                            getOptionLabel={(option) =>
                              option.Title
                            }
                            options={OutsourceList}
                            // loading={loading}
                            //defaultValue={{EmpNo:'2', Name:"Michael Jordan"}}
                            defaultValue={{ Id: visitorDetails.EmpNo, Title: visitorDetails.Title }}

                            renderInput={(params) => (
                              <TextField
                                {...params}

                                onChange={findUser}
                                label={visitorDetails.OtherSource + " Name"}
                                variant="standard"
                                helperText={errorDetails.EmpNo}
                                error={errorDetails.EmpNo.length === 0 ? false : true}
                              />
                            )}
                          />
                        </FormControl>
                      </span>}


                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6} >
                    <Paper variant="outlined" className={classes.paper}>
                      <FormControl className={classes.textField} error={errorDetails.TimeFrom.length === 0 ? false : true}>


                        <MuiPickersUtilsProvider utils={DateFnsUtils}>

                          <TimePicker
                            error={errorDetails.TimeFrom.length === 0 ? false : true}
                            format="MM/dd/yyyy HH:mm"
                            label="Time From"
                            value={visitorDetails.TimeFrom}
                            onChange={(d) => onTimeChange(d, 'TimeFrom')}
                            InputProps={{ className: classes.dateField }}
                          //autoOk
                          />
                        </MuiPickersUtilsProvider>

                        <FormHelperText id="error-Attach">{errorDetails.TimeFrom}</FormHelperText>

                      </FormControl>



                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} >
                    <Paper variant="outlined" className={classes.paper}>
                      <FormControl className={classes.textField} error={errorDetails.TimeTo.length === 0 ? false : true}>


                        <MuiPickersUtilsProvider utils={DateFnsUtils}>

                          <TimePicker
                            error={errorDetails.TimeTo.length === 0 ? false : true}

                            format="MM/dd/yyyy HH:mm"
                            label="Time To"
                            value={visitorDetails.TimeTo}
                            onChange={(d) => onTimeChange(d, 'TimeTo')}
                            InputProps={{ className: classes.dateField }}
                          //autoOk
                          />
                        </MuiPickersUtilsProvider>
                        <FormHelperText id="error-Attach">{errorDetails.TimeTo}</FormHelperText>
                      </FormControl>
                    </Paper>
                  </Grid>











                </Grid>
              </div>
            </form>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialogFab} color="default" >
              Cancel
            </Button>
            <Button onClick={handleCloseDialogFab} color="primary" autoFocus >
              OK
            </Button>
          </DialogActions>
        </Dialog>

        <Backdrop className={classes.backdrop} open={isProgress} >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Snackbar open={isSavingDone} autoHideDuration={2000} >
          <Alert severity="success">
            Data has been saved successfully.
            {((isEncoder) && (_submit == 2)) && <div>
              An email notification has been sent to {approverDetails.name}.
            </div>
            }
            {((isReceptionist) && (_submit == 2)) && <div>
              An email notification has been sent to {approverDetails.name}.
            </div>
            }

          </Alert>
        </Snackbar>

      </div>
    </form >
  );

}
