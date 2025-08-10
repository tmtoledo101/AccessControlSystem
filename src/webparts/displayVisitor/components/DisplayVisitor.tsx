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
 * Checks if a field should be visible based on user role and form state
 * @param element Element name
 * @returns Whether the element should be visible
 */
const checkVisibility = (element: string, visitor: IVisitor, isEdit: boolean, isEncoder: boolean, isReceptionist: boolean, isApproverUser: boolean, isWalkinApproverUser: boolean, isSSDUser: boolean): boolean => {
  const forApprover = isApproverUser && visitor.StatusId === 2;
  const forWalkinApprover = isWalkinApproverUser && visitor.StatusId === 2;
  const forSSD = isSSDUser && (visitor.StatusId === 3 || visitor.StatusId === 4 || visitor.StatusId === 7); // Include StatusId 4 (Approved by SSD) and 7 (Denied by SSD)
  const forEncoder = isEncoder && (visitor.StatusId === 1 || visitor.StatusId === 2);
  const forReceptionist = isReceptionist && (visitor.StatusId === 1 || visitor.StatusId === 2);
  const forReceptionistCompletion = isReceptionist && (visitor.StatusId === 4 || visitor.StatusId === 9);

  switch (element) {
    case 'editicon':
      // The edit icon should be visible if not already in edit mode and the user is an encoder or SSD user
      return !isEdit && (forEncoder || forSSD);
    default:
      return false;
  }
};


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
    FirstName: '',
    Car: false,
    AccessCard: '',
    PlateNo: '',
    TypeofVehicle: '',
    Color: '',
    DriverLastName: '',
    DriverFirstName: '',
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
    FirstName: '',
    Car: '',
    AccessCard: '',
    PlateNo: '',
    TypeofVehicle: '',
    Color: '',
    DriverLastName: '',
    DriverFirstName: '',
    IDPresented: '',
    GateNo: '',
    Files: ''
  });

  // Variables (mutable, but not state, often for temporary use within functions)
  let _idx = -1;
  let _deptName = "";
  let _itemId = 0;
  let _itemIdDetails = 0; // Used to track the ID of the currently active visitor detail for file operations
  let _sourceURL = null;
  let _refno = "";
  let _colorValue = 'Green';
  let deleteFiles = []; // Files to be deleted for the main visitor
  let deleteFilesDetails = []; // Files to be deleted for visitor details
  let _origVisitorDetailsList = []; // To track original visitor details for deletion check

  /**
   * Handles chip click to download a file
   * @param e Event
   * @param fileName Name of the file to download
   * @param controlType 'inputFields' for main visitor files, or other for visitor details files
   */
  const handleChipClick = (e, fileName: string, controlType: string) => {
    let fileUrl = '';
    if (controlType === 'inputFields') {
      fileUrl = `${props.siteUrl}/VisitorsLib/${_itemId}/${fileName}`;
    } else {
      fileUrl = `${props.siteUrl}/VisitorDetailsLib/${_itemIdDetails}/${fileName}`;
    }

    // Create a temporary anchor element to trigger download
    let link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName; // Suggest the original filename for download
    document.body.appendChild(link); // Append to body (required for Firefox)
    link.click();
    document.body.removeChild(link); // Clean up
  };

  /**
   * Handles visitor details action (view, delete, print, updateSSDApprove)
   * This needs to be defined before `save` if `save` calls it.
   * @param action Action to perform
   * @param rowData Row data of the visitor detail
   */
  const handleVisitorDetailsAction = (action: string, rowData: IVisitorDetails) => {
    if (action === 'view') {
      _idx = visitorDetailsList.indexOf(rowData);
      if (rowData.ID) {
        _itemIdDetails = rowData.ID; // Set _itemIdDetails for file operations in dialog
      }

      const detailWithParentId = {
        ...rowData,
        ParentId: rowData.ParentId || _itemId // Use existing ParentId or fall back to _itemId
      };

      setVisitorDetails(detailWithParentId);
      setVisitorDetailsMode('edit');
      setOpenDialogFab(true);
    } else if (action === 'delete') {
      const idxToDelete = visitorDetailsList.indexOf(rowData);
      if (idxToDelete > -1) {
        const tempList = [...visitorDetailsList];
        tempList.splice(idxToDelete, 1);
        setVisitorDetailsList(tempList);

        // If the deleted item had an ID, add it to the list for server-side deletion
        if (rowData.ID) {
          deleteFilesDetails.push({ Id: rowData.ID, Filename: null }); // Filename null indicates deleting the detail record itself
        }

        if (tempList.length === 0) {
          const tempErrors = { ...errorFields };
          tempErrors.Details = "Visitor Details are required. Please add visitor names.";
          setError(tempErrors);
        }
      }
    } else if (action === 'print') {
      _idx = visitorDetailsList.indexOf(rowData);
      if (rowData.ID) {
        _itemIdDetails = rowData.ID; // Set _itemIdDetails for print dialog
      }

      setVisitorDetails(rowData);
      setOpenDialogIDFab(true);
    } else if (action === 'updateSSDApprove') {
      // Update the SSDApprove value in the visitor details list
      const idx = visitorDetailsList.findIndex(item => item.ID === rowData.ID);
      if (idx !== -1) {
        const tempList = [...visitorDetailsList];
        tempList[idx] = rowData; // Use the updated rowData directly
        setVisitorDetailsList(tempList);
        
        // Only update status if the user is an SSD user
        if (isSSDUser) {
          console.log("SSD Approve value:", rowData.SSDApprove);
          
          if (rowData.SSDApprove === 'Yes') {
            // If SSD approver ticks the checkbox, update status to "Approved by SSD" (ID 4)
            console.log("Setting status to Approved by SSD (4)");
            setInputs(prev => ({
              ...prev,
              StatusId: 4,
              Status: { Title: 'Approved by SSD' }
            }));
          } else if (rowData.SSDApprove === 'No') {
            // If SSD approver unticks the checkbox, update status to "Denied by SSD" (ID 7)
            console.log("Setting status to Denied by SSD (7)");
            setInputs(prev => ({
              ...prev,
              StatusId: 7,
              Status: { Title: 'Denied by SSD' }
            }));
          }
        }
      }
    }
  };


  /**
   * Validates input fields for main visitor form
   * @param name Field name
   * @param value Field value
   */
  const validateInputs = (name, value) => {
    const tempErrors = { ...errorFields };

    // Skip validation for EmpNo field (Contact Person) - TEMPORARY FOR TESTING DELETE this Terence !!!
    // Consider removing this temporary skip in production code.
    if (name === "EmpNo") {
      tempErrors[name] = "";
      setError(tempErrors);
      return;
    }

    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      tempErrors[name] = "This is a required input field";
      setError(tempErrors);
    } else {
      if (name === "DateTimeVisit" || name === "DateTimeArrival") {
        const visitDate = inputFields.DateTimeVisit ? new Date(inputFields.DateTimeVisit) : null;
        const arrivalDate = inputFields.DateTimeArrival ? new Date(inputFields.DateTimeArrival) : null;

        if (visitDate && arrivalDate && visitDate > arrivalDate) {
          tempErrors.DateTimeVisit = "From Date should be earlier than To Date";
          tempErrors.DateTimeArrival = "To Date should be later than From Date";
          setError(tempErrors);
        } else {
          tempErrors.DateTimeVisit = "";
          tempErrors.DateTimeArrival = "";
          setError(tempErrors);
        }
      } else {
        tempErrors[name] = "";
        setError(tempErrors);
      }
    }
  };

  /**
   * Validates visitor details input fields
   * @param name Field name
   * @param value Field value
   */
  const validateInputsDetails = (name, value) => {
    const tempErrors = { ...errorDetails };

    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      tempErrors[name] = "This is a required input field";
      setErrorDetails(tempErrors);
    } else {
      tempErrors[name] = "";
      setErrorDetails(tempErrors);
    }
  };


  /**
   * Validates the main form before submission
   * @param t Action type
   * @returns Whether the form is valid
   */
  const validateOnSubmit = (t: string): boolean => {
    let isValid = true;
    const tempErrors = { ...errorFields };
    const requiredFields = [];

    // Determine required fields based on user role and action
    if ((isEncoder || isReceptionist) && (inputFields.StatusId === 1 || inputFields.StatusId === 2)) {
      requiredFields.push("Purpose", "DeptId", "Bldg", "RoomNo", "DateTimeVisit", "DateTimeArrival",
        'CompanyName', 'Address', 'VisContactNo', 'ApproverId'
      );
      // EmpNo (Contact Person) is still in the list, but validation is skipped via validateInputs
      if (inputFields.Purpose === 'Others') {
        requiredFields.push('PurposeOthers');
      }
    } else if ((isApproverUser || isWalkinApproverUser) && inputFields.StatusId === 2 && t === 'deny') {
      requiredFields.push('Remarks1');
    } else if (isSSDUser && inputFields.StatusId === 3 && t === 'deny') {
      requiredFields.push('Remarks2');
    }

    const validationErrorsFound = [];

    // Validate each required field
    for (const field of requiredFields) {
      if (field === "EmpNo" && inputFields.Purpose === "For receiving") {
        // Special handling for EmpNo, skip validation if purpose is "For receiving"
        tempErrors[field] = "";
      } else if (field === "DateTimeVisit" || field === "DateTimeArrival") {
        const visitDate = inputFields.DateTimeVisit ? new Date(inputFields.DateTimeVisit) : null;
        const arrivalDate = inputFields.DateTimeArrival ? new Date(inputFields.DateTimeArrival) : null;

        if (!visitDate || !arrivalDate) {
          tempErrors[field] = "This is a required input field";
          validationErrorsFound.push(field);
        } else if (visitDate > arrivalDate) {
          tempErrors.DateTimeVisit = "From Date should be earlier than To Date";
          tempErrors.DateTimeArrival = "To Date should be later than From Date";
          validationErrorsFound.push(field); // Add both to indicate issues
        } else {
          tempErrors[field] = "";
        }
      } else if (field === "ApproverId" && t === 'savedraft') {
        tempErrors[field] = ""; // Approver is not required for draft saves
      } else {
        if (!inputFields[field]) {
          tempErrors[field] = "This is a required input field";
          validationErrorsFound.push(field);
        } else {
          tempErrors[field] = "";
        }
      }
    }

    // Validate visitor details list
    if (visitorDetailsList.length === 0) {
      tempErrors.Details = "Visitor Details are required. Please add visitor names by clicking the (+) button.";
      validationErrorsFound.push('Details');
    }

    // Validate visitor details files and other fields for receptionist completion
    if ((inputFields.StatusId === 4) || (inputFields.StatusId === 9)) {
      for (let i = 0; i < visitorDetailsList.length; i++) {
        const rowData = visitorDetailsList[i];
        let hasFiles = (rowData.Files && rowData.Files.length > 0) || (rowData.initFiles && rowData.initFiles.length > 0);

        if (!hasFiles || !rowData.AccessCard || !rowData.GateNo || !rowData.IDPresented) {
          // If any detail is incomplete, set an error for the main form's details section
          tempErrors.Details = `Please complete Visitor Details of ${rowData.Title || `Visitor ${i + 1}`} on row ${i + 1} before saving!`;
          validationErrorsFound.push('Details');
          alert(`Please complete Visitor Details of ${rowData.Title || `Visitor ${i + 1}`} on row ${i + 1} before saving!`);
          handleVisitorDetailsAction('view', rowData); // Open the dialog for the problematic row
          isValid = false; // Set overall form validity to false
          break; // Stop checking further details as one is already invalid
        }
      }
    }


    if (validationErrorsFound.length > 0) {
      isValid = false;
    }

    setError(tempErrors);
    return isValid;
  };

  /**
   * Validates visitor details before submission
   * @returns Whether the visitor details are valid
   */
  const validateOnSubmitDetails = (): boolean => {
    let isValid = true;
    const tempErrors = { ...errorDetails };
    const requiredDetailFields = [];

    // Determine required fields for visitor details based on user role and main visitor status
    if ((isEncoder || isReceptionist) && (inputFields.StatusId === 1 || inputFields.StatusId === 2)) {
      requiredDetailFields.push('Title'); // Only Title is always required
      if (visitorDetails.Car) { // Only require these if 'Car' is checked
        requiredDetailFields.push('PlateNo', 'TypeofVehicle', 'Color', 'DriverLastName');
      }
    } else if (isReceptionist && (inputFields.StatusId === 4 || inputFields.StatusId === 9)) {
      requiredDetailFields.push('Title', 'AccessCard', 'IDPresented', 'GateNo');
      if (visitorDetails.Car) {
        requiredDetailFields.push('PlateNo', 'TypeofVehicle', 'Color', 'DriverLastName');
      }

      // Check for files specifically for receptionist completion status
      if (!visitorDetails.Files || visitorDetails.Files.length === 0) {
        tempErrors.Files = "Please upload a file.";
        isValid = false;
      } else {
        tempErrors.Files = "";
      }
    }

    const detailValidationErrorsFound = [];

    // Validate each required detail field
    for (const field of requiredDetailFields) {
      // Special handling for car-related fields if 'Car' is not checked
      if (!visitorDetails.Car && (field === "PlateNo" || field === "TypeofVehicle" || field === "Color" || field === "DriverLastName")) {
        tempErrors[field] = ""; // Clear error if car is not selected
      } else {
        if (!visitorDetails[field]) {
          tempErrors[field] = "This is a required input field";
          detailValidationErrorsFound.push(field);
        } else {
          tempErrors[field] = "";
        }
      }
    }

    if (detailValidationErrorsFound.length > 0) {
      isValid = false;
    }

    setErrorDetails(tempErrors);
    return isValid;
  };


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
   * Saves the visitor and visitor details data to SharePoint.
   */
  const save = async () => {
    try {
      setProgress(true);

      // Check if record has been modified by another user
      const origVisitor = await sharePointService.getVisitorById(_itemId);
      if (origVisitor && origVisitor.Modified !== modifiedDate) {
        alert("Record has been changed by another user! Please refresh the page to see the latest updates.");
        window.open(props.siteUrl, "_self"); // Redirect or refresh as needed
        return;
      }

      // Save main visitor information
      const updatedVisitor = await sharePointService.saveVisitor(
        inputFields,
        sAction,
        currentUser
      );

      // Update reference number after saving the main visitor
      _refno = updatedVisitor.Title;

      // Handle main visitor files (upload and delete)
      await fileService.uploadVisitorFiles(
        _itemId,
        inputFields.Files,
        inputFields.origFiles,
        deleteFiles
      );

      // Send email notification based on the action
      await sendEmail();

      // Save/Update visitor details
      for (const visitorDetail of visitorDetailsList) {
        // Ensure ParentId is correctly set to the main visitor's ID before saving.
        const detailToSave = {
          ...visitorDetail,
          ParentId: _itemId
        };

        // Determine the StatusId based on SSDApprove value
        let detailStatusId = updatedVisitor.StatusId;
        if (isSSDUser && visitorDetail.SSDApprove !== undefined) {
          // If SSD user has approved or denied this specific visitor
          detailStatusId = visitorDetail.SSDApprove === 'Yes' ? 4 : 7;
        }

        const savedDetail = await sharePointService.saveVisitorDetails(
          detailToSave,
          _itemId,
          _refno,
          inputFields.DeptId,
          inputFields.DateTimeVisit,
          inputFields.DateTimeArrival,
          inputFields.CompanyName,
          detailStatusId,
          updatedVisitor.RequestDate
        );

        // If it's a new detail, update its ID after saving to allow file uploads
        if (!visitorDetail.ID && savedDetail.ID) {
          visitorDetail.ID = savedDetail.ID; // Update the ID in the local state for file uploads
        }

        // Upload files for visitor details
        if (visitorDetail.ID) { // Ensure ID exists for file uploads
          await fileService.uploadVisitorDetailsFiles(
            visitorDetail.ID,
            visitorDetail.Files,
            visitorDetail.origFiles
          );
        }
      }

      // Delete files associated with removed visitor details
      await fileService.deleteVisitorDetailsFiles(deleteFilesDetails);

      // Delete visitor details that were removed from the list
      for (const origDetail of _origVisitorDetailsList) {
        const exists = visitorDetailsList.some(detail => detail.ID === origDetail.ID);
        if (!exists && origDetail.ID) { // Only delete if it had an ID (was previously saved)
          await sharePointService.deleteVisitorDetails(origDetail.ID);
        }
      }

      setSavingDone(true); // Indicate that saving is complete

      // Redirect after saving based on conditions
      setTimeout(() => {
        let url = props.siteUrl;
        if (_sourceURL) {
          url = _sourceURL;
        }

        // Specific redirection logic for receptionists after completion
        if (((inputFields.StatusId === 4) || (inputFields.StatusId === 9)) && (isReceptionist)) {
          url = window.location.href; // Stay on the current page
        }

        window.open(url, "_self");
      }, 1000); // Short delay for Snackbar to show
    } catch (error) {
      console.error("Error saving data:", error);
      setProgress(false); // Hide progress indicator on error
    }
  };

  /**
   * Handles confirmation dialog close
   * This needs to be defined before `onClickSubmit` and `onClickCancel` if they call it,
   * and before `save` if `save` calls it.
   * @param confirmed Whether the user confirmed the action
   */
  const handleCloseDialog = (confirmed: boolean) => {
    setOpenDialog(false);

    if (confirmed) {
      if ((dialogMessage.includes("submit")) ||
        (dialogMessage.includes("save")) ||
        (dialogMessage.includes("approve")) ||
        (dialogMessage.includes("deny")) ||
        (dialogMessage.includes("complete"))) {
        save();
      } else if (dialogMessage.includes("discard")) {
        let url = props.siteUrl;
        if (_sourceURL) {
          url = _sourceURL;
        }
        window.open(url, "_self");
      }
    }
  };

  /**
   * Handles print ID dialog close
   */
  const handleCloseDialogIDFab = () => {
    setOpenDialogIDFab(false);
  };

  /**
   * Handles visitor details dialog close or save
   * @param confirmed Whether the user confirmed the action (clicked save/add)
   */
  const handleCloseDialogFab = (confirmed: boolean) => {
    // Check if the user is an approver or SSD user (view-only mode for details)
    const isViewOnly = isApproverUser || isSSDUser;

    if (confirmed) {
      // Allow edits only if the user is in edit mode and not in view-only mode
      if (isEdit && !isViewOnly) {
        if (validateOnSubmitDetails()) {
          // Ensure ParentId is set correctly to the main visitor's ID
          const detailToSave = {
            ...visitorDetails,
            ParentId: _itemId
          };

          if (visitorDetailsMode === 'add') {
            // Add new visitor detail to the list
            setVisitorDetailsList(prevList => [...prevList, detailToSave]);
            // Clear overall 'Details' error if a detail is added
            setError(prevErrors => ({ ...prevErrors, Details: "" }));
          } else {
            // Update existing visitor detail in the list
            const updatedList = [...visitorDetailsList];
            if (_idx !== -1) {
              updatedList[_idx] = detailToSave;
              setVisitorDetailsList(updatedList);
            }
          }
        } else {
          // If validation fails, keep the dialog open
          return;
        }
      }
    }

    setOpenDialogFab(false); // Close the dialog
  };


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
        _itemId = 7; // Hardcoded for testing, ideally use getUrlParameter

        // Get current user
        const user = await sharePointService.getCurrentUser();
        setCurrentUser(user);
        console.log("User", user);

        // Check user groups
        const groups = await sharePointService.getCurrentUserGroups();
        let isUser = false;
        let isencoder = false;
        let isreceptionist = false;
        console.log("Groups:", groups);

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
          // Handle case where visitor is not found, e.g., redirect or show error
          return;
        }

        setModifiedDate(visitor.Modified); // to check if record has been updated

        // Check if user is in UsersPerDept (Encoder role)
        const users_per_dept = await sharePointService.getDepartments(user.Id);
        if (users_per_dept.length > 0) {
          isUser = true;
          isencoder = true;
          setEncoder(true);
        }
        setUsersPerDept(users_per_dept);

        // Show print button for receptionist if status is approved or completed
        if ((visitor.StatusId === 4 || visitor.StatusId === 9) && isreceptionist) {
          setHidePrint(false);
          const colorlist = await sharePointService.getIDColors();
          setcolorList(colorlist);
        }

        // Check if user is an approver (Department Approver or Walk-in Approver)
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

        // Set specific approver roles if current user is the assigned approver
        if (visitor.ApproverId === user.Id) {
          if (visitor.ExternalType === "Pre-arranged") {
            setApproverUser(true);
          } else {
            setisWalkinApproverUser(true);
          }
          isUser = true;
        }

        // Re-confirm encoder status for Pre-arranged visitors
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

        // Log the current user type for debugging
        console.log("Current User Type:", {
          "Is Encoder": isencoder,
          "Is Receptionist": isreceptionist,
          "Is Department Approver": isApproverUser,
          "Is SSD Approver": isSSDUser,
          "Is Walk-in Approver": isWalkinApproverUser,
          "IsEdit": isEdit
        });

        // If the user is authorized, fetch lookup data and visitor details
        if (isUser) {
          _deptName = visitor.Dept.Title;

          // Get lookup data for various dropdowns
          const purpose = await sharePointService.getPurposes();
          setPurpose(purpose);

          const building = await sharePointService.getBuildings();
          setBldg(building);

          const depts = await sharePointService.getDepartments();

          // Filter departments based on user role (encoder or receptionist)
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

          // Get contact information for the current visitor's contact person
          const optionContacts = await sharePointService.getEmployeeByEmpNo(visitor.EmpNo);
          setContacts(optionContacts);

          // Get SSD users
          const ssdUsers = await sharePointService.getSSDUsers();
          console.log("SSD Users", ssdUsers);
          setSSD(ssdUsers);

          // Get and set visitor details related to the main visitor
          const visitordetails = await sharePointService.getVisitorDetailsByParentId(_itemId);
          _origVisitorDetailsList = visitordetails; // Store original for comparison on save
          setVisitorDetailsList(visitordetails);

          // Get gates and ID types for visitor details form
          const gates = await sharePointService.getGates();
          setGates(gates);

          const idpresented = await sharePointService.getIDTypes();
          setIDs(idpresented);

          // Set the main visitor form data
          setInputs({ ...visitor });
        } else {
          // If not authorized, alert and redirect
          alert("You are not authorized to access this page!");
          window.open(props.siteUrl, "_self");
        }

        setProgress(false); // Hide progress indicator once all data is loaded
      } catch (e) {
        console.error("Initialization Error:", e);
        setProgress(false); // Ensure progress is hidden even on error
      }
    })();
  }, []); // Empty dependency array means this runs once on component mount


  /**
   * Handles select field changes (dropdowns)
   * @param event Event
   */
  const handleChangeCbo = async (event) => {
    const { name, value } = event.target;

    if (name === "DeptId") {
      const deptfiltered = deptList.filter(item => item.Id === value);
      if (deptfiltered.length > 0) {
        _deptName = deptfiltered[0].Title;
      }


      // Fetch approvers based on external type and selected department
      if (inputFields.ExternalType === 'Walk-in') {
        const walkinapprovers = await sharePointService.getWalkinApprovers(value);
        setWalkinApprovers(walkinapprovers);
        setApprovers([]); // Clear pre-arranged approvers
      } else {
        const approvers = await sharePointService.getApprovers(value, currentUser.Id);
        setApprovers(approvers);
        setWalkinApprovers([]); // Clear walk-in approvers
      }
    } else if (name === "Purpose") {
      // Clear PurposeOthers if purpose is not 'Others'
      if (value !== 'Others') {
        setInputs(prev => ({ ...prev, PurposeOthers: '' }));
        setError(prev => ({ ...prev, PurposeOthers: '' }));
      }
    } else if (name === "colorAccess") {
      const filtered = colorList.filter(item => item.Title === value);
      if (filtered.length > 0) {
        _colorValue = filtered[0].ColorCode;
      }
    }

    setInputs(prev => ({ ...prev, [name]: value }));
    validateInputs(name, value);
  };

  /**
   * Handles text field changes (input, textarea) for main visitor form
   * @param e Event
   */
  const handleChangeTxt = (e) => {
    const { name, value, checked, type } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setInputs(prev => ({ ...prev, [name]: newValue }));
    validateInputs(name, newValue);
  };

  /**
   * Handles text field changes for visitor details dialog
   * @param e Event
   */
  const handleChangeTxtDetails = (e) => {
    const { name, value, checked, type } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setVisitorDetails(prev => {
      const newDetails = { ...prev, [name]: newValue };
      // Clear car-related fields if 'Car' checkbox is unchecked
      if (name === 'Car' && newValue === false) {
        newDetails.Color = "";
        newDetails.DriverLastName = "";
        newDetails.PlateNo = "";
        newDetails.TypeofVehicle = "";
        // Also clear their errors
        setErrorDetails(prevErrors => ({
          ...prevErrors,
          PlateNo: "", TypeofVehicle: "", Color: "", DriverLastName: ""
        }));
      }
      return newDetails;
    });
    validateInputsDetails(name, newValue);
  };

  /**
   * Handles date time changes for main visitor form
   * @param e Date value
   * @param name Field name
   */
  const onDateTimeVisitChange = (e, name) => {
    setInputs(prev => ({ ...prev, [name]: e }));
    validateInputs(name, e);
  };

  /**
   * Handles changes for main visitor form's dropzone files
   * @param files Files array
   */
  const handleChangeDropZone = (files) => {
    setInputs(prev => ({ ...prev, Files: files }));

    // Determine files to be deleted from SharePoint
    const filesToDelete = inputFields.origFiles.filter(origFile =>
      !files.some(currentFile => currentFile.name === origFile.Name)
    );
    deleteFiles = filesToDelete; // Update the global var or manage state for it
  };

  /**
   * Handles changes for visitor details dialog's dropzone files
   * @param files Files array
   */
  const handleChangeDropZone2 = (files) => {
    setVisitorDetails(prev => ({ ...prev, Files: files, initFiles: files }));

    const tempErrorDetails = { ...errorDetails };
    if (files.length > 0) {
      tempErrorDetails.Files = "";
    } else {
      tempErrorDetails.Files = "Please upload a file.";
    }
    setErrorDetails(tempErrorDetails);

    // Determine files to be deleted from SharePoint for the current visitor detail
    if (_itemIdDetails) { // Only track deletions if it's an existing record
      const filesToDeleteForDetail = visitorDetails.origFiles.filter(origFile =>
        !files.some(currentFile => currentFile.name === origFile.Name)
      ).map(file => ({ Id: _itemIdDetails, Filename: file.Name }));

      // Add to global delete list, avoiding duplicates
      filesToDeleteForDetail.forEach(fileToDelete => {
        const exists = deleteFilesDetails.some(item =>
          item.Id === fileToDelete.Id && item.Filename === fileToDelete.Filename
        );
        if (!exists) {
          deleteFilesDetails.push(fileToDelete);
        }
      });
    }
  };


  /**
   * Handles autocomplete selection for Contact Person
   * @param event Event
   * @param value Selected value from autocomplete
   */
  const handleACSelectedValue = (event, value) => {
    setInputs(prev => {
      if (value) {
        validateInputs('EmpNo', value.EmpNo); // Validate empNo when selected
        return {
          ...prev,
          EmpNo: value.EmpNo,
          DirectNo: value.DirectNo,
          LocalNo: value.LocalNo,
          Position: value.Position,
        };
      } else {
        validateInputs('EmpNo', ""); // Validate empty empNo when cleared
        setContacts([]); // Clear contacts when selection is cleared
        return {
          ...prev,
          EmpNo: "",
          DirectNo: "",
          LocalNo: "",
          Position: "",
        };
      }
    });
  };

  /**
   * Handles finding a user for Contact Person autocomplete
   * @param e Event
   */
  const findUser = async (e) => {
    const searchTerm = e.target.value;
    setInputs(prev => ({
      ...prev,
      EmpNo: "",
      DirectNo: "",
      LocalNo: "",
      Position: "",
    })); // Clear fields while typing

    if (searchTerm.length > 2) {
      setAC1Open(true); // Open autocomplete suggestions
      const options = await sharePointService.getEmployeesByName(searchTerm, _deptName);
      setContacts(options);
    } else if (searchTerm.length < 3) {
      setContacts([]); // Clear options if search term is too short
      setAC1Open(false); // Close autocomplete suggestions
    }
  };

  /**
   * Handles add visitor details button click
   */
  const handleAddVisitorDetails = () => {
    setVisitorDetailsMode('add');
    // Reset visitorDetails state for a new entry
    setVisitorDetails({
      ID: null,
      Title: '',
      FirstName: '',
      Car: inputFields.RequireParking, // Inherit parking requirement from main form
      AccessCard: '',
      PlateNo: '',
      TypeofVehicle: '',
      Color: '',
      DriverLastName: '',
      DriverFirstName: '',
      IDPresented: '',
      GateNo: '',
      ParentId: inputFields.ID, // Link new detail to the main visitor's ID
      Files: [],
      initFiles: [],
      origFiles: []
    });
    setErrorDetails({ // Clear any previous errors
      Title: '', FirstName: '', Car: '', AccessCard: '', PlateNo: '',
      TypeofVehicle: '', Color: '', DriverLastName: '', DriverFirstName: '',
      IDPresented: '', GateNo: '', Files: ''
    });
    setOpenDialogFab(true);
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
   * Handles close button click for the main display form
   */
  const handleCloseDisplay = () => {
    window.open(props.siteUrl + '/SitePages/ViewVisitorappge.aspx', "_self");
  };

  /**
   * Handles edit button click for the main form
   */
  const handleEditClick = () => {
    // Check if the SSD user should be able to edit based on the status
    if (isSSDUser && !(inputFields.StatusId === 3 || inputFields.StatusId === 4 || inputFields.StatusId === 7)) {
      // Don't allow editing if the request hasn't been approved by the Approver yet
      alert("SSD users can only edit requests that have been approved by the Approver.");
      return;
    }
    
    // Allow editing
    setEditMode(true);
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

          <Snackbar open={isSavingDone} autoHideDuration={2000} onClose={() => setSavingDone(false)}>
            <Alert severity="success" onClose={() => setSavingDone(false)}>
              Data has been saved successfully.
              {successMessage && <div>{successMessage}</div>}
            </Alert>
          </Snackbar>
        </div>
      )}
    </form>
  );
};

export default DisplayVisitor;
