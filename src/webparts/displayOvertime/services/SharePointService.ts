import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups";
import "@pnp/sp/profiles";
import { IItemAddResult } from "@pnp/sp/items";
import moment from 'moment';

import { IOvertimeRequest } from "../models/IOvertimeRequest";
import { IEmployeeDetails } from "../models/IEmployeeDetails";
import { toISOString } from "../helpers/dateHelpers";

/**
 * SharePoint service class
 */
export class SharePointService {
  private readonly ENCODERS_GROUP = "Encoders";
  private readonly RECEPTIONIST_GROUP = "Receptionist";
  private readonly SSD_GROUP = "SSD";
  private readonly WALKIN_APPROVER_GROUP = "WalkinApprover";
  
  /**
   * Gets current user
   * @returns Current user
   */
  public async getCurrentUser(): Promise<any> {
    return await sp.web.currentUser();
  }
  
  /**
   * Gets user groups
   * @returns User groups
   */
  public async getUserGroups(): Promise<any[]> {
    return await sp.web.currentUser.groups();
  }
  
  /**
   * Gets user roles
   * @param userId User ID
   * @returns User roles
   */
  public async getUserRoles(userId: number): Promise<{
    isEncoder: boolean;
    isReceptionist: boolean;
    isApproverUser: boolean;
    isSSDUser: boolean;
    isWalkinApproverUser: boolean;
  }> {
    const groups = await this.getUserGroups();
    const usersPerDept = await sp.web.lists.getByTitle("UsersPerDept")
      .items
      .select("*,Name/Title,Dept/Title")
      .expand('Name,Dept')
      .top(5000)
      .orderBy("Modified", true)
      .filter(`NameId eq ${userId}`)
      .get();
    
    let isEncoder = usersPerDept.length > 0;
    let isReceptionist = false;
    let isSSDUser = false;
    let isWalkinApproverUser = false;
    
    for (const group of groups) {
      if (group.LoginName === this.RECEPTIONIST_GROUP) {
        isReceptionist = true;
      } else if (group.LoginName === this.SSD_GROUP) {
        isSSDUser = true;
      } else if (group.LoginName === this.WALKIN_APPROVER_GROUP) {
        isWalkinApproverUser = true;
      }
    }
    
    return {
      isEncoder,
      isReceptionist,
      isApproverUser: false, // This will be set later based on the request
      isSSDUser,
      isWalkinApproverUser
    };
  }
  
  /**
   * Gets overtime request
   * @param itemId Item ID
   * @returns Overtime request
   */
  public async getOvertimeRequest(itemId: number): Promise<IOvertimeRequest> {
    const items = await sp.web.lists.getByTitle("Overtime")
      .items
      .select("*,Approver/Title,Approver/EMail,Status/Title,Dept/Title,SSDApprover/Title,Author/Title,Author/EMail")
      .expand('Approver,Dept,Status,SSDApprover,Author')
      .top(5000)
      .filter(`ID eq ${itemId}`)
      .get();
    
    if (items.length === 0) {
      throw new Error(`Overtime request with ID ${itemId} not found`);
    }
    
    return items[0] as IOvertimeRequest;
  }
  
  /**
   * Gets employee details
   * @param parentId Parent ID
   * @returns Employee details
   */
  public async getEmployeeDetails(parentId: number): Promise<IEmployeeDetails[]> {
    const items = await sp.web.lists.getByTitle("OvertimeDetails")
      .items
      .select("*")
      .top(5000)
      .filter(`ParentId eq ${parentId}`)
      .get();
    
    return items as IEmployeeDetails[];
  }
  
  /**
   * Gets departments
   * @returns Departments
   */
  public async getDepartments(): Promise<any[]> {
    return await sp.web.lists.getByTitle("Departments")
      .items
      .select("*")
      .top(5000)
      .get();
  }
  
  /**
   * Gets buildings
   * @returns Buildings
   */
  public async getBuildings(): Promise<any[]> {
    return await sp.web.lists.getByTitle("Building")
      .items
      .select("*")
      .top(5000)
      .orderBy("Title", true)
      .get();
  }
  
  /**
   * Gets purposes
   * @returns Purposes
   */
  public async getPurposes(): Promise<any[]> {
    return await sp.web.lists.getByTitle("Purpose")
      .items
      .select("*")
      .top(5000)
      .filter(`Group eq 'Organic'`)
      .get();
  }
  
  /**
   * Gets approvers
   * @param departmentId Department ID
   * @param currentUserId Current user ID
   * @returns Approvers
   */
  public async getApprovers(departmentId: number, currentUserId: number): Promise<any[]> {
    const approvers = await sp.web.lists.getByTitle("Approvers")
      .items
      .select("*,Name/Title,Name/EMail,Dept/Title")
      .expand('Name,Dept')
      .top(5000)
      .filter(`DeptId eq ${departmentId}`)
      .get();
    
    // Filter out current user from approvers
    return approvers.filter(approver => approver.NameId !== currentUserId);
  }
  
  /**
   * Gets personnel types
   * @returns Personnel types
   */
  public async getPersonnelTypes(): Promise<any[]> {
    return await sp.web.lists.getByTitle("PersonnelType")
      .items
      .select("*")
      .top(5000)
      .get();
  }
  
  /**
   * Gets SSD users
   * @returns SSD users
   */
  public async getSSDUsers(): Promise<any[]> {
    const siteGroups = await sp.web.siteGroups();
    let ssdUsers = [];
    
    for (const group of siteGroups) {
      if (group.LoginName === this.SSD_GROUP) {
        ssdUsers = await sp.web.siteGroups.getById(group.Id).users();
        break;
      }
    }
    
    return ssdUsers;
  }
  
