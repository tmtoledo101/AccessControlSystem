import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups";
import { IItemAddResult } from "@pnp/sp/items";
import { IVisitor } from "../models/IVisitor";
import { IVisitorDetails } from "../models/IVisitorDetails";
import { toISOString } from "../helpers/dateHelpers";
import moment from "moment";

export class SharePointService {
  private siteUrl: string;
  private siteRelativeUrl: string;

  constructor(siteUrl: string, siteRelativeUrl: string) {
    this.siteUrl = siteUrl;
    this.siteRelativeUrl = siteRelativeUrl;
  }

  /**
   * Gets the current user
   * @returns Current user information
   */
  public async getCurrentUser(): Promise<any> {
    return await sp.web.currentUser();
  }

  /**
   * Checks if current user is in the Approvers list
   * @returns Whether the current user is an approver
   */
  public async isCurrentUserApprover(): Promise<boolean> {
    const currentUser = await this.getCurrentUser();

    const items = await sp.web.lists
      .getByTitle("Approvers")
      .items.select("Id", "Name/Id")
      .expand("Name")
      .top(1)
      .filter(`NameId eq ${currentUser.Id}`)
      .get();

    return items.length > 0;
  }

  /**
   * Gets the current user's groups
   * @returns Array of groups the current user belongs to
   */
  public async getCurrentUserGroups(): Promise<any[]> {
    return await sp.web.currentUser.groups();
  }

  /**
   * Gets the list of UsersPerDept entries for the given user
   * Used to determine if the user is an Encoder (exists in UsersPerDept)
   */
  public async getUsersPerDept(userId: number): Promise<any[]> {
    return await sp.web.lists
      .getByTitle("UsersPerDept")
      .items.select("*,Name/Title,Dept/Title")
      .expand("Name,Dept")
      .top(5000)
      .orderBy("Modified", true)
      .filter(`NameId eq ${userId}`)
      .get();
  }

  /**
   * Loads AccessPass items and returns a lookup map:
   * AccessPassId -> { title, buildings[] }
   */
  public async getAccessCardOptions(): Promise<{
    [key: number]: { title: string; buildings: string[] };
  }> {
    const items = await sp.web.lists
      .getByTitle("AccessPass")
      .items.select("Id", "Title", "Building/Title", "Building/Id")
      .expand("Building")
      .top(5000)
      .get();

    const lookup: { [key: number]: { title: string; buildings: string[] } } = {};

    for (const item of items as any[]) {
      let buildings: string[] = [];

      if (item.Building && item.Building.results) {
        for (const b of item.Building.results) {
          if (b && b.Title) buildings.push(b.Title);
        }
      } else if (item.Building && item.Building.Title) {
        buildings = [item.Building.Title];
      }

      lookup[item.Id] = {
        title: item.Title,
        buildings,
      };
    }

    return lookup;
  }

  /**
   * Gets a visitor by ID
   * @param id Visitor ID
   * @returns Visitor information
   */
  public async getVisitorById(id: number): Promise<any> {
    const visitors = await sp.web.lists
      .getByTitle("Visitors")
      .items.select(
        "*,Receptionist/Title, Approver/Title,Approver/EMail,Approver/ID, Status/Title,Dept/Title,SSDApprover/Title,Author/Title,Author/EMail"
      )
      .expand("Receptionist,Approver,Dept,Status,SSDApprover,Author")
      .top(5000)
      .filter(`ID eq ${id}`)
      .get();

    if (visitors.length > 0) {
      const visitor = visitors[0];

      const visitorsLib = await sp.web
        .getFolderByServerRelativeUrl(this.siteRelativeUrl + "/VisitorsLib/" + id)
        .files.select("*")
        .top(5000)
        .expand("ListItemAllFields")
        .get();

      const files = visitorsLib.map((row) => row.Name);
      visitor.Files = [];
      visitor.initFiles = files;
      visitor.origFiles = visitorsLib;
      visitor.colorAccess = "General";

      return visitor;
    }

    return null;
  }

