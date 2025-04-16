import * as React from 'react';
import $ from 'jquery';
//import styles from './NewVisitor.module.scss';
//import fetch from 'cross-fetch';
import { ISPHttpClientOptions, SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { useState, useEffect, useCallback, Component, useRef } from 'react';
import { IDisplayVisitorProps } from './IDisplayVisitorProps';
import Box from '@material-ui/core/Box';
import { escape } from '@microsoft/sp-lodash-subset';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import SendIcon from '@material-ui/icons/Send';
import PrintIcon from '@material-ui/icons/Print';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import EditIcon from '@material-ui/icons/Edit';
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import Chip from '@material-ui/core/Chip';

import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';

import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import DoneIcon from '@material-ui/icons/Done';

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
import ReactToPrint from "react-to-print";
//import { BasePeoplePicker } from 'office-ui-fabric-react';


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
      fontFamily: '"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif'

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
      //  fontFamily: '"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif'


    },
    labelbottom: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      fontSize: '18px',
      //fontFamily: '"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif'

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
    rootChip: {
      display: 'flex',
      justifyContent: 'flex-start',
      flexWrap: 'wrap',
      '& > *': {
        margin: theme.spacing(0.5),
      },
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
var _itemIdDetails = 0;
var _sourceURL = null;
var _submit = 1;
var deleteFiles = [];
var deleteFilesDetails = [];
var _origVisitorDetailsList = [];
var _refno = "";
//var sAction = "";
var _colorValue = 'Green';



export default function Approval(props: IDisplayVisitorProps) {


  const inputRef = useRef();
  const classes = useStyles();
  const Encoders_Group = "Encoders";
  const Receptionist_Group = "Receptionist";
  const SSD_Group = "SSD";
  const WalkinApprover_Group = "WalkinApprover";

  const [openDialog, setOpenDialog] = useState(false);
  const [approverDetails, setApproverDetails] = useState({ email: '', name: '' });
  const [isSavingDone, setSavingDone] = useState(false);
  const [isProgress, setProgress] = useState(false);
  const [selectedDate, handleDateChange] = useState(new Date());
  const [dialogMessage, setDialogMessage] = useState("");
  const [selectedResDate, setResDate] = useState(new Date());
  const [isEncoder, setEncoder] = useState(false);
  const [isReceptionist, setReceptionist] = useState(false);
  const [isApproverUser, setApproverUser] = useState(false);
  const [isSSDUser, setSSDUser] = useState(false);
  const [isWalkinApproverUser, setisWalkinApproverUser] = useState(false);
  const [VisitorDetailsMode, setVisitorDetailsMode] = useState('add');
  const [SSDUsers, setSSD] = useState([]);
  const [WalkinApprovers, setWalkinApprovers] = useState([]);
  const [sAction, setsAction] = useState('');



  const [VisitorDetailsFiles, setVisitorDetailsFiles] = useState([]);
  const [VisitorFiles, setVisitorFiles] = useState([]);
  const [idropzoneCounter, setDropzoneCounter] = useState(0);
  const [idropzoneCounter2, setDropzoneCounter2] = useState(0);
  const [modifiedDate, setModifiedDate] = useState<Date>(null);
  const [isHidePrint, setHidePrint] = useState(true);
  const [colorList, setcolorList] = useState([]);



  const [inputFields, setInputs] = useState(
    {
      ID: null, Title: '', ExternalType: '', Purpose: '', DeptId: null, Dept: { Title: '' }, Bldg: '', RoomNo: '',
      EmpNo: '', ContactName: '', Position: '', DirectNo: '', LocalNo: '', DateTimeVisit: new Date(), DateTimeArrival: new Date(),
      CompanyName: '', Address: '', VisContactNo: '', VisLocalNo: '', RequireParking: false, Remarks1: '', Remarks2: '',
      StatusId: 0, Status: { Title: '' }, ApproverId: null, Approver: { Title: '', EMail: '', ID: null }, Files: [], initFiles: [], origFiles: [],
      SSDApproverId: null, SSDApprover: { Title: '' }, RequestDate: new Date(), Author: { Title: '', EMail: '' }, AuthorId: null, colorAccess: 'General',
      SSDDate: null, DeptApproverDate: null, MarkCompleteDate: null, Receptionist: { Title: '' }, ReceptionistId: null,PurposeOthers:''
    }
  );
  const [errorFields, setError] = useState(
    {
      ExternalType: '', Purpose: '', DeptId: '', Bldg: '', RoomNo: '',
      EmpNo: '', Title: '', Position: '', DirectNo: '', LocalNo: '', DateTimeVisit: '', DateTimeArrival: '',
      CompanyName: '', Address: '', VisContactNo: '', VisLocalNo: '', RequireParking: '',
      ApproverId: '', Details: '', Remarks1: '', Remarks2: '',PurposeOthers:''
    }
  );
  const [visitorDetails, setVisitorDetails] = useState(
    {
      ID: null, Title: '', Car: false, AccessCard: '', PlateNo: '', TypeofVehicle: '', Color: '',
      DriverName: '', IDPresented: '', GateNo: '', ParentId: null, Files: [], initFiles: [], origFiles: []
    }
  );
  const [visitorDetailsList, setVisitorDetailsList] = useState([]);


  const [errorDetails, setErrorDetails] = useState(
    {
      Title: '', Car: '', AccessCard: '', PlateNo: '', TypeofVehicle: '', Color: '', DriverName: '', IDPresented: '', GateNo: '', Files: ''
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
  const [openDialogIDFab, setOpenDialogIDFab] = useState(false);
  const [fullWidth, setFullWidth] = React.useState(true);
  const [maxWidth, setMaxWidth] = React.useState<DialogProps['maxWidth']>('md');
  const [isEdit, setEditMode] = useState(false);




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
  const handleChipClick = (e, row, ctrl: string) => {
    console.info(e);

    /*
    if (ctrl === 'inputFields') {
      window.open(`${props.siteUrl}/VisitorsLib/${_itemId}/${row}`, "_blank");
    } else {

      window.open(`${props.siteUrl}/VisitorDetailsLib/${_itemIdDetails}/${row}`, "_blank");
    }*/
    

    let f = '';
    if (ctrl == 'inputFields') {
      f = `${props.siteUrl}/VisitorsLib/${_itemId}/${row}`;

    } else {

      f = `${props.siteUrl}/VisitorDetailsLib/${_itemIdDetails}/${row}`;
    }

    let link = document.createElement('a');
    link.href = f;
    link.download = f.substr(f.lastIndexOf('/') + 1);
    link.click();



  };

  const sendEmail = async () => {

    let toEmail = [];

    let emailProps: IEmailProperties = {
      From: _user.Email,
      To: toEmail,
      //CC: ["user2@site.com", "user3@site.com"],
      //BCC: ["user4@site.com", "user5@site.com"],
      Subject: '',
      Body: '',
      AdditionalHeaders: {
        "content-type": "text/html"
      }
    };



    if ((isEncoder) && (sAction === 'submit') && (inputFields.StatusId === 1)) {
      let approvers = approverList.filter((item) => item.NameId === inputFields.ApproverId);


      let aprop = { ...approverDetails };
      aprop.email = approvers[0].Name.EMail;
      aprop.name = approvers[0].Name.Title;
      setApproverDetails(aprop);

      toEmail.push(approvers[0].Name.EMail);

      emailProps.To = toEmail;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : For Approval ${_refno} - ${inputFields.Purpose}`;
      emailProps.Body = `BSP Access Control System Request Notification.</br></br>Ref No.:${_refno}</br>Purpose:${inputFields.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayVisitorappge.aspx?pid=${_itemId}">link</a>`;


      await sp.utility.sendEmail(emailProps);

    } else if ((isReceptionist) && (sAction === 'submit') && (inputFields.StatusId === 1)) {
      let walkinapprovers = WalkinApprovers.filter((item) => item.NameId === inputFields.ApproverId);


      let aprop = { ...approverDetails };
      aprop.email = walkinapprovers[0].Name.EMail;
      aprop.name = walkinapprovers[0].Name.Title;
      setApproverDetails(aprop);

      toEmail.push(walkinapprovers[0].Name.EMail);

      emailProps.To = toEmail;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : For Confirmation ${_refno} - ${inputFields.Purpose}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${_refno}</br>Purpose:${inputFields.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayVisitorappge.aspx?pid=${_itemId}">link</a>`;

      await sp.utility.sendEmail(emailProps);

    } else if ((isApproverUser) && (sAction === 'approve') && (inputFields.StatusId === 2)) { //for SSD approvers


      toEmail = SSDUsers.map(row => {
        return row.Email;
      });

      emailProps.To = toEmail;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : For Approval ${_refno} - ${inputFields.Purpose}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${_refno}</br>Purpose:${inputFields.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayVisitorappge.aspx?pid=${_itemId}">link</a>`;

      await sp.utility.sendEmail(emailProps);

      toEmail.push(inputFields.Author.EMail);

      emailProps.To = toEmail;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : Approved by ${inputFields.Approver.Title} - ${_refno}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${_refno}</br>Purpose:${inputFields.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayVisitorappge.aspx?pid=${_itemId}">link</a>`;


      await sp.utility.sendEmail(emailProps);
    } else if ((isWalkinApproverUser) && (sAction === 'approve') && (inputFields.StatusId === 2)) {
      let aprop = { ...approverDetails };


      toEmail.push(inputFields.Author.EMail);
      emailProps.To = toEmail;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : Confirmed by ${inputFields.Approver.Title} - ${_refno}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${_refno}</br>Purpose:${inputFields.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayVisitorappge.aspx?pid=${_itemId}">link</a>`;
      await sp.utility.sendEmail(emailProps);

    } else if ((isSSDUser) && (sAction === 'approve') && (inputFields.StatusId === 3)) { //for SSD approvers

      toEmail.push(inputFields.Author.EMail);
      emailProps.To = toEmail;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : Approved by SSD - ${_refno}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${_refno}</br>Purpose:${inputFields.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayVisitorappge.aspx?pid=${_itemId}">link</a>`;


      await sp.utility.sendEmail(emailProps);
    } else if ((isApproverUser) && (sAction === 'deny') && (inputFields.StatusId === 2)) {

      toEmail.push(inputFields.Author.EMail);

      emailProps.To = toEmail;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : Disapproved by ${inputFields.Approver.Title} - ${_refno}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${_refno}</br>Purpose:${inputFields.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayVisitorappge.aspx?pid=${_itemId}">link</a>`;

      await sp.utility.sendEmail(emailProps);
    } else if ((isWalkinApproverUser) && (sAction === 'deny') && (inputFields.StatusId === 2)) {

      toEmail.push(inputFields.Author.EMail);

      emailProps.To = toEmail;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : Disapproved by ${inputFields.Approver.Title} - ${_refno}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${_refno}</br>Purpose:${inputFields.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayVisitorappge.aspx?pid=${_itemId}">link</a>`;

      await sp.utility.sendEmail(emailProps);
    } else if ((isSSDUser) && (sAction === 'deny') && (inputFields.StatusId === 3)) {

      toEmail.push(inputFields.Author.EMail);

      emailProps.To = toEmail;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : Disapproved by SSD - ${_user.Title} - ${_refno}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${_refno}</br>Purpose:${inputFields.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayVisitorappge.aspx?pid=${_itemId}">link</a>`;

      await sp.utility.sendEmail(emailProps);

    }





  };

  const findUser = async (e) => {
    //setFirstname(e.target.value);
    const tempProps = { ...inputFields };
    tempProps.EmpNo = "";
    tempProps.DirectNo = "";
    tempProps.LocalNo = "";
    tempProps.Position = "";
    setInputs(tempProps);
    if (e.target.value.length > 2) {

      //const url: string = props.siteUrl + `/_api/web/siteusers?$top=5000&$filter=substringof('${e.target.value}', Title) and PrincipalType%20eq%201`;
      //const response = await props.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
      //const result = await response.json();
      // let options =  $.map(result.value, function(obj) {
      //   return { Id: obj.Id, Title: obj.Title };    //replace Id to id and Title to text for select2 to accept
      // });


      let options = await sp.web.lists.getByTitle("Employees").items.select("*").top(5000).filter(`substringof('${e.target.value}', Name) and Dept eq '${_deptName}'`).get();
      setContacts(options);



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

    inputFields.origFiles.map(row => {
      let filtered = files.filter((item) => item.name === row.Name);
      if (filtered.length === 0) {
        let deletefiltered = deleteFiles.filter((item) => item.Name === row.Name);
        if (deletefiltered.length === 0) {
          deleteFiles.push(row);
        }
      }
    });




  };
  const handleChangeDropZone2 = (files) => {
    const tempProps = { ...visitorDetails };
    const tempErrorProps = { ...errorDetails };
    tempProps.Files = files;
    tempProps.initFiles = files;   //new 11/25/2021
    setVisitorDetails(tempProps);

    visitorDetails.origFiles.map(row => {
      let filtered = files.filter((item) => item.name === row.Name);




      if (filtered.length === 0) {
        let deletefiltered = deleteFilesDetails.filter((item) => {
          return ((item.Id === _itemIdDetails) && (item.Filename === row.Name));
        });

        if (deletefiltered.length === 0) {
          deleteFilesDetails.push({ Id: _itemIdDetails, Filename: row.Name });
        }

      }



    });
    // if ((isReceptionist) && (inputFields.StatusId == 4)) {
    if (files.length > 0) {
      tempErrorProps.Files = "";
    } else {
      tempErrorProps.Files = "Please upload a file";

    }

    setErrorDetails(tempErrorProps);


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
      tempProps.ID = null;
      tempProps.PlateNo = '';
      tempProps.Title = '';
      tempProps.TypeofVehicle = '';
      setVisitorDetails(tempProps);
      setOpenDialogFab(true);

    } else if (e.currentTarget.id === 'editFab') {
      setVisitorDetailsMode('edit');
      setEditMode(true);
    } else if (e.currentTarget.id === 'printFab') {
      setOpenDialogIDFab(true);

    }
  };
  const handleCloseDialogFab = (e) => {


    if (e.target.innerText === "OK") {
      if (isEdit) {
        if (validateOnSubmitDetails() === true) {
          addVisitor();
          setOpenDialogFab(false);
        }
      } else {
        setOpenDialogFab(false);

      }

    } else {
      setOpenDialogFab(false);

    }


  };
  const handleCloseDialogIDFab = (e) => {


    if (e.target.innerText === "OK") {

      // alert('print');

      // setOpenDialogIDFab(false);



    } else {
      setOpenDialogIDFab(false);

    }


  };

  function validateInputs(name, value) {

    const tempProps = { ...errorFields };
    if (value.length === 0) {

      tempProps[name] = "This is a required input field";
      setError(tempProps);

    } else {
      if (name === "DateTimeVisit") {
        if (value > Date.parse(inputFields.DateTimeArrival.toString())) {
          tempProps[name] = "From Date should be earlier than To Date";
          setError(tempProps);
        } else {
          tempProps[name] = "";
          setError(tempProps);

        }

      } else if (name === "DateTimeArrival") {
        if (Date.parse(inputFields.DateTimeVisit.toString()) > value) {
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
  function validateOnSubmit(t) {
    let isValid = false;
    const tempProps = { ...errorFields };
    let required = [];
    if ((isEncoder) && ((inputFields.StatusId === 1) || (inputFields.StatusId === 2))) {
      required = ["Purpose", "DeptId", "Bldg", "RoomNo", "EmpNo", "DateTimeVisit", "DateTimeArrival",
        'CompanyName', 'Address', 'VisContactNo', 'ApproverId'
      ];
      if (inputFields.Purpose=='Others'){
        required.push('PurposeOthers');
      }
    } else if ((isReceptionist) && ((inputFields.StatusId === 1) || (inputFields.StatusId === 2))) {
      required = ["Purpose", "DeptId", "Bldg", "RoomNo", "EmpNo", "DateTimeVisit", "DateTimeArrival",
        'CompanyName', 'Address', 'VisContactNo', 'ApproverId'
      ];
      if (inputFields.Purpose=='Others'){
        required.push('PurposeOthers');
      }
    } else if ((isApproverUser) && (inputFields.StatusId === 2) && (t === 'deny')) {
      required = ['Remarks1'];
    } else if ((isWalkinApproverUser) && (inputFields.StatusId === 2) && (t === 'deny')) {
      required = ['Remarks1'];
    } else if ((isSSDUser) && (inputFields.StatusId === 3) && (t === 'deny')) {
      required = ['Remarks2'];
    }
    
    let validbit = [];
    for (let i = 0; i < required.length; i++) {
      //alert(required[i]);
      if ((required[i] === "EmpNo") && (inputFields.Purpose === "For receiving")) {
        tempProps[required[i]] = "";
      } else if (required[i] === "DateTimeVisit") {
        if (Date.parse(inputFields.DateTimeVisit.toString()) > Date.parse(inputFields.DateTimeArrival.toString())) {
          tempProps[required[i]] = "From Date should be earlier than To Date";
          validbit.push(required[i]);

        }
      } else if (required[i] === "DateTimeArrival") {
        if (Date.parse(inputFields.DateTimeVisit.toString()) > Date.parse(inputFields.DateTimeArrival.toString())) {
          tempProps[required[i]] = "From Date should be earlier than To Date";
          validbit.push(required[i]);
        }
      } else if ((required[i] === "ApproverId") && (t === 'savedraft')) {

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
    if ((inputFields.StatusId === 4) || (inputFields.StatusId === 9)) {


      for (let i = 0; i < visitorDetailsList.length; i++) {
        let rowData = visitorDetailsList[i];
        let havefiles = false;
        if ((rowData.Files.length > 0) || (rowData.initFiles.length > 0)) {
          havefiles = true;
        }
        //  if (inputFields.StatusId === 4) {
        if ((!havefiles) || (!rowData.AccessCard) || (!rowData.GateNo) || (!rowData.IDPresented)) {
          validbit.push('Details');
          alert(`Please complete Visitor Details of ${rowData.Title} on row ${i + 1}  before saving! `);
          ViewAction('view', rowData);

          break;

        }
        //  }

      }
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
    let required = [];
    let validbit = [];
    if ((isEncoder) && ((inputFields.StatusId === 1) || (inputFields.StatusId === 2))) {
      required = ['Title', 'PlateNo', 'TypeofVehicle', 'Color', 'DriverName'];
    } else if ((isReceptionist) && ((inputFields.StatusId === 4) || (inputFields.StatusId === 9))) {
      required = ['Title', 'PlateNo', 'TypeofVehicle', 'Color', 'DriverName', 'AccessCard', 'IDPresented', 'GateNo'];
      if (visitorDetails.Files.length === 0) { //check all fields if valid
        tempProps.Files = "Please upload a file.";
        validbit.push('Files');
      }


    } else if ((isReceptionist) && ((inputFields.StatusId === 1) || (inputFields.StatusId === 2))) {
      required = ['Title', 'PlateNo', 'TypeofVehicle', 'Color', 'DriverName'];
    }
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

  const onClickSubmit = (e, t: string) => {
    setsAction(t);
    let msg = "";
    if (t === 'savedraft') {

      msg = "Do you want to save and exit?";
    } else if (t === 'submit') {
      msg = "Do you want to submit this form?";
    } else if (t === 'approve') {
      msg = "Do you want to approve this request?";
    } else if (t === 'deny') {
      msg = "Do you want to deny this request?";
    } else if (t === 'markcomplete') {
      msg = "Do you want to complete this request?";
    }
    const isValid = validateOnSubmit(t);
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
        _sourceURL = document.referrer;
        /*uncomment this to get item Terence!!!
        _itemId = parseInt(getUrlParameter('pid'));
        */
       _itemId = 3;
       _user = await sp.web.currentUser();


        let groups = await sp.web.currentUser.groups();
        let isUser = false;
        let isencoder = false;
        let isreceptionist = false;
        let isssd = false;
        let isapproveruser = false;
        let iswalkinapprover = false;



        /*

         for (let i = 0; i < groups.length; i++) {
           if (groups[i].LoginName === Encoders_Group) {
             setEncoder(true);
             isUser = true;
             const tempProps = { ...inputFields };
             tempProps.ExternalType = "Pre-arranged";
             setInputs(tempProps);
             isencoder = true;
             setEncoder(true);
             break;
           }
         }*/




        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === Receptionist_Group) {
            setReceptionist(true);
            isUser = true;
            const tempProps = { ...inputFields };
            //tempProps.ExternalType = "Walk-in";
            setInputs(tempProps);
            isreceptionist = true;
            break;
          }
        }


        let visitors = await sp.web.lists.getByTitle("Visitors")
          .items
          .select("*,Receptionist/Title, Approver/Title,Approver/EMail,Approver/ID, Status/Title,Dept/Title,SSDApprover/Title,Author/Title,Author/EMail")
          .expand('Receptionist,Approver,Dept,Status,SSDApprover,Author').top(5000)
          .filter(`ID eq ${_itemId}`)
          .get();
        console.log("visitors",visitors);
        console.log("ItemId",_itemId);
        setModifiedDate(visitors[0].Modified); //to check if record has been updated
        let users_per_dept = await sp.web.lists.getByTitle("UsersPerDept").items.select("*,Name/Title,Dept/Title").expand('Name,Dept').top(5000).orderBy("Modified", true).filter(`NameId eq ${_user.Id} `).get();
        if (users_per_dept.length > 0) {
          //setEncoder(true);
          isUser = true;
          isencoder = true;
        }
        setUsersPerDept(users_per_dept);

        if ((visitors[0].StatusId == 4) || (visitors[0].StatusId == 9)) {
          if (isreceptionist === true) {
            setHidePrint(false);  //show print button
            let colorlist = await sp.web.lists.getByTitle("IDColor")
              .items
              .select("*")
              .top(5000)
              .get();
            setcolorList(colorlist);
          }
        }

        if ((visitors[0].ExternalType === 'Pre-arranged')) {
          let approvers = await sp.web.lists.getByTitle("Approvers")
            .items
            .select("*,Name/Title, Name/EMail, Dept/Title")
            .expand('Name,Dept').top(5000)
            .filter(`DeptId eq ${visitors[0].DeptId}`)
            .get();

          // setApprovers(approvers);
          let filteredapprovers = [];
          let filtuser = approvers.filter((item) => item.NameId === _user.Id);
          if (filtuser.length > 0) {
            isUser = true;
          }
          if (isencoder) {
            approvers.map(item => {
              if (item.NameId != _user.Id) {
                filteredapprovers.push(item);
              }
            });

          }
          setApprovers(filteredapprovers);
        } else if ((visitors[0].ExternalType === 'Walk-in')) {
          let walkinapprovers = await sp.web.lists.getByTitle("WalkinApprovers")
            .items
            .select("*,Name/Title, Name/EMail, Dept/Title")
            .expand('Name,Dept').top(5000)
            .filter(`DeptId eq ${visitors[0].DeptId}`)
            .get();

          setWalkinApprovers(walkinapprovers);
          let filtuser = walkinapprovers.filter((item) => item.NameId === _user.Id);
          if (filtuser.length > 0) {
            isUser = true;
          }
        }
        /*
        let approverfiltereduser = approvers.filter((item) => {
          return ((item.NameId === _user.Id) && (item.DeptId === visitors[0].DeptId));
        });*/

        if (visitors[0].ApproverId === _user.Id) {    //&& visitors[0].StatusId === 2
          if (visitors[0].ExternalType === "Pre-arranged") {
            setApproverUser(true);
          } else {
            setisWalkinApproverUser(true);
          }
          isapproveruser = true;
          isUser = true;
        }
        if ((visitors[0].ExternalType === "Pre-arranged") && (isencoder)) {
          setEncoder(true);

        }
        /*
        else if ((visitors[0].ExternalType === "Walk-in") && (isreceptionist)) {
          setReceptionist(true);
        }*/


        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === SSD_Group) {
            setSSDUser(true);
            isUser = true;
            isssd = true;
            break;
          }
        }



        let optionContacts = await sp.web.lists.getByTitle("Employees")
          .items.select("*").top(5000)
          .filter(`EmpNo eq '${visitors[0].EmpNo}'`).get();
        setContacts(optionContacts);

      
        const sitegroups = await sp.web.siteGroups();
        for (let i = 0; i < sitegroups.length; i++) {
          console.log("sitegroups", sitegroups[i].LoginName);
          if (sitegroups[i].LoginName === SSD_Group) {
            console.log( "sitegroup", sitegroups[i]);
            const ssdusers = await sp.web.siteGroups.getById(sitegroups[i].Id).users();
            setSSD(ssdusers);       //get ssd user list
          }
        }
      

        /*
        for (let i = 0; i < sitegroups.length; i++) {
          if (sitegroups[i].LoginName === WalkinApprover_Group) {
            console.log(sitegroups[i]);
            const walkinapprovers = await sp.web.siteGroups.getById(sitegroups[i].Id).users();
            setWalkinApprovers(walkinapprovers);
          }
        }*/

        if (isUser) {
          _deptName = visitors[0].Dept.Title;
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

          let visitorslib = await sp.web.getFolderByServerRelativeUrl(props.siteRelativeUrl + '/VisitorsLib/' + _itemId)
            .files
            //.filter("ListItemAllFields/Publish eq " + true)
            .select("*")
            .top(5000)
            //  .orderBy('ListItemAllFields/Name', true)
            .expand('ListItemAllFields') // For Metadata extraction
            .get();

          let files = visitorslib.map(row => {
            return row.Name;
          });
          visitors[0]["Files"] = [];
          visitors[0]["initFiles"] = files;
          visitors[0]["origFiles"] = visitorslib;
          visitors[0]["colorAccess"] = 'General';

          let visitordetails = await sp.web.lists.getByTitle("VisitorDetails")
            .items
            .select("*")
            .top(5000)
            .filter(`ParentId eq ${_itemId}`)
            .get();

          _origVisitorDetailsList = visitordetails; //for comparison of deleted rows

          await Promise.all(visitordetails.map(async (row) => {
            let visitordetailslib = await sp.web.getFolderByServerRelativeUrl(props.siteRelativeUrl + '/VisitorDetailsLib/' + row.ID.toString())
              .files
              .select("*")
              .top(5000)
              .expand('ListItemAllFields') // For Metadata extraction
              .get();
            let files3 = visitordetailslib.map(row3 => {
              return row3.Name;
            });
            row["Files"] = [];
            row["initFiles"] = files3;
            row["origFiles"] = visitordetailslib;

          }));
          setVisitorDetailsList(visitordetails);



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

          setInputs({ ...visitors[0] });

        } else {
          alert("You are not authorized to access this page!");
          window.open(props.siteUrl, "_self");

        }


      } catch (e) {
        console.log(e);
      }

    })();



  }, []);
  async function ViewAction(event, rowData) {
    if (event === 'view') {

      _idx = visitorDetailsList.indexOf(rowData);   //edit save reference
      if (rowData.ID) {
        _itemIdDetails = rowData.ID;
      }

      const tempProps = { ...rowData };

      /*
      if (tempProps.Files.length > 0) {
        let initfiles = [];
        tempProps.Files.map(row => {
          //return row.name;
          initfiles.push(row);

        });
        tempProps.initFiles = initfiles;
      }*/




      setVisitorDetails(tempProps);
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
    } else if (event === 'print') {
      _idx = visitorDetailsList.indexOf(rowData);   //edit save reference
      if (rowData.ID) {
        _itemIdDetails = rowData.ID;
      }

      const tempProps = { ...rowData };
      if (tempProps.Files.length > 0) {
        let initfiles = [];
        tempProps.Files.map(row => {
          //return row.name;
          initfiles.push(row);

        });
        tempProps.initFiles = initfiles;
      }
      setVisitorDetails(tempProps);
      setOpenDialogIDFab(true);
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
    if ((dialogMessage.indexOf("submit") > 0) || (dialogMessage.indexOf("save") > 0) || (dialogMessage.indexOf("approve") > 0) || (dialogMessage.indexOf("deny") > 0) || (dialogMessage.indexOf("complete") > 0)) {
      if (e.target.innerText === "OK") {
        save();
      }
    } else if (dialogMessage.indexOf("discard") > 0) {
      if (e.target.innerText === "OK") {
        let url = props.siteUrl;
        if (_sourceURL) {
          url = _sourceURL;
        }
        window.open(url, "_self");
      }

    }
  };
  const handleChangeCbo = async (event) => {
    const { name, value } = event.target;


    if (name === "DeptId") {
      let deptfiltered = deptList.filter((item) => item.Id === value);
      _deptName = deptfiltered[0].Title;
      if (inputFields.ExternalType === 'Walk-in') {
        let walkinapprovers = await sp.web.lists.getByTitle("WalkinApprovers")
          .items
          .select("*,Name/Title, Name/EMail, Dept/Title")
          .expand('Name,Dept').top(5000)
          .filter(`DeptId eq ${value}`)
          .get();

        setWalkinApprovers(walkinapprovers);
      } else {
        let approvers = await sp.web.lists.getByTitle("Approvers")
          .items
          .select("*,Name/Title, Name/EMail, Dept/Title")
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
      }
      //validateInputs(name, value);
    }
    else if (name === "ApproverId") {
      /*
      const url: string = props.siteUrl + `/_api/web/siteusers?$top=5000&$filter=ID eq ${value}`;
      const response = await props.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
      const result = await response.json();

      let aprop = { ...approverDetails };
      aprop.email = result.value[0].Email;
      aprop.name = result.value[0].Title;
      setApproverDetails(aprop);*/

    } else if (name =='Purpose'){
        inputFields.PurposeOthers = '';
    } else if (name === "colorAccess") {
      let filtered = colorList.filter((item) => item.Title === value);
      _colorValue = filtered[0].ColorCode;
    }

    if (name === 'GateNo' || name === 'IDPresented') {
      const tempProps = { ...visitorDetails };
      tempProps[name] = value;
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

    setProgress(true);
    let list = sp.web.lists.getByTitle("Visitors");
    let origVisitors = await list.items.getById(_itemId).get();
    if (origVisitors.Modified === modifiedDate) {

      let contactsfiltered = contactList.filter((item) => item.EmpNo === inputFields.EmpNo);
      let bldgfiltered = bldgList.filter((item) => item.Title === inputFields.Bldg);

      _refno = inputFields.Title;
      let statusid = inputFields.StatusId;
      let requestdate = inputFields.RequestDate;
      let markcompletedate = inputFields.MarkCompleteDate;
      let ssddate = inputFields.SSDDate;
      let deptapprovedate = inputFields.DeptApproverDate;
      let ssdapproverid = inputFields.SSDApproverId;
      let receptionistid = inputFields.ReceptionistId;

      if (sAction === "submit") {
        _refno = await createRequestNo(bldgfiltered[0].LocationCode);
        requestdate = new Date();
        statusid = 2;
      } else if (sAction === "savedraft") {
        statusid = inputFields.StatusId;
      } else if (sAction === "markcomplete") {
        statusid = 5;
        markcompletedate = new Date();
        receptionistid = _user.Id;

      } else if (sAction === "approve") {
        if ((inputFields.StatusId === 2) && inputFields.ExternalType === 'Pre-arranged') {   //dept approver
          statusid = 3;
          deptapprovedate = new Date();
        } else if ((inputFields.StatusId === 2) && inputFields.ExternalType === 'Walk-in') {
          statusid = 9;
          deptapprovedate = new Date();

        } else if (inputFields.StatusId === 3) {   //ssd approver
          statusid = 4;
          ssdapproverid = _user.Id;
          ssddate = new Date();
        }
      } else if (sAction === "deny") {
        statusid = 6;
        if ((inputFields.StatusId === 2) && inputFields.ExternalType === 'Pre-arranged') {
          statusid = 6;
        } else if ((inputFields.StatusId === 2) && inputFields.ExternalType === 'Walk-in') {
          statusid = 8;

        } else if (inputFields.StatusId === 3) {
          statusid = 7;

        }
      }

      let contact = "";
      if (contactsfiltered.length > 0) {
        contact = contactsfiltered[0].Name;
      }

      const iar = await list.items.getById(_itemId).update({
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
        StatusId: statusid,
        RequestDate: moment(requestdate).toISOString(),
        Remarks1: inputFields.Remarks1,
        Remarks2: inputFields.Remarks2,
        SSDApproverId: ssdapproverid,
        SSDDate: moment(ssddate).toISOString(),
        DeptApproverDate: moment(deptapprovedate).toISOString(),
        MarkCompleteDate: moment(markcompletedate).toISOString(),
        ReceptionistId: receptionistid,
        PurposeOthers: inputFields.PurposeOthers


      });
      //if (_submit === 2) {
      await sendEmail();
      // }


      const f = props.siteRelativeUrl + "/VisitorsLib/" + _itemId;

      await Promise.all(inputFields.Files.map(async (file) => {
        let filt = inputFields.origFiles.filter((f7) => f7.Name === file.name);
        if (filt.length == 0) {        
          if (file.size <= 10485760) {
            // small upload
            await sp.web.getFolderByServerRelativeUrl(f).files.add(file.name, file, true);
          } else {
            // large upload
            await sp.web.getFolderByServerRelativeUrl(f).files.addChunked(file.name, file, d1 => {
              console.log({ data: d1 });
            }, true);
          }
        }
      }));

      await Promise.all(deleteFiles.map(async (file) => {
        let fullpath = f + '/' + file.Name;
        let i3 = await sp.web.getFolderByServerRelativeUrl(fullpath).delete();
      }));

      let list2 = sp.web.lists.getByTitle("VisitorDetails");

      await Promise.all(visitorDetailsList.map(async (visitor) => {
        if (visitor.ID) {
          const iar2 = await list2.items.getById(visitor.ID).update({
            ParentId: _itemId,
            Title: visitor.Title,
            Car: visitor.Car,
            Color: visitor.Color,
            DriverName: visitor.DriverName,
            TypeofVehicle: visitor.TypeofVehicle,
            PlateNo: visitor.PlateNo,
            GateNo: visitor.GateNo,
            IDPresented: visitor.IDPresented,
            AccessCard: visitor.AccessCard,
            RequestDate: moment(requestdate).toISOString(),
            DeptId: inputFields.DeptId,
            RefNo: _refno,
            DateFrom: moment(inputFields.DateTimeVisit).toISOString(),
            DateTo: moment(inputFields.DateTimeArrival).toISOString(),
            CompanyName: inputFields.CompanyName,
            StatusId: statusid
          });

          let f2 = props.siteRelativeUrl + "/VisitorDetailsLib/" + visitor.ID;

          await Promise.all(visitor["Files"].map(async (file) => {
            let filt = visitor["origFiles"].filter((f7) => f7.Name === file.name);
            if (filt.length == 0) {   
              if (file.size <= 10485760) {
                // small upload
                await sp.web.getFolderByServerRelativeUrl(f2).files.add(file.name, file, true);
              } else {
                // large upload
                await sp.web.getFolderByServerRelativeUrl(f2).files.addChunked(file.name, file, d1 => {
                  console.log({ data: d1 });
                }, true);
              }
            }
          }));



        } else {


          const iar2: IItemAddResult = await sp.web.lists.getByTitle("VisitorDetails").items.add({
            ParentId: _itemId,
            Title: visitor.Title,
            Car: visitor.Car,
            Color: visitor.Color,
            DriverName: visitor.DriverName,
            TypeofVehicle: visitor.TypeofVehicle,
            PlateNo: visitor.PlateNo,
            GateNo: visitor.GateNo,
            IDPresented: visitor.IDPresented,
            AccessCard: visitor.AccessCard,
            RequestDate: moment(requestdate).toISOString(),
            DeptId: inputFields.DeptId,
            RefNo: _refno,
            DateFrom: moment(inputFields.DateTimeVisit).toISOString(),
            DateTo: moment(inputFields.DateTimeArrival).toISOString(),
            CompanyName: inputFields.CompanyName,
            StatusId: statusid

          });
          const folderAddResult2 = await sp.web.lists.getByTitle("VisitorDetailsLib").rootFolder.folders.add(iar2.data.ID.toString());
          let f2 = props.siteRelativeUrl + "/VisitorDetailsLib/" + iar2.data.ID;

          await Promise.all(visitor["Files"].map(async (file) => {
            let filt = visitor["origFiles"].filter((f7) => f7.Name === file.name);
            if (filt.length == 0) {   
              if (file.size <= 10485760) {
                // small upload
                await sp.web.getFolderByServerRelativeUrl(f2).files.add(file.name, file, true);
              } else {
                // large upload
                await sp.web.getFolderByServerRelativeUrl(f2).files.addChunked(file.name, file, d1 => {
                  console.log({ data: d1 });
                }, true);
              }
            }
          }));



        }

      }));
      await Promise.all(deleteFilesDetails.map(async (file) => {

        let fullpath = props.siteRelativeUrl + "/VisitorDetailsLib/" + file.Id + '/' + file.Filename;
        const i3 = await sp.web.getFolderByServerRelativeUrl(fullpath).delete();
      }));
      await Promise.all(_origVisitorDetailsList.map(async (row) => {   //delete child list items

        let deletelistfiltered0 = visitorDetailsList.filter((item) => item.ID != null);
        let deletelistfiltered = deletelistfiltered0.filter((item) => item.ID === row.ID);
        if (deletelistfiltered.length === 0) {
          let r = await sp.web.lists.getByTitle("VisitorDetails").items.getById(row.ID).delete();

        }
      }));



      setSavingDone(true);
      setTimeout(
        () => {
          //setProgress(false);
          //window.open(props.siteUrl, "_self");
          let url = props.siteUrl;
          if (_sourceURL) {
            url = _sourceURL;
          }
          if (((inputFields.StatusId == 4) || (inputFields.StatusId == 9)) && (isReceptionist)) {
            url = window.location.href;
            window.open(url, "_self");
          } else {
            window.open(url, "_self");

          }


        },
        1000
      );
    } else {
      alert("Record has been changed by another user!");
      window.open(props.siteUrl, "_self");
    }
  }

  //////
  setTimeout(
    () => {
      //setProgress(false);

      $(".MuiDropzoneArea-root").css("min-height", "10px");

    },
    10
  );
  ////
  const checkAC = (e) => {
    var forApprover = false;
    var forSSD = false;
    var forEncoder = false;
    var forReceptionist = false;
    var forReceptionistCompletion = false;
    var isEditable = false;
    let vis = false; //return to false
    //let isEditable = false;


    function edit() {
      if (isEdit) {
        if ((forEncoder) || (forReceptionist)) {
          vis = true;
        }
      }
    }
    function display() {
      if (!isEdit) {
        vis = true;
      } else {
        if ((forApprover) || (forSSD) || (forReceptionistCompletion)) {
          vis = true;
        }
      }

    }
    if ((inputFields.ExternalType === "Pre-arranged") && (isApproverUser) && (inputFields.StatusId === 2)) {
      forApprover = true;
      isEditable = true;
    } else
      if ((inputFields.ExternalType === "Walk-in") && (isWalkinApproverUser) && (inputFields.StatusId === 2)) {
        forApprover = true;
        isEditable = true;
      } else

        if ((inputFields.ExternalType === "Pre-arranged") && (isEncoder) && ((inputFields.StatusId === 1) || (inputFields.StatusId === 2))) {
          forEncoder = true;
          isEditable = true;
        } else if ((inputFields.ExternalType === "Walk-in") && (isReceptionist) && ((inputFields.StatusId === 1) || (inputFields.StatusId === 2))) {
          forReceptionist = true;
          isEditable = true;

        } else if ((isReceptionist) && (inputFields.StatusId === 4)) {
          forReceptionistCompletion = true;
          isEditable = true;
        } else if ((isReceptionist) && (inputFields.StatusId === 9)) {
          forReceptionistCompletion = true;
          isEditable = true;

        } else if ((inputFields.ExternalType === "Pre-arranged") && (isSSDUser) && (inputFields.StatusId === 3)) {
          forSSD = true;
          isEditable = true;

        }




    if (e === 'editicon') {
      if (isEditable) {
        if (!isEdit) {
          vis = true;
        }
      }

    } else if (e === 'cdisp') {
      display();

    } else if (e === 'cedit') {
      edit();

    } else if (e === 'deptdisp') {
      if (!isEdit) {
        vis = true;
      } else {
        if ((forApprover) || (forSSD) || (forReceptionistCompletion)) {
          vis = true;
        } else if ((isEncoder) && (inputFields.StatusId === 2)) {
          vis = true;

        }
      }

    } else if (e === 'deptedit') {

      // edit();
      if (isEdit) {
        if ((isEncoder) && (inputFields.StatusId === 1)) {
          vis = true;
        } else if (forReceptionist) {
          vis = true;
        }
      }


    } else if (e === 'requireparkingedit') {
      if (isEdit) {
        if ((forEncoder) || (forReceptionist)) {
          vis = false;  //disable false control
        } else {
          vis = true;
        }
      } else {
        vis = true;
      }
    } else if (e === 'addfabdetail') {
      if ((isEdit) && ((forReceptionist) || (forEncoder))) {
        vis = true;
      }

    } else if (e === 'visitordetailsedit') {
      if ((isEdit) && (visitorDetailsList.length > 0) && ((forReceptionist) || (forEncoder))) {
        vis = true;

      }
    } else if (e === 'visitordetailsdisp') {
      if ((!isEdit) && (visitorDetailsList.length > 0)) {
        vis = true;
      } else if ((isEdit) && (visitorDetailsList.length > 0)) {
        if ((forSSD) || (forApprover) || (forReceptionistCompletion)) {
          vis = true;
        }
      }

    } else if (e === 'walkinapproversedit') {
      if (isEdit) {
        if ((isReceptionist) && (inputFields.StatusId === 1)) {
          vis = true;
        }
      }
    } else if (e === 'approversedit') {
      if (isEdit) {
        if ((isEncoder) && (inputFields.StatusId === 1)) {
          vis = true;
        }
      }
    } else if (e === 'approversdisp') {
      if (!isEdit) {
        if (inputFields.ApproverId) {
          vis = true;
        }
      }
    } else if (e === 'addmain1') { //save
      if (isEdit) {
        if ((forEncoder) || (forReceptionist) || (forReceptionistCompletion)) {
          vis = true;
        }
      }
    } else if (e === 'addmain2') {   //submit
      if (isEdit) {
        if ((isEncoder) && ((inputFields.StatusId === 1))) {
          vis = true;
        } else if ((isReceptionist) && ((inputFields.StatusId === 1))) {
          vis = true;
        }
      }
    } else if (e === 'close') {
      if (!isEdit) {
        vis = true;
      }
    } else if (e === 'addapproval') {
      if (isEdit) {
        if ((forApprover) || (forSSD)) {
          vis = true;
        }
      }
    } else if (e === 'remarks1disp') {
      if (!isEdit) {
        if (inputFields.Remarks1) {
          vis = true;
        }
      }
    } else if (e === 'remarks2disp') {
      if (!isEdit) {
        if (inputFields.Remarks2) {
          vis = true;
        }
      }
    } else if (e === 'ssddatedisp') {
      if (!isEdit) {
        if (inputFields.SSDDate) {
          vis = true;
        }
      }
    } else if (e === 'deptdatedisp') {
      if (!isEdit) {
        if (inputFields.DeptApproverDate) {
          vis = true;
        }
      }
    } else if (e === 'markcompletedatedisp') {
      if (!isEdit) {
        if (inputFields.MarkCompleteDate) {
          vis = true;
        }
      }
    } else if (e === 'ssdapproverdisp') {
      if (!isEdit) {
        if (inputFields.SSDApproverId) {
          vis = true;
        }
      }

    } else if (e === 'remarks1edit') {
      if (isEdit) {
        if (forApprover) {
          vis = true;
        }
      }
    } else if (e === 'remarks2edit') {
      if (isEdit) {
        if (forSSD) {
          vis = true;
        }
      }
    } else if (e === 'requestdatedisp') {
      //if ((!isEdit) && (inputFields.RequestDate)) {
      if (inputFields.RequestDate) {

        vis = true;

      }
    } else if (e === 'detailscaredit') {
      if (isEdit) {
        if ((forEncoder) || (forReceptionist)) {
          vis = false;  //disable false control
        } else {
          vis = true;
        }
      } else {
        vis = true;
      }

    } else if (e === 'detailsidpresentededit') {
      if (isEdit) {
        if (forReceptionistCompletion) {
          vis = true;
        }
      }
    } else if (e === 'detailsidpresenteddisp') {
      if (!isEdit) {
        if (visitorDetails.IDPresented) {
          vis = true;
        }
      }
    } else if (e === 'detailsgateedit') {
      if (isEdit) {
        if (forReceptionistCompletion) {
          vis = true;
        }
      }
    } else if (e === 'detailsgatedisp') {
      if (!isEdit) {
        if (visitorDetails.GateNo) {
          vis = true;
        }
      }
    } else if (e === 'detailsaccesscardedit') {
      if (isEdit) {
        if (forReceptionistCompletion) {
          vis = true;
        }
      }
    } else if (e === 'detailsaccesscarddisp') {
      if (!isEdit) {
        if (visitorDetails.AccessCard) {
          vis = true;
        }
      }
    } else if (e === 'dropzone2edit') {
      if (isEdit) {
        if (forReceptionistCompletion) {
          vis = true;
        }
      }
    } else if (e === 'dropzone2disp') {
      if (!isEdit) {
        if (visitorDetails.initFiles.length > 0) {
          vis = true;
        }
      }
    } else if (e === 'markcomplete') {
      if (isEdit) {
        if (forReceptionistCompletion) {
          vis = true;
        }
      }

    }
    return vis;

  };
  const handleCloseDisplay = (e) => {
    /*
    let url = props.siteUrl;
    if (_sourceURL) {
      url = _sourceURL;
    }*/
    window.open(props.siteUrl + '/SitePages/ViewVisitorappge.aspx', "_self");

  };

  return (
    <form noValidate autoComplete="off">
      {(inputFields.ID) &&
        <div className={classes.root} style={{ padding: '12px' }}>


          <Grid container spacing={1}   >
            <Grid item xs={12}>
              <Paper variant="outlined" className={classes.paper}>
                <Box style={{ fontSize: "1.5rem" }} >
                  Display Visitor
                </Box>

              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" className={classes.paper}>

                {checkAC('editicon') &&
                  <span>

                    <Box component="div" style={{ display: 'inline' }} className={classes.floatingbutton}>
                      <Tooltip title="Edit" >
                        <Fab id='editFab' size="medium" color="primary" onClick={onClickFab} >
                          <EditIcon />

                        </Fab>
                      </Tooltip>
                    </Box>
                  </span>
                }



              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" className={classes.paper}>
                {(inputFields.Title) && <span>

                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Reference No.</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}  >{inputFields.Title}</Box>
                </span>}
              </Paper>

            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" className={classes.paper}>
                {checkAC('requestdatedisp') && <span>
                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Request Date</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{moment(inputFields.RequestDate).format('MM/DD/yyyy')}</Box>

                </span>}
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

                {checkAC('cedit') && <span>

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
                </span>}
                {(checkAC('cedit') && (inputFields.Purpose === 'Others')) && <span>

                  <TextField

                    inputProps={{ maxLength: 255 }}
                    error={errorFields.PurposeOthers.length === 0 ? false : true} required label="Others" name="PurposeOthers" onChange={handleChangeTxt} value={inputFields.PurposeOthers}
                    variant="standard" className={classes.textField}
                    helperText={errorFields.PurposeOthers}
                  />
                </span>}
                {checkAC('cdisp') && <span>

                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Purpose</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.Purpose}</Box>
                  
                </span>}
                {checkAC('cdisp') && (inputFields.PurposeOthers)  &&  <span>

                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.PurposeOthers}</Box>
                  
                </span>}

              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} >
              <Paper variant="outlined" className={classes.paper}>
                {checkAC('deptedit') && <span>

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
                </span>}
                {checkAC('deptdisp') && <span>
                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Department to Visit</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.Dept.Title}</Box>


                </span>}

              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} >
              <Paper variant="outlined" className={classes.paper}>
                {checkAC('cedit') && <span>
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
                </span>}

                {checkAC('cdisp') && <span>
                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Building</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.Bldg}</Box>


                </span>}

              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} >
              <Paper variant="outlined" className={classes.paper}>
                {checkAC('cedit') && <span>
                  <TextField

                    inputProps={{ maxLength: 255 }}
                    error={errorFields.RoomNo.length === 0 ? false : true} required label="Room No." name="RoomNo" onChange={handleChangeTxt} value={inputFields.RoomNo}
                    variant="standard" className={classes.textField}
                    helperText={errorFields.RoomNo}
                  />
                </span>}
                {checkAC('cdisp') && <span>
                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Room No.</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.RoomNo}</Box>


                </span>}

              </Paper>

            </Grid>
            <Grid item xs={12} sm={6} >
              <Paper variant="outlined" className={classes.paper}>
                {checkAC('cedit') && <span>
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
                      defaultValue={{ EmpNo: inputFields.EmpNo, Name: inputFields.ContactName }}

                      renderInput={(params) => (
                        <TextField
                          {...params}

                          onChange={findUser}
                          label="Contact Person"
                          variant="standard"
                          helperText={errorFields.EmpNo}
                          error={errorFields.EmpNo.length === 0 ? false : true}
                        />
                      )}
                    />
                    {/* <FormHelperText id="error-Attach">{errorFields.EmpNo}</FormHelperText>*/}


                  </FormControl>
                </span>}
                {checkAC('cdisp') && <span>
                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Contact Person</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.ContactName}</Box>


                </span>}


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
            <Grid item xs={12} sm={6} >
              <Paper variant="outlined" className={classes.paper}>
                <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Local No.</Box>
                <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.LocalNo}</Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} >
              <Paper variant="outlined" className={classes.paper}>
                {checkAC('cedit') && <span>
                  <FormControl className={classes.textField} error={errorFields.DateTimeVisit.length === 0 ? false : true} >


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
                </span>}
                {checkAC('cdisp') && <span>
                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Date and Time of Visit From</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{moment(inputFields.DateTimeVisit).format('MM/DD/yyyy HH:mm')}</Box>


                </span>}

              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} >
              <Paper variant="outlined" className={classes.paper}>
                {checkAC('cedit') && <span>
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
                </span>}
                {checkAC('cdisp') && <span>
                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Date and Time of Visit To</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{moment(inputFields.DateTimeArrival).format('MM/DD/yyyy HH:mm')}</Box>

                </span>}

              </Paper>
            </Grid>
            <Grid item xs={12} sm={12} >

              <Paper variant="outlined" className={classes.paper}>
                {checkAC('cedit') && <span>
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
                    initialFiles={inputFields.initFiles}
                  />
                </span>}
                {checkAC('cdisp') &&


                  <div className={classes.rootChip}>
                    {inputFields.initFiles.map((row) => (
                      <Chip
                        icon={<AttachFileIcon />}
                        label={row}
                        onClick={(e) => handleChipClick(e, row, 'inputFields')}

                        variant="outlined"
                      />
                    ))}
                  </div>

                }

              </Paper>

            </Grid>
            <Grid item xs={12}>
              <Paper variant="outlined" className={classes.paper}>
                <Box style={{ fontSize: "1 rem" }} >
                  Visitor Details
                </Box>

              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} >
              <Paper variant="outlined" className={classes.paper}>
                {checkAC('cedit') && <span>
                  <TextField

                    inputProps={{ maxLength: 255 }}
                    error={errorFields.CompanyName.length === 0 ? false : true} required label="Company Name" name="CompanyName" onChange={handleChangeTxt} value={inputFields.CompanyName}
                    variant="standard" className={classes.textField}
                    helperText={errorFields.CompanyName}
                  />
                </span>}
                {checkAC('cdisp') && <span>
                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Company Name</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.CompanyName}</Box>

                </span>}

              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" className={classes.paper}>
                {checkAC('cedit') && <span>


                  <TextField

                    multiline
                    error={errorFields.Address.length === 0 ? false : true} required label="Address" name="Address" onChange={handleChangeTxt} value={inputFields.Address}
                    variant="standard" className={classes.textField}
                    helperText={errorFields.Address}
                  />
                </span>}
                {checkAC('cdisp') && <span>
                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Address</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.Address}</Box>

                </span>}

              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" className={classes.paper}>
                {checkAC('cedit') && <span>
                  <TextField
                    inputProps={{ maxLength: 255 }}
                    error={errorFields.VisContactNo.length === 0 ? false : true} required label="Contact No." name="VisContactNo" onChange={handleChangeTxt} value={inputFields.VisContactNo}
                    variant="standard" className={classes.textField}
                    helperText={errorFields.VisContactNo}
                  />
                </span>}
                {checkAC('cdisp') && <span>
                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Contact No.</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.VisContactNo}</Box>

                </span>}


              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" className={classes.paper}>
                {checkAC('cedit') && <span>
                  <TextField

                    inputProps={{ maxLength: 255 }}
                    label="Local No." name="VisLocalNo" onChange={handleChangeTxt} value={inputFields.VisLocalNo}
                    variant="standard" className={classes.textField}
                    helperText={errorFields.VisLocalNo}
                  />
                </span>}
                {checkAC('cdisp') && <span>
                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Local No.</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.VisLocalNo}</Box>

                </span>}
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
                        disabled={checkAC('requireparkingedit')}
                      />
                    }
                    label="Request for Parking"

                  />
                </div>

              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} >
              <Paper variant="outlined" className={classes.paper}>
                <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Form Status</Box>
                <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.Status.Title}</Box>



              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper variant="outlined" className={classes.paper}>

                {checkAC('addfabdetail') && <span>


                  <Box component="div" style={{ display: 'inline' }} className={classes.floatingbutton}>
                    <Tooltip title="Visitor Details" >
                      <Fab id='addFab' size="medium" color="primary" onClick={onClickFab} >
                        <AddIcon />

                      </Fab>
                    </Tooltip>
                  </Box>
                </span>}





              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper variant="outlined" className={classes.paper}>
                {checkAC('visitordetailsedit') &&

                  <div >
                    <MaterialTable

                      title="Visitors"
                      columns={[

                        { title: 'Name', field: 'Title' },
                        { title: 'Access Card', field: 'AccessCard' },

                        {
                          title: 'Car', field: "Car",
                          render: rowData => <span>{rowData.Car ? 'With' : 'Without'}</span>
                        },
                        { title: 'Plate No.', field: 'PlateNo' },
                        { title: 'Type of Vehicle', field: "TypeofVehicle" },
                        { title: "Driver's Name", field: "DriverName" },
                        { title: 'Gate', field: "GateNo" },
                        { title: 'ID Presented', field: "IDPresented" },


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
                {checkAC('visitordetailsdisp') && <div >
                  <MaterialTable

                    title="Visitors"
                    columns={[

                      { title: 'Name', field: 'Title' },
                      { title: 'Access Card', field: 'AccessCard' },

                      {
                        title: 'Car', field: "Car",
                        render: rowData => <span>{rowData.Car ? 'With' : 'Without'}</span>
                      },
                      { title: 'Plate No.', field: 'PlateNo' },
                      { title: 'Type of Vehicle', field: "TypeofVehicle" },
                      { title: "Driver's Name", field: "DriverName" },
                      { title: 'Gate', field: "GateNo" },
                      { title: 'ID Presented', field: "IDPresented" },


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
                        icon: () => <PrintIcon />,
                        tooltip: 'Print Preview',
                        hidden: isHidePrint,
                        onClick: (event, rowData) => { ViewAction('print', rowData); },

                      },

                    ]}

                  />
                </div>}
                <FormControl className={classes.textField} error={errorFields.Details.length === 0 ? false : true}>
                  <FormHelperText id="error-Attach">{errorFields.Details}</FormHelperText>
                </FormControl>



              </Paper>
            </Grid>
            <Grid item xs={12} sm={12} >

              <Paper variant="outlined" className={classes.paper}>
                {checkAC('approversedit') && <span>

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
                </span>}
                {checkAC('walkinapproversedit') && <span>

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
                      {WalkinApprovers.map((item) => (
                        <MenuItem key={item.NameId} value={item.NameId}    >
                          {item.Name.Title}
                        </MenuItem>
                      ))}

                    </Select>
                    <FormHelperText id="error-Attach">{errorFields.ApproverId}</FormHelperText>

                  </FormControl>
                </span>}

                {checkAC('approversdisp') && <span>
                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Dept. Approver</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.Approver.Title}</Box>

                </span>}
                {checkAC('deptdatedisp') && <span>

                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}  >{moment(inputFields.DeptApproverDate).format('MM/DD/yyyy HH:mm')}</Box>

                </span>}

              </Paper>


            </Grid>
            <Grid item xs={12} sm={12}>
              <Paper variant="outlined" className={classes.paper}>
                {checkAC('remarks1edit') && <span>
                  <TextField
                    error={errorFields.Remarks1.length === 0 ? false : true}
                    multiline

                    label="Approver's Remarks" name="Remarks1" onChange={handleChangeTxt} value={inputFields.Remarks1}
                    variant="standard" className={classes.textField}
                    helperText={errorFields.Remarks1}
                  />

                </span>}
                {checkAC('remarks1disp') && <span>

                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Dept. Approver's Remarks</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }} className={classes.labelbottom}>{inputFields.Remarks1}</Box>

                </span>}
              </Paper>

            </Grid>
            <Grid item xs={12} sm={12}>
              <Paper variant="outlined" className={classes.paper}>

                {checkAC('ssdapproverdisp') && <span>

                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >SSD Approver</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.SSDApprover.Title}</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}  >{(inputFields.SSDDate ? moment(inputFields.SSDDate).format('MM/DD/yyyy HH:mm') : "")}</Box>


                </span>}

              </Paper>

            </Grid>
            <Grid item xs={12} sm={12}>
              <Paper variant="outlined" className={classes.paper}>

                {checkAC('remarks2edit') && <span>
                  <TextField
                    error={errorFields.Remarks2.length === 0 ? false : true}
                    multiline
                    label="SSD Remarks" name="Remarks2" onChange={handleChangeTxt} value={inputFields.Remarks2}
                    variant="standard" className={classes.textField}
                    helperText={errorFields.Remarks2}
                  />
                </span>}
                {checkAC('remarks2disp') && <span>

                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >SSD Remarks</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }} className={classes.labelbottom}>{inputFields.Remarks2}</Box>

                </span>}
              </Paper>

            </Grid>
            <Grid item xs={12} sm={12}>
              <Paper variant="outlined" className={classes.paper}>

                {checkAC('markcompletedatedisp') && <span>

                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Completed by</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.Receptionist.Title}</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}  >{moment(inputFields.MarkCompleteDate).format('MM/DD/yyyy HH:mm')}</Box>

                </span>}

              </Paper>

            </Grid>

            < Grid container justify="flex-end" >


              {isEdit && <span>
                <ButtonGroup >
                  {checkAC('addmain1') && <span>
                    <Button className={classes.paperbutton} startIcon={<CancelIcon />} variant="contained" color="secondary" onClick={onClickCancel}>
                      Close
                    </Button>
                    <Button name="savedraft" className={classes.paperbutton} startIcon={<SaveIcon />} variant="contained" color="default" onClick={(e) => onClickSubmit(e, 'savedraft')}>
                      Save
                    </Button>
                  </span>}
                  {checkAC('addmain2') && <span>
                    <Button name="submit" className={classes.paperbutton} endIcon={<SendIcon />} variant="contained" color="primary" onClick={(e) => onClickSubmit(e, 'submit')}>
                      Submit
                    </Button>
                  </span>}
                  {checkAC('markcomplete') && <span>
                    <Button name="markcomplete" className={classes.paperbutton} startIcon={<DoneIcon />} variant="contained" color="default" onClick={(e) => onClickSubmit(e, 'markcomplete')}>
                      Mark complete
                    </Button>
                  </span>}
                </ButtonGroup>
              </span>}


              {checkAC('addapproval') && <span>
                <ButtonGroup >
                  <Button className={classes.paperbutton} startIcon={<CancelIcon />} variant="contained" color="default" onClick={onClickCancel}>
                    Close
                  </Button>
                  <Button name="deny" className={classes.paperbutton} startIcon={<ThumbDownIcon />} variant="contained" color="default" onClick={(e) => onClickSubmit(e, 'deny')}>
                    Deny
                  </Button>

                  <Button name="approve" className={classes.paperbutton} startIcon={<ThumbUpIcon />} variant="contained" color="primary" onClick={(e) => onClickSubmit(e, 'approve')}>
                    Approve
                  </Button>
                </ButtonGroup>

              </span>}
              {checkAC('close') && <span>
                <ButtonGroup >
                  <Button className={classes.paperbutton} variant="contained" color="default" onClick={handleCloseDisplay}>
                    Close
                  </Button>
                </ButtonGroup>

              </span>}
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
            open={openDialogIDFab}
            onClose={handleCloseDialogIDFab}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">Print Preview of ID</DialogTitle>
            <DialogContent >
              <form noValidate autoComplete="off">
                <div className={classes.root} style={{ padding: '0px' }}>

                  <Grid container spacing={1}   >

                    <Grid item xs={12}   >
                      <Paper variant="outlined" className={classes.paper}>

                        <FormControl className={classes.textField} >
                          <InputLabel id="colorAccessLabel"   >Color Access</InputLabel>
                          <Select
                            labelId="colorAccessLabel"
                            id="colorAccess"
                            value={inputFields.colorAccess}
                            onChange={handleChangeCbo}
                            name='colorAccess'
                          //renderValue={(value) => mapSelect(IDList, value, 'ID', 'IDPresentedId', 'Title')}
                          >
                            {colorList.map((item) => (
                              <MenuItem key={item.Title} value={item.Title}    >
                                {item.Title}
                              </MenuItem>
                            ))}

                          </Select>


                        </FormControl>



                      </Paper>
                    </Grid>
                    <Grid item xs={12}   >
                      <Paper variant="outlined" className={classes.paper}>
                        <div style={{ maxWidth: '224px', fontFamily: 'Roboto' }} ref={inputRef}>
                          <div> <img src={props.siteUrl + '/DocOthers/idprinthdr.png'} alt="BSP Logo" ></img></div>
                          <div>&nbsp; </div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>{visitorDetails.Title}</div>
                          <div>&nbsp; </div>
                          <table style={{ padding: '1px' }}  >
                            <tbody>
                              <tr >

                                <td><img src={props.siteUrl + '/VisitorDetailsLib/' + _itemIdDetails + '/' + visitorDetails.initFiles[0]} alt="ID Photo" width="110px" height="110px" ></img></td>
                                <td style={{ fontSize: '8px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{visitorDetails.GateNo + '\n' + inputFields.Title + '\nValidity:\n' + moment(inputFields.DateTimeVisit).format('MM/DD/yyyy') + '-\n' + moment(inputFields.DateTimeArrival).format('MM/DD/yyyy')}</td>
                              </tr>
                            </tbody>
                          </table>
                          <div style={{ paddingLeft: '10px', fontSize: '10px', textAlign: 'left' }}>Person to Visit</div>
                          <div style={{ paddingLeft: '10px', fontSize: '10px', fontWeight: 'bold', textAlign: 'left' }}>{inputFields.ContactName}</div>

                          <div style={{ paddingLeft: '10px', fontSize: '10px', textAlign: 'left' }}>Department</div>
                          <div style={{ paddingLeft: '10px', fontSize: '10px', fontWeight: 'bold', textAlign: 'left' }}>{inputFields.Dept.Title}</div>
                          <div>&nbsp; </div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', backgroundColor: _colorValue }}>{inputFields.Bldg}</div>



                        </div>
                      </Paper>
                    </Grid>






                  </Grid>
                </div>
              </form>
            </DialogContent>

            <DialogActions>

              <Button onClick={handleCloseDialogIDFab} color="default" >
                Cancel
              </Button>

              <ReactToPrint
                trigger={() => <Button onClick={handleCloseDialogFab} color="primary" autoFocus >
                  Print
                </Button>

                }
                content={() => inputRef.current}
              />
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
            <DialogTitle id="alert-dialog-title">Visitor Details</DialogTitle>
            <DialogContent >
              <form noValidate autoComplete="off">
                <div className={classes.root} style={{ padding: '0px' }}>

                  <Grid container spacing={1}   >

                    <Grid item xs={12} sm={6}  >
                      <Paper variant="outlined" className={classes.paper}>
                        {checkAC('cedit') && <span>
                          <TextField
                            inputProps={{ maxLength: 255 }}
                            error={errorDetails.Title.length === 0 ? false : true} required label="Visitor's Name" name="Title" onChange={handleChangeTxtDetails} value={visitorDetails.Title}
                            variant="standard" className={classes.textField}
                            helperText={errorDetails.Title}
                          />
                        </span>}

                        {checkAC('cdisp') && <span>

                          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Visitor's Name</Box>
                          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{visitorDetails.Title}</Box>

                        </span>}


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
                                disabled={checkAC('detailscaredit')}
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

                            {checkAC('cedit') && <span>
                              <TextField
                                inputProps={{ maxLength: 255 }}
                                error={errorDetails.Color.length === 0 ? false : true} required label="Color" name="Color" onChange={handleChangeTxtDetails} value={visitorDetails.Color}
                                variant="standard" className={classes.textField}
                                helperText={errorDetails.Color}
                              />
                            </span>}
                            {checkAC('cdisp') && <span>
                              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Color</Box>
                              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{visitorDetails.Color}</Box>
                            </span>}


                          </Paper>
                        </span>
                      }
                    </Grid>


                    <Grid item xs={12} sm={6} >
                      {(visitorDetails.Car) && <span>
                        <Paper variant="outlined" className={classes.paper}>
                          {checkAC('cedit') && <span>

                            <TextField
                              inputProps={{ maxLength: 255 }}
                              error={errorDetails.PlateNo.length === 0 ? false : true} required label="Plate No." name="PlateNo" onChange={handleChangeTxtDetails} value={visitorDetails.PlateNo}
                              variant="standard" className={classes.textField}
                              helperText={errorDetails.PlateNo}
                            />
                          </span>}
                          {checkAC('cdisp') && <span>
                            <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Plate No.</Box>
                            <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{visitorDetails.PlateNo}</Box>
                          </span>}


                        </Paper>
                      </span>}
                    </Grid>

                    <Grid item xs={12} sm={6}  >
                      {(visitorDetails.Car) && <span>
                        <Paper variant="outlined" className={classes.paper}>
                          {checkAC('cedit') && <span>

                            <TextField
                              inputProps={{ maxLength: 255 }}
                              error={errorDetails.DriverName.length === 0 ? false : true} required label="Driver's Name" name="DriverName" onChange={handleChangeTxtDetails} value={visitorDetails.DriverName}
                              variant="standard" className={classes.textField}
                              helperText={errorDetails.DriverName}
                            />
                          </span>}
                          {checkAC('cdisp') && <span>
                            <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Driver's Name</Box>
                            <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{visitorDetails.DriverName}</Box>
                          </span>}


                        </Paper>
                      </span>}
                    </Grid>

                    <Grid item xs={12} sm={6} >
                      {(visitorDetails.Car) && <span>
                        <Paper variant="outlined" className={classes.paper}>
                          {checkAC('cedit') && <span>
                            <TextField
                              inputProps={{ maxLength: 255 }}
                              error={errorDetails.TypeofVehicle.length === 0 ? false : true} required label="Type of Vehicle" name="TypeofVehicle" onChange={handleChangeTxtDetails} value={visitorDetails.TypeofVehicle}
                              variant="standard" className={classes.textField}
                              helperText={errorDetails.TypeofVehicle}
                            />
                          </span>}
                          {checkAC('cdisp') && <span>
                            <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Type of Vehicle</Box>
                            <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{visitorDetails.TypeofVehicle}</Box>
                          </span>}

                        </Paper>
                      </span>}
                    </Grid>


                    <Grid item xs={12} sm={6}  >

                      <Paper variant="outlined" className={classes.paper}>
                        {checkAC('detailsidpresentededit') && <span>

                          <FormControl className={classes.textField} error={errorDetails.IDPresented.length === 0 ? false : true}>
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

                            <FormHelperText id="error-Attach">{errorDetails.IDPresented}</FormHelperText>

                          </FormControl>
                        </span>}
                        {checkAC('detailsidpresenteddisp') && <span>
                          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >ID Presented</Box>
                          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{visitorDetails.IDPresented}</Box>
                        </span>}


                      </Paper>

                    </Grid>

                    <Grid item xs={12} sm={6} >

                      <Paper variant="outlined" className={classes.paper}>
                        {checkAC('detailsgateedit') && <span>
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
                                <MenuItem key={item.Title} value={item.Title}    >
                                  {item.Title}
                                </MenuItem>
                              ))}

                            </Select>

                            <FormHelperText id="error-Attach">{errorDetails.IDPresented}</FormHelperText>

                          </FormControl>
                        </span>}
                        {checkAC('detailsgatedisp') && <span>
                          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Gate</Box>
                          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{visitorDetails.GateNo}</Box>
                        </span>}

                      </Paper>

                    </Grid>
                    <Grid item xs={12} sm={6}  >

                      <Paper variant="outlined" className={classes.paper}>

                        {checkAC('detailsaccesscardedit') && <span>
                          <TextField

                            inputProps={{ maxLength: 255 }}
                            error={errorDetails.AccessCard.length === 0 ? false : true} required label="Access Card No." name="AccessCard" onChange={handleChangeTxtDetails} value={visitorDetails.AccessCard}
                            variant="standard" className={classes.textField}
                            helperText={errorDetails.AccessCard}
                          />
                        </span>}
                        {checkAC('detailsaccesscarddisp') && <span>
                          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Access Card</Box>
                          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{visitorDetails.AccessCard}</Box>
                        </span>}

                      </Paper>

                    </Grid>

                    <Grid item xs={12} sm={6} >
                      <Paper variant="outlined" className={classes.paper}>
                        {/*(isReceptionist) && <span>*/}
                        {checkAC('dropzone2edit') && <span>

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
                            initialFiles={visitorDetails.initFiles}
                          />
                        </span>}
                        {checkAC('dropzone2disp') &&


                          <div className={classes.rootChip}>
                            {visitorDetails.initFiles.map((row) => (
                              <Chip
                                icon={<AttachFileIcon />}
                                label={row}
                                onClick={(e) => handleChipClick(e, row, 'visitorDetails')}

                                variant="outlined"
                              />
                            ))}
                          </div>

                        }
                        <FormControl error>
                          <FormHelperText id="error-Attach">{errorDetails.Files}</FormHelperText>
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
              {((isEncoder || isReceptionist) && (sAction === 'submit')) && <div>
                An email notification has been sent to approver {approverDetails.name}.
              </div>
              }
              {((isApproverUser) && (inputFields.StatusId === 2) && (sAction === 'approve')) && <div>
                An email notification has been sent to the SSD group .
              </div>
              }
              {((isWalkinApproverUser) && (inputFields.StatusId === 2) && (sAction === 'approve')) && <div>
                An email notification has been sent to requestor {inputFields.Author.Title}.
              </div>
              }
              {((isSSDUser) && (inputFields.StatusId === 3) && (sAction === 'approve')) && <div>
                An email notification has been sent to requestor {inputFields.Author.Title}.
              </div>
              }
              {(sAction === 'deny') && <div>
                An email notification has been sent to requestor {inputFields.Author.Title}.
              </div>
              }

            </Alert>
          </Snackbar>

        </div>
      }
    </form >
  );

}
