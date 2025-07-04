import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups";
import "@pnp/sp/profiles";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { IItemAddResult } from "@pnp/sp/items";
import moment from 'moment';

import { IOvertimeRequest } from "../models/IOvertimeRequest";
import { IEmployeeDetails } from "../models/IEmployeeDetails";
import { IUser } from "../models/IUser";
import { IDepartment } from "../models/IDepartment";
import { STATUS } from "../constants/status";
import { toISOString } from "../utils/dateUtils";
import { FileService } from "./FileService";

/**
 * Service for SharePoint operations
 */
export class SharePointService {
  /**
   * Gets the current user
   * @returns The current user
   */
  public static async getCurrentUser(): Promise<IUser> {
    const user = await sp.web.currentUser();
    return {
      Id: user.Id,
      Title: user.Title,
      EMail: user.Email || user.UserPrincipalName
    };
  }
  
  /**
   * Gets the user's groups
   * @returns The user's groups
   */
  public static async getUserGroups(): Promise<any[]> {
    return await sp.web.currentUser.groups();
  }
  
  /**
   * Gets the user's departments
   * @param userId The user ID
   * @returns The user's departments
   */
  public static async getUserDepartments(userId: number): Promise<any[]> {
    return await sp.web.lists.getByTitle("UsersPerDept")
      .items
      .select("*,Name/Title,Dept/Title")
      .expand('Name,Dept')
      .top(5000)
      .orderBy("Modified", true)
      .filter(`NameId eq ${userId}`)
      .get();
  }
  
  /**
   * Gets an overtime request
   * @param id The request ID
   * @param siteRelativeUrl The site relative URL
   * @returns The overtime request
   */
  public static async getOvertimeRequest(id: number, siteRelativeUrl: string): Promise<IOvertimeRequest> {
    // Get the request
    const requests = await sp.web.lists.getByTitle("Overtime")
      .items
      .select("*,Approver/Title,Approver/EMail,Status/Title,Dept/Title,SSDApprover/Title,Author/Title,Author/EMail")
      .expand('Approver,Dept,Status,SSDApprover,Author')
      .top(5000)
      .filter(`ID eq ${id}`)
      .get();
    
    if (requests.length === 0) {
      return null;
    }
    
    const request = requests[0];
    
    // Get the files
    const files = await sp.web.getFolderByServerRelativeUrl(`${siteRelativeUrl}/OvertimeLib/${id}`)
      .files
      .select("*")
      .top(5000)
      .expand('ListItemAllFields')
      .get();
    
    const fileNames = files.map(file => file.Name);
    
    // Return the request with files
    return {
      ...request,
      Files: [],
      initFiles: fileNames,
      origFiles: files
    };
  }
  
  /**
   * Gets employee details for a request
   * @param requestId The request ID
   * @returns The employee details
   */
  public static async getEmployeeDetails(requestId: number): Promise<IEmployeeDetails[]> {
    return await sp.web.lists.getByTitle("OvertimeDetails")
      .items
      .select("*")
      .top(5000)
      .filter(`ParentId eq ${requestId}`)
      .get();
  }
  
  /**
   * Gets purpose options
   * @returns The purpose options
   */
  public static async getPurposeOptions(): Promise<any[]> {
    return await sp.web.lists.getByTitle("Purpose")
      .items
      .select("*")
      .top(5000)
      .filter(`Group eq 'Organic'`)
      .get();
  }
  
  /**
   * Gets building options
   * @returns The building options
   */
  public static async getBuildingOptions(): Promise<any[]> {
    return await sp.web.lists.getByTitle("Building")
      .items
      .select("*")
      .top(5000)
      .orderBy("Title", true)
      .get();
  }
  
  /**
   * Gets department options
   * @param userDepartments The user's departments
   * @returns The department options
   */
  public static async getDepartmentOptions(userDepartments: any[]): Promise<IDepartment[]> {
    const departments = await sp.web.lists.getByTitle("Departments")
      .items
      .select("*")
      .top(5000)
      .get();
    
    // Filter departments based on user's departments
    return departments.filter(department => 
      userDepartments.some(userDept => userDept.DeptId === department.Id)
    );
  }
  
  /**
   * Gets approver options
   * @param departmentId The department ID
   * @param userId The user ID
   * @returns The approver options
   */
  public static async getApproverOptions(departmentId: number, userId: number): Promise<any[]> {
    const approvers = await sp.web.lists.getByTitle("Approvers")
      .items
      .select("*,Name/Title,Name/EMail,Dept/Title")
      .expand('Name,Dept')
      .top(5000)
      .filter(`DeptId eq ${departmentId}`)
      .get();
    
    // Filter out the current user
    return approvers.filter(approver => approver.NameId !== userId);
  }
  
  /**
   * Gets SSD users
   * @returns The SSD users
   */
  public static async getSSDUsers(): Promise<IUser[]> {
    const siteGroups = await sp.web.siteGroups();
    const ssdGroup = siteGroups.find(group => group.LoginName === 'SSD');
    
    if (ssdGroup) {
      const users = await sp.web.siteGroups.getById(ssdGroup.Id).users();
      return users.map(user => ({
        Id: user.Id,
        Title: user.Title,
        EMail: user.Email || user.UserPrincipalName
      }));
    }
    
    return [];
  }
  
  /**
   * Gets personnel type options
   * @returns The personnel type options
   */
  public static async getPersonnelTypeOptions(): Promise<any[]> {
    return await sp.web.lists.getByTitle("PersonnelType")
      .items
      .select("*")
      .top(5000)
      .get();
  }
  
  /**
   * Gets employees
   * @param searchText The search text
   * @param departmentName The department name
   * @returns The employees
   */
  public static async getEmployees(searchText: string, departmentName: string): Promise<any[]> {
    if (searchText.length <= 2) {
      return [];
    }
    
    return await sp.web.lists.getByTitle("Employees")
      .items
      .select("*")
      .top(5000)
      .filter(`substringof('${searchText}', Name) and Dept eq '${departmentName}'`)
      .get();
  }
  
  /**
   * Searches for employees
   * @param searchText The search text
   * @param departmentName The department name
   * @returns The employees
   */
  public static async searchEmployees(searchText: string, departmentName: string): Promise<any[]> {
    return this.getEmployees(searchText, departmentName);
  }
  
  /**
   * Gets outsource personnel
   * @param searchText The search text
   * @param departmentId The department ID
   * @param personnelType The personnel type
   * @returns The outsource personnel
   */
  public static async getOutsourcePersonnel(
    searchText: string,
    departmentId: number,
    personnelType: string
  ): Promise<any[]> {
    if (searchText.length <= 2) {
      return [];
    }
    
    return await sp.web.lists.getByTitle("Outsource")
      .items
      .select("*,PersonnelType/Title,Dept/Title")
      .expand('PersonnelType,Dept')
      .top(5000)
      .filter(`substringof('${searchText}', Title) and DeptId eq ${departmentId} and PersonnelType/Title eq '${personnelType}'`)
      .get();
  }
  
  /**
   * Searches for outsource personnel
   * @param searchText The search text
   * @param departmentId The department ID
   * @param personnelType The personnel type
   * @returns The outsource personnel
   */
  public static async searchOutsource(
    searchText: string,
    departmentId: number,
    personnelType: string
  ): Promise<any[]> {
    return this.getOutsourcePersonnel(searchText, departmentId, personnelType);
  }
  
  /**
   * Creates a request number
   * @param locationCode The location code
   * @returns The request number
   */
  public static async createRequestNumber(locationCode: string): Promise<string> {
    const refNoCountList = sp.web.lists.getByTitle("RefNoCount");
    const refNoCounts = await refNoCountList
      .items
      .select("*")
      .top(5000)
      .filter(`Title eq 'Overtime'`)
      .get();
    
    let lastNumber = 0;
    
    if (refNoCounts.length > 0) {
      const refNoCount = refNoCounts[0];
      const refNoDate = moment(refNoCount.DateRef).endOf('day');
      const today = moment().endOf('day');
      
      if (refNoDate.isSame(today)) {
        lastNumber = parseInt(refNoCount.LastNum) + 1;
      } else {
        lastNumber = 1;
      }
      
      await refNoCountList.items.getById(refNoCount.ID).update({
        LastNum: lastNumber,
        DateRef: moment().endOf('day').toISOString()
      });
    }
    
    // Format the request number
    const lastNumberString = lastNumber.toString();
    const pad = "000";
    const paddedNumber = pad.substring(0, pad.length - lastNumberString.length) + lastNumberString;
    
    return `${locationCode}-${moment().format('YYYYMMDD')}-${paddedNumber}`;
  }
  
  /**
   * Saves an overtime request
   * @param request The request
   * @param action The action
   * @param siteRelativeUrl The site relative URL
   * @param employeeDetails The employee details
   * @param originalEmployeeDetails The original employee details
   * @returns The saved request
   */
  public static async saveOvertimeRequest(
    request: IOvertimeRequest,
    action: string,
    siteRelativeUrl: string,
    employeeDetails: IEmployeeDetails[],
    originalEmployeeDetails: IEmployeeDetails[]
  ): Promise<IOvertimeRequest> {
    // Check if the request has been modified
    const originalRequest = await sp.web.lists.getByTitle("Overtime").items.getById(request.ID).get();
    
    if (originalRequest.Modified !== request.Modified) {
      throw new Error("Record has been changed by another user!");
    }
    
    // Get building for reference number
    const buildings = await this.getBuildingOptions();
    const building = buildings.find(b => b.Title === request.Bldg);
    
    // Set request properties based on action
    let refNo = request.Title;
    let statusId = request.StatusId;
    let requestDate = request.RequestDate;
    let ssdDate = request.SSDDate;
    let deptApproverDate = request.DeptApproverDate;
    let ssdApproverId = request.SSDApproverId;
    
    if (action === "submit") {
      refNo = await this.createRequestNumber(building.LocationCode);
      requestDate = new Date();
      statusId = STATUS.PENDING_DEPT_APPROVAL;
    } 
    else if (action === "approve") {
      if (request.StatusId === STATUS.PENDING_DEPT_APPROVAL) {
        statusId = STATUS.PENDING_SSD_APPROVAL;
        deptApproverDate = new Date();
      } 
      else if (request.StatusId === STATUS.PENDING_SSD_APPROVAL) {
        statusId = STATUS.APPROVED;
        ssdApproverId = request.SSDApproverId;
        ssdDate = new Date();
      }
    } 
    else if (action === "deny") {
      if (request.StatusId === STATUS.PENDING_DEPT_APPROVAL) {
        statusId = STATUS.DENIED_BY_DEPT;
      } 
      else if (request.StatusId === STATUS.PENDING_SSD_APPROVAL) {
        statusId = STATUS.DENIED_BY_SSD;
      }
    }
    
    // Update the request
    await sp.web.lists.getByTitle("Overtime").items.getById(request.ID).update({
      Title: refNo,
      Purpose: request.Purpose,
      DeptId: request.DeptId,
      Bldg: request.Bldg,
      Others: request.Purpose === 'Others' ? request.Others : null,
      DateFrom: toISOString(request.DateFrom),
      DateTo: toISOString(request.DateTo),
      ApproverId: request.ApproverId,
      StatusId: statusId,
      RequestDate: toISOString(requestDate),
      Remarks1: request.Remarks1,
      Remarks2: request.Remarks2,
      SSDApproverId: ssdApproverId,
      SSDDate: ssdDate ? toISOString(ssdDate) : null,
      DeptApproverDate: deptApproverDate ? toISOString(deptApproverDate) : null,
    });
    
    // Upload files
    const folderPath = `${siteRelativeUrl}/OvertimeLib/${request.ID}`;
    const deletedFiles = await FileService.uploadFiles(folderPath, request.Files, request.origFiles);
    
    // Delete files
    await FileService.deleteFiles(folderPath, deletedFiles);
    
    // Update employee details
    const detailsList = sp.web.lists.getByTitle("OvertimeDetails");
    
    // Update existing details
    await Promise.all(employeeDetails.map(async (detail) => {
      if (detail.ID) {
        await detailsList.items.getById(detail.ID).update({
          ParentId: request.ID,
          Title: detail.Title,
          RequestDate: toISOString(requestDate),
          DeptId: request.DeptId,
          RefNo: refNo,
          TimeFrom: toISOString(detail.TimeFrom),
          TimeTo: toISOString(detail.TimeTo),
          Etype: detail.Etype,
          OtherSource: detail.Etype === 'Others' ? detail.OtherSource : null,
          EmpNo: detail.EmpNo.toString(),
          StatusId: statusId
        });
      } else {
        // Add new details
        await detailsList.items.add({
          ParentId: request.ID,
          Title: detail.Title,
          RequestDate: toISOString(requestDate),
          DeptId: request.DeptId,
          RefNo: refNo,
          TimeFrom: toISOString(detail.TimeFrom),
          TimeTo: toISOString(detail.TimeTo),
          Etype: detail.Etype,
          OtherSource: detail.Etype === 'Others' ? detail.OtherSource : null,
          EmpNo: detail.EmpNo.toString(),
          StatusId: statusId
        });
      }
    }));
    
    // Delete removed details
    await Promise.all(originalEmployeeDetails.map(async (originalDetail) => {
      const detailExists = employeeDetails.some(detail => detail.ID === originalDetail.ID);
      
      if (!detailExists) {
        await detailsList.items.getById(originalDetail.ID).delete();
      }
    }));
    
    // Return the updated request
    return {
      ...request,
      Title: refNo,
      StatusId: statusId,
      RequestDate: requestDate,
      SSDDate: ssdDate,
      DeptApproverDate: deptApproverDate,
      SSDApproverId: ssdApproverId
    };
  }
}