  /**
   * Gets visitor details by parent ID
   * @param parentId Parent visitor ID
   * @returns Array of visitor details
   */
  public async getVisitorDetailsByParentId(parentId: number): Promise<any[]> {
    const visitorDetails = await sp.web.lists
      .getByTitle("VisitorDetails")
      .items
      .select(
        "ID",
        "Title",
        "FirstName",
        "Car",
        "PlateNo",
        "TypeofVehicle",
        "Color",
        "DriverName",
        "ParentId",
        "SSDApprove",
        "ParkingRequest",
        "AccessCardNo",
        "AccessCard/Id",
        "AccessCard/Title",
        "IDPresented"
      )
      .expand("AccessCard")
      .top(5000)
      .filter(`ParentId eq ${parentId}`)
      .get();

    await Promise.all(
      visitorDetails.map(async (row) => {
        const visitorDetailsLib = await sp.web
          .getFolderByServerRelativeUrl(
            this.siteRelativeUrl + "/VisitorDetailsLib/" + row.ID.toString()
          )
          .files.select("*")
          .top(5000)
          .expand("ListItemAllFields")
          .get();

        const acObj = (row as any).AccessCard;
        (row as any).AccessCardId = acObj && acObj.Id ? Number(acObj.Id) : null;
        (row as any).AccessCard = acObj && acObj.Title ? String(acObj.Title) : "";

        const files = visitorDetailsLib.map((fileRow) => fileRow.Name);
        row.Files = [];
        row.initFiles = files;
        row.origFiles = visitorDetailsLib;

        row.SSDApprove = row.SSDApprove === true ? "Yes" : "No";
        row.ParkingRequest = row.ParkingRequest === true ? "Yes" : "No";


      })
    );

    return visitorDetails;
  }

  /**
   * Gets the list of purposes
   * @returns Array of purposes
   */
  public async getPurposes(): Promise<any[]> {
    return await sp.web.lists
      .getByTitle("Purpose")
      .items.select("*")
      .top(5000)
      .filter(`Group eq 'Visitor'`)
      .get();
  }

  /**
   * Gets the list of buildings
   * @returns Array of buildings
   */
  public async getBuildings(): Promise<any[]> {
    return await sp.web.lists
      .getByTitle("Building")
      .items.select("*")
      .top(5000)
      .orderBy("Title", true)
      .get();
  }

  /**
   * Gets the list of departments
   * @param userId Optional user ID to filter departments by user
   * @returns Array of departments
   */
  public async getDepartments(userId?: number): Promise<any[]> {
    const depts = await sp.web.lists
      .getByTitle("Departments")
      .items.select("*")
      .top(5000)
      .get();

    if (userId) {
      const usersPerDept = await sp.web.lists
        .getByTitle("UsersPerDept")
        .items.select("*,Name/Title,Dept/Title")
        .expand("Name,Dept")
        .top(5000)
        .orderBy("Modified", true)
        .filter(`NameId eq ${userId}`)
        .get();

      if (usersPerDept.length > 0) {
        const mappedDepts: any[] = [];
        depts.forEach((row) => {
          const filtered = usersPerDept.filter((item) => item.DeptId === row.Id);
          if (filtered.length > 0) {
            mappedDepts.push(row);
          }
        });
        return mappedDepts;
      }
    }

    return depts;
  }

  /**
   * Gets the list of approvers for a department
   * @param deptId Department ID
   * @param currentUserId Current user ID to exclude from the list
   * @returns Array of approvers
   */
  public async getApprovers(deptId: number, currentUserId: number): Promise<any[]> {
    const approvers = await sp.web.lists
      .getByTitle("Approvers")
      .items.select("*,Name/Title, Name/EMail, Dept/Title")
      .expand("Name,Dept")
      .top(5000)
      .filter(`DeptId eq ${deptId}`)
      .get();

    return approvers.filter((item) => item.NameId !== currentUserId);
  }

  /**
   * Gets the list of walkin approvers for a department
   * @param deptId Department ID
   * @returns Array of walkin approvers
   */
  public async getWalkinApprovers(deptId: number): Promise<any[]> {
    return await sp.web.lists
      .getByTitle("WalkinApprovers")
      .items.select("*,Name/Title, Name/EMail, Dept/Title")
      .expand("Name,Dept")
      .top(5000)
      .filter(`DeptId eq ${deptId}`)
      .get();
  }

  /**
   * Gets the list of SSD users
   * @returns Array of SSD users
   */
  public async getSSDUsers(): Promise<any[]> {
    const siteGroups = await sp.web.siteGroups();
    for (let i = 0; i < siteGroups.length; i++) {
      if (siteGroups[i].LoginName === "SSD") {
        return await sp.web.siteGroups.getById(siteGroups[i].Id).users();
      }
    }
    return [];
  }

  public async getGroupUsersByName(groupLoginName: string): Promise<any[]> {
    const siteGroups = await sp.web.siteGroups();
    const g = siteGroups.find((x) => x.LoginName === groupLoginName);
    if (!g) return [];
    return await sp.web.siteGroups.getById(g.Id).users();
  }

  /**
   * Gets the list of gates
   * @returns Array of gates
   */
  public async getGates(): Promise<any[]> {
    return await sp.web.lists
      .getByTitle("Gates")
      .items.select("*")
      .top(5000)
      .get();
  }

  /**
   * Gets the list of ID types
   * @returns Array of ID types
   */
  public async getIDTypes(): Promise<any[]> {
    return await sp.web.lists
      .getByTitle("IDPresented")
      .items.select("*")
      .top(5000)
      .get();
  }

  /**
   * Gets the list of ID colors
   * @returns Array of ID colors
   */
  public async getIDColors(): Promise<any[]> {
    return await sp.web.lists
      .getByTitle("IDColor")
      .items.select("*")
      .top(5000)
      .get();
  }

  /**
   * Gets employees by name
   * @param name Name to search for
   * @param deptName Department name to filter by
   * @returns Array of matching employees
   */
  public async getEmployeesByName(name: string, deptName: string): Promise<any[]> {
    if (name.length > 2) {
      return await sp.web.lists
        .getByTitle("Employees")
        .items.select("*")
        .top(5000)
        .filter(`substringof('${name}', Name) and Dept eq '${deptName}'`)
        .get();
    }
    return [];
  }

  /**
   * Gets an employee by employee number
   * @param empNo Employee number
   * @returns Matching employee
   */
  public async getEmployeeByEmpNo(empNo: string): Promise<any[]> {
    return await sp.web.lists
      .getByTitle("Employees")
      .items.select("*")
      .top(5000)
      .filter(`EmpNo eq '${empNo}'`)
      .get();
  }

  /**
   * Creates a new request number
   * @param locationCode Location code
   * @returns New request number
   */
  public async createRequestNo(locationCode: string): Promise<string> {
    const refNoCount = await sp.web.lists
      .getByTitle("RefNoCount")
      .items.select("*")
      .top(5000)
      .filter(`Title eq 'Visitor'`)
      .get();

    let last = 0;

    if (refNoCount.length > 0) {
      const dt = moment(refNoCount[0].DateRef).endOf("day").toISOString();
      const dt2 = moment().endOf("day").toISOString();

      if (dt === dt2) {
        last = parseInt(refNoCount[0].LastNum) + 1;
        await sp.web.lists
          .getByTitle("RefNoCount")
          .items.getById(refNoCount[0].ID)
          .update({
            LastNum: last,
            DateRef: moment().endOf("day").toISOString(),
          });
      } else {
        last = 1;
        await sp.web.lists
          .getByTitle("RefNoCount")
          .items.getById(refNoCount[0].ID)
          .update({
            LastNum: last,
            DateRef: moment().endOf("day").toISOString(),
          });
      }
    }

    const lastRefNo = "" + Number(last);
    const pad = "000";
    return (
      locationCode +
      "-" +
      moment().format("YYYYMMDD") +
      "-" +
      pad.substring(0, pad.length - lastRefNo.length) +
      lastRefNo
    );
  }

