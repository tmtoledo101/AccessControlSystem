import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { IDisplayVisitorProps } from './IDisplayVisitorProps';
import { IVisitor, IFormError, IApproverDetails } from '../models/IVisitor';
import { IVisitorDetails, IVisitorDetailsError } from '../models/IVisitorDetails';
import { SharePointService } from '../services/SharePointService';
import { EmailService } from '../services/EmailService';
import { FileService } from '../services/FileService';
import { getUrlParameter } from '../helpers/urlHelpers';

// Section components
import HeaderSection from './sections/HeaderSection';
import VisitorInformationSection from './sections/VisitorInformationSection';
import VisitorDetailsSection from './sections/VisitorDetailsSection';
import ApprovalSection from './sections/ApprovalSection';
import ActionButtonsSection from './sections/ActionButtonsSection';

// Dialog components
import ConfirmationDialog from './dialogs/ConfirmationDialog';
import VisitorDetailsDialog from './dialogs/VisitorDetailsDialog';
import PrintIDDialog from './dialogs/PrintIDDialog';

// Material UI imports
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

// Define styles
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      fontFamily: '"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
      padding: '12px'
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
  }),
);

// Alert component
function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

/**
 * DisplayVisitor component
 * @param props Component properties
 * @returns JSX element
 */
const DisplayVisitor: React.FC<IDisplayVisitorProps> = (props) => {
  const classes = useStyles();
  const printRef = useRef<HTMLDivElement>(null);
  
  // Constants
  const Encoders_Group = "Encoders";
  const Receptionist_Group = "Receptionist";
  const SSD_Group = "SSD";
  const WalkinApprover_Group = "WalkinApprover";
  
  // Services
  const sharePointService = new SharePointService(props.siteUrl, props.siteRelativeUrl);
  const fileService = new FileService(props.siteRelativeUrl);
  
  // State variables
  const [openDialog, setOpenDialog] = useState(false);
  const [approverDetails, setApproverDetails] = useState<IApproverDetails>({ email: '', name: '' });
  const [isSavingDone, setSavingDone] = useState(false);
  const [isProgress, setProgress] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isEncoder, setEncoder] = useState(false);
  const [isReceptionist, setReceptionist] = useState(false);
  const [isApproverUser, setApproverUser] = useState(false);
  const [isSSDUser, setSSDUser] = useState(false);
  const [isWalkinApproverUser, setisWalkinApproverUser] = useState(false);
  const [visitorDetailsMode, setVisitorDetailsMode] = useState('add');
  const [SSDUsers, setSSD] = useState([]);
  const [WalkinApprovers, setWalkinApprovers] = useState([]);
  const [sAction, setsAction] = useState('');
  const [modifiedDate, setModifiedDate] = useState<Date>(null);
  const [isHidePrint, setHidePrint] = useState(true);
  const [colorList, setcolorList] = useState([]);
  const [purposeList, setPurpose] = useState([]);
  const [deptList, setDept] = useState([]);
  const [bldgList, setBldg] = useState([]);
  const [approverList, setApprovers] = useState([]);
  const [contactList, setContacts] = React.useState([]);
  const [IDList, setIDs] = React.useState([]);
  const [GateList, setGates] = React.useState([]);
  const [usersPerDept, setUsersPerDept] = React.useState([]);
  const [isAC1Open, setAC1Open] = React.useState(false);
  const [openDialogFab, setOpenDialogFab] = useState(false);
  const [openDialogIDFab, setOpenDialogIDFab] = useState(false);
  const [isEdit, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Form state
  const [inputFields, setInputs] = useState<IVisitor>({
    ID: null, 
    Title: '', 
    ExternalType: '', 
    Purpose: '', 
    DeptId: null, 
    Dept: { Title: '' }, 
    Bldg: '', 
    RoomNo: '',
    EmpNo: '', 
    ContactName: '', 
    Position: '', 
    DirectNo: '', 
    LocalNo: '', 
    DateTimeVisit: new Date(), 
    DateTimeArrival: new Date(),
    CompanyName: '', 
    Address: '', 
    VisContactNo: '', 
    VisLocalNo: '', 
    RequireParking: false, 
    Remarks1: '', 
    Remarks2: '',
    StatusId: 0, 
    Status: { Title: '' }, 
    ApproverId: null, 
    Approver: { Title: '', EMail: '', ID: null }, 
    Files: [], 
    initFiles: [], 
    origFiles: [],
    SSDApproverId: null, 
    SSDApprover: { Title: '' }, 
    RequestDate: new Date(), 
    Author: { Title: '', EMail: '' }, 
    AuthorId: null, 
    colorAccess: 'General',
    SSDDate: null, 
    DeptApproverDate: null, 
    MarkCompleteDate: null, 
    Receptionist: { Title: '' }, 
    ReceptionistId: null,
    PurposeOthers: ''
  });
  
  const [errorFields, setError] = useState<IFormError>({
    ExternalType: '', 
    Purpose: '', 
    DeptId: '', 
    Bldg: '', 
    RoomNo: '',
    EmpNo: '', 
    Title: '', 
    Position: '', 
    DirectNo: '', 
    LocalNo: '', 
    DateTimeVisit: '', 
    DateTimeArrival: '',
    CompanyName: '', 
    Address: '', 
    VisContactNo: '', 
    VisLocalNo: '', 
    RequireParking: '',
    ApproverId: '', 
    Details: '', 
    Remarks1: '', 
    Remarks2: '',
    PurposeOthers: ''
  });
  
  const [visitorDetails, setVisitorDetails] = useState<IVisitorDetails>({
    ID: null, 
    Title: '', 
    Car: false, 
    AccessCard: '', 
    PlateNo: '', 
    TypeofVehicle: '', 
    Color: '',
    DriverName: '', 
    IDPresented: '', 
    GateNo: '', 
    ParentId: null, 
    Files: [], 
    initFiles: [], 
    origFiles: []
  });
  
  const [visitorDetailsList, setVisitorDetailsList] = useState<IVisitorDetails[]>([]);
  
  const [errorDetails, setErrorDetails] = useState<IVisitorDetailsError>({
    Title: '', 
    Car: '', 
    AccessCard: '', 
    PlateNo: '', 
    TypeofVehicle: '', 
    Color: '', 
    DriverName: '', 
    IDPresented: '', 
    GateNo: '', 
    Files: ''
  });
  
  // Variables
  let _idx = -1;
  let _deptName = "";
  let _itemId = 0;
  let _itemIdDetails = 0;
  let _sourceURL = null;
  let _refno = "";
  let _colorValue = 'Green';
  let deleteFiles = [];
  let deleteFilesDetails = [];
  let _origVisitorDetailsList = [];
  
  /**
   * Initializes the component
   */
  useEffect(() => {
    (async () => {
      try {
        setProgress(true);
        
        // Get URL parameters
        _sourceURL = document.referrer;
       // _itemId = parseInt(getUrlParameter('pid'));
       _itemId = 5;
        // Get current user
        const user = await sharePointService.getCurrentUser();
        setCurrentUser(user);
        console.log("User",user);
        // Check user groups
        const groups = await sharePointService.getCurrentUserGroups();
        let isUser = false;
        let isencoder = false;
        let isreceptionist = false;
        console.log("Groups:",groups);
        // Check if user is in Receptionist group
        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === Receptionist_Group) {
            setReceptionist(true);
            isUser = true;
            isreceptionist = true;
            break;
          }
        }
        
        // Get visitor data
        const visitor = await sharePointService.getVisitorById(_itemId);
        if (!visitor) {
          setProgress(false);
          return;
        }
        
        setModifiedDate(visitor.Modified); // to check if record has been updated
        
        // Check if user is in UsersPerDept
        const users_per_dept = await sharePointService.getDepartments(user.Id);
        if (users_per_dept.length > 0) {
          isUser = true;
          isencoder = true;
          setEncoder(true);
        }
        setUsersPerDept(users_per_dept);
        
        // Show print button for receptionist
        if ((visitor.StatusId == 4 || visitor.StatusId == 9) && isreceptionist) {
          setHidePrint(false);
          const colorlist = await sharePointService.getIDColors();
          setcolorList(colorlist);
        }
        
        // Check if user is approver
        if (visitor.ExternalType === 'Pre-arranged') {
          const approvers = await sharePointService.getApprovers(visitor.DeptId, user.Id);
          setApprovers(approvers);
          
          const filtuser = approvers.filter(item => item.NameId === user.Id);
          if (filtuser.length > 0) {
            isUser = true;
          }
        } else if (visitor.ExternalType === 'Walk-in') {
          const walkinapprovers = await sharePointService.getWalkinApprovers(visitor.DeptId);
          setWalkinApprovers(walkinapprovers);
          
          const filtuser = walkinapprovers.filter(item => item.NameId === user.Id);
          if (filtuser.length > 0) {
            isUser = true;
          }
        }
        
        // Set user roles
        if (visitor.ApproverId === user.Id) {
          if (visitor.ExternalType === "Pre-arranged") {
            setApproverUser(true);
          } else {
            setisWalkinApproverUser(true);
          }
          isUser = true;
        }
        
        if ((visitor.ExternalType === "Pre-arranged") && (isencoder)) {
          setEncoder(true);
        }
        
        // Check if user is in SSD group
        console.log("groups: ", groups.length);
        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === SSD_Group) {
            console.log("Login name: ", groups[i].LoginName, " SSD Group: ", SSD_Group);
            setSSDUser(true);
            isUser = true;
            break;
          }
        }
        
        // Log the current user type
        console.log("Current User Type:", {
          "Is Encoder": isencoder,
          "Is Receptionist": isreceptionist,
          "Is Department Approver": isApproverUser,
          "Is SSD Approver": isSSDUser,
          "Is Walk-in Approver": isWalkinApproverUser,
          "IsEdit": isEdit
        });
        
        if (isUser) {
          _deptName = visitor.Dept.Title;
          
          // Get lookup data
          const purpose = await sharePointService.getPurposes();
          setPurpose(purpose);
          
          const building = await sharePointService.getBuildings();
          setBldg(building);
          
          const depts = await sharePointService.getDepartments();
          
          if (isencoder) {
            const mappedrows = [];
            depts.forEach(row => {
              const filtered = users_per_dept.filter(item => item.DeptId === row.Id);
              if (filtered.length > 0) {
                mappedrows.push(row);
              }
            });
            setDept(mappedrows);
          } else if (isreceptionist) {
            setDept(depts);
          }
          
          // Get contact information
          const optionContacts = await sharePointService.getEmployeeByEmpNo(visitor.EmpNo);
          setContacts(optionContacts);
          
          // Get SSD users
          const ssdUsers = await sharePointService.getSSDUsers();
          console.log("SSD Users", ssdUsers);
          setSSD(ssdUsers);
          
          // Get visitor details
          const visitordetails = await sharePointService.getVisitorDetailsByParentId(_itemId);
          _origVisitorDetailsList = visitordetails;
          setVisitorDetailsList(visitordetails);
          
          // Get gates and ID types
          const gates = await sharePointService.getGates();
          setGates(gates);
          
          const idpresented = await sharePointService.getIDTypes();
          setIDs(idpresented);
          
          // Set form data
          setInputs({ ...visitor });
        } else {
          alert("You are not authorized to access this page!");
          window.open(props.siteUrl, "_self");
        }
        
        setProgress(false);
      } catch (e) {
        console.error(e);
        setProgress(false);
      }
    })();
  }, []);
  
  /**
   * Sends email notifications
   */
  const sendEmail = async () => {
    const emailService = new EmailService(props.siteUrl, currentUser.Email);
    await emailService.sendNotification(
      sAction,
      inputFields,
      approverDetails,
      isEncoder,
      isReceptionist,
      isApproverUser,
      isWalkinApproverUser,
      isSSDUser,
      SSDUsers,
      visitorDetailsList
    );
    
    // Set success message
    const message = emailService.getSuccessMessage(
      sAction,
      inputFields,
      approverDetails,
      isEncoder,
      isReceptionist,
      isApproverUser,
      isWalkinApproverUser,
      isSSDUser
    );
    
    setSuccessMessage(message);
  };
  
  /**
   * Validates input fields
   * @param name Field name
   * @param value Field value
   */
  const validateInputs = (name, value) => {
    const tempProps = { ...errorFields };
    
    // Skip validation for EmpNo field (Contact Person) - TEMPORARY FOR TESTING DELETE this Terence !!!
    if (name === "EmpNo") {
      tempProps[name] = "";
      setError(tempProps);
      return;
    }
    
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
    }
  };
  
  /**
   * Validates visitor details input fields
   * @param name Field name
   * @param value Field value
   */
  const validateInputsDetails = (name, value) => {
    const tempProps = { ...errorDetails };
    
    if (value.length === 0) {
      tempProps[name] = "This is a required input field";
      setErrorDetails(tempProps);
    } else {
      tempProps[name] = "";
      setErrorDetails(tempProps);
    }
  };
  
  /**
   * Validates the form before submission
   * @param t Action type
   * @returns Whether the form is valid
   */
  const validateOnSubmit = (t: string): boolean => {
    let isValid = false;
    const tempProps = { ...errorFields };
    const required = [];
    
    // Determine required fields based on user role and action
    if ((isEncoder) && ((inputFields.StatusId === 1) || (inputFields.StatusId === 2))) {
      // Remove EmpNo from required fields - TEMPORARY FOR TESTING
      required.push("Purpose", "DeptId", "Bldg", "RoomNo", "DateTimeVisit", "DateTimeArrival",
        'CompanyName', 'Address', 'VisContactNo', 'ApproverId'
      );
      if (inputFields.Purpose === 'Others') {
        required.push('PurposeOthers');
      }
    } else if ((isReceptionist) && ((inputFields.StatusId === 1) || (inputFields.StatusId === 2))) {
      required.push("Purpose", "DeptId", "Bldg", "RoomNo", "EmpNo", "DateTimeVisit", "DateTimeArrival",
        'CompanyName', 'Address', 'VisContactNo', 'ApproverId'
      );
      if (inputFields.Purpose === 'Others') {
        required.push('PurposeOthers');
      }
    } else if ((isApproverUser) && (inputFields.StatusId === 2) && (t === 'deny')) {
      required.push('Remarks1');
    } else if ((isWalkinApproverUser) && (inputFields.StatusId === 2) && (t === 'deny')) {
      required.push('Remarks1');
    } else if ((isSSDUser) && (inputFields.StatusId === 3) && (t === 'deny')) {
      required.push('Remarks2');
    }
    
    const validbit = [];
    
    // Validate each required field
    for (let i = 0; i < required.length; i++) {
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
    
    // Check visitor details files for receptionist
    if ((inputFields.StatusId === 4) || (inputFields.StatusId === 9)) {
      for (let i = 0; i < visitorDetailsList.length; i++) {
        const rowData = visitorDetailsList[i];
        let havefiles = false;
        
        if ((rowData.Files.length > 0) || (rowData.initFiles.length > 0)) {
          havefiles = true;
        }
        
        if ((!havefiles) || (!rowData.AccessCard) || (!rowData.GateNo) || (!rowData.IDPresented)) {
          validbit.push('Details');
          alert(`Please complete Visitor Details of ${rowData.Title} on row ${i + 1} before saving!`);
          handleVisitorDetailsAction('view', rowData);
          break;
        }
      }
    }
    
    // If no validation errors, the form is valid
    if (validbit.length === 0) {
      isValid = true;
    }
    
    setError(tempProps);
    return isValid;
  };
  
  /**
   * Validates visitor details before submission
   * @returns Whether the visitor details are valid
   */
  const validateOnSubmitDetails = (): boolean => {
    let isValid = false;
    const tempProps = { ...errorDetails };
    const required = [];
    
    // Determine required fields based on user role and status
    if ((isEncoder) && ((inputFields.StatusId === 1) || (inputFields.StatusId === 2))) {
      required.push('Title', 'PlateNo', 'TypeofVehicle', 'Color', 'DriverName');
    } else if ((isReceptionist) && ((inputFields.StatusId === 4) || (inputFields.StatusId === 9))) {
      required.push('Title', 'PlateNo', 'TypeofVehicle', 'Color', 'DriverName', 'AccessCard', 'IDPresented', 'GateNo');
      
      // Check for files
      if (visitorDetails.Files.length === 0) {
        tempProps.Files = "Please upload a file.";
      }
    } else if ((isReceptionist) && ((inputFields.StatusId === 1) || (inputFields.StatusId === 2))) {
      required.push('Title', 'PlateNo', 'TypeofVehicle', 'Color', 'DriverName');
    }
    
    const validbit = [];
    
    // Validate each required field
    for (let i = 0; i < required.length; i++) {
      if ((required[i] === "PlateNo") && (visitorDetails.Car === false)) {
        tempProps[required[i]] = "";
      } else if ((required[i] === "TypeofVehicle") && (visitorDetails.Car === false)) {
        tempProps[required[i]] = "";
      } else if ((required[i] === "Color") && (visitorDetails.Car === false)) {
        tempProps[required[i]] = "";
      } else if ((required[i] === "DriverName") && (visitorDetails.Car === false)) {
        tempProps[required[i]] = "";
      } else {
        if (!visitorDetails[required[i]]) {
          tempProps[required[i]] = "This is a required input field";
          validbit.push(required[i]);
        }
      }
    }
    
    // If no validation errors, the form is valid
    if (validbit.length === 0) {
      isValid = true;
    }
    
    setErrorDetails(tempProps);
    return isValid;
  };
  
  /**
   * Handles submit button click
   * @param e Event
   * @param t Action type
   */
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
  
  /**
   * Handles cancel button click
   */
  const onClickCancel = (e) => {
    setDialogMessage("Do you want to discard changes and exit?");
    setOpenDialog(true);
  };
  
  /**
   * Handles close button click
   */
  const handleCloseDisplay = () => {
    window.open(props.siteUrl + '/SitePages/ViewVisitorappge.aspx', "_self");
  };
  
  /**
   * Handles confirmation dialog close
   * @param confirmed Whether the user confirmed the action
   */
  const handleCloseDialog = (confirmed: boolean) => {
    setOpenDialog(false);
    
    if (confirmed) {
      if ((dialogMessage.indexOf("submit") > 0) || 
          (dialogMessage.indexOf("save") > 0) || 
          (dialogMessage.indexOf("approve") > 0) || 
          (dialogMessage.indexOf("deny") > 0) || 
          (dialogMessage.indexOf("complete") > 0)) {
        save();
      } else if (dialogMessage.indexOf("discard") > 0) {
        let url = props.siteUrl;
        if (_sourceURL) {
          url = _sourceURL;
        }
        window.open(url, "_self");
      }
    }
  };
  
  /**
   * Handles select field changes
   * @param event Event
   */
  const handleChangeCbo = async (event) => {
    const { name, value } = event.target;
    
    if (name === "DeptId") {
      const deptfiltered = deptList.filter(item => item.Id === value);
      _deptName = deptfiltered[0].Title;
      
      if (inputFields.ExternalType === 'Walk-in') {
        const walkinapprovers = await sharePointService.getWalkinApprovers(value);
        setWalkinApprovers(walkinapprovers);
      } else {
        const approvers = await sharePointService.getApprovers(value, currentUser.Id);
        setApprovers(approvers);
      }
    } else if (name === "Purpose") {
      if (value === 'Others') {
        const tempProps = { ...inputFields };
        tempProps.PurposeOthers = '';
        setInputs(tempProps);
      }
    } else if (name === "colorAccess") {
      const filtered = colorList.filter(item => item.Title === value);
      if (filtered.length > 0) {
        _colorValue = filtered[0].ColorCode;
      }
    }
    
    const tempProps = { ...inputFields };
    tempProps[name] = value;
    setInputs(tempProps);
    validateInputs(name, value);
  };
  
  /**
   * Handles text field changes
   * @param e Event
   */
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
  
  /**
   * Handles text field changes for visitor details
   * @param e Event
   */
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
  
  /**
   * Handles date time changes
   * @param e Date value
   * @param name Field name
   */
  const onDateTimeVisitChange = (e, name) => {
    const tempProps = { ...inputFields };
    tempProps[name] = e;
    setInputs(tempProps);
    validateInputs(name, e);
  };
  
  /**
   * Handles dropzone changes
   * @param files Files
   */
  const handleChangeDropZone = (files) => {
    const tempProps = { ...inputFields };
    tempProps.Files = files;
    setInputs(tempProps);
    
    inputFields.origFiles.forEach(row => {
      const filtered = files.filter(item => item.name === row.Name);
      if (filtered.length === 0) {
        const deletefiltered = deleteFiles.filter(item => item.Name === row.Name);
        if (deletefiltered.length === 0) {
          deleteFiles.push(row);
        }
      }
    });
  };
  
  /**
   * Handles dropzone changes for visitor details
   * @param files Files
   */
  const handleChangeDropZone2 = (files) => {
    const tempProps = { ...visitorDetails };
    const tempErrorProps = { ...errorDetails };
    tempProps.Files = files;
    tempProps.initFiles = files;
    setVisitorDetails(tempProps);
    
    visitorDetails.origFiles.forEach(row => {
      const filtered = files.filter(item => item.name === row.Name);
      
      if (filtered.length === 0) {
        const deletefiltered = deleteFilesDetails.filter(item => {
          return ((item.Id === _itemIdDetails) && (item.Filename === row.Name));
        });
        
        if (deletefiltered.length === 0) {
          deleteFilesDetails.push({ Id: _itemIdDetails, Filename: row.Name });
        }
      }
    });
    
    if (files.length > 0) {
      tempErrorProps.Files = "";
    } else {
      tempErrorProps.Files = "Please upload a file";
    }
    
    setErrorDetails(tempErrorProps);
  };
  
  /**
   * Handles autocomplete selection
   * @param event Event
   * @param value Selected value
   */
  const handleACSelectedValue = (event, value) => {
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
  
  /**
   * Handles finding a user
   * @param e Event
   */
  const findUser = async (e) => {
    const tempProps = { ...inputFields };
    tempProps.EmpNo = "";
    tempProps.DirectNo = "";
    tempProps.LocalNo = "";
    tempProps.Position = "";
    setInputs(tempProps);
    
    if (e.target.value.length > 2) {
      const options = await sharePointService.getEmployeesByName(e.target.value, _deptName);
      setContacts(options);
    } else if (e.target.value.length < 3) {
      setContacts([]);
    }
  };
  
  /**
   * Handles visitor details action
   * @param action Action to perform
   * @param rowData Row data
   */
  const handleVisitorDetailsAction = (action: string, rowData: IVisitorDetails) => {
    if (action === 'view') {
      _idx = visitorDetailsList.indexOf(rowData);
      if (rowData.ID) {
        _itemIdDetails = rowData.ID;
      }
      
      setVisitorDetails(rowData);
      setVisitorDetailsMode('edit');
      setOpenDialogFab(true);
    } else if (action === 'delete') {
      const idx = visitorDetailsList.indexOf(rowData);
      const tempProps = [...visitorDetailsList];
      tempProps.splice(idx, 1);
      setVisitorDetailsList(tempProps);
      
      if (tempProps.length === 0) {
        const tempProps2 = { ...errorFields };
        tempProps2.Details = "Visitor Details are required. Please add visitor names.";
        setError(tempProps2);
      }
    } else if (action === 'print') {
      _idx = visitorDetailsList.indexOf(rowData);
      if (rowData.ID) {
        _itemIdDetails = rowData.ID;
      }
      
      setVisitorDetails(rowData);
      setOpenDialogIDFab(true);
    } else if (action === 'updateSSDApprove') {
      // Update the SSDApprove value in the visitor details list
      // Find the item by ID instead of using indexOf
      const idx = visitorDetailsList.findIndex(item => item.ID === rowData.ID);
      if (idx !== -1) {
        const tempList = [...visitorDetailsList];
        tempList[idx] = rowData; // Use the updated rowData directly
        setVisitorDetailsList(tempList);
      }
    }
  };
  
  /**
   * Handles add visitor details button click
   */
  const handleAddVisitorDetails = () => {
    setVisitorDetailsMode('add');
    const tempProps = { ...visitorDetails };
    tempProps.AccessCard = '';
    tempProps.Car = inputFields.RequireParking;
    tempProps.Color = '';
    tempProps.DriverName = '';
    tempProps.GateNo = '';
    tempProps.IDPresented = '';
    tempProps.ParentId = null;
    tempProps.ID = null;
    tempProps.PlateNo = '';
    tempProps.Title = '';
    tempProps.TypeofVehicle = '';
    tempProps.Files = [];
    tempProps.initFiles = [];
    tempProps.origFiles = [];
    
    setVisitorDetails(tempProps);
    setOpenDialogFab(true);
  };
  
  /**
   * Handles visitor details dialog close
   * @param confirmed Whether the user confirmed the action
   */
  const handleCloseDialogFab = (confirmed: boolean) => {
    // Check if the user is an approver or SSD user (view-only mode)
    const isViewOnly = isApproverUser || isSSDUser;
    
    if (confirmed) {
      // Only allow edits if the user is not in view-only mode
      if (isEdit && !isViewOnly) {
        if (validateOnSubmitDetails()) {
          if (visitorDetailsMode === 'add') {
            setVisitorDetailsList([...visitorDetailsList, visitorDetails]);
            const tempProps = { ...errorFields };
            tempProps.Details = "";
            setError(tempProps);
          } else {
            const tempList = [...visitorDetailsList];
            tempList[_idx] = { ...visitorDetails };
            setVisitorDetailsList(tempList);
          }
        }
      }
    }
    
    setOpenDialogFab(false);
  };
  
  /**
   * Handles print ID dialog close
   */
  const handleCloseDialogIDFab = () => {
    setOpenDialogIDFab(false);
  };
  
  /**
   * Handles edit button click
   */
  const handleEditClick = () => {
    setEditMode(true);
  };
  
  /**
   * Handles chip click
   * @param e Event
   * @param row Row data
   * @param ctrl Control name
   */
  const handleChipClick = (e, row, ctrl: string) => {
    let f = '';
    if (ctrl === 'inputFields') {
      f = `${props.siteUrl}/VisitorsLib/${_itemId}/${row}`;
    } else {
      f = `${props.siteUrl}/VisitorDetailsLib/${_itemIdDetails}/${row}`;
    }
    
    let link = document.createElement('a');
    link.href = f;
    link.download = f.substr(f.lastIndexOf('/') + 1);
    link.click();
  };
  
  /**
   * Saves the form
   */
  const save = async () => {
    try {
      setProgress(true);
      
      // Check if record has been modified
      const origVisitor = await sharePointService.getVisitorById(_itemId);
      if (origVisitor) {
        console.log("origVisitor", origVisitor.Modified);
        console.log("modifiedDate", modifiedDate);
        if (origVisitor.Modified !== modifiedDate) {
          alert("Record has been changed by another user!");
          window.open(props.siteUrl, "_self");
          return;
        }
      }
      
      // Save visitor
      const updatedVisitor = await sharePointService.saveVisitor(
        inputFields,
        sAction,
        currentUser
      );
      
      // Update reference number
      _refno = updatedVisitor.Title;
      
      // Upload files
      await fileService.uploadVisitorFiles(
        _itemId,
        inputFields.Files,
        inputFields.origFiles,
        deleteFiles
      );
      
      // Send email notification
      await sendEmail();
      
      // Save visitor details
      for (const visitorDetail of visitorDetailsList) {
        await sharePointService.saveVisitorDetails(
          visitorDetail,
          _itemId,
          _refno,
          inputFields.DeptId,
          inputFields.DateTimeVisit,
          inputFields.DateTimeArrival,
          inputFields.CompanyName,
          updatedVisitor.StatusId,
          updatedVisitor.RequestDate
        );
        
        if (visitorDetail.ID) {
          await fileService.uploadVisitorDetailsFiles(
            visitorDetail.ID,
            visitorDetail.Files,
            visitorDetail.origFiles
          );
        }
      }
      
      // Delete visitor details files
      await fileService.deleteVisitorDetailsFiles(deleteFilesDetails);
      
      // Delete removed visitor details
      for (const origDetail of _origVisitorDetailsList) {
        const exists = visitorDetailsList.some(detail => detail.ID === origDetail.ID);
        if (!exists) {
          await sharePointService.deleteVisitorDetails(origDetail.ID);
        }
      }
      
      setSavingDone(true);
      
      // Redirect after saving
      setTimeout(() => {
        let url = props.siteUrl;
        if (_sourceURL) {
          url = _sourceURL;
        }
        
        if (((inputFields.StatusId === 4) || (inputFields.StatusId === 9)) && (isReceptionist)) {
          url = window.location.href;
        }
        
        window.open(url, "_self");
      }, 1000);
    } catch (error) {
      console.error("Error saving data:", error);
      setProgress(false);
    }
  };
  
  return (
    <form noValidate autoComplete="off">
      {inputFields.ID && (
        <div className={classes.root}>
          <Grid container spacing={1}>
            <HeaderSection
              visitor={inputFields}
              showEditButton={checkVisibility('editicon', inputFields, isEdit, isEncoder, isReceptionist, isApproverUser, isWalkinApproverUser, isSSDUser)}
              onEditClick={handleEditClick}
            />
            
          <VisitorInformationSection
            visitor={inputFields}
            errorFields={errorFields}
            isEdit={isEdit}
            isEncoder={isEncoder}
            isReceptionist={isReceptionist}
            isApproverUser={isApproverUser}
            isSSDUser={isSSDUser}
            purposeList={purposeList}
            deptList={deptList}
            bldgList={bldgList}
            contactList={contactList}
            isAC1Open={isAC1Open}
            siteUrl={props.siteUrl}
            itemId={_itemId}
            onChangeTxt={handleChangeTxt}
            onChangeCbo={handleChangeCbo}
            onDateTimeVisitChange={onDateTimeVisitChange}
            onACSelectedValue={handleACSelectedValue}
            onFindUser={findUser}
            onACOpen={() => setAC1Open(true)}
            onACClose={() => setAC1Open(false)}
            onChangeDropZone={handleChangeDropZone}
            onChipClick={handleChipClick}
          />
            
            <VisitorDetailsSection
              visitor={inputFields}
              errorFields={errorFields}
              isEdit={isEdit}
              isEncoder={isEncoder}
              isReceptionist={isReceptionist}
              isSSDUser={isSSDUser}
              isApproverUser={isApproverUser}
              isWalkinApproverUser={isWalkinApproverUser}
              visitorDetailsList={visitorDetailsList}
              isHidePrint={isHidePrint}
              onAddClick={handleAddVisitorDetails}
              onVisitorDetailsAction={handleVisitorDetailsAction}
            />
            
            <ApprovalSection
              visitor={inputFields}
              errorFields={errorFields}
              isEdit={isEdit}
              isEncoder={isEncoder}
              isReceptionist={isReceptionist}
              isApproverUser={isApproverUser}
              isWalkinApproverUser={isWalkinApproverUser}
              isSSDUser={isSSDUser}
              approverList={approverList}
              walkinApproverList={WalkinApprovers}
              onChangeTxt={handleChangeTxt}
              onChangeCbo={handleChangeCbo}
            />
            
            <ActionButtonsSection
              isEdit={isEdit}
              isEncoder={isEncoder}
              isReceptionist={isReceptionist}
              isApproverUser={isApproverUser}
              isWalkinApproverUser={isWalkinApproverUser}
              isSSDUser={isSSDUser}
              statusId={inputFields.StatusId}
              onSubmit={onClickSubmit}
              onCancel={onClickCancel}
              onClose={handleCloseDisplay}
            />
          </Grid>
          
          <ConfirmationDialog
            open={openDialog}
            message={dialogMessage}
            onClose={handleCloseDialog}
          />
          
          {/* Visitor Details Dialog */}
          {openDialogFab && (
            <VisitorDetailsDialog
              open={openDialogFab}
              visitorDetails={visitorDetails}
              errorDetails={errorDetails}
              isEdit={isEdit}
              idList={IDList}
              gateList={GateList}
              isApproverUser={isApproverUser}
              isSSDUser={isSSDUser}
              onClose={handleCloseDialogFab}
              onChangeTxt={handleChangeTxtDetails}
              onChangeCbo={handleChangeCbo}
              onChangeDropZone={handleChangeDropZone2}
              onChipClick={handleChipClick}
            />
          )}
          
          {openDialogIDFab && (
            <PrintIDDialog
              open={openDialogIDFab}
              visitorDetails={visitorDetails}
              visitor={inputFields}
              colorValue={_colorValue}
              itemId={_itemId}
              itemIdDetails={_itemIdDetails}
              siteUrl={props.siteUrl}
              printRef={printRef}
              onClose={handleCloseDialogIDFab}
            />
          )}
          
          <Backdrop className={classes.backdrop} open={isProgress}>
            <CircularProgress color="inherit" />
          </Backdrop>
          
          <Snackbar open={isSavingDone} autoHideDuration={2000}>
            <Alert severity="success">
              Data has been saved successfully.
              {successMessage && <div>{successMessage}</div>}
            </Alert>
          </Snackbar>
        </div>
      )}
    </form>
  );
};

/**
 * Checks if a field should be visible based on user role and form state
 * @param element Element name
 * @returns Whether the element should be visible
 */
  const checkVisibility = (element: string, visitor: IVisitor, isEdit: boolean, isEncoder: boolean, isReceptionist: boolean, isApproverUser: boolean, isWalkinApproverUser: boolean, isSSDUser: boolean): boolean => {
  const forApprover = isApproverUser && visitor.StatusId === 2;
  const forWalkinApprover = isWalkinApproverUser && visitor.StatusId === 2;
  const forSSD = isSSDUser && visitor.StatusId === 3;
  const forEncoder = isEncoder && (visitor.StatusId === 1 || visitor.StatusId === 2);
  const forReceptionist = isReceptionist && (visitor.StatusId === 1 || visitor.StatusId === 2);
  const forReceptionistCompletion = isReceptionist && (visitor.StatusId === 4 || visitor.StatusId === 9);
  
  switch (element) {
    case 'editicon':
      return !isEdit && (forEncoder || forSSD);
    default:
      return false;
  }
};

export default DisplayVisitor;