  /**
   * Searches employees
   * @param searchTerm Search term
   * @param departmentName Department name
   * @returns Employees
   */
  public async searchEmployees(searchTerm: string, departmentName: string): Promise<any[]> {
    return await sp.web.lists.getByTitle("Employees")
      .items
      .select("*")
      .top(5000)
      .filter(`substringof('${searchTerm}', Name) and Dept eq '${departmentName}'`)
      .get();
  }
  
  /**
   * Searches outsource personnel
   * @param searchTerm Search term
   * @param departmentId Department ID
   * @param personnelType Personnel type
   * @returns Outsource personnel
   */
  public async searchOutsourcePersonnel(
    searchTerm: string,
    departmentId: number,
    personnelType: string
  ): Promise<any[]> {
    return await sp.web.lists.getByTitle("Outsource")
      .items
      .select("*,PersonnelType/Title,Dept/Title")
      .expand('PersonnelType,Dept')
      .top(5000)
      .filter(`substringof('${searchTerm}', Title) and DeptId eq ${departmentId} and PersonnelType/Title eq '${personnelType}'`)
      .get();
  }
  
  /**
   * Creates request number
   * @param locationCode Location code
   * @returns Request number
   */
  public async createRequestNumber(locationCode: string): Promise<string> {
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
      const dateRef = moment(refNoCount.DateRef).endOf('day').toISOString();
      const today = moment().endOf('day').toISOString();
      
      if (dateRef === today) {
        lastNumber = parseInt(refNoCount.LastNum) + 1;
        
        await refNoCountList.items.getById(refNoCount.ID).update({
          LastNum: lastNumber,
          DateRef: moment().endOf('day').toISOString()
        });
      } else {
        lastNumber = 1;
        
        await refNoCountList.items.getById(refNoCount.ID).update({
          LastNum: lastNumber,
          DateRef: moment().endOf('day').toISOString()
        });
      }
    }
    
    const paddedNumber = lastNumber.toString().padStart(3, '0');
    return `${locationCode}-${moment().format('YYYYMMDD')}-${paddedNumber}`;
  }
  
  /**
   * Updates overtime request
   * @param overtimeRequest Overtime request
   * @returns Updated overtime request
   */
  public async updateOvertimeRequest(overtimeRequest: IOvertimeRequest): Promise<IOvertimeRequest> {
    const { ID, Files, initFiles, origFiles, ...updateData } = overtimeRequest;
    
    // Create a new object for the update data
    const updatePayload: any = { ...updateData };
    
    // Convert dates to ISO strings
    if (updatePayload.DateFrom) {
      updatePayload.DateFrom = toISOString(updatePayload.DateFrom);
    }
    
    if (updatePayload.DateTo) {
      updatePayload.DateTo = toISOString(updatePayload.DateTo);
    }
    
    if (updatePayload.RequestDate) {
      updatePayload.RequestDate = toISOString(updatePayload.RequestDate);
    }
    
    if (updatePayload.SSDDate) {
      updatePayload.SSDDate = toISOString(updatePayload.SSDDate);
    }
    
    if (updatePayload.DeptApproverDate) {
      updatePayload.DeptApproverDate = toISOString(updatePayload.DeptApproverDate);
    }
    
    await sp.web.lists.getByTitle("Overtime").items.getById(ID).update(updatePayload);
    
    return await this.getOvertimeRequest(ID);
  }
  
  /**
   * Updates employee details
   * @param employeeDetails Employee details
   * @returns Updated employee details
   */
  public async updateEmployeeDetails(employeeDetails: IEmployeeDetails): Promise<IEmployeeDetails> {
    const { ID, Files, initFiles, origFiles, ...updateData } = employeeDetails;
    
    // Create a new object for the update data
    const updatePayload: any = { ...updateData };
    
    // Convert dates to ISO strings
    if (updatePayload.TimeFrom) {
      updatePayload.TimeFrom = toISOString(updatePayload.TimeFrom);
    }
    
    if (updatePayload.TimeTo) {
      updatePayload.TimeTo = toISOString(updatePayload.TimeTo);
    }
    
    await sp.web.lists.getByTitle("OvertimeDetails").items.getById(ID).update(updatePayload);
    
    return employeeDetails;
  }
  
  /**
   * Creates employee details
   * @param employeeDetails Employee details
   * @returns Created employee details
   */
  public async createEmployeeDetails(employeeDetails: IEmployeeDetails): Promise<IEmployeeDetails> {
    const { Files, initFiles, origFiles, ...createData } = employeeDetails;
    
    // Create a new object for the create data
    const createPayload: any = { ...createData };
    
    // Convert dates to ISO strings
    if (createPayload.TimeFrom) {
      createPayload.TimeFrom = toISOString(createPayload.TimeFrom);
    }
    
    if (createPayload.TimeTo) {
      createPayload.TimeTo = toISOString(createPayload.TimeTo);
    }
    
    const result: IItemAddResult = await sp.web.lists.getByTitle("OvertimeDetails").items.add(createPayload);
    
    return {
      ...employeeDetails,
      ID: result.data.ID
    };
  }
  
  /**
   * Deletes employee details
   * @param id Employee details ID
   * @returns Promise
   */
  public async deleteEmployeeDetails(id: number): Promise<void> {
    await sp.web.lists.getByTitle("OvertimeDetails").items.getById(id).delete();
  }
}
