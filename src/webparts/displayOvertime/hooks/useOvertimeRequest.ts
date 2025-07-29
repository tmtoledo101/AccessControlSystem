import { useState, useEffect, useCallback } from 'react';
import { IOvertimeRequest, IOvertimeRequestErrors } from '../models/IOvertimeRequest';
import { IEmployeeDetails } from '../models/IEmployeeDetails';
import { IUser } from '../models/IUser';
import { IDepartment } from '../models/IDepartment';
import { SharePointService } from '../services/SharePointService';
import { EmailService } from '../services/EmailService';
import { getUrlParameter } from '../utils/urlUtils';
import { validateOvertimeRequest } from '../utils/validationUtils';
import { getUserPermissions } from '../utils/permissionUtils';

/**
 * Interface for save request result
 */
export interface ISaveRequestResult {
  savedRequest?: IOvertimeRequest;
  errors?: IOvertimeRequestErrors;
  success?: boolean;
  error?: string;
}

/**
 * Custom hook for managing overtime requests
 * @param siteUrl The site URL
 * @param siteRelativeUrl The site relative URL
 * @returns Overtime request state and handlers
 */
export const useOvertimeRequest = (siteUrl: string, siteRelativeUrl: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [requestId, setRequestId] = useState<number>(null);
  const [currentUser, setCurrentUser] = useState<IUser>(null);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [userDepartments, setUserDepartments] = useState<any[]>([]);
  const [permissions, setPermissions] = useState({
    isEncoder: false,
    isReceptionist: false,
    isApproverUser: false,
    isSSDUser: false,
    isWalkinApproverUser: false,
    isUser: false
  });
  const [purposeList, setPurposeList] = useState<any[]>([]);
  const [buildingList, setBuildingList] = useState<any[]>([]);
  const [departmentList, setDepartmentList] = useState<IDepartment[]>([]);
  const [approverList, setApproverList] = useState<any[]>([]);
  const [ssdUsers, setSsdUsers] = useState<IUser[]>([]);
  const [personnelTypeList, setPersonnelTypeList] = useState<any[]>([]);
  const [sourceUrl, setSourceUrl] = useState<string>(null);
  const [refNo, setRefNo] = useState<string>('');
  const [deleteFiles, setDeleteFiles] = useState<any[]>([]);
  const [originalEmployeeDetails, setOriginalEmployeeDetails] = useState<IEmployeeDetails[]>([]);

  /**
   * Loads reference data
   * @param departmentId The department ID
   * @param user The current user (optional)
   */
  const loadReferenceData = useCallback(async (departmentId: number, user?: IUser) => {
    // Load purpose list
    const purposes = await SharePointService.getPurposeOptions();
    setPurposeList(purposes);

    // Load building list
    const buildings = await SharePointService.getBuildingOptions();
    setBuildingList(buildings);

    // Load department list
    const departments = await SharePointService.getDepartmentOptions(userDepartments);
    setDepartmentList(departments);

    // Load approver list
    if (departmentId) {
      // Use the passed user parameter if available, otherwise fall back to currentUser
      const userToUse = user || currentUser;
      if (userToUse) {
        console.log(`User for approver options:`, userToUse.Id);
        const approvers = await SharePointService.getApproverOptions(departmentId, userToUse.Id);
        setApproverList(approvers);
      }
    }

    // Load SSD users
    const fetchedSsdUsers = await SharePointService.getSSDUsers(); // Renamed to avoid shadowing
    setSsdUsers(fetchedSsdUsers);

    // Load personnel type list
    const personnelTypes = await SharePointService.getPersonnelTypeOptions();
    setPersonnelTypeList(personnelTypes);
  }, [userDepartments, currentUser]); // Dependencies for loadReferenceData

  /**
   * Loads the request data
   */
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Get the request ID from the URL
      const id = parseInt(getUrlParameter('pid')) || 2; // Default to 1 for testing
      console.log(`Loading request with ID: ${id}`);
      setRequestId(id);

      // Get the source URL
      setSourceUrl(document.referrer);

      // Get the current user
      const user = await SharePointService.getCurrentUser();
      console.log(`Current user loaded:`, user);
      setCurrentUser(user);
      console.log(`currentUser:`, user);

      // Get the user's groups
      const groups = await SharePointService.getUserGroups();
      setUserGroups(groups);

      // Get the user's departments
      const departments = await SharePointService.getUserDepartments(user.Id);
      setUserDepartments(departments);

      // Get the request
      const request = await SharePointService.getOvertimeRequest(id, siteRelativeUrl);
      console.log(`Request loaded:`, request);
      if (!request) {
        throw new Error('Request not found');
      }

      // Get the employee details
      const employeeDetails = await SharePointService.getEmployeeDetails(id);
      setOriginalEmployeeDetails(employeeDetails);

      // Set user permissions
      const userPermissions = getUserPermissions(
        user.Id,
        groups,
        departments,
        request.ApproverId,
        request.StatusId
      );
      setPermissions(userPermissions);

      // Check if the user has permission to access the request
      if (!userPermissions.isUser) {
        alert('You are not authorized to access this page!');
        window.open(siteUrl, '_self');
        return null;
      }

      // Load reference data
      await loadReferenceData(request.DeptId, user);

      setIsLoading(false);

      return {
        request,
        employeeDetails
      };
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      return null;
    }
  }, [siteUrl, siteRelativeUrl, loadReferenceData]); // Add loadReferenceData as a dependency

  /**
   * Handles department change
   * @param departmentId The department ID
   */
  const handleDepartmentChange = useCallback(async (departmentId: number) => {
    if (departmentId && currentUser) {
      console.log(`Current user:`, currentUser);
      const approvers = await SharePointService.getApproverOptions(departmentId, currentUser.Id);
      setApproverList(approvers);

      // Get department name
      const department = departmentList.find(dept => dept.Id === departmentId);
      return (department && department.Title) || '';
    }
    return '';
  }, [currentUser, departmentList]);

  /**
   * Saves the request
   * @param request The request to save
   * @param action The action to perform
   * @param employeeDetails The employee details
   * @returns The saved request result
   */
  const saveRequest = useCallback(async (
    request: IOvertimeRequest,
    action: string,
    employeeDetails: IEmployeeDetails[]
  ): Promise<ISaveRequestResult> => {
    try {
      // Validate the request
      const { isValid, errors } = validateOvertimeRequest(request, action, employeeDetails);

      if (!isValid) {
        return { errors };
      }

      // Save the request
      const savedRequest = await SharePointService.saveOvertimeRequest(
        request,
        action,
        siteRelativeUrl,
        employeeDetails,
        originalEmployeeDetails
      );

      // Send email notification
      if (currentUser) {
        await EmailService.sendEmailNotification(
          savedRequest,
          action,
          currentUser,
          siteUrl,
          ssdUsers
        );
      }

      return {
        savedRequest,
        success: true
      };
    } catch (error) {
      console.error(error);
      return {
        error: error.message
      };
    }
  }, [siteUrl, siteRelativeUrl, currentUser, ssdUsers, originalEmployeeDetails]);

  return {
    isLoading,
    requestId,
    currentUser,
    userGroups,
    userDepartments,
    permissions,
    purposeList,
    buildingList,
    departmentList,
    approverList,
    ssdUsers,
    personnelTypeList,
    sourceUrl,
    refNo,
    deleteFiles,
    originalEmployeeDetails,
    loadData,
    loadReferenceData,
    handleDepartmentChange,
    saveRequest
  };
};