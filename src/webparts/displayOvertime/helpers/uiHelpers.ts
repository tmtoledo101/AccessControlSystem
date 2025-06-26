import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { IUserRoles } from '../models/IEmployeeDetails';

/**
 * Creates styles
 * @param theme Theme
 * @returns Styles
 */
export const createOvertimeStyles = (theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
    fontFamily: '"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif'
  },
  paper: {
    padding: theme.spacing(1),
    borderColor: "transparent",
  },
  paperbutton: {
    textTransform: "none",
    margin: "5px",
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
});

/**
 * Menu props
 */
export const MENU_PROPS = {
  PaperProps: {
    style: {
      maxHeight: 48 * 4.5 + 8,
      width: 250,
    },
  },
};

/**
 * Checks if user has role
 * @param userRoles User roles
 * @param statusId Status ID
 * @param action Action
 * @returns Has role
 */
export function checkUserRole(
  userRoles: IUserRoles,
  statusId: number,
  action: string
): boolean {
  const { isEncoder, isReceptionist, isApproverUser, isSSDUser, isWalkinApproverUser } = userRoles;
  
  // For edit icon
  if (action === 'editicon') {
    return (isEncoder && (statusId === 1 || statusId === 2)) || 
           (isSSDUser && statusId === 3) || 
           (isApproverUser && statusId === 2);
  }
  
  // For display controls
  if (action === 'cdisp' || action === 'deptdisp') {
    return true;
  }
  
  // For edit controls
  if (action === 'cedit') {
    return (isEncoder && (statusId === 1 || statusId === 2)) || 
           (isSSDUser && statusId === 3) || 
           (isApproverUser && statusId === 2);
  }
  
  // For department edit
  if (action === 'deptedit') {
    return (isEncoder && statusId === 1) || isReceptionist;
  }
  
  // For add fab detail
  if (action === 'addfabdetail') {
    return isEncoder || isReceptionist;
  }
  
  // For visitor details edit
  if (action === 'visitordetailsedit') {
    return (isEncoder || isReceptionist);
  }
  
  // For visitor details display
  if (action === 'visitordetailsdisp') {
    return true;
  }
  
  // For approvers edit
  if (action === 'approversedit') {
    return (isEncoder && statusId === 1);
  }
  
  // For approvers display
  if (action === 'approversdisp') {
    return true;
  }
  
  // For save button
  if (action === 'addmain1') {
    return isEncoder || isReceptionist;
  }
  
  // For submit button
  if (action === 'addmain2') {
    return (isEncoder && statusId === 1) || (isReceptionist && statusId === 1);
  }
  
  // For close button
  if (action === 'close') {
    return true;
  }
  
  // For approval buttons
  if (action === 'addapproval') {
    return isApproverUser || isSSDUser;
  }
  
  // For remarks display
  if (action === 'remarks1disp' || action === 'remarks2disp') {
    return true;
  }
  
  // For remarks edit
  if (action === 'remarks1edit') {
    return isApproverUser;
  }
  
  if (action === 'remarks2edit') {
    return isSSDUser;
  }
  
  // For request date display
  if (action === 'requestdatedisp') {
    return true;
  }
  
  // For SSD approver display
  if (action === 'ssdapproverdisp') {
    return true;
  }
  
  // For SSD date display
  if (action === 'ssddatedisp') {
    return true;
  }
  
  // For department date display
  if (action === 'deptdatedisp') {
    return true;
  }
  
  return false;
}

/**
 * Gets status text
 * @param statusId Status ID
 * @returns Status text
 */
export function getStatusText(statusId: number): string {
  switch (statusId) {
    case 1:
      return 'Draft';
    case 2:
      return 'Pending Department Approval';
    case 3:
      return 'Pending SSD Approval';
    case 4:
      return 'Approved';
    case 5:
      return 'Completed';
    case 6:
      return 'Denied by Department';
    case 7:
      return 'Denied by SSD';
    default:
      return 'Unknown';
  }
}

/**
 * Gets status color
 * @param statusId Status ID
 * @returns Status color
 */
export function getStatusColor(statusId: number): string {
  switch (statusId) {
    case 1:
      return '#FFA500'; // Orange
    case 2:
    case 3:
      return '#3498DB'; // Blue
    case 4:
    case 5:
      return '#2ECC71'; // Green
    case 6:
    case 7:
      return '#E74C3C'; // Red
    default:
      return '#95A5A6'; // Gray
  }
}

/**
 * Checks component visibility
 * @param componentType Component type
 * @param isEditMode Is edit mode
 * @param userRoles User roles
 * @param options Additional options
 * @returns Is visible
 */
