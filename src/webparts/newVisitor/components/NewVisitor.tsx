import * as React from 'react';
import $ from 'jquery';
//import styles from './NewVisitor.module.scss';
//import fetch from 'cross-fetch';
import { ISPHttpClientOptions, SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { useState, useEffect, useCallback, Component, useRef } from 'react';
import { INewVisitorProps } from './INewVisitorProps';
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
import { MuiPickersUtilsProvider, DatePicker, DateTimePicker, KeyboardDatePicker } from "@material-ui/pickers";
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

//import { BasePeoplePicker } from 'office-ui-fabric-react';


//import styles from './Display1.module.scss';
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

export default function Approval(props: INewVisitorProps) {




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
      ExternalType: '', Purpose: '', DeptId: null, Bldg: '', RoomNo: '',
      EmpNo: '', Position: '', DirectNo: '', LocalNo: '', DateTimeVisit: new Date(), DateTimeArrival: new Date(),
      CompanyName: '', Address: '', VisContactNo: '', VisLocalNo: '', RequireParking: false,
      Status: '', ApproverId: null, Files: [],PurposeOthers:''
    }
  );
  const [errorFields, setError] = useState(
    {
      ExternalType: '', Purpose: '', DeptId: '', Bldg: '', RoomNo: '',
      EmpNo: '', Title: '', Position: '', DirectNo: '', LocalNo: '', DateTimeVisit: '', DateTimeArrival: '',
      CompanyName: '', Address: '', VisContactNo: '', VisLocalNo: '', RequireParking: '',
      ApproverId: '', Details: '',PurposeOthers:''
    }
  );
  const [visitorDetails, setVisitorDetails] = useState(
    {
      Title: '', Car: false, AccessCard: '', PlateNo: '', TypeofVehicle: '', Color: '',
      DriverName: '', IDPresented: '', GateNo: '', ParentId: null, Files: []
    }
  );
  const [visitorDetailsList, setVisitorDetailsList] = useState([]);


  const [errorDetails, setErrorDetails] = useState(
    {
      Title: '', Car: '', AccessCard: '', PlateNo: '', TypeofVehicle: '', Color: '', DriverName: '', IDPresentedId: '', GateNo: '', Files: ''
    }
  );
  const [isAC1Open, setAC1Open] = React.useState(false);
  const [purposeList, setPurpose] = useState([]);
  const [deptList, setDept] = useState([]);
  const [bldgList, setBldg] = useState([]);
  const [approverList, setApprovers] = useState([]);
  const [contactList, setContacts] = React.useState([]);


  const [IDList, setIDs] = React.useState([]);
  const [GateList, setGates] = React.useState([]);
  const [usersPerDept, setUsersPerDept] = React.useState([]);
  const [openDialogFab, setOpenDialogFab] = useState(false);
  const [fullWidth, setFullWidth] = React.useState(true);
  const [maxWidth, setMaxWidth] = React.useState<DialogProps['maxWidth']>('md');


  const handleACSelectedValue = (event, value) => {

    //let contactsfiltered = contactList.filter((item) => item.EmpNo === value);

    const tempProps = { ...inputFields };
    if (value) {
      tempProps.EmpNo = value.EmpNo;
      tempProps.DirectNo = value.DirectNo;
      tempProps.LocalNo = value.LocalNo;
      tempProps.Position = value.Position;
      validateInputs('EmpNo', tempProps.EmpNo);
    } else {

      tempProps.EmpNo = "";
      tempProps.DirectNo = "";
      tempProps.LocalNo = "";
      tempProps.Position = "";
      setContacts([]);
      validateInputs('EmpNo', "");

    }

    setInputs(tempProps);




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
      strbody = `BSP Access Control System Request Notification.</br></br>Ref No.:${_refno}</br>Purpose:${inputFields.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayVisitorappge.aspx?pid=${_itemId}">link</a>`;


    } else if (isReceptionist) {
      toEmail.push(approverDetails.email);
      subject = `BSP ACCESS CONTROL SYSTEM : For Confirmation ${_refno} - ${inputFields.Purpose}`;
      strbody = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${_refno}</br>Purpose:${inputFields.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayVisitorappge.aspx?pid=${_itemId}">link</a>`;

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
    const tempProps = { ...inputFields };
    tempProps.EmpNo = "";
    tempProps.DirectNo = "";
    tempProps.LocalNo = "";
    tempProps.Position = "";
    setInputs(tempProps);
    //let  beh = e.target.value;
    if (e.target.value.length > 2) {

      //const url: string = props.siteUrl + `/_api/web/siteusers?$top=5000&$filter=substringof('${e.target.value}', Title) and PrincipalType%20eq%201`;
      //const response = await props.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
      //const result = await response.json();
      // let options =  $.map(result.value, function(obj) {
      //   return { Id: obj.Id, Title: obj.Title };    //replace Id to id and Title to text for select2 to accept
      // });
      
  

     


      let options = await sp.web.lists.getByTitle("Employees").items.select("*").top(5000).filter(`substringof('${e.target.value}', Name) and Dept eq '${_deptName}'`).get();
      setContacts(options);

/*      
      const result = await sp.profiles.clientPeoplePickerSearchUser({
        AllowEmailAddresses: true,
        AllowMultipleEntities: false,
        MaximumEntitySuggestions: 2000,
        QueryString: beh
      });

      const loginName = result[0]['Key'];
      const propertyName = "AccountName";
      const property = await sp.profiles.getUserProfilePropertyFor(loginName, propertyName);
      const profile = await sp.profiles.getPropertiesFor(loginName);
      console.log(result.length);
      console.log(property);
      */


    } else if (e.target.value.length < 3) {
      setContacts([]);


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
    if (name === 'RequireParking') {
      tempProps[name] = e.target.checked;

    } else {
      tempProps[name] = value;
    }


    setInputs(tempProps);
    validateInputs(name, value);

  };
  const handleChangeTxtDetails = (e) => {
    const { name, value } = e.target;
    const tempProps = { ...visitorDetails };

    if (name === 'Car') {
      tempProps[name] = e.target.checked;
      if (e.target.checked === false) {
        tempProps.Color = "";
        tempProps.DriverName = "";
        tempProps.PlateNo = "";
        tempProps.TypeofVehicle = "";
      }
    } else {
      tempProps[name] = value;
    }


    setVisitorDetails(tempProps);
    validateInputsDetails(name, value);

  };

  const onDateTimeVisitChange = (e, name) => {
    const tempProps = { ...inputFields };
    tempProps[name] = e;
    setInputs(tempProps);
    validateInputs(name, e);
    console.log(e);

  };
  const handleChangeDropZone = (files) => {
    const tempProps = { ...inputFields };
    tempProps.Files = files;
    setInputs(tempProps);

  };
  const handleChangeDropZone2 = (files) => {
    const tempProps = { ...visitorDetails };
    tempProps.Files = files;
    setVisitorDetails(tempProps);
    //  alert(files.length);
    /*
    setFiles([...files]);
    const tempProps = { ...errorFields };
    if (idropzoneCounter2 > 0) {
      if (files.length > 0) {
        tempProps.Attach = "";
      } else {
        tempProps.Attach = "Please upload a file";

      }

    }
    let iTemp: number = idropzoneCounter + 1;
    setDropzoneCounter(iTemp);
    setError(tempProps);
    */


  };
  const onClickFab = (e) => {
    console.log(e);
    if (e.currentTarget.id === 'addFab') {
      setVisitorDetailsMode('add');
      const tempProps = { ...visitorDetails };
      tempProps.AccessCard = '';
      if (inputFields.RequireParking === true) {
        tempProps.Car = true;
      } else {
        tempProps.Car = false;
      }

      tempProps.Color = '';
      tempProps.DriverName = '';
      tempProps.GateNo = '';
      tempProps.IDPresented = '';
      tempProps.ParentId = null;
      tempProps.PlateNo = '';
      tempProps.Title = '';
      tempProps.TypeofVehicle = '';
      setVisitorDetails(tempProps);
      setOpenDialogFab(true);

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
    if (value.length === 0 && name !== 'EmpNo') {
      tempProps[name] = "This is a required input field";
      setError(tempProps);
    } else if (name === 'EmpNo' && inputFields.Purpose !== "For receiving" && value.length === 0) {
      tempProps[name] = "This is a required input field";
      setError(tempProps);
    }
     else {
      if (name === "DateTimeVisit") {
        if (value > inputFields.DateTimeArrival) {
          tempProps[name] = "From Date should be earlier than To Date";
        } else {
          tempProps[name] = "";
        }
      } else if (name === "DateTimeArrival") {
        if (inputFields.DateTimeVisit > value) {
          tempProps[name] = "From Date should be earlier than To Date";
        } else {
          tempProps[name] = "";
        }
      } else {
        tempProps[name] = "";
      }
      setError(tempProps);
    }
  }
  function validateInputsDetails(name, value) {

    const tempProps = { ...errorDetails };
    if (value.length === 0) {
      tempProps[name] = "This is a required input field";
      setErrorDetails(tempProps);
    } else {
      tempProps[name] = "";
      setErrorDetails(tempProps);

    }
  }
  /*
  const createRequestNo = async (loc: string) => {

    let refno: string = '';
    const url: string = `${props.siteUrl}/_vti_bin/listdata.svc/Visitors/$count?$filter=substringof('${loc}-${moment(new Date()).format('YYYYMMDD')}',Title)`;

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
      .filter(`Title eq 'Visitor'`)
      .get();
    let last = 0;

    if (RefNoCount.length > 0) {

      let dt = moment(RefNoCount[0].DateRef).endOf('day').toISOString();
      let dt2 = moment().endOf('day').toISOString();

      if (dt === dt2) {
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
  /*function validateOnSubmit() {
    let isValid = false;
    const tempProps = { ...errorFields };
    const required = ["Purpose", "DeptId", "Bldg", "RoomNo", "EmpNo", "DateTimeVisit", "DateTimeArrival",
      'CompanyName', 'Address', 'VisContactNo', 'ApproverId'
    ];
    ];
    if (inputFields.Purpose=='Others'){
      required.push('PurposeOthers');
    }
    let validbit = [];
    for (let i = 0; i < required.length; i++) {
      //alert(required[i]);
      if ((required[i] === "EmpNo") && (inputFields.Purpose === "For receiving")) {
        tempProps[required[i]] = "";
      } else if (required[i] === "DateTimeVisit") {
        if (inputFields.DateTimeVisit > inputFields.DateTimeArrival) {
          tempProps[required[i]] = "From Date should be earlier than To Date";
          validbit.push(required[i]);

        }
      } else if (required[i] === "DateTimeArrival") {
        if (inputFields.DateTimeVisit > inputFields.DateTimeArrival) {
          tempProps[required[i]] = "From Date should be earlier than To Date";
          validbit.push(required[i]);
        }
      } else if ((required[i] === "ApproverId") && (_submit === 1)) {
        tempProps[required[i]] = "";

      } else {
        if (!inputFields[required[i]]) {   // set error messages if invalid
          tempProps[required[i]] = "This is a required input field";
          validbit.push(required[i]);
        }
      }
    }
    if (visitorDetailsList.length === 0) {
      tempProps.Details = "Visitor Details are required. Please add visitor names by clicking the (+) button.";
      validbit.push('Details');

    }
    console.log("Validbit",validbit,"Length",validbit.length);
    if (validbit.length === 0) { //check all fields if valid
      isValid = true;

    }

    setError(tempProps);
    return isValid;

  }*/
    function validateOnSubmit() {
      let isValid = false;
      const tempProps = { ...errorFields };
      const required = ["Purpose", "DeptId", "Bldg", "RoomNo", "DateTimeVisit", "DateTimeArrival",
        'CompanyName', 'Address', 'VisContactNo', 'ApproverId'
      ];
  
      if (inputFields.Purpose === 'Others') {
        required.push('PurposeOthers');
      }
  
      let validbit = [];
  
      // Validate fields
      for (let i = 0; i < required.length; i++) {
        if ((required[i] === "EmpNo") && (inputFields.Purpose === "For receiving")) {
          tempProps[required[i]] = "";
        } else if (required[i] === "DateTimeVisit") {
          if (inputFields.DateTimeVisit > inputFields.DateTimeArrival) {
            tempProps[required[i]] = "From Date should be earlier than To Date";
            validbit.push(required[i]);
          }
        } else if (required[i] === "DateTimeArrival") {
          if (inputFields.DateTimeVisit > inputFields.DateTimeArrival) {
            tempProps[required[i]] = "From Date should be earlier than To Date";
            validbit.push(required[i]);
          }
        } else if ((required[i] === "ApproverId") && (_submit === 1)) {
          tempProps[required[i]] = "";
        } else {
          if (!inputFields[required[i]]) {
            tempProps[required[i]] = "This is a required input field";
            validbit.push(required[i]);
          }
        }
      }
  
      // Check visitor details
      if (visitorDetailsList.length === 0) {
        tempProps.Details = "Visitor Details are required. Please add visitor names by clicking the (+) button.";
        validbit.push('Details');
      }
  
      console.log("Validbit:", validbit, "Length:", validbit.length);
  
      if (validbit.length === 0) {
        isValid = true;
      }
  
      // Log the error props for debugging
      console.log("Error Fields:", tempProps);
      setError(tempProps);
  
      return isValid;
  }  
  console.log("Checking EmpNo validation, Purpose:", inputFields.Purpose);
  function validateOnSubmitDetails() {
    let isValid = false;
    const tempProps = { ...errorDetails };
    const required = ['Title', 'PlateNo', 'TypeofVehicle', 'Color', 'DriverName'];
    let validbit = [];
    for (let i = 0; i < required.length; i++) {
      //alert(required[i]);
      if ((required[i] === "PlateNo") && (visitorDetails.Car === false)) {
        tempProps[required[i]] = "";
      } else if ((required[i] === "TypeofVehicle") && (visitorDetails.Car === false)) {
        tempProps[required[i]] = "";
      } else if ((required[i] === "Color") && (visitorDetails.Car === false)) {
        tempProps[required[i]] = "";
      } else if ((required[i] === "DriverName") && (visitorDetails.Car === false)) {
        tempProps[required[i]] = "";

      } else {
        if (!visitorDetails[required[i]]) {   // set error messages if invalid
          tempProps[required[i]] = "This is a required input field";
          validbit.push(required[i]);
        }
      }
    }

    if (validbit.length === 0) { //check all fields if valid
      isValid = true;

    }

    setErrorDetails(tempProps);
    return isValid;

  }

  const onClickSubmit = (e, action) => {
    let msg = "";
    console.log("inside ClickSubmit", action);
    
    if (action === 'save') {
      _submit = 1;
      msg = "Do you want to save and exit?";
      console.log("inside Save",action);
    } else if (action === 'submit') {
      _submit = 2;
      msg = "Do you want to submit this form?"; 
      console.log("inside Submit",action);
    }
    const isValid = validateOnSubmit();
    if (isValid) {
      console.log("If validate ",isValid);
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

    console.log('loaded new visitors');
    (async () => {

      try {
        
        /*if (getCookie('chkurl') != window.location.href) {
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
          const tempProps = { ...inputFields };
          tempProps.ExternalType = "Pre-arranged";
          setInputs(tempProps);
          isencoder = true;
          setEncoder(true);

        }
        setUsersPerDept(users_per_dept);



        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === Receptionist_Group) {
            setReceptionist(true);
            isUser = true;
            const tempProps = { ...inputFields };
            tempProps.ExternalType = "Walk-in";
            setInputs(tempProps);
            isreceptionist = true;
            setReceptionist(true);
            break;
          }
        }




        if (isUser) {

          let purpose = await sp.web.lists.getByTitle("Purpose")
            .items
            .select("*")
            .top(5000)
            .filter(`Group eq 'Visitor'`)
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
          if (isencoder) {
            let mappedrows = [];
            depts.map(row => {
              let filtered = users_per_dept.filter((item) => item.DeptId === row.Id);
              if (filtered.length > 0) {
                mappedrows.push(row);
              }
            });
            setDept(mappedrows);
          } else if (isreceptionist) {
            setDept(depts);
          }

          let gates = await sp.web.lists.getByTitle("Gates")
            .items
            .select("*")
            .top(5000)
            .get();
          setGates(gates);
          let idpresented = await sp.web.lists.getByTitle("IDPresented")
            .items
            .select("*")
            .top(5000)
            .get();
          setIDs(idpresented);


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
        tempProps2.Details = "Visitor Details are required. Please add visitor names.";
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

    console.log("Selected value", name, value);
    if (name === "DeptId") {
      let deptfiltered = deptList.filter((item) => item.Id === value);
      _deptName = deptfiltered[0].Title;
      if (inputFields.ExternalType === 'Walk-in') {
        let walkinapprovers = await sp.web.lists.getByTitle("WalkinApprovers")
          .items
          .select("*,Name/Title, Dept/Title")
          .expand('Name,Dept').top(5000)
          .filter(`DeptId eq ${value}`)
          .get();

        setWalkinApprovers(walkinapprovers);

      } else {
        let approvers = await sp.web.lists.getByTitle("Approvers")
          .items
          .select("*,Name/Title, Dept/Title")
          .expand('Name,Dept').top(5000)
          .filter(`DeptId eq ${value}`)
          .get();
        let filteredapprovers = [];

        approvers.map(item => {
          if (item.NameId != _user.Id) {
            filteredapprovers.push(item);
          }
        });
        setApprovers(filteredapprovers);




      }
      //validateInputs(name, value);
    } else if (name =='Purpose') {
      inputFields.PurposeOthers = '';  
    } else if (name === "ApproverId") {

      const url: string = props.siteUrl + `/_api/web/siteusers?$top=5000&$filter=ID eq ${value}`;
      const response = await props.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
      const result = await response.json();


      let aprop = { ...approverDetails };
      aprop.email = result.value[0].Email;
      aprop.name = result.value[0].Title;
      setApproverDetails(aprop);

    }
    

    if (name === 'GateNo' || name === 'IDPresented') {
      const tempProps = { ...visitorDetails };
      tempProps[name] = value;
      setVisitorDetails(tempProps);
      validateInputs(name, value);


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

    let contactsfiltered = contactList.filter((item) => item.EmpNo === inputFields.EmpNo);
    if (contactsfiltered.length > 0) {
      contact = contactsfiltered[0].Name;
    }

    let bldgfiltered = bldgList.filter((item) => item.Title === inputFields.Bldg);


    if (_submit === 2) {
      _refno = await createRequestNo(bldgfiltered[0].LocationCode);
    }

    let requestdate = ((_submit === 2) ? moment().toISOString() : null);
    const iar: IItemAddResult = await sp.web.lists.getByTitle("Visitors").items.add({
      Title: _refno,
      ContactName: contact,
      ExternalType: inputFields.ExternalType,
      Purpose: inputFields.Purpose,
      DeptId: inputFields.DeptId,
      Bldg: inputFields.Bldg,
      RoomNo: inputFields.RoomNo,
      EmpNo: inputFields.EmpNo,
      Position: inputFields.Position,
      DirectNo: inputFields.DirectNo,
      LocalNo: inputFields.LocalNo,
      DateTimeVisit: moment(inputFields.DateTimeVisit).toISOString(),
      DateTimeArrival: moment(inputFields.DateTimeArrival).toISOString(),
      CompanyName: inputFields.CompanyName,
      Address: inputFields.Address,
      VisContactNo: inputFields.VisContactNo,
      VisLocalNo: inputFields.VisLocalNo,
      RequireParking: inputFields.RequireParking,
      ApproverId: inputFields.ApproverId,
      StatusId: _submit,
      RequestDate: requestdate,
      PurposeOthers: inputFields.PurposeOthers

    });
    _itemId = iar.data.ID;
    if (_submit === 2) {
      await sendEmail();

    }

    const f = props.siteRelativeUrl + "/VisitorsLib/" + iar.data.ID;
    const folderAddResult = await sp.web.lists.getByTitle("VisitorsLib").rootFolder.folders.add(iar.data.ID.toString());

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


      const iar2: IItemAddResult = await sp.web.lists.getByTitle("VisitorDetails").items.add({
        ParentId: iar.data.ID,
        Title: visitor.Title,
        Car: visitor.Car,
        Color: visitor.Color,
        DriverName: visitor.DriverName,
        TypeofVehicle: visitor.TypeofVehicle,
        PlateNo: visitor.PlateNo,
        GateNo: visitor.GateNO,
        IDPresented: visitor.IDPresented,
        AccessCard: visitor.AccessCard,
        RequestDate: requestdate,
        DeptId: inputFields.DeptId,
        RefNo: _refno,
        DateFrom: moment(inputFields.DateTimeVisit).toISOString(),
        DateTo: moment(inputFields.DateTimeArrival).toISOString(),
        CompanyName: inputFields.CompanyName,
        StatusId: _submit


      });
      const folderAddResult2 = await sp.web.lists.getByTitle("VisitorDetailsLib").rootFolder.folders.add(iar2.data.ID.toString());

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
                New Visitor
              </Box>

            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" className={classes.paper}>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >External Type</Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.ExternalType}</Box>


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
              { (inputFields.Purpose === 'Others') && <span>

                  <TextField

                    inputProps={{ maxLength: 255 }}
                    error={errorFields.PurposeOthers.length === 0 ? false : true} required label="Others" name="PurposeOthers" onChange={handleChangeTxt} value={inputFields.PurposeOthers}
                    variant="standard" className={classes.textField}
                    helperText={errorFields.PurposeOthers}
                  />
                </span>}


            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} >
            <Paper variant="outlined" className={classes.paper}>
              <FormControl className={classes.textField} error={errorFields.DeptId.length === 0 ? false : true}>
                <InputLabel id="deptLabel"   >Department to Visit *</InputLabel>
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
                <InputLabel id="bldgLabel"   >Building</InputLabel>
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
              <TextField

                inputProps={{ maxLength: 255 }}
                error={errorFields.RoomNo.length === 0 ? false : true} required label="Room No." name="RoomNo" onChange={handleChangeTxt} value={inputFields.RoomNo}
                variant="standard" className={classes.textField}
                helperText={errorFields.RoomNo}
              />

            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} >
            <Paper variant="outlined" className={classes.paper}>
              <FormControl className={classes.textField} error={errorFields.EmpNo.length === 0 ? false : true}>

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

                  renderInput={(params) => (
                    <TextField
                      {...params}

                      onChange={findUser}
                      label="Contact Person"
                      variant="standard"
                      // helperText={errorFields.EmpNo}
                      // error={errorFields.EmpNo.length === 0 ? false : true}
                      // helperText={errorFields.EmpNo || ''}  // Handling undefined or null
                      // error={Boolean(errorFields.EmpNo)}   // Simple error check
                    />
                  )}
                />
                {/* <FormHelperText id="error-Attach">{errorFields.EmpNo}</FormHelperText>*/}


              </FormControl>


            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} >
            <Paper variant="outlined" className={classes.paper}>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Position</Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.Position}</Box>



            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} >
            <Paper variant="outlined" className={classes.paper}>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Direct No.</Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.DirectNo}</Box>



            </Paper>
          </Grid>
          <Grid item xs={12} sm={12} >
            <Paper variant="outlined" className={classes.paper}>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Local No.</Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.LocalNo}</Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} >
            <Paper variant="outlined" className={classes.paper}>
              <FormControl className={classes.textField} error={errorFields.DateTimeVisit.length === 0 ? false : true}>


                <MuiPickersUtilsProvider utils={DateFnsUtils}>

                  <DateTimePicker
                    error={errorFields.DateTimeVisit.length === 0 ? false : true}
                    disablePast
                    format="MM/dd/yyyy HH:mm"
                    label="Date and Time of Visit From"
                    value={inputFields.DateTimeVisit}
                    onChange={(d) => onDateTimeVisitChange(d, 'DateTimeVisit')}
                    InputProps={{ className: classes.dateField }}
                  //autoOk
                  />
                </MuiPickersUtilsProvider>

                <FormHelperText id="error-Attach">{errorFields.DateTimeVisit}</FormHelperText>

              </FormControl>



            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} >
            <Paper variant="outlined" className={classes.paper}>
              <FormControl className={classes.textField} error={errorFields.DateTimeArrival.length === 0 ? false : true}>


                <MuiPickersUtilsProvider utils={DateFnsUtils}>

                  <DateTimePicker
                    error={errorFields.DateTimeArrival.length === 0 ? false : true}
                    disablePast
                    format="MM/dd/yyyy HH:mm"
                    label="Date and Time of Visit To"
                    value={inputFields.DateTimeArrival}
                    onChange={(d) => onDateTimeVisitChange(d, 'DateTimeArrival')}
                    InputProps={{ className: classes.dateField }}
                  //autoOk
                  />
                </MuiPickersUtilsProvider>

                <FormHelperText id="error-Attach">{errorFields.DateTimeArrival}</FormHelperText>

              </FormControl>



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
              <Box style={{ fontSize: "1rem" }} >
                Visitor Details
              </Box>

            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} >
            <Paper variant="outlined" className={classes.paper}>
              <TextField

                inputProps={{ maxLength: 255 }}
                error={errorFields.CompanyName.length === 0 ? false : true} required label="Company Name" name="CompanyName" onChange={handleChangeTxt} value={inputFields.CompanyName}
                variant="standard" className={classes.textField}
                helperText={errorFields.CompanyName}
              />

            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" className={classes.paper}>


              <TextField

                multiline
                error={errorFields.Address.length === 0 ? false : true} required label="Address" name="Address" onChange={handleChangeTxt} value={inputFields.Address}
                variant="standard" className={classes.textField}
                helperText={errorFields.Address}
              />

            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" className={classes.paper}>
              <TextField
                inputProps={{ maxLength: 255 }}
                error={errorFields.VisContactNo.length === 0 ? false : true} required label="Contact No." name="VisContactNo" onChange={handleChangeTxt} value={inputFields.VisContactNo}
                variant="standard" className={classes.textField}
                helperText={errorFields.VisContactNo}
              />


            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" className={classes.paper}>
              <TextField

                inputProps={{ maxLength: 255 }}
                label="Local No." name="VisLocalNo" onChange={handleChangeTxt} value={inputFields.VisLocalNo}
                variant="standard" className={classes.textField}
                helperText={errorFields.VisLocalNo}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" className={classes.paper}>
              <div className={classes.datelabel}>
                <FormControlLabel

                  control={
                    <Checkbox
                      checked={inputFields.RequireParking}
                      onChange={handleChangeTxt}
                      name="RequireParking"
                      color="primary"
                    />
                  }
                  label="Request for Parking"

                />
              </div>

            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper variant="outlined" className={classes.paper}>




              <Box component="div" style={{ display: 'inline' }} className={classes.floatingbutton}>
                <Tooltip title="Add Visitor Details" >
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

                    title="Visitors"
                    columns={[

                      { title: 'Name', field: 'Title' },
                      // { title: 'Access Card', field: 'AccessCard' },

                      {
                        title: 'Car', field: "Care",
                        render: rowData => <span>{rowData.Car ? 'With' : 'Without'}</span>
                      },
                      { title: 'Plate No.', field: 'PlateNo' },
                      { title: 'Type of Vehicle', field: "TypeofVehicle" },
                      { title: "Driver's Name", field: "DriverName" },
                      // { title: 'Gate', field: "GateNo" },


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

            {(isEncoder) && <span>
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
            </span>}
            {(isReceptionist) && <span>
              <Paper variant="outlined" className={classes.paper}>
                <FormControl className={classes.textField} error={errorFields.ApproverId.length === 0 ? false : true}>
                  <InputLabel id="approversLabel"   >Forward for Confirmation *</InputLabel>
                  <Select
                    labelId="approversLabel"
                    id=""
                    value={inputFields.ApproverId}
                    onChange={handleChangeCbo}
                    name='ApproverId'
                  // renderValue={(value) => mapSelect(approverList, value, 'NameId', 'ApproverId', 'Title')}
                  >
                    {WalkinApprovers.map((item) => (
                      <MenuItem key={item.NameId} value={item.NameId}    >
                        {item.Name.Title}
                      </MenuItem>
                    ))}

                  </Select>
                  <FormHelperText id="error-Attach">{errorFields.ApproverId}</FormHelperText>

                </FormControl>


              </Paper>
            </span>}
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
          <DialogTitle id="alert-dialog-title">Add Visitor Details</DialogTitle>
          <DialogContent >
            <form noValidate autoComplete="off">
              <div className={classes.root} style={{ padding: '0px' }}>

                <Grid container spacing={1}   >

                  <Grid item xs={12} sm={6}  >
                    <Paper variant="outlined" className={classes.paper}>


                      <TextField
                        inputProps={{ maxLength: 255 }}
                        error={errorDetails.Title.length === 0 ? false : true} required label="Visitor's Name" name="Title" onChange={handleChangeTxtDetails} value={visitorDetails.Title}
                        variant="standard" className={classes.textField}
                        helperText={errorDetails.Title}
                      />

                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6} >
                    <Paper variant="outlined" className={classes.paper}>
                      <div className={classes.datelabel}>
                        <FormControlLabel

                          control={
                            <Checkbox
                              checked={visitorDetails.Car}
                              onChange={handleChangeTxtDetails}
                              name="Car"
                              color="primary"
                            />
                          }
                          label="With Vehicle?"

                        />
                      </div>


                    </Paper>
                  </Grid>


                  <Grid item xs={12} sm={6}  >
                    {(visitorDetails.Car) &&
                      <span>
                        <Paper variant="outlined" className={classes.paper}>


                          <TextField
                            inputProps={{ maxLength: 255 }}
                            error={errorDetails.Color.length === 0 ? false : true} required label="Color" name="Color" onChange={handleChangeTxtDetails} value={visitorDetails.Color}
                            variant="standard" className={classes.textField}
                            helperText={errorDetails.Color}
                          />


                        </Paper>
                      </span>
                    }
                  </Grid>


                  <Grid item xs={12} sm={6} >
                    {(visitorDetails.Car) &&
                      <span>
                        <Paper variant="outlined" className={classes.paper}>

                          <TextField
                            inputProps={{ maxLength: 255 }}
                            error={errorDetails.PlateNo.length === 0 ? false : true} required label="Plate No." name="PlateNo" onChange={handleChangeTxtDetails} value={visitorDetails.PlateNo}
                            variant="standard" className={classes.textField}
                            helperText={errorDetails.PlateNo}
                          />


                        </Paper>
                      </span>}
                  </Grid>

                  <Grid item xs={12} sm={6}  >
                    {(visitorDetails.Car) && <span>
                      <Paper variant="outlined" className={classes.paper}>


                        <TextField
                          inputProps={{ maxLength: 255 }}
                          error={errorDetails.DriverName.length === 0 ? false : true} required label="Driver's Name" name="DriverName" onChange={handleChangeTxtDetails} value={visitorDetails.DriverName}
                          variant="standard" className={classes.textField}
                          helperText={errorDetails.DriverName}
                        />
                      </Paper>
                    </span>}
                  </Grid>

                  <Grid item xs={12} sm={6} >
                    {(visitorDetails.Car) && <span>
                      <Paper variant="outlined" className={classes.paper}>
                        <TextField
                          inputProps={{ maxLength: 255 }}
                          error={errorDetails.TypeofVehicle.length === 0 ? false : true} required label="Type of Vehicle" name="TypeofVehicle" onChange={handleChangeTxtDetails} value={visitorDetails.TypeofVehicle}
                          variant="standard" className={classes.textField}
                          helperText={errorDetails.TypeofVehicle}
                        />



                      </Paper>
                    </span>}
                  </Grid>
                  {/*

                  <Grid item xs={12} sm={6}  >
                    {(isReceptionist) && <span>
                      <Paper variant="outlined" className={classes.paper}>

                        <FormControl className={classes.textField} error={errorDetails.IDPresentedId.length === 0 ? false : true}>
                          <InputLabel id="idPresentedLabel"   >ID Presented</InputLabel>
                          <Select
                            labelId="idPresentedLabel"
                            id="idPresented"
                            value={visitorDetails.IDPresented}
                            onChange={handleChangeCbo}
                            name='IDPresented'
                          //renderValue={(value) => mapSelect(IDList, value, 'ID', 'IDPresentedId', 'Title')}
                          >
                            {IDList.map((item) => (
                              <MenuItem key={item.Title} value={item.Title}    >
                                {item.Title}
                              </MenuItem>
                            ))}

                          </Select>

                          <FormHelperText id="error-Attach">{errorDetails.IDPresentedId}</FormHelperText>

                        </FormControl>

                      </Paper>
                    </span>}
                  </Grid>

                  <Grid item xs={12} sm={6} >
                    {(isReceptionist) && <span>
                      <Paper variant="outlined" className={classes.paper}>
                        <FormControl className={classes.textField} error={errorDetails.GateNo.length === 0 ? false : true}>
                          <InputLabel id="gateLabel"   >Gate</InputLabel>
                          <Select
                            labelId="gateLabel"
                            id="gate"
                            value={visitorDetails.GateNo}
                            onChange={handleChangeCbo}
                            name='GateNo'
                          // renderValue={(value) => mapSelect(GateList, value, 'ID', 'GateNo', 'Title')}
                          >
                            {GateList.map((item) => (
                              <MenuItem key={item.Id} value={item.Title}    >
                                {item.Title}
                              </MenuItem>
                            ))}

                          </Select>

                          <FormHelperText id="error-Attach">{errorDetails.IDPresentedId}</FormHelperText>

                        </FormControl>


                      </Paper>
                    </span>}
                  </Grid>
                  <Grid item xs={12} sm={6}  >
                    {(isReceptionist) && <span>
                      <Paper variant="outlined" className={classes.paper}>


                        <TextField

                          inputProps={{ maxLength: 255 }}
                          error={errorDetails.AccessCard.length === 0 ? false : true} required label="Access Card No." name="AccessCard" onChange={handleChangeTxtDetails} value={visitorDetails.AccessCard}
                          variant="standard" className={classes.textField}
                          helperText={errorDetails.AccessCard}
                        />

                      </Paper>
                    </span>}
                  </Grid>

                  <Grid item xs={12} sm={6} >
                    {(isReceptionist) && <span>
                      <Paper variant="outlined" className={classes.paper}>
                        <DropzoneArea
                          acceptedFiles={['image/*']}
                          showFileNames={true}
                          showPreviews={true}
                          maxFileSize={70000000}
                          onChange={handleChangeDropZone2}
                          filesLimit={10}
                          //showPreviews={false}
                          showPreviewsInDropzone={false}
                          useChipsForPreview
                          previewGridProps={{ container: { spacing: 1, direction: 'row' } }}
                          previewChipProps={{ classes: { root: classes.previewChip } }}
                          previewText="Selected files"
                          dropzoneText="Add a picture"
                          initialFiles={visitorDetails.Files}
                        />

                      </Paper>
                    </span>}
                  </Grid>
                    */}


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
