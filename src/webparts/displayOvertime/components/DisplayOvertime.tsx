import * as React from 'react';
import $ from 'jquery';
//import styles from './NewVisitor.module.scss';
//import fetch from 'cross-fetch';
import { ISPHttpClientOptions, SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { useState, useEffect, useCallback, Component, useRef } from 'react';
import { IDisplayOvertimeProps } from './IDisplayOvertimeProps';
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
import { doesElementContainFocus } from 'office-ui-fabric-react';
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


export default function Approval(props: IDisplayOvertimeProps) {


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

  const [OutsourceList, setOutsource] = React.useState([]);
  const [PersonnelTypeList, setPersonnel] = React.useState([]);




  const [inputFields, setInputs] = useState(
    {
      ID: null, Title: '', Purpose: '', DeptId: null, Dept: { Title: '' }, Bldg: '', Others: '',
      DateFrom: moment().startOf('day'), DateTo: moment().startOf('day'),
      Remarks1: '', Remarks2: '', SSDDate: null, DeptApproverDate: null,
      StatusId: 0, Status: { Title: '' }, ApproverId: null, Approver: { Title: '', EMail: '' }, Files: [], initFiles: [], origFiles: [],
      SSDApproverId: null, SSDApprover: { Title: '' }, RequestDate: new Date(), Author: { Title: '', EMail: '' }, AuthorId: null
    }
  );
  const [errorFields, setError] = useState(
    {
      Purpose: '', DeptId: '', Bldg: '', Others: '',
      DateFrom: '', DateTo: '',
      Title: '',
      ApproverId: '', Details: '', Remarks1: '', Remarks2: ''
    }
  );
  const [visitorDetails, setVisitorDetails] = useState(
    {
      TimeFrom: inputFields.DateFrom, TimeTo: inputFields.DateTo, OtherSource: '',
      EmpNo: '', Etype: 'BSP', ID: null, Title: '', ParentId: null, Files: [], initFiles: [], origFiles: []
    }
  );
  const [visitorDetailsList, setVisitorDetailsList] = useState([]);


  const [errorDetails, setErrorDetails] = useState(
    {
      TimeFrom: '', TimeTo: '', OtherSource: '',
      EmpNo: '', Etype: '', Title: ''
    }
  );
  const [isAC1Open, setAC1Open] = React.useState(false);
  const [purposeList, setPurpose] = useState([]);
  const [deptList, setDept] = useState([]);
  const [bldgList, setBldg] = useState([]);
  const [approverList, setApprovers] = useState([]);
  const [contactList, setContacts] = React.useState([]);

  const [usersPerDept, setUsersPerDept] = React.useState([]);
  const [openDialogFab, setOpenDialogFab] = useState(false);
  const [fullWidth, setFullWidth] = React.useState(true);
  const [maxWidth, setMaxWidth] = React.useState<DialogProps['maxWidth']>('md');
  const [isEdit, setEditMode] = useState(false);




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
  const handleChipClick = (e, row, ctrl: string) => {
    console.info(e);
    /*
    if (ctrl === 'inputFields') {
      window.open(`${props.siteUrl}/OvertimeLib/${_itemId}/${row}`, "_blank");
    } else {

      //window.open(`${props.siteUrl}/VisitorDetailsLib/${_itemIdDetails}/${row}`, "_blank");
    }*/


    let f = '';
    if (ctrl == 'inputFields') {
      f = `${props.siteUrl}/OvertimeLib/${_itemId}/${row}`;
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
      emailProps.Body = `BSP Access Control System Request Notification.</br></br>Ref No.:${_refno}</br>Purpose:${inputFields.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${_itemId}">link</a>`;


      await sp.utility.sendEmail(emailProps);



    } else if ((isApproverUser) && (sAction === 'approve') && (inputFields.StatusId === 2)) { //for SSD approvers


      toEmail = SSDUsers.map(row => {
        return row.Email;
      });

      emailProps.To = toEmail;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : For Approval ${_refno} - ${inputFields.Purpose}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${_refno}</br>Purpose:${inputFields.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${_itemId}">link</a>`;

      await sp.utility.sendEmail(emailProps);

      toEmail.push(inputFields.Author.EMail);

      emailProps.To = toEmail;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : Approved by ${inputFields.Approver.Title} - ${_refno}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${_refno}</br>Purpose:${inputFields.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${_itemId}">link</a>`;


      await sp.utility.sendEmail(emailProps);


    } else if ((isSSDUser) && (sAction === 'approve') && (inputFields.StatusId === 3)) { //for SSD approvers

      toEmail.push(inputFields.Author.EMail);
      emailProps.To = toEmail;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : Approved by SSD - ${_refno}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${_refno}</br>Purpose:${inputFields.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${_itemId}">link</a>`;


      await sp.utility.sendEmail(emailProps);
    } else if ((isApproverUser) && (sAction === 'deny') && (inputFields.StatusId === 2)) {

      toEmail.push(inputFields.Author.EMail);

      emailProps.To = toEmail;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : Disapproved by ${inputFields.Approver.Title} - ${_refno}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${_refno}</br>Purpose:${inputFields.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${_itemId}">link</a>`;

      await sp.utility.sendEmail(emailProps);

    } else if ((isSSDUser) && (sAction === 'deny') && (inputFields.StatusId === 3)) {

      toEmail.push(inputFields.Author.EMail);

      emailProps.To = toEmail;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : Disapproved by SSD - ${_user.Title} - ${_refno}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${_refno}</br>Purpose:${inputFields.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${_itemId}">link</a>`;

      await sp.utility.sendEmail(emailProps);

    }





  };

  const findUser = async (e) => {
    //setFirstname(e.target.value);
    const tempProps = { ...visitorDetails };

    tempProps.EmpNo = "";
    tempProps.Title = "";
    setVisitorDetails(tempProps);
    if (e.target.value.length > 2) {

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

  const onClickFab = (e) => {
    console.log(e);
    if (e.currentTarget.id === 'addFab') {
      if (inputFields.DeptId) {
        setVisitorDetailsMode('add');
        const tempProps = { ...visitorDetails };
        tempProps.ParentId = null;
        tempProps.ID = null;
        tempProps.Title = '';
        tempProps.EmpNo = '';
        if (visitorDetailsList.length === 0) {
          tempProps.TimeFrom = inputFields.DateFrom;
          tempProps.TimeTo = inputFields.DateTo;
        } else {
          tempProps.TimeFrom = visitorDetailsList[visitorDetailsList.length - 1].TimeFrom;
          tempProps.TimeTo = visitorDetailsList[visitorDetailsList.length - 1].TimeTo;
          tempProps.Etype = visitorDetailsList[visitorDetailsList.length - 1].Etype;
          tempProps.OtherSource = visitorDetailsList[visitorDetailsList.length - 1].OtherSource;
        }
        setVisitorDetails(tempProps);
        setOpenDialogFab(true);
      } else {
        alert('Please select a department before adding employees!');
      }

    } else if (e.currentTarget.id === 'editFab') {
      setVisitorDetailsMode('edit');
      setEditMode(true);

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

  function validateInputs(name, value) {

    const tempProps = { ...errorFields };
    if (value.length === 0) {

      tempProps[name] = "This is a required input field";
      setError(tempProps);

    } else {
      if (name === "DateFrom") {
        if (value > Date.parse(inputFields.DateTo.toString())) {
          tempProps[name] = "From Date should be earlier than To Date";
          setError(tempProps);
        } else {
          tempProps[name] = "";
          setError(tempProps);

        }

      } else if (name === "DateTo") {
        if (Date.parse(inputFields.DateFrom.toString()) > value) {
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
    }




  }
  function validateInputsDetails(name, value) {

    const tempProps = { ...errorDetails };
    if (value.length === 0) {
      tempProps[name] = "This is a required input field";
      setErrorDetails(tempProps);
    } else {
      if (name === "TimeFrom") {
        if (value > Date.parse(visitorDetails.TimeTo.toString())) {
          tempProps[name] = "From Time should be earlier than To Time";
          setErrorDetails(tempProps);
        } else {
          tempProps[name] = "";
          setErrorDetails(tempProps);

        }

      } else if (name === "TimeTo") {
        if (Date.parse(visitorDetails.TimeFrom.toString()) > value) {
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
  const createRequestNo = async (loc: string) => {
    let list = sp.web.lists.getByTitle("RefNoCount");
    let RefNoCount = await sp.web.lists.getByTitle("RefNoCount")
      .items
      .select("*")
      .top(5000)
      .filter(`Title eq 'Overtime'`)
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

      required = ["Purpose", "DeptId", "Bldg", "DateFrom", "DateTo"];
      if (inputFields.Purpose === "Others") {
        required.push('Others');
      }
      if (t === 'submit') {
        required.push('ApproverId');
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
      if (required[i] === "DateFrom") {
        if (Date.parse(inputFields.DateFrom.toString()) > Date.parse(inputFields.DateTo.toString())) {
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
      tempProps.Details = "Visitor Details are required. Please add visitor names by clicking the (+) button.";
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
      if (!visitorDetails[required[i]]) {   // set error messages if invalid
        tempProps[required[i]] = "This is a required input field";
        validbit.push(required[i]);
      }
    }
    if (Date.parse(visitorDetails.TimeFrom.toString()) > Date.parse(visitorDetails.TimeTo.toString())) {
      tempProps.TimeFrom = "From Time should be earlier than To Time";
      validbit.push('TimeFrom');
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
        _itemId = parseInt(getUrlParameter('pid'));

        _user = await sp.web.currentUser();


        let groups = await sp.web.currentUser.groups();
        let isUser = false;
        let isencoder = false;
        let isreceptionist = false;
        let isssd = false;
        let isapproveruser = false;
        let iswalkinapprover = false;


        
        /*let body = {"username": "admin", "password": "admin"};          
        let res =[];
        $.ajax({
          async: false,
          contentType: 'application/json',
          username: "admin",
          password: "admin",
          url: `https://sxv01esbap1d.testbsp.gov.ph/bsp/gateway/WeKnow/edms-GetToken/1.1`,
          type: "POST",
          data: body,
          headers: { "Accept": "application/json; odata=verbose",
          "X-API-Key": "69024b8c-2190-4043-ab8b-e4a62057aa91"},
          success: (data) => {
            res = data;
          },
          error: (err) => {
            console.log('fail');
    
          }
        });*/








        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === Receptionist_Group) {
            setReceptionist(true);
            isUser = true;
            isreceptionist = true;

            break;
          }
        }


        let visitors = await sp.web.lists.getByTitle("Overtime")
          .items
          .select("*,Approver/Title,Approver/EMail, Status/Title,Dept/Title,SSDApprover/Title,Author/Title,Author/EMail")
          .expand('Approver,Dept,Status,SSDApprover,Author').top(5000)
          .filter(`ID eq ${_itemId}`)
          .get();

        setModifiedDate(visitors[0].Modified); //to check if record has been updated
        let users_per_dept = await sp.web.lists.getByTitle("UsersPerDept").items.select("*,Name/Title,Dept/Title").expand('Name,Dept').top(5000).orderBy("Modified", true).filter(`NameId eq ${_user.Id} `).get();
        if (users_per_dept.length > 0) {
          setEncoder(true);
          isUser = true;
          isencoder = true;

        }
        setUsersPerDept(users_per_dept);

        let approvers = await sp.web.lists.getByTitle("Approvers")
          .items
          .select("*,Name/Title, Name/EMail, Dept/Title")
          .expand('Name,Dept').top(5000)
          .filter(`DeptId eq ${visitors[0].DeptId}`)
          .get();

        //setApprovers(approvers);
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

        if (visitors[0].ApproverId === _user.Id) {    //&& visitors[0].StatusId === 2
          setApproverUser(true);
          isapproveruser = true;
          isUser = true;
        }



        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === SSD_Group) {
            setSSDUser(true);
            isUser = true;
            isssd = true;
            break;
          }
        }


        /*
        let optionContacts = await sp.web.lists.getByTitle("Employees")
          .items.select("*").top(5000)
          .filter(`EmpNo eq '${visitors[0].EmpNo}'`).get();
        setContacts(optionContacts);*/


        const sitegroups = await sp.web.siteGroups();
        for (let i = 0; i < sitegroups.length; i++) {
          if (sitegroups[i].LoginName === SSD_Group) {
            console.log(sitegroups[i]);
            const ssdusers = await sp.web.siteGroups.getById(sitegroups[i].Id).users();
            setSSD(ssdusers);       //get ssd user list
          }
        }


        if (isUser) {
          _deptName = visitors[0].Dept.Title;
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


          let visitorslib = await sp.web.getFolderByServerRelativeUrl(props.siteRelativeUrl + '/OvertimeLib/' + _itemId)
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

          let visitordetails = await sp.web.lists.getByTitle("OvertimeDetails")
            .items
            .select("*")
            .top(5000)
            .filter(`ParentId eq ${_itemId}`)
            .get();

          _origVisitorDetailsList = visitordetails; //for comparison of deleted rows

          setVisitorDetailsList(visitordetails);

          let personneltype = await sp.web.lists.getByTitle("PersonnelType")
            .items
            .select("*")
            .top(5000)
            .get();
          setPersonnel(personneltype);

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
    if ((dialogMessage.indexOf("submit") > 0) || (dialogMessage.indexOf("save") > 0) || (dialogMessage.indexOf("approve") > 0) || (dialogMessage.indexOf("deny") > 0)) {
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

      //validateInputs(name, value);
    }
    if (name === "ApproverId") {
      /*
      const url: string = props.siteUrl + `/_api/web/siteusers?$top=5000&$filter=ID eq ${value}`;
      const response = await props.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
      const result = await response.json();

      let aprop = { ...approverDetails };
      aprop.email = result.value[0].Email;
      aprop.name = result.value[0].Title;
      setApproverDetails(aprop);*/


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

    setProgress(true);
    let list = sp.web.lists.getByTitle("Overtime");
    let origVisitors = await list.items.getById(_itemId).get();
    if (origVisitors.Modified === modifiedDate) {


      let bldgfiltered = bldgList.filter((item) => item.Title === inputFields.Bldg);

      _refno = inputFields.Title;
      let statusid = inputFields.StatusId;
      let requestdate = inputFields.RequestDate;
      let ssddate = inputFields.SSDDate;
      let deptapprovedate = inputFields.DeptApproverDate;
      let ssdapproverid = inputFields.SSDApproverId;

      if (sAction === "submit") {
        _refno = await createRequestNo(bldgfiltered[0].LocationCode);
        requestdate = new Date();
        statusid = 2;
      } else if (sAction === "savedraft") {
        statusid = inputFields.StatusId;

      } else if (sAction === "approve") {
        if ((inputFields.StatusId === 2)) {
          statusid = 3;
          deptapprovedate = new Date();

        } else if (inputFields.StatusId === 3) {
          statusid = 4;
          ssdapproverid = _user.Id;
          ssddate = new Date();
        }
      } else if (sAction === "deny") {
        statusid = 6;
        if ((inputFields.StatusId === 2)) {
          statusid = 6;

        } else if (inputFields.StatusId === 3) {
          statusid = 7;

        }
      }


      const iar = await list.items.getById(_itemId).update({
        Title: _refno,
        Purpose: inputFields.Purpose,
        DeptId: inputFields.DeptId,
        Bldg: inputFields.Bldg,
        Others: ((inputFields.Purpose === 'Others') ? inputFields.Others : null),
        DateFrom: moment(inputFields.DateFrom).toISOString(),
        DateTo: moment(inputFields.DateTo).toISOString(),
        ApproverId: inputFields.ApproverId,
        StatusId: statusid,
        RequestDate: moment(requestdate).toISOString(),
        Remarks1: inputFields.Remarks1,
        Remarks2: inputFields.Remarks2,
        SSDApproverId: ssdapproverid,
        SSDDate: moment(ssddate).toISOString(),
        DeptApproverDate: moment(deptapprovedate).toISOString(),

      });

      await sendEmail();



      const f = props.siteRelativeUrl + "/OvertimeLib/" + _itemId;

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

      let list2 = sp.web.lists.getByTitle("OvertimeDetails");

      await Promise.all(visitorDetailsList.map(async (visitor) => {
        if (visitor.ID) {
          const iar2 = await list2.items.getById(visitor.ID).update({
            ParentId: _itemId,
            Title: visitor.Title,
            RequestDate: moment(requestdate).toISOString(),
            DeptId: inputFields.DeptId,
            RefNo: _refno,
            //DateFrom: moment(inputFields.DateTimeVisit).toISOString(),
            //DateTo: moment(inputFields.DateTimeArrival).toISOString(),
            TimeFrom: moment(visitor.TimeFrom).toISOString(),
            TimeTo: moment(visitor.TimeTo).toISOString(),
            Etype: visitor.Etype,
            OtherSource: ((visitor.Etype === 'Others') ? visitor.OtherSource : null),
            EmpNo: visitor.EmpNo.toString(),
            StatusId: statusid
          });


        } else {


          const iar2: IItemAddResult = await sp.web.lists.getByTitle("OvertimeDetails").items.add({
            ParentId: _itemId,
            Title: visitor.Title,
            RequestDate: moment(requestdate).toISOString(),
            DeptId: inputFields.DeptId,
            RefNo: _refno,
            TimeFrom: moment(visitor.TimeFrom).toISOString(),
            TimeTo: moment(visitor.TimeTo).toISOString(),
            Etype: visitor.Etype,
            OtherSource: ((visitor.Etype === 'Others') ? visitor.OtherSource : null),
            EmpNo: visitor.EmpNo.toString(),
            StatusId: statusid

          });

        }

      }));
      await Promise.all(_origVisitorDetailsList.map(async (row) => {   //delete child list items

        let deletelistfiltered0 = visitorDetailsList.filter((item) => item.ID != null);
        let deletelistfiltered = deletelistfiltered0.filter((item) => item.ID === row.ID);
        if (deletelistfiltered.length === 0) {
          let r = await sp.web.lists.getByTitle("OvertimeDetails").items.getById(row.ID).delete();

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
          window.open(url, "_self");

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
        if (forEncoder) {
          vis = true;
        }
      }
    }
    function display() {
      if (!isEdit) {
        vis = true;
      } else {
        if ((forApprover) || (forSSD)) {
          vis = true;
        }
      }

    }
    if ((isEncoder) && ((inputFields.StatusId === 1) || (inputFields.StatusId === 2))) {
      forEncoder = true;
      isEditable = true;
    } else if ((isSSDUser) && (inputFields.StatusId === 3)) {
      forSSD = true;
      isEditable = true;
    }

    if ((isApproverUser) && (inputFields.StatusId === 2)) {
      forApprover = true;
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
        if ((forApprover) || (forSSD)) {
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
      if ((!isEdit) && (inputFields.RequestDate)) {
        vis = true;

      }
    } else if (e === 'ssdapproverdisp') {
      if (!isEdit) {
        if (inputFields.SSDApproverId) {
          vis = true;
        }
      }
    }   else if (e === 'ssddatedisp') {
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
    }  
    return vis;

  };
  const handleCloseDisplay = (e) => {

    let url = props.siteUrl;
    if (_sourceURL) {
      url = _sourceURL;
    }
    window.open(url, "_self");

  };

  return (
    <form noValidate autoComplete="off">
      {(inputFields.ID) &&
        <div className={classes.root} style={{ padding: '12px' }}>


          <Grid container spacing={1}   >
            <Grid item xs={12}>
              <Paper variant="outlined" className={classes.paper}>
                <Box style={{ fontSize: "1.5rem" }} >
                  Display Overtime / Overstay
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

            <Grid item xs={12} sm={6} >
              <Paper variant="outlined" className={classes.paper}>
                {checkAC('deptedit') && <span>

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
                </span>}
                {checkAC('deptdisp') && <span>
                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Requesting Department</Box>
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
                </span>}
                {checkAC('cdisp') && <span>
                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Entry Permit Valid From</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{moment(inputFields.DateFrom).format('MM/DD/yyyy')}</Box>


                </span>}

              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} >
              <Paper variant="outlined" className={classes.paper}>
                {checkAC('cedit') && <span>
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
                </span>}
                {checkAC('cdisp') && <span>
                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Entry Permit Valid To</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{moment(inputFields.DateTo).format('MM/DD/yyyy')}</Box>

                </span>}

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
                {checkAC('cdisp') && <span>

                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Purpose</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.Purpose}</Box>
                </span>}

              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} >
              <Paper variant="outlined" className={classes.paper}>

                {(checkAC('cedit') && (inputFields.Purpose === 'Others')) && <span>

                  <TextField

                    inputProps={{ maxLength: 255 }}
                    error={errorFields.Others.length === 0 ? false : true} required label="Others" name="Others" onChange={handleChangeTxt} value={inputFields.Others}
                    variant="standard" className={classes.textField}
                    helperText={errorFields.Others}
                  />
                </span>}
                {(checkAC('cdisp') && (inputFields.Purpose === 'Others')) && <span>

                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Others</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.Others}</Box>
                </span>}

              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} >
              <Paper variant="outlined" className={classes.paper}>
                <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Form Status</Box>
                <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{inputFields.Status.Title}</Box>



              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" className={classes.paper}>
                {(inputFields.RequestDate) && <span>
                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Request Date</Box>
                  <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{moment(inputFields.RequestDate).format('MM/DD/yyyy')}</Box>

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
                <Box style={{ fontSize: "1 rem" }}>
                  Employee Details
                </Box>

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
                {checkAC('visitordetailsdisp') &&

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

                {checkAC('approversdisp') && <span>
                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Approver</Box>
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

                  <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Approver's Remarks</Box>
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
            open={openDialogFab}
            onClose={handleCloseDialogFab}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">Employee Details</DialogTitle>
            <DialogContent >
              <form noValidate autoComplete="off">
                <div className={classes.root} style={{ padding: '0px' }}>

                  <Grid container spacing={1}   >
                    <Grid item xs={12} sm={6}  >
                      <Paper variant="outlined" className={classes.paper}>
                        {checkAC('cedit') && <span>
                          <div className={classes.datelabel}>
                            <FormControl component="fieldset">

                              <RadioGroup row aria-label="Etype" name="Etype" value={visitorDetails.Etype} onChange={handleChangeTxtDetails}>

                                <FormControlLabel value="BSP" control={<Radio color="primary" />} label="BSP" />
                                <FormControlLabel value="Others" control={<Radio color="primary" />} label="Others" />
                              </RadioGroup>
                            </FormControl>


                          </div>
                        </span>}

                        {checkAC('cdisp') && <span>
                          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Employee Type</Box>
                          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{visitorDetails.Etype}</Box>
                        </span>}


                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}  >
                      <Paper variant="outlined" className={classes.paper}>
                        {(checkAC('cedit') && (visitorDetails.Etype === 'Others')) && <span>
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

                        {(checkAC('cdisp') && (visitorDetails.Etype === 'Others')) && <span>
                          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Others</Box>
                          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{visitorDetails.OtherSource}</Box>
                        </span>}


                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={12}  >
                      <Paper variant="outlined" className={classes.paper}>

                        {(checkAC('cedit') && (visitorDetails.Etype === 'BSP')) && <span>
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
                        {(checkAC('cedit') && (visitorDetails.Etype === 'Others')) && <span>
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


                        {checkAC('cdisp') && <span>
                          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Visitor's Name</Box>
                          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{visitorDetails.Title}</Box>
                        </span>}


                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}  >
                      <Paper variant="outlined" className={classes.paper}>
                        {(checkAC('cedit')) && <span>
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


                        </span>}

                        {checkAC('cdisp') && <span>
                          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Time From</Box>
                          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{moment(visitorDetails.TimeFrom).format('HH:mm')}</Box>
                        </span>}


                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}  >
                      <Paper variant="outlined" className={classes.paper}>
                        {(checkAC('cedit')) && <span>
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

                        </span>}

                        {checkAC('cdisp') && <span>
                          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop} >Time From</Box>
                          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{moment(visitorDetails.TimeFrom).format('HH:mm')}</Box>
                        </span>}


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