  /**
   * Saves a visitor
   */
  public async saveVisitor(
    visitor: IVisitor,
    action: string,
    currentUser: any
  ): Promise<any> {
    const list = sp.web.lists.getByTitle("Visitors");
    let statusId = visitor.StatusId;
    let requestDate = visitor.RequestDate;
    let markCompleteDate = visitor.MarkCompleteDate;
    let ssdDate = visitor.SSDDate;
    let deptApproveDate = visitor.DeptApproverDate;
    let ssdApproverId = visitor.SSDApproverId;
    let receptionistId = visitor.ReceptionistId;
    let refNo = visitor.Title;

    if (action === "submit") {
      const buildings = await this.getBuildings();
      const bldgFiltered = buildings.filter((item) => item.Title === visitor.Bldg);
      refNo = await this.createRequestNo(bldgFiltered[0].LocationCode);
      requestDate = new Date();
      statusId = 2;
    } else if (action === "savedraft") {
      statusId = visitor.StatusId;
    } else if (action === "markcomplete") {
      statusId = 5;
      markCompleteDate = new Date();
      receptionistId = currentUser.Id;
    } else if (action === "approve") {
      if (visitor.StatusId === 2 && visitor.ExternalType === "Pre-arranged") {
        statusId = 3;
        deptApproveDate = new Date();
      } else if (visitor.StatusId === 2 && visitor.ExternalType === "Walk-in") {
        statusId = 9;
        deptApproveDate = new Date();
      } else if (visitor.StatusId === 3) {
        statusId = 4;
        ssdApproverId = currentUser.Id;
        ssdDate = new Date();
      }
    } else if (action === "deny") {
      if (visitor.StatusId === 2 && visitor.ExternalType === "Pre-arranged") {
        statusId = 6;
      } else if (visitor.StatusId === 2 && visitor.ExternalType === "Walk-in") {
        statusId = 8;
      } else if (visitor.StatusId === 3) {
        statusId = 7;
      }
    }

    let contactName = "";
    if (visitor.EmpNo) {
      const contacts = await this.getEmployeeByEmpNo(visitor.EmpNo);
      if (contacts.length > 0) contactName = contacts[0].Name;
    }

    await list.items.getById(visitor.ID).update({
      Title: refNo,
      ContactName: contactName,
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
      RequestDate: toISOString(requestDate),
      Remarks1: visitor.Remarks1,
      Remarks2: visitor.Remarks2,
      SSDApproverId: ssdApproverId,
      SSDDate: ssdDate ? toISOString(ssdDate) : null,
      DeptApproverDate: deptApproveDate ? toISOString(deptApproveDate) : null,
      MarkCompleteDate: markCompleteDate ? toISOString(markCompleteDate) : null,
      ReceptionistId: receptionistId,
      PurposeOthers: visitor.PurposeOthers,
    });

    return {
      ...visitor,
      Title: refNo,
      StatusId: statusId,
      RequestDate: requestDate,
      SSDApproverId: ssdApproverId,
      SSDDate: ssdDate,
      DeptApproverDate: deptApproveDate,
      MarkCompleteDate: markCompleteDate,
      ReceptionistId: receptionistId,
    };
  }

  /**
   * Uploads files for a visitor
   */
  public async uploadVisitorFiles(
    visitorId: number,
    files: any[],
    origFiles: any[],
    deleteFiles: any[]
  ): Promise<void> {
    const folderPath = this.siteRelativeUrl + "/VisitorsLib/" + visitorId;

    await Promise.all(
      files.map(async (file) => {
        const filtered = origFiles.filter((f) => f.Name === file.name);
        if (filtered.length === 0) {
          if (file.size <= 10485760) {
            await sp.web.getFolderByServerRelativeUrl(folderPath).files.add(file.name, file, true);
          } else {
            await sp.web.getFolderByServerRelativeUrl(folderPath).files.addChunked(
              file.name,
              file,
              (data) => {
                console.log({ data });
              },
              true
            );
          }
        }
      })
    );

    await Promise.all(
      deleteFiles.map(async (file) => {
        const fullPath = folderPath + "/" + file.Name;
        await sp.web.getFolderByServerRelativeUrl(fullPath).delete();
      })
    );
  }

