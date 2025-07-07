import { sp } from "@pnp/sp";
import "@pnp/sp/profiles";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import "@pnp/sp/site-users/web";
import "@pnp/sp/fields";
import "@pnp/sp/regional-settings/web";
import "@pnp/sp/site-groups";
import { IItemAddResult } from "@pnp/sp/items";
import { IVisitor } from "../models/IVisitor";
import { IVisitorDetails } from "../models/IVisitorDetails";
import { toISOString } from "../helpers/dateHelpers";
import moment from 'moment';

/**
 * SharePoint service for visitor operations
 */
export class SharePointService {
  private siteUrl: string;
  private siteRelativeUrl: string;

  /**
   * Constructor
   * @param siteUrl Site URL
   * @param siteRelativeUrl Site relative URL
   */
  constructor(siteUrl: string, siteRelativeUrl: string) {
    this.siteUrl = siteUrl;
    this.siteRelativeUrl = siteRelativeUrl;
  }

  /**
   * Gets the current user
   * @returns Current user
   */
  public async getCurrentUser(): Promise<any> {
    return await sp.web.currentUser();
  }

  /**
   * Gets the current user groups
   * @returns Current user groups
   */
  public async getCurrentUserGroups(): Promise<any[]> {
    return await sp.web.currentUser.groups();
  }

