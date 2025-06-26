import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { IDisplayOvertimeProps } from './IDisplayOvertimeProps';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import moment from 'moment';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { IItemAddResult } from "@pnp/sp/items";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups";
import "@pnp/sp/sputilities";
import { IEmailProperties } from "@pnp/sp/sputilities";

// Import services
import { FileService } from '../services/FileService';

// Import components
import HeaderSection from './sections/HeaderSection';
import OvertimeInformationSection from './sections/OvertimeInformationSection';
import EmployeeDetailsSection from './sections/EmployeeDetailsSection';
import FileAttachmentSection from './sections/FileAttachmentSection';
import ApprovalSection from './sections/ApprovalSection';
import ActionButtonsSection from './sections/ActionButtonsSection';
import ConfirmationDialog from './dialogs/ConfirmationDialog';
import EmployeeDetailsDialog from './dialogs/EmployeeDetailsDialog';

// Helper function for URL parameters
function getUrlParameter(name: string): string {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  const results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Define interfaces
interface IOvertimeRequest {
  ID: number | null;
  Title: string;
  Purpose: string;
  DeptId: number | null;
  Dept: { Title: string };
  Bldg: string;
  Others: string;
  DateFrom: any;
  DateTo: any;
  Remarks1: string;
  Remarks2: string;
  SSDDate: Date | null;
  DeptApproverDate: Date | null;
  StatusId: number;
  Status: { Title: string };
  ApproverId: number | null;
  Approver: { Title: string; EMail: string };
  Files: any[];
  initFiles: string[];
  origFiles: any[];
  SSDApproverId: number | null;
  SSDApprover: { Title: string };
  RequestDate: Date;
  Author: { Title: string; EMail: string };
  AuthorId: number | null;
}

interface IErrorFields {
  Purpose: string;
  DeptId: string;
  Bldg: string;
  Others: string;
  DateFrom: string;
  DateTo: string;
  Title: string;
  ApproverId: string;
  Details: string;
  Remarks1: string;
  Remarks2: string;
}

interface IEmployeeDetails {
  ID: number | null;
  ParentId: number | null;
  Title: string;
  TimeFrom: any;
  TimeTo: any;
  Etype: string;
  OtherSource: string;
  EmpNo: string;
  Files: any[];
  initFiles: string[];
  origFiles: any[];
}

interface IErrorDetails {
  TimeFrom: string;
  TimeTo: string;
  OtherSource: string;
  EmpNo: string;
  Etype: string;
  Title: string;
}

// Validation functions
function validateInputs(name: string, value: any, errorFields: IErrorFields): IErrorFields {
  const tempProps = { ...errorFields };
  
  if (!value || value.length === 0) {
    tempProps[name] = "This is a required input field";
  } else {
    if (name === "DateFrom") {
      if (moment(value).isAfter(moment())) {
        tempProps[name] = "From Date should be earlier than To Date";
      } else {
        tempProps[name] = "";
      }
    } else if (name === "DateTo") {
      if (moment().isAfter(moment(value))) {
        tempProps[name] = "From Date should be earlier than To Date";
      } else {
        tempProps[name] = "";
      }
    } else {
      tempProps[name] = "";
    }
  }
  
  return tempProps;
}

function validateOnSubmit(
  formData: IOvertimeRequest, 
  employeeDetailsList: IEmployeeDetails[], 
  errorFields: IErrorFields, 
  action: string, 
  userRoles: any
): { isValid: boolean; errors: IErrorFields } {
  const tempProps = { ...errorFields };
  let required: string[] = [];
  
  if ((userRoles.isEncoder) && ((formData.StatusId === 1) || (formData.StatusId === 2))) {
    required = ["Purpose", "DeptId", "Bldg", "DateFrom", "DateTo"];
    if (formData.Purpose === "Others") {
      required.push('Others');
    }
    if (action === 'submit') {
      required.push('ApproverId');
    }
  } else if ((userRoles.isApproverUser) && (formData.StatusId === 2) && (action === 'deny')) {
    required = ['Remarks1'];
  } else if ((userRoles.isWalkinApproverUser) && (formData.StatusId === 2) && (action === 'deny')) {
    required = ['Remarks1'];
  } else if ((userRoles.isSSDUser) && (formData.StatusId === 3) && (action === 'deny')) {
    required = ['Remarks2'];
  }
  
  let validbit: string[] = [];
  
  for (let i = 0; i < required.length; i++) {
    if (required[i] === "DateFrom") {
      if (moment(formData.DateFrom).isAfter(moment(formData.DateTo))) {
        tempProps[required[i]] = "From Date should be earlier than To Date";
        validbit.push(required[i]);
      }
    } else if (required[i] === "DateTo") {
      if (moment(formData.DateFrom).isAfter(moment(formData.DateTo))) {
        tempProps[required[i]] = "From Date should be earlier than To Date";
        validbit.push(required[i]);
      }
    } else {
      if (!formData[required[i]]) {
        tempProps[required[i]] = "This is a required input field";
        validbit.push(required[i]);
      }
    }
  }
  
  if (employeeDetailsList.length === 0) {
    tempProps.Details = "Employee Details are required. Please add employee names by clicking the (+) button.";
    validbit.push('Details');
  }
  
  return {
    isValid: validbit.length === 0,
    errors: tempProps
  };
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      fontFamily: '"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif'
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
  }),
);