export function checkComponentVisibility(
  componentType: string,
  isEditMode: boolean,
  userRoles: IUserRoles,
  options: {
    statusId: number;
    hasEmployeeDetails?: boolean;
  }
): boolean {
  const { statusId } = options;
  const additionalCondition = options.hasEmployeeDetails !== undefined ? options.hasEmployeeDetails : true;
  
  // Header section components
  if (componentType === 'editIcon') {
    return !isEditMode && checkUserRole(userRoles, statusId, 'editicon') && additionalCondition;
  }
  
  if (componentType === 'referenceNumber') {
    return additionalCondition;
  }
  
  // Overtime information section components
  if (componentType === 'departmentSelect') {
    return isEditMode && checkUserRole(userRoles, statusId, 'deptedit') && additionalCondition;
  }
  
  if (componentType === 'departmentDisplay') {
    return (!isEditMode || !checkUserRole(userRoles, statusId, 'deptedit')) && additionalCondition;
  }
  
  if (componentType === 'buildingSelect') {
    return isEditMode && checkUserRole(userRoles, statusId, 'cedit') && additionalCondition;
  }
  
  if (componentType === 'buildingDisplay') {
    return (!isEditMode || !checkUserRole(userRoles, statusId, 'cedit')) && additionalCondition;
  }
  
  if (componentType === 'dateFromPicker') {
    return isEditMode && checkUserRole(userRoles, statusId, 'cedit') && additionalCondition;
  }
  
  if (componentType === 'dateFromDisplay') {
    return (!isEditMode || !checkUserRole(userRoles, statusId, 'cedit')) && additionalCondition;
  }
  
  if (componentType === 'dateToPicker') {
    return isEditMode && checkUserRole(userRoles, statusId, 'cedit') && additionalCondition;
  }
  
  if (componentType === 'dateToDisplay') {
    return (!isEditMode || !checkUserRole(userRoles, statusId, 'cedit')) && additionalCondition;
  }
  
  if (componentType === 'purposeSelect') {
    return isEditMode && checkUserRole(userRoles, statusId, 'cedit') && additionalCondition;
  }
  
  if (componentType === 'purposeDisplay') {
    return (!isEditMode || !checkUserRole(userRoles, statusId, 'cedit')) && additionalCondition;
  }
  
  if (componentType === 'othersInput') {
    return isEditMode && checkUserRole(userRoles, statusId, 'cedit') && additionalCondition;
  }
  
  if (componentType === 'othersDisplay') {
    return (!isEditMode || !checkUserRole(userRoles, statusId, 'cedit')) && additionalCondition;
  }
  
  if (componentType === 'statusDisplay') {
    return additionalCondition;
  }
  
  if (componentType === 'requestDateDisplay') {
    return checkUserRole(userRoles, statusId, 'requestdatedisp') && additionalCondition;
  }
  
  // File attachment section components
  if (componentType === 'fileDropzone') {
    return isEditMode && checkUserRole(userRoles, statusId, 'cedit') && additionalCondition;
  }
  
  if (componentType === 'fileChips') {
    return (!isEditMode || !checkUserRole(userRoles, statusId, 'cedit')) && additionalCondition;
  }
  
  // Employee details section components
  if (componentType === 'addEmployeeButton') {
    return isEditMode && checkUserRole(userRoles, statusId, 'addfabdetail') && additionalCondition;
  }
  
  if (componentType === 'employeeDetailsEdit') {
    return isEditMode && checkUserRole(userRoles, statusId, 'visitordetailsedit') && additionalCondition;
  }
  
  if (componentType === 'employeeDetailsDisplay') {
    return (!isEditMode || !checkUserRole(userRoles, statusId, 'visitordetailsedit')) && additionalCondition;
  }
  
  // Approval section components
  if (componentType === 'approverSelect') {
    return isEditMode && checkUserRole(userRoles, statusId, 'approversedit') && additionalCondition;
  }
  
  if (componentType === 'approverDisplay') {
    return checkUserRole(userRoles, statusId, 'approversdisp') && additionalCondition;
  }
  
  if (componentType === 'deptDateDisplay') {
    return checkUserRole(userRoles, statusId, 'deptdatedisp') && additionalCondition;
  }
  
  if (componentType === 'remarks1Input') {
    return isEditMode && checkUserRole(userRoles, statusId, 'remarks1edit') && additionalCondition;
  }
  
  if (componentType === 'remarks1Display') {
    return checkUserRole(userRoles, statusId, 'remarks1disp') && additionalCondition;
  }
  
  if (componentType === 'ssdApproverDisplay') {
    return checkUserRole(userRoles, statusId, 'ssdapproverdisp') && additionalCondition;
  }
  
  if (componentType === 'ssdDateDisplay') {
    return checkUserRole(userRoles, statusId, 'ssddatedisp') && additionalCondition;
  }
  
  if (componentType === 'remarks2Input') {
    return isEditMode && checkUserRole(userRoles, statusId, 'remarks2edit') && additionalCondition;
  }
  
  if (componentType === 'remarks2Display') {
    return checkUserRole(userRoles, statusId, 'remarks2disp') && additionalCondition;
  }
  
  // Action buttons section components
  if (componentType === 'closeButton') {
    return !isEditMode && checkUserRole(userRoles, statusId, 'close') && additionalCondition;
  }
  
  if (componentType === 'saveButton') {
    return isEditMode && checkUserRole(userRoles, statusId, 'addmain1') && additionalCondition;
  }
  
  if (componentType === 'submitButton') {
    return isEditMode && checkUserRole(userRoles, statusId, 'addmain2') && additionalCondition;
  }
  
  if (componentType === 'approvalButtons') {
    return isEditMode && checkUserRole(userRoles, statusId, 'addapproval') && additionalCondition;
  }
  
  return false;
}
