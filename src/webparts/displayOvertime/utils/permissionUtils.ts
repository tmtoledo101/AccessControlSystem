import { GROUPS } from '../constants/groups';
import { STATUS } from '../constants/status';

/**
 * Interface for user permissions
 */
export interface IUserPermissions {
  isEncoder: boolean;
  isReceptionist: boolean;
  isApproverUser: boolean;
  isSSDUser: boolean;
  isWalkinApproverUser: boolean;
  isUser: boolean;
}

/**
 * Checks if a user is in a group
 * @param groups The user's groups
 * @param groupName The group name to check
 * @returns True if the user is in the group
 */
export function isUserInGroup(groups: any[], groupName: string): boolean {
  return groups.some(group => group.LoginName === groupName);
}

/**
 * Checks if a user is an approver for a request
 * @param userId The user ID
 * @param approverId The approver ID
 * @param statusId The status ID
 * @returns True if the user is an approver
 */
export function isApprover(userId: number, approverId: number, statusId: number): boolean {
  return userId === approverId && statusId === STATUS.PENDING_DEPT_APPROVAL;
}

/**
 * Gets user permissions
 * @param userId The user ID
 * @param userGroups The user's groups
 * @param userDepartments The user's departments
 * @param approverId The approver ID
 * @param statusId The status ID
 * @returns The user permissions
 */
export function getUserPermissions(
  userId: number,
  userGroups: any[],
  userDepartments: any[],
  approverId: number,
  statusId: number
): IUserPermissions {
  const isEncoder = userDepartments.length > 0;
  const isReceptionist = isUserInGroup(userGroups, GROUPS.RECEPTIONIST);
  const isSSDUser = isUserInGroup(userGroups, GROUPS.SSD);
  const isWalkinApproverUser = isUserInGroup(userGroups, GROUPS.WALKIN_APPROVER);
  const isApproverUser = isApprover(userId, approverId, statusId);
  
  return {
    isEncoder,
    isReceptionist,
    isApproverUser,
    isSSDUser,
    isWalkinApproverUser,
    isUser: isEncoder || isReceptionist || isApproverUser || isSSDUser || isWalkinApproverUser
  };
}

/**
 * Checks if a component should be visible
 * @param component The component name
 * @param permissions The user permissions
 * @param statusId The status ID
 * @param isEditMode Whether the component is in edit mode
 * @param hasData Whether the component has data
 * @returns True if the component should be visible
 */
export function isComponentVisible(
  component: string,
  permissions: IUserPermissions,
  statusId: number,
  isEditMode: boolean,
  hasData: boolean = true
): boolean {
  const { isEncoder, isReceptionist, isApproverUser, isSSDUser, isWalkinApproverUser } = permissions;
  
  // Check if the user has edit permissions
  const canEdit = (isEncoder && (statusId === STATUS.DRAFT || statusId === STATUS.PENDING_DEPT_APPROVAL)) ||
                 (isSSDUser && statusId === STATUS.PENDING_SSD_APPROVAL) ||
                 (isApproverUser && statusId === STATUS.PENDING_DEPT_APPROVAL) ||
                 (isWalkinApproverUser && statusId === STATUS.PENDING_DEPT_APPROVAL);
  
  // Display mode components
  if (component === 'editIcon') {
    return canEdit && !isEditMode;
  } else if (component === 'cdisp' || component === 'requestDateDisp' || component === 'statusDisp') {
    return !isEditMode || !canEdit;
  } else if (component === 'deptDisp') {
    return !isEditMode || (isEditMode && ((isApproverUser || isSSDUser) || (isEncoder && statusId === STATUS.PENDING_DEPT_APPROVAL)));
  } else if (component === 'approversDisp') {
    return !isEditMode && hasData;
  } else if (component === 'remarks1Disp') {
    return !isEditMode && hasData;
  } else if (component === 'remarks2Disp') {
    return !isEditMode && hasData;
  } else if (component === 'ssdApproverDisp') {
    return !isEditMode && hasData;
  } else if (component === 'ssdDateDisp') {
    return !isEditMode && hasData;
  } else if (component === 'deptDateDisp') {
    return !isEditMode && hasData;
  } else if (component === 'visitorDetailsDisp') {
    return (!isEditMode && hasData) || (isEditMode && hasData && (isSSDUser || isApproverUser));
  } else if (component === 'close') {
    return !isEditMode;
  }
  
  // Edit mode components
  else if (component === 'cedit') {
    return isEditMode && (isEncoder || isReceptionist);
  } else if (component === 'deptEdit') {
    return isEditMode && isEncoder && statusId === STATUS.DRAFT;
  } else if (component === 'approversEdit') {
    return isEditMode && isEncoder && statusId === STATUS.DRAFT;
  } else if (component === 'remarks1Edit') {
    return isEditMode && isApproverUser;
  } else if (component === 'remarks2Edit') {
    return isEditMode && isSSDUser;
  } else if (component === 'addFabDetail') {
    return isEditMode && (isEncoder || isReceptionist);
  } else if (component === 'visitorDetailsEdit') {
    return isEditMode && hasData && (isEncoder || isReceptionist);
  } else if (component === 'addMain1') { // save
    return isEditMode && (isEncoder || isReceptionist);
  } else if (component === 'addMain2') { // submit
    return isEditMode && ((isEncoder && statusId === STATUS.DRAFT) || (isReceptionist && statusId === STATUS.DRAFT));
  } else if (component === 'addApproval') {
    return isEditMode && (isApproverUser || isSSDUser);
  }
  
  return false;
}