/**
 * Alert component for notifications
 * @param props Alert properties
 * @returns JSX element
 */
function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

/**
 * DisplayOvertime component
 * @param props Component properties
 * @returns JSX element
 */
const DisplayOvertime: React.FC<IDisplayOvertimeProps> = (props) => {
  const classes = useStyles();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Constants
  const ENCODERS_GROUP = "Encoders";
  const RECEPTIONIST_GROUP = "Receptionist";
  const SSD_GROUP = "SSD";
  const WALKIN_APPROVER_GROUP = "WalkinApprover";
  
  // State variables
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [action, setAction] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingDone, setSavingDone] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [modifiedDate, setModifiedDate] = useState<Date | null>(null);
  const [employeeDetailsDialogOpen, setEmployeeDetailsDialogOpen] = useState(false);
  const [employeeDetailsDialogMode, setEmployeeDetailsDialogMode] = useState<'add' | 'edit'>('add');
  const [currentEmployeeDetails, setCurrentEmployeeDetails] = useState<IEmployeeDetails>({
    ID: null,
    ParentId: null,
    Title: '',
    TimeFrom: new Date(),
    TimeTo: new Date(),
    Etype: 'BSP',
    OtherSource: '',
    EmpNo: '',
    Files: [],
    initFiles: [],
    origFiles: []
  });
  
  // User roles
  const [userRoles, setUserRoles] = useState({
    isEncoder: false,
    isReceptionist: false,
    isApproverUser: false,
    isSSDUser: false,
    isWalkinApproverUser: false
  });
  
  // Lists data
  const [purposeList, setPurposeList] = useState<any[]>([]);
  const [deptList, setDeptList] = useState<any[]>([]);
  const [bldgList, setBldgList] = useState<any[]>([]);
  const [approverList, setApproverList] = useState<any[]>([]);
  const [personnelTypeList, setPersonnelTypeList] = useState<any[]>([]);
  const [ssdUsers, setSSDUsers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Form data
  const [formData, setFormData] = useState<IOvertimeRequest>({
    ID: null,
    Title: '',
    Purpose: '',
    DeptId: null,
    Dept: { Title: '' },
    Bldg: '',
    Others: '',
    DateFrom: moment().startOf('day'),
    DateTo: moment().startOf('day'),
    Remarks1: '',
    Remarks2: '',
    SSDDate: null,
    DeptApproverDate: null,
    StatusId: 0,
    Status: { Title: '' },
    ApproverId: null,
    Approver: { Title: '', EMail: '' },
    Files: [],
    initFiles: [],
    origFiles: [],
    SSDApproverId: null,
    SSDApprover: { Title: '' },
    RequestDate: new Date(),
    Author: { Title: '', EMail: '' },
    AuthorId: null
  });
  
  const [errorFields, setErrorFields] = useState<IErrorFields>({
    Purpose: '',
    DeptId: '',
    Bldg: '',
    Others: '',
    DateFrom: '',
    DateTo: '',
    Title: '',
    ApproverId: '',
    Details: '',
    Remarks1: '',
    Remarks2: ''
  });
  
  const [employeeDetailsList, setEmployeeDetailsList] = useState<IEmployeeDetails[]>([]);
  const [originalEmployeeDetailsList, setOriginalEmployeeDetailsList] = useState<IEmployeeDetails[]>([]);
  const [deletedFiles, setDeletedFiles] = useState<any[]>([]);
  const [itemId, setItemId] = useState(0);
  const [refNo, setRefNo] = useState("");
  const [sourceURL, setSourceURL] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  /**
   * Initialize component
   */
  useEffect(() => {
    (async () => {
      try {
        setSourceURL(document.referrer);
        const id = parseInt(getUrlParameter('pid') || '1');
        setItemId(id);
        
        // Get current user
        const user = await sp.web.currentUser();
        setCurrentUser(user);
        
        // Check user groups
        const groups = await sp.web.currentUser.groups();
        let isEncoder = false;
        let isReceptionist = false;
        let isSSD = false;
        
        // Check if user is in Receptionist group
        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === RECEPTIONIST_GROUP) {
            setUserRoles(prev => ({ ...prev, isReceptionist: true }));
            isReceptionist = true;
            break;
          }
        }
        
        // Get overtime request data
        const overtimeRequests = await sp.web.lists.getByTitle("Overtime")
          .items
          .select("*,Approver/Title,Approver/EMail,Status/Title,Dept/Title,SSDApprover/Title,Author/Title,Author/EMail")
          .expand('Approver,Dept,Status,SSDApprover,Author')
          .top(5000)
          .filter(`ID eq ${id}`)
          .get();
        
        if (overtimeRequests.length === 0) {
          throw new Error("Overtime request not found");
        }
        
        const overtimeRequest = overtimeRequests[0];
        setModifiedDate(overtimeRequest.Modified);
        
        // Check if user is an encoder
        const usersPerDept = await sp.web.lists.getByTitle("UsersPerDept")
          .items
          .select("*,Name/Title,Dept/Title")
          .expand('Name,Dept')
          .top(5000)
          .orderBy("Modified", true)
          .filter(`NameId eq ${user.Id}`)
          .get();
        
        if (usersPerDept.length > 0) {
          setUserRoles(prev => ({ ...prev, isEncoder: true }));
          isEncoder = true;
        }
        
        // Check if user is an approver
        if (overtimeRequest.ApproverId === user.Id) {
          setUserRoles(prev => ({ ...prev, isApproverUser: true }));
        }
        
        // Check if user is in SSD group
        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === SSD_GROUP) {
            setUserRoles(prev => ({ ...prev, isSSDUser: true }));
            isSSD = true;
            break;
          }
        }
        
        // Get SSD users
        const sitegroups = await sp.web.siteGroups();
        for (let i = 0; i < sitegroups.length; i++) {
          if (sitegroups[i].LoginName === SSD_GROUP) {
            const ssdUsers = await sp.web.siteGroups.getById(sitegroups[i].Id).users();
            setSSDUsers(ssdUsers);
            break;
          }
        }
        
        // Check if user has access
        if (isEncoder || isReceptionist || overtimeRequest.ApproverId === user.Id || isSSD) {
          // Load reference data
          const deptName = overtimeRequest.Dept.Title;
          
          // Get purpose list
          const purpose = await sp.web.lists.getByTitle("Purpose")
            .items
            .select("*")
            .top(5000)
            .filter(`Group eq 'Organic'`)
            .get();
          setPurposeList(purpose);
          
          // Get building list
          const building = await sp.web.lists.getByTitle("Building")
            .items
            .select("*")
            .top(5000)
            .orderBy("Title", true)
            .get();
          setBldgList(building);
          
          // Get department list
          const depts = await sp.web.lists.getByTitle("Departments")
            .items
            .select("*")
            .top(5000)
            .get();
          
          // Filter departments based on user permissions
          let mappedDepts: any[] = [];
          if (isEncoder) {
            depts.forEach(dept => {
              const filtered = usersPerDept.filter(item => item.DeptId === dept.Id);
              if (filtered.length > 0) {
                mappedDepts.push(dept);
              }
            });
          } else {
            mappedDepts = depts;
          }
          setDeptList(mappedDepts);
          
          // Get approvers
          const approvers = await sp.web.lists.getByTitle("Approvers")
            .items
            .select("*,Name/Title,Name/EMail,Dept/Title")
            .expand('Name,Dept')
            .top(5000)
            .filter(`DeptId eq ${overtimeRequest.DeptId}`)
            .get();
          
          // Filter approvers (exclude current user if encoder)
          let filteredApprovers: any[] = [];
          if (isEncoder) {
            approvers.forEach(item => {
              if (item.NameId !== user.Id) {
                filteredApprovers.push(item);
              }
            });
          } else {
            filteredApprovers = approvers;
          }
          setApproverList(filteredApprovers);
          
          // Get file attachments
          const files = await sp.web.getFolderByServerRelativeUrl(`${props.siteRelativeUrl}/OvertimeLib/${id}`)
            .files
            .select("*")
            .top(5000)
            .expand('ListItemAllFields')
            .get();
          
          const fileNames = files.map(file => file.Name);
          overtimeRequest.Files = [];
          overtimeRequest.initFiles = fileNames;
          overtimeRequest.origFiles = files;
          
          // Get employee details
          const employeeDetails = await sp.web.lists.getByTitle("OvertimeDetails")
            .items
            .select("*")
            .top(5000)
            .filter(`ParentId eq ${id}`)
            .get();
          
          setEmployeeDetailsList(employeeDetails);
          setOriginalEmployeeDetailsList(employeeDetails);
          
          // Get personnel types
          const personnelTypes = await sp.web.lists.getByTitle("PersonnelType")
            .items
            .select("*")
            .top(5000)
            .get();
          setPersonnelTypeList(personnelTypes);
          
          // Set form data
          setFormData(overtimeRequest);
          setRefNo(overtimeRequest.Title);
        } else {
          alert("You are not authorized to access this page!");
          window.open(props.siteUrl, "_self");
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        alert("An error occurred while loading the data. Please try again later.");
      }
    })();
  }, []);
  
  /**
   * Handles text field changes
   * @param e Change event
   */
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData };
    
    updatedFormData[name] = value;
    setFormData(updatedFormData);
    
    const updatedErrors = validateInputs(name, value, errorFields);
    setErrorFields(updatedErrors);
  };
  
  /**
   * Handles dropdown changes
   * @param e Change event
   */
  const handleDropdownChange = async (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value as any;
    
    const updatedFormData = { ...formData };
    updatedFormData[name] = value;
    
    // Special handling for department change
    if (name === "DeptId") {
      const deptFiltered = deptList.filter(item => item.Id === value);
      if (deptFiltered.length > 0) {
        updatedFormData.Dept = { Title: deptFiltered[0].Title };
        
        // Update approvers list
        const approvers = await sp.web.lists.getByTitle("Approvers")
          .items
          .select("*,Name/Title,Name/EMail,Dept/Title")
          .expand('Name,Dept')
          .top(5000)
          .filter(`DeptId eq ${value}`)
          .get();
        
        let filteredApprovers: any[] = [];
        approvers.forEach(item => {
          if (item.NameId !== currentUser?.Id) {
            filteredApprovers.push(item);
          }
        });
        
        setApproverList(filteredApprovers);
      }
    }
    
    setFormData(updatedFormData);
    
    const updatedErrors = validateInputs(name, value, errorFields);
    setErrorFields(updatedErrors);
  };
  
  /**
   * Handles date changes
   * @param date New date value
   * @param name Field name
   */
  const handleDateChange = (date: any, name: string) => {
    const updatedFormData = { ...formData };
    updatedFormData[name] = moment(date).startOf('day');
    
    setFormData(updatedFormData);
    
    const updatedErrors = validateInputs(name, date, errorFields);
    setErrorFields(updatedErrors);
  };
  
  /**
   * Handles file changes
   * @param files New files
   */
  const handleFileChange = (files: File[]) => {
    const updatedFormData = { ...formData };
    updatedFormData.Files = files;
    
    setFormData(updatedFormData);
    
    // Track deleted files
    const newDeletedFiles = [...deletedFiles];
    formData.origFiles.forEach(file => {
      const filtered = files.filter(f => f.name === file.Name);
      if (filtered.length === 0) {
        const deleteFiltered = newDeletedFiles.filter(f => f.Name === file.Name);
        if (deleteFiltered.length === 0) {
          newDeletedFiles.push(file);
        }
      }
    });
    
    setDeletedFiles(newDeletedFiles);
  };
  
  /**
   * Handles file click
   * @param fileName File name
   */
  const handleFileClick = (fileName: string) => {
    const fileUrl = `${props.siteUrl}/OvertimeLib/${itemId}/${fileName}`;
    
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };
  
  /**
   * Opens employee details dialog in add mode
   */
  const handleAddEmployeeClick = () => {
    if (!formData.DeptId) {
      alert('Please select a department before adding employees!');
      return;
    }
    
    const newEmployeeDetails: IEmployeeDetails = {
      ID: null,
      ParentId: null,
      Title: '',
      EmpNo: '',
      Etype: 'BSP',
      OtherSource: '',
      Files: [],
      initFiles: [],
      origFiles: [],
      TimeFrom: new Date(),
      TimeTo: new Date()
    };
    
    // Set default times based on existing entries or form data
    if (employeeDetailsList.length === 0) {
      newEmployeeDetails.TimeFrom = formData.DateFrom;
      newEmployeeDetails.TimeTo = formData.DateTo;
    } else {
      const lastEntry = employeeDetailsList[employeeDetailsList.length - 1];
      newEmployeeDetails.TimeFrom = lastEntry.TimeFrom;
      newEmployeeDetails.TimeTo = lastEntry.TimeTo;
      newEmployeeDetails.Etype = lastEntry.Etype;
      newEmployeeDetails.OtherSource = lastEntry.OtherSource;
    }
    
    setCurrentEmployeeDetails(newEmployeeDetails);
    setEmployeeDetailsDialogMode('add');
    setEmployeeDetailsDialogOpen(true);
  };
  
  /**
   * Opens employee details dialog in edit mode
   * @param employeeDetails Employee details to edit
   */
  const handleViewEmployeeClick = (employeeDetails: IEmployeeDetails) => {
    setCurrentEmployeeDetails(employeeDetails);
    setEmployeeDetailsDialogMode('edit');
    setEmployeeDetailsDialogOpen(true);
  };
  
  /**
   * Deletes an employee from the list
   * @param employeeDetails Employee details to delete
   */
  const handleDeleteEmployeeClick = (employeeDetails: IEmployeeDetails) => {
    const updatedList = employeeDetailsList.filter(item => 
      item !== employeeDetails
    );
    
    setEmployeeDetailsList(updatedList);
    
    // Update error message if needed
    if (updatedList.length === 0) {
      setErrorFields(prev => ({
        ...prev,
        Details: "Employee Details are required. Please add employee names by clicking the (+) button."
      }));
    }
  };
  
  /**
   * Closes employee details dialog
   * @param save Whether to save changes
   * @param employeeDetails Updated employee details
   */
  const handleEmployeeDetailsDialogClose = (save: boolean, employeeDetails?: IEmployeeDetails) => {
    if (save && employeeDetails) {
      if (employeeDetailsDialogMode === 'add') {
        setEmployeeDetailsList([...employeeDetailsList, employeeDetails]);
        setErrorFields(prev => ({ ...prev, Details: "" }));
      } else {
        const index = employeeDetailsList.findIndex(item => 
          item.ID === employeeDetails.ID || 
          (item.EmpNo === employeeDetails.EmpNo && item.Title === employeeDetails.Title)
        );
        
        if (index !== -1) {
          const updatedList = [...employeeDetailsList];
          updatedList[index] = employeeDetails;
          setEmployeeDetailsList(updatedList);
        }
      }
    }
    
    setEmployeeDetailsDialogOpen(false);
  };
  
  /**
   * Searches for employees
   * @param searchText Search text
   * @param employeeType Employee type
   * @param personnelType Personnel type
   */
  const handleEmployeeSearch = async (searchText: string, employeeType: string, personnelType: string) => {
    if (searchText.length > 2) {
      try {
        if (employeeType === 'BSP') {
          const employees = await sp.web.lists.getByTitle("Employees")
            .items
            .select("*")
            .top(5000)
            .filter(`substringof('${searchText}', Name) and Dept eq '${formData.Dept?.Title}'`)
            .get();
          
          setSearchResults(employees);
        } else {
          const outsource = await sp.web.lists.getByTitle("Outsource")
            .items
            .select("*,PersonnelType/Title,Dept/Title")
            .expand('PersonnelType,Dept')
            .top(5000)
            .filter(`substringof('${searchText}', Title) and DeptId eq ${formData.DeptId} and PersonnelType/Title eq '${personnelType}'`)
            .get();
          
          setSearchResults(outsource);
        }
      } catch (error) {
        console.error("Error searching employees:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };
  
  /**
   * Handles edit button click
   */
  const handleEditClick = () => {
    setIsEdit(true);
  };
  
  /**
   * Handles cancel button click
   */
  const handleCancelClick = () => {
    setDialogMessage("Do you want to discard changes and exit?");
    setDialogOpen(true);
  };
  
  /**
   * Handles save button click
   */
  const handleSaveClick = () => {
    setAction('savedraft');
    setDialogMessage("Do you want to save and exit?");
    setDialogOpen(true);
  };
  
  /**
   * Handles submit button click
   */
  const handleSubmitClick = () => {
    setAction('submit');
    setDialogMessage("Do you want to submit this form?");
    
    const validationResult = validateOnSubmit(formData, employeeDetailsList, errorFields, 'submit', userRoles);
    if (validationResult.isValid) {
      setDialogOpen(true);
    } else {
      setErrorFields(validationResult.errors);
    }
  };
  
  /**
   * Handles approve button click
   */
  const handleApproveClick = () => {
    setAction('approve');
    setDialogMessage("Do you want to approve this request?");
    
    const validationResult = validateOnSubmit(formData, employeeDetailsList, errorFields, 'approve', userRoles);
    if (validationResult.isValid) {
      setDialogOpen(true);
    } else {
      setErrorFields(validationResult.errors);
    }
  };
  
  /**
   * Handles deny button click
   */
  const handleDenyClick = () => {
    setAction('deny');
    setDialogMessage("Do you want to deny this request?");
    
    const validationResult = validateOnSubmit(formData, employeeDetailsList, errorFields, 'deny', userRoles);
    if (validationResult.isValid) {
      setDialogOpen(true);
    } else {
      setErrorFields(validationResult.errors);
    }
  };
  
  /**
   * Handles close button click
   */
  const handleCloseClick = () => {
    let url = props.siteUrl;
    if (sourceURL) {
      url = sourceURL;
    }
    window.open(url, "_self");
  };
  
  /**
   * Handles dialog close
   * @param confirmed Whether the action was confirmed
   */
  const handleDialogClose = (confirmed: boolean) => {
    setDialogOpen(false);
    
    if (confirmed) {
      if (dialogMessage.includes("discard")) {
        handleCloseClick();
      } else {
        saveData();
      }
    }
  };
  
  /**
   * Creates a new request number
   * @param locationCode Location code
   * @returns New request number
   */
  const createRequestNo = async (locationCode: string) => {
    const refNoCountList = sp.web.lists.getByTitle("RefNoCount");
    const refNoCount = await refNoCountList.items
      .select("*")
      .top(5000)
      .filter(`Title eq 'Overtime'`)
      .get();
    
    let lastNum = 0;
    
    if (refNoCount.length > 0) {
      const today = moment().endOf('day').toISOString();
      const refDate = moment(refNoCount[0].DateRef).endOf('day').toISOString();
      
      if (refDate === today) {
        lastNum = parseInt(refNoCount[0].LastNum) + 1;
        await refNoCountList.items.getById(refNoCount[0].ID).update({
          LastNum: lastNum,
          DateRef: today
        });
      } else {
        lastNum = 1;
        await refNoCountList.items.getById(refNoCount[0].ID).update({
          LastNum: lastNum,
          DateRef: today
        });
      }
    }
    
    const paddedNum = String(lastNum).padStart(3, '0');
    const newRefNo = `${locationCode}-${moment().format('YYYYMMDD')}-${paddedNum}`;
    
    return newRefNo;
  };
  
  /**
   * Sends email notifications
   */
  const sendEmail = async () => {
    let toEmails: string[] = [];
    
    let emailProps: IEmailProperties = {
      From: currentUser.Email,
      To: toEmails,
      Subject: '',
      Body: '',
      AdditionalHeaders: {
        "content-type": "text/html"
      }
    };
    
    if (userRoles.isEncoder && action === 'submit' && formData.StatusId === 1) {
      // Email to approver
      const approvers = approverList.filter(item => item.NameId === formData.ApproverId);
      
      if (approvers.length > 0) {
        toEmails.push(approvers[0].Name.EMail);
        
        emailProps.To = toEmails;
        emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : For Approval ${refNo} - ${formData.Purpose}`;
        emailProps.Body = `BSP Access Control System Request Notification.</br></br>Ref No.:${refNo}</br>Purpose:${formData.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${itemId}">link</a>`;
        
        await sp.utility.sendEmail(emailProps);
      }
    } else if (userRoles.isApproverUser && action === 'approve' && formData.StatusId === 2) {
      // Email to SSD approvers
      toEmails = ssdUsers.map(user => user.Email);
      
      emailProps.To = toEmails;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : For Approval ${refNo} - ${formData.Purpose}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${refNo}</br>Purpose:${formData.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${itemId}">link</a>`;
      
      await sp.utility.sendEmail(emailProps);
      
      // Email to requestor
      toEmails = [formData.Author.EMail];
      
      emailProps.To = toEmails;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : Approved by ${formData.Approver.Title} - ${refNo}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${refNo}</br>Purpose:${formData.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${itemId}">link</a>`;
      
      await sp.utility.sendEmail(emailProps);
    } else if (userRoles.isSSDUser && action === 'approve' && formData.StatusId === 3) {
      // Email to requestor
      toEmails = [formData.Author.EMail];
      
      emailProps.To = toEmails;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : Approved by SSD - ${refNo}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${refNo}</br>Purpose:${formData.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${itemId}">link</a>`;
      
      await sp.utility.sendEmail(emailProps);
    } else if (userRoles.isApproverUser && action === 'deny' && formData.StatusId === 2) {
      // Email to requestor
      toEmails = [formData.Author.EMail];
      
      emailProps.To = toEmails;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : Disapproved by ${formData.Approver.Title} - ${refNo}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${refNo}</br>Purpose:${formData.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${itemId}">link</a>`;
      
      await sp.utility.sendEmail(emailProps);
    } else if (userRoles.isSSDUser && action === 'deny' && formData.StatusId === 3) {
      // Email to requestor
      toEmails = [formData.Author.EMail];
      
      emailProps.To = toEmails;
      emailProps.Subject = `BSP ACCESS CONTROL SYSTEM : Disapproved by SSD - ${currentUser.Title} - ${refNo}`;
      emailProps.Body = `BSP Access Control System For Approval Notification.</br></br>Ref No.:${refNo}</br>Purpose:${formData.Purpose}</br></br>You may open the request by clicking on this <a href="${props.siteUrl}/sitePages/DisplayOvertimeappge.aspx?pid=${itemId}">link</a>`;
      
      await sp.utility.sendEmail(emailProps);
    }
  };
  
  /**
   * Saves data to SharePoint
   */
  const saveData = async () => {
    setIsLoading(true);
    
    try {
      const list = sp.web.lists.getByTitle("Overtime");
      const origRequest = await list.items.getById(itemId).get();
      
      if (origRequest.Modified === modifiedDate) {
        const bldgFiltered = bldgList.filter(item => item.Title === formData.Bldg);
        let newRefNo = formData.Title;
        let statusId = formData.StatusId;
        let requestDate = formData.RequestDate;
        let ssdDate = formData.SSDDate;
        let deptApproverDate = formData.DeptApproverDate;
        let ssdApproverId = formData.SSDApproverId;
        
        if (action === "submit") {
          newRefNo = await createRequestNo(bldgFiltered[0].LocationCode);
          requestDate = new Date();
          statusId = 2;
        } else if (action === "savedraft") {
          statusId = formData.StatusId;
        } else if (action === "approve") {
          if (formData.StatusId === 2) {
            statusId = 3;
            deptApproverDate = new Date();
          } else if (formData.StatusId === 3) {
            statusId = 4;
            ssdApproverId = currentUser.Id;
            ssdDate = new Date();
          }
        } else if (action === "deny") {
          if (formData.StatusId === 2) {
            statusId = 6;
          } else if (formData.StatusId === 3) {
            statusId = 7;
          }
        }
        
        // Update overtime request
        await list.items.getById(itemId).update({
          Title: newRefNo,
          Purpose: formData.Purpose,
          DeptId: formData.DeptId,
          Bldg: formData.Bldg,
          Others: (formData.Purpose === 'Others') ? formData.Others : null,
          DateFrom: moment(formData.DateFrom).toISOString(),
          DateTo: moment(formData.DateTo).toISOString(),
          ApproverId: formData.ApproverId,
          StatusId: statusId,
          RequestDate: moment(requestDate).toISOString(),
          Remarks1: formData.Remarks1,
          Remarks2: formData.Remarks2,
          SSDApproverId: ssdApproverId,
          SSDDate: ssdDate ? moment(ssdDate).toISOString() : null,
          DeptApproverDate: deptApproverDate ? moment(deptApproverDate).toISOString() : null,
        });
        
        // Send email notifications
        await sendEmail();
        
        // Handle file attachments
        const folderPath = props.siteRelativeUrl + "/OvertimeLib/" + itemId;
        
        // Upload new files
        await Promise.all(formData.Files.map(async (file) => {
          const fileExists = formData.origFiles.some(f => f.Name === file.name);
          if (!fileExists) {
            if (file.size <= 10485760) {
              // Small upload
              await sp.web.getFolderByServerRelativeUrl(folderPath).files.add(file.name, file, true);
            } else {
              // Large upload
              await sp.web.getFolderByServerRelativeUrl(folderPath).files.addChunked(file.name, file, data => {
                console.log({ data });
              }, true);
            }
          }
        }));
        
        // Delete removed files
        await Promise.all(deletedFiles.map(async (file) => {
          const fullPath = folderPath + '/' + file.Name;
          await sp.web.getFileByServerRelativeUrl(fullPath).delete();
        }));
        
        // Handle employee details
        const detailsList = sp.web.lists.getByTitle("OvertimeDetails");
        
        // Update existing and add new employee details
        await Promise.all(employeeDetailsList.map(async (employee) => {
          if (employee.ID) {
            // Update existing employee
            await detailsList.items.getById(employee.ID).update({
              ParentId: itemId,
              Title: employee.Title,
              RequestDate: moment(requestDate).toISOString(),
              DeptId: formData.DeptId,
              RefNo: newRefNo,
              TimeFrom: moment(employee.TimeFrom).toISOString(),
              TimeTo: moment(employee.TimeTo).toISOString(),
              Etype: employee.Etype,
              OtherSource: (employee.Etype === 'Others') ? employee.OtherSource : null,
              EmpNo: employee.EmpNo.toString(),
              StatusId: statusId
            });
          } else {
            // Add new employee
            await detailsList.items.add({
              ParentId: itemId,
              Title: employee.Title,
              RequestDate: moment(requestDate).toISOString(),
              DeptId: formData.DeptId,
              RefNo: newRefNo,
              TimeFrom: moment(employee.TimeFrom).toISOString(),
              TimeTo: moment(employee.TimeTo).toISOString(),
              Etype: employee.Etype,
              OtherSource: (employee.Etype === 'Others') ? employee.OtherSource : null,
              EmpNo: employee.EmpNo.toString(),
              StatusId: statusId
            });
          }
        }));
        
        // Delete removed employee details
        await Promise.all(originalEmployeeDetailsList.map(async (employee) => {
          const stillExists = employeeDetailsList.some(e => e.ID === employee.ID);
          if (!stillExists) {
            await detailsList.items.getById(employee.ID).delete();
          }
        }));
        
        setSavingDone(true);
        setTimeout(() => {
          let url = props.siteUrl;
          if (sourceURL) {
            url = sourceURL;
          }
          window.open(url, "_self");
        }, 2000);
      } else {
        alert("Record has been changed by another user!");
        window.open(props.siteUrl, "_self");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("An error occurred while saving the data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render component
  return (
    <form noValidate autoComplete="off">
      {formData.ID && (
        <div className={classes.root} style={{ padding: '12px' }}>
          <Grid container spacing={1}>
            {/* Header Section */}
            <HeaderSection 
              overtimeRequest={formData}
              isEdit={isEdit}
              userRoles={userRoles}
              onEditClick={handleEditClick}
            />
            
            {/* Overtime Information Section */}
            <OvertimeInformationSection
              isEdit={isEdit}
              overtimeRequest={formData}
              errorFields={errorFields}
              userRoles={userRoles}
              departmentList={deptList}
              buildingList={bldgList}
              purposeList={purposeList}
              onInputChange={handleDropdownChange}
              onDateChange={handleDateChange}
            />
            
            {/* File Attachment Section */}
            <FileAttachmentSection
              isEdit={isEdit}
              overtimeRequest={formData}
              userRoles={userRoles}
              fileService={new FileService(props.siteUrl, props.siteRelativeUrl)}
              onFilesChange={handleFileChange}
            />
            
            {/* Employee Details Section */}
            <EmployeeDetailsSection
              isEdit={isEdit}
              userRoles={userRoles}
              overtimeRequest={formData}
              employeeDetailsList={employeeDetailsList}
              errorFields={errorFields}
              onAddClick={handleAddEmployeeClick}
              onViewClick={handleViewEmployeeClick}
              onDeleteClick={handleDeleteEmployeeClick}
            />
            
            {/* Approval Section */}
            <ApprovalSection
              isEdit={isEdit}
              userRoles={userRoles}
              formState={{ statusId: formData.StatusId }}
              formData={formData}
              approverList={approverList}
              errorFields={errorFields}
              onDropdownChange={handleDropdownChange}
              onTextChange={handleTextChange}
            />
            
            {/* Action Buttons Section */}
            <ActionButtonsSection
              isEdit={isEdit}
              userRoles={userRoles}
              statusId={formData.StatusId}
              onCancel={handleCancelClick}
              onSave={handleSaveClick}
              onSubmit={handleSubmitClick}
              onApprove={handleApproveClick}
              onDeny={handleDenyClick}
              onClose={handleCloseClick}
            />
          </Grid>
          
          {/* Confirmation Dialog */}
          <ConfirmationDialog
            open={dialogOpen}
            title="Confirmation"
            message={dialogMessage}
            onClose={handleDialogClose}
          />
          
          {/* Employee Details Dialog */}
          <EmployeeDetailsDialog
            open={employeeDetailsDialogOpen}
            mode={employeeDetailsDialogMode}
            employeeDetails={currentEmployeeDetails}
            deptName={formData.Dept?.Title}
            deptId={formData.DeptId}
            personnelTypeList={personnelTypeList}
            searchResults={searchResults}
            onSearch={handleEmployeeSearch}
            onClose={handleEmployeeDetailsDialogClose}
          />
          
          {/* Loading Backdrop */}
          <Backdrop className={classes.backdrop} open={isLoading}>
            <CircularProgress color="inherit" />
          </Backdrop>
          
          {/* Success Notification */}
          <Snackbar open={isSavingDone} autoHideDuration={2000}>
            <Alert severity="success">
              Data has been saved successfully.
              {userRoles.isEncoder && action === 'submit' && (
                <div>
                  An email notification has been sent to the approver.
                </div>
              )}
              {userRoles.isApproverUser && formData.StatusId === 2 && action === 'approve' && (
                <div>
                  An email notification has been sent to the SSD group.
                </div>
              )}
              {userRoles.isSSDUser && formData.StatusId === 3 && action === 'approve' && (
                <div>
                  An email notification has been sent to the requestor {formData.Author.Title}.
                </div>
              )}
              {action === 'deny' && (
                <div>
                  An email notification has been sent to the requestor {formData.Author.Title}.
                </div>
              )}
            </Alert>
          </Snackbar>
        </div>
      )}
    </form>
  );
};

export default DisplayOvertime;