  /**
   * Gets departments
   * @param userId Optional user ID to filter by
   * @returns Departments
   */
  public async getDepartments(userId?: number): Promise<any[]> {
    if (userId) {
      return await sp.web.lists.getByTitle("UsersPerDept")
        .items
        .select("*,Name/Title,Dept/Title")
        .expand('Name,Dept')
        .top(5000)
        .orderBy("Modified", true)
        .filter(`NameId eq ${userId}`)
        .get();
    } else {
      return await sp.web.lists.getByTitle("Departments")
        .items
        .select("*")
        .top(5000)
        .get();
    }
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
      .filter(`Group eq 'Visitor'`)
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
   * Gets approvers
   * @param deptId Department ID
   * @param currentUserId Current user ID
   * @returns Approvers
   */
  public async getApprovers(deptId: number, currentUserId: number): Promise<any[]> {
    const approvers = await sp.web.lists.getByTitle("Approvers")
      .items
      .select("*,Name/Title, Dept/Title")
      .expand('Name,Dept')
      .top(5000)
      .filter(`DeptId eq ${deptId}`)
      .get();

    return approvers.filter(item => item.NameId !== currentUserId);
  }

  /**
   * Gets walkin approvers
   * @param deptId Department ID
   * @returns Walkin approvers
   */
  public async getWalkinApprovers(deptId: number): Promise<any[]> {
    return await sp.web.lists.getByTitle("WalkinApprovers")
      .items
      .select("*,Name/Title, Dept/Title")
      .expand('Name,Dept')
      .top(5000)
      .filter(`DeptId eq ${deptId}`)
      .get();
  }

  /**
   * Gets SSD users
   * @returns SSD users
   */
  public async getSSDUsers(): Promise<any[]> {
    return await sp.web.siteGroups.getByName("SSD").users.get();
  }

  /**
   * Gets gates
   * @returns Gates
   */
  public async getGates(): Promise<any[]> {
    return await sp.web.lists.getByTitle("Gates")
      .items
      .select("*")
      .top(5000)
      .get();
  }

  /**
   * Gets ID types
   * @returns ID types
   */
  public async getIDTypes(): Promise<any[]> {
    return await sp.web.lists.getByTitle("IDPresented")
      .items
      .select("*")
      .top(5000)
      .get();
  }

  /**
   * Gets ID colors
   * @returns ID colors
   */
  public async getIDColors(): Promise<any[]> {
    return await sp.web.lists.getByTitle("IDColors")
      .items
      .select("*")
      .top(5000)
      .get();
  }

  /**
   * Gets employees by name
   * @param name Name to search for
   * @param deptName Department name
   * @returns Employees
   */
  public async getEmployeesByName(name: string, deptName: string): Promise<any[]> {
    return await sp.web.lists.getByTitle("Employees")
      .items
      .select("*")
      .top(5000)
      .filter(`substringof('${name}', Name) and Dept eq '${deptName}'`)
      .get();
  }

  /**
   * Gets employee by employee number
   * @param empNo Employee number
   * @returns Employee
   */
  public async getEmployeeByEmpNo(empNo: string): Promise<any[]> {
    if (!empNo) return [];
    return await sp.web.lists.getByTitle("Employees")
      .items
      .select("*")
      .top(5000)
      .filter(`EmpNo eq '${empNo}'`)
      .get();
  }

  /**
   * Creates a request number
   * @param loc Location code
   * @returns Request number
   */
  public async createRequestNo(loc: string): Promise<string> {
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
        await list.items.getById(RefNoCount[0].ID).update({
          LastNum: last,
          DateRef: moment().endOf('day').toISOString()
        });
      } else {
        last = 1;
        await list.items.getById(RefNoCount[0].ID).update({
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
  }

  /**
   * Saves a visitor
   * @param visitor Visitor data
   * @param action Action type
   * @param currentUser Current user
   * @returns Saved visitor
   */
  public async saveVisitor(visitor: IVisitor, action: string, currentUser: any): Promise<IVisitor> {
    try {
      let statusId = visitor.StatusId;
      let requestDate = null;
      let deptApproverDate = null;
      let ssdDate = null;
      let markCompleteDate = null;
      let refno = visitor.Title;

      // Determine status ID and dates based on action
      if (action === 'submit') {
        statusId = 2;
        requestDate = moment().toISOString();
      } else if (action === 'approve') {
        if (visitor.StatusId === 2) {
          statusId = 3;
          deptApproverDate = moment().toISOString();
        } else if (visitor.StatusId === 3) {
          statusId = 4;
          ssdDate = moment().toISOString();
        }
      } else if (action === 'deny') {
        if (visitor.StatusId === 2) {
          statusId = 8;
          deptApproverDate = moment().toISOString();
        } else if (visitor.StatusId === 3) {
          statusId = 7;
          ssdDate = moment().toISOString();
        }
      } else if (action === 'markcomplete') {
        statusId = 9;
        markCompleteDate = moment().toISOString();
      }

      // Create request number if submitting
      if (action === 'submit' && !visitor.Title) {
        const bldgfiltered = await sp.web.lists.getByTitle("Building")
          .items
          .select("*")
          .top(5000)
          .filter(`Title eq '${visitor.Bldg}'`)
          .get();
        
        if (bldgfiltered.length > 0) {
          refno = await this.createRequestNo(bldgfiltered[0].LocationCode);
        }
      }

      // Update visitor
      if (visitor.ID) {
        await sp.web.lists.getByTitle("Visitors").items.getById(visitor.ID).update({
          Title: refno,
          ExternalType: visitor.ExternalType,
          Purpose: visitor.Purpose,
          DeptId: visitor.DeptId,
          Bldg: visitor.Bldg,
          RoomNo: visitor.RoomNo,
          EmpNo: visitor.EmpNo,
          Position: visitor.Position,
          DirectNo: visitor.DirectNo,
          LocalNo: visitor.LocalNo,
          DateTimeVisit: toISOString(visitor.DateTimeVisit),
          DateTimeArrival: toISOString(visitor.DateTimeArrival),
          CompanyName: visitor.CompanyName,
          Address: visitor.Address,
          VisContactNo: visitor.VisContactNo,
          VisLocalNo: visitor.VisLocalNo,
          RequireParking: visitor.RequireParking,
          ApproverId: visitor.ApproverId,
          StatusId: statusId,
          RequestDate: requestDate,
          DeptApproverDate: deptApproverDate,
          SSDDate: ssdDate,
          MarkCompleteDate: markCompleteDate,
          Remarks1: visitor.Remarks1,
          Remarks2: visitor.Remarks2,
          PurposeOthers: visitor.PurposeOthers
        });

        // Return updated visitor
        return {
          ...visitor,
          Title: refno,
          StatusId: statusId,
          RequestDate: requestDate ? new Date(requestDate) : visitor.RequestDate,
          DeptApproverDate: deptApproverDate ? new Date(deptApproverDate) : visitor.DeptApproverDate,
          SSDDate: ssdDate ? new Date(ssdDate) : visitor.SSDDate,
          MarkCompleteDate: markCompleteDate ? new Date(markCompleteDate) : visitor.MarkCompleteDate
        };
      } else {
        // Add new visitor
        const iar: IItemAddResult = await sp.web.lists.getByTitle("Visitors").items.add({
          Title: refno,
          ExternalType: visitor.ExternalType,
          Purpose: visitor.Purpose,
          DeptId: visitor.DeptId,
          Bldg: visitor.Bldg,
          RoomNo: visitor.RoomNo,
          EmpNo: visitor.EmpNo,
          Position: visitor.Position,
          DirectNo: visitor.DirectNo,
          LocalNo: visitor.LocalNo,
          DateTimeVisit: toISOString(visitor.DateTimeVisit),
          DateTimeArrival: toISOString(visitor.DateTimeArrival),
          CompanyName: visitor.CompanyName,
          Address: visitor.Address,
          VisContactNo: visitor.VisContactNo,
          VisLocalNo: visitor.VisLocalNo,
          RequireParking: visitor.RequireParking,
          ApproverId: visitor.ApproverId,
          StatusId: statusId,
          RequestDate: requestDate,
          PurposeOthers: visitor.PurposeOthers
        });

        // Create folder for attachments
        await sp.web.lists.getByTitle("VisitorsLib").rootFolder.folders.add(iar.data.ID.toString());

        // Return new visitor
        return {
          ...visitor,
          ID: iar.data.ID,
          Title: refno,
          StatusId: statusId,
          RequestDate: requestDate ? new Date(requestDate) : null
        };
      }
    } catch (error) {
      console.error("Error saving visitor:", error);
      throw error;
    }
  }

  /**
   * Saves visitor details
   * @param visitorDetail Visitor details
   * @param parentId Parent ID
   * @param refno Reference number
   * @param deptId Department ID
   * @param dateFrom Date from
   * @param dateTo Date to
   * @param companyName Company name
   * @param statusId Status ID
   * @param requestDate Request date
   * @returns Saved visitor details
   */
  public async saveVisitorDetails(
    visitorDetail: IVisitorDetails,
    parentId: number,
    refno: string,
    deptId: number,
    dateFrom: Date,
    dateTo: Date,
    companyName: string,
    statusId: number,
    requestDate: Date
  ): Promise<IVisitorDetails> {
    try {
      if (visitorDetail.ID) {
        // Update existing visitor details
        await sp.web.lists.getByTitle("VisitorDetails").items.getById(visitorDetail.ID).update({
          ParentId: parentId,
          Title: visitorDetail.Title,
          Car: visitorDetail.Car,
          Color: visitorDetail.Color,
          DriverName: visitorDetail.DriverName,
          TypeofVehicle: visitorDetail.TypeofVehicle,
          PlateNo: visitorDetail.PlateNo,
          GateNo: visitorDetail.GateNo,
          IDPresented: visitorDetail.IDPresented,
          AccessCard: visitorDetail.AccessCard,
          SSDApprove: visitorDetail.SSDApprove
        });

        return visitorDetail;
      } else {
        // Add new visitor details
        const iar: IItemAddResult = await sp.web.lists.getByTitle("VisitorDetails").items.add({
          ParentId: parentId,
          Title: visitorDetail.Title,
          Car: visitorDetail.Car,
          Color: visitorDetail.Color,
          DriverName: visitorDetail.DriverName,
          TypeofVehicle: visitorDetail.TypeofVehicle,
          PlateNo: visitorDetail.PlateNo,
          GateNo: visitorDetail.GateNo,
          IDPresented: visitorDetail.IDPresented,
          AccessCard: visitorDetail.AccessCard,
          RequestDate: requestDate ? toISOString(requestDate) : null,
          DeptId: deptId,
          RefNo: refno,
          DateFrom: toISOString(dateFrom),
          DateTo: toISOString(dateTo),
          CompanyName: companyName,
          StatusId: statusId
        });

        // Create folder for attachments
        await sp.web.lists.getByTitle("VisitorDetailsLib").rootFolder.folders.add(iar.data.ID.toString());

        return {
          ...visitorDetail,
          ID: iar.data.ID,
          ParentId: parentId
        };
      }
    } catch (error) {
      console.error("Error saving visitor details:", error);
      throw error;
    }
  }

  /**
   * Deletes visitor details
   * @param id Visitor details ID
   */
  public async deleteVisitorDetails(id: number): Promise<void> {
    try {
      await sp.web.lists.getByTitle("VisitorDetails").items.getById(id).delete();
    } catch (error) {
      console.error("Error deleting visitor details:", error);
      throw error;
    }
  }
}