  /**
   * Saves visitor details
   */
  public async saveVisitorDetails(
    visitorDetails: IVisitorDetails,
    parentId: number,
    refNo: string,
    deptId: number,
    dateTimeVisit: Date,
    dateTimeArrival: Date,
    companyName: string,
    statusId: number,
    requestDate: Date
  ): Promise<IVisitorDetails> {
    if (visitorDetails.ID) {
      await sp.web.lists
        .getByTitle("VisitorDetails")
        .items.getById(visitorDetails.ID)
        .update({
          Title: visitorDetails.Title,
          FirstName: visitorDetails.FirstName,
          Car: visitorDetails.Car,
          Color: visitorDetails.Color,
          DriverName: visitorDetails.DriverName,
          TypeofVehicle: visitorDetails.TypeofVehicle,
          PlateNo: visitorDetails.PlateNo,
          IDPresented: visitorDetails.IDPresented,
          AccessCardId: visitorDetails.AccessCardId ? Number(visitorDetails.AccessCardId) : null,
          AccessCardNo: visitorDetails.AccessCardNo || "",
          RequestDate: toISOString(requestDate),
          DeptId: deptId,
          RefNo: refNo,
          DateFrom: toISOString(dateTimeVisit),
          DateTo: toISOString(dateTimeArrival),
          CompanyName: companyName,
          StatusId: statusId,
          SSDApprove: visitorDetails.SSDApprove === "Yes" ? true : false,
          ParkingRequest: visitorDetails.ParkingRequest === "Yes" ? true : false,
        });

      return visitorDetails;
    } else {
      const result: IItemAddResult = await sp.web.lists
        .getByTitle("VisitorDetails")
        .items.add({
          ParentId: parentId,
          Title: visitorDetails.Title,
          FirstName: visitorDetails.FirstName,
          Car: visitorDetails.Car,
          Color: visitorDetails.Color,
          DriverName: visitorDetails.DriverName,
          TypeofVehicle: visitorDetails.TypeofVehicle,
          PlateNo: visitorDetails.PlateNo,
          IDPresented: visitorDetails.IDPresented,
          //AccessCard: visitorDetails.AccessCard,
          AccessCardId: visitorDetails.AccessCardId ? Number(visitorDetails.AccessCardId) : null,
          RequestDate: toISOString(requestDate),
          DeptId: deptId,
          RefNo: refNo,
          DateFrom: toISOString(dateTimeVisit),
          DateTo: toISOString(dateTimeArrival),
          CompanyName: companyName,
          StatusId: statusId,
          SSDApprove: visitorDetails.SSDApprove === "Yes" ? true : false,
          ParkingRequest: visitorDetails.ParkingRequest === "Yes" ? true : false,
        });

      await sp.web.lists
        .getByTitle("VisitorDetailsLib")
        .rootFolder.folders.add(result.data.ID.toString());

      return {
        ...visitorDetails,
        ID: result.data.ID,
        ParentId: parentId,
      };
    }
  }

  /**
   * Uploads files for visitor details
   */
  public async uploadVisitorDetailsFiles(
    visitorDetailsId: number,
    files: any[],
    origFiles: any[]
  ): Promise<void> {
    const folderPath = this.siteRelativeUrl + "/VisitorDetailsLib/" + visitorDetailsId;

    await Promise.all(
      files.map(async (file) => {
        const filtered = origFiles.filter((f) => f.Name === file.name);
        if (filtered.length === 0) {
          if (file.size <= 10485760) {
            await sp.web.getFolderByServerRelativeUrl(folderPath).files.add(file.name, file, true);
          } else {
            await sp.web.getFolderByServerRelativeUrl(folderPath).files.addChunked(
              file.name,
              file,
              (data) => {
                console.log({ data });
              },
              true
            );
          }
        }
      })
    );
  }

  /**
   * Deletes visitor details files
   */
  public async deleteVisitorDetailsFiles(
    deleteFiles: { Id: number; Filename: string }[]
  ): Promise<void> {
    await Promise.all(
      deleteFiles.map(async (file) => {
        const fullPath =
          this.siteRelativeUrl +
          "/VisitorDetailsLib/" +
          file.Id +
          "/" +
          file.Filename;
        await sp.web.getFolderByServerRelativeUrl(fullPath).delete();
      })
    );
  }

  /**
   * Deletes visitor details
   */
  public async deleteVisitorDetails(id: number): Promise<void> {
    await sp.web.lists.getByTitle("VisitorDetails").items.getById(id).delete();
  }
}