import { WebPartContext } from "@microsoft/sp-webpart-base";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups";
import { IItemAddResult } from "@pnp/sp/items";
import { SPHttpClient } from "@microsoft/sp-http";
import moment from 'moment';
import { IVisitor } from "../models/IVisitor";
import { IVisitorDetails } from "../models/IVisitorDetails";

/**
 * SharePoint service
 */
export class SharePointService {
  private context: WebPartContext;
  private siteUrl: string;
  private siteRelativeUrl: string;
  private currentUser: any;

  /**
   * Constructor
   * @param context Web part context
   * @param siteUrl Site URL
   * @param siteRelativeUrl Site relative URL
   */
  constructor(context: WebPartContext, siteUrl: string, siteRelativeUrl: string) {
    this.context = context;
    this.siteUrl = siteUrl;
    this.siteRelativeUrl = siteRelativeUrl;
  }

  /**
   * Initializes the service
   */
  public async initialize(): Promise<void> {
    sp.setup({
      spfxContext: this.context
    });

    this.currentUser = await sp.web.currentUser();
  }

  /**
   * Gets the current user
   * @returns Current user
   */
  public getCurrentUser(): any {
    return this.currentUser;
  }

  /**
   * Checks if the user is in a group
   * @param groupName Group name
   * @returns Whether the user is in the group
   */
  public async isUserInGroup(groupName: string): Promise<boolean> {
    const groups = await sp.web.currentUser.groups();
    return groups.some(g => g.LoginName === groupName);
  }

  /**
   * Gets the users per department
   * @returns Users per department
   */
  public async getUsersPerDept(): Promise<any[]> {
    return await sp.web.lists.getByTitle("UsersPerDept")
      .items
      .select("*,Name/Title,Dept/Title")
      .expand('Name,Dept')
      .top(5000)
      .orderBy("Modified", true)
      .filter(`NameId eq ${this.currentUser.Id}`)
      .get();
  }

  /**
   * Gets the purpose list
   * @returns Purpose list
   */
  public async getPurposeList(): Promise<any[]> {
    return await sp.web.lists.getByTitle("Purpose")
      .items
      .select("*")
      .top(5000)
      .filter(`Group eq 'Visitor'`)
      .get();
  }

  /**
   * Gets the building list
   * @returns Building list
   */
  public async getBuildingList(): Promise<any[]> {
    return await sp.web.lists.getByTitle("Building")
      .items
      .select("*")
      .top(5000)
      .orderBy("Title", true)
      .get();
  }

  /**
   * Gets the department list
   * @param isEncoder Whether the user is an encoder
   * @param usersPerDept Users per department
   * @returns Department list
   */
  public async getDepartmentList(isEncoder: boolean, usersPerDept: any[]): Promise<any[]> {
    const depts = await sp.web.lists.getByTitle("Departments")
      .items
      .select("*")
      .top(5000)
      .get();

    if (isEncoder) {
      return depts.filter(dept =>
        usersPerDept.some(upd => upd.DeptId === dept.Id)
      );
    }

    return depts;
  }

  /**
   * Gets the approver list
   * @param deptId Department ID
   * @returns Approver list
   */
  public async getApproverList(deptId: number): Promise<any[]> {
    const approvers = await sp.web.lists.getByTitle("Approvers")
      .items
      .select("*,Name/Title, Dept/Title")
      .expand('Name,Dept')
      .top(5000)
      .filter(`DeptId eq ${deptId}`)
      .get();

    return approvers.filter(a => a.NameId !== this.currentUser.Id);
  }

  /**
   * Gets the walkin approver list
   * @param deptId Department ID
   * @returns Walkin approver list
   */
  public async getWalkinApproverList(deptId: number): Promise<any[]> {
    return await sp.web.lists.getByTitle("WalkinApprovers")
      .items
      .select("*,Name/Title, Dept/Title")
      .expand('Name,Dept')
      .top(5000)
      .filter(`DeptId eq ${deptId}`)
      .get();
  }

  /**
   * Gets the approver details
   * @param approverId Approver ID
   * @returns Approver details
   */
  public async getApproverDetails(approverId: number): Promise<{ email: string; name: string }> {
    const url: string = this.siteUrl + `/_api/web/siteusers?$top=5000&$filter=ID eq ${approverId}`;
    const response = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    const result = await response.json();

    if (result.value && result.value.length > 0) {
      return {
        email: result.value[0].Email,
        name: result.value[0].Title
      };
    }

    return { email: '', name: '' };
  }

  /**
   * Finds users by name or EmpNo and department.
   * This is used for the live search/autocomplete in the UI.
   * @param searchQuery The text to search for (can be name or EmpNo).
   * @param deptName Department name to filter by.
   * @returns Users matching the criteria.
   */
  public async findUsersByName(searchQuery: string, deptName: string): Promise<any[]> {
    let filterParts = [];

    // Always search by Name using substringof (for typing names)
    filterParts.push(`substringof('${searchQuery}', Name)`);

    // If the searchQuery looks like a number, also search by EmpNo (for typing EmpNo)
    // The `visitor.EmpNo` passed from saveVisitor will also hit this if it's a number
    if (/^\d+$/.test(searchQuery)) { // Checks if string contains only digits
        filterParts.push(`EmpNo eq '${searchQuery}'`);
    }

    // Combine the search queries with OR
    let combinedSearchFilter = filterParts.join(" or ");

    let finalFilterString = combinedSearchFilter;

    // Add department filter if deptName is provided and not empty
    if (deptName) {
        finalFilterString = `(${combinedSearchFilter}) and Dept eq '${deptName}'`; // Group previous filters
    }

    // console.log("DEBUG findUsersByName (SharePointService): Constructed filter:", finalFilterString); // Uncomment for debugging

    return await sp.web.lists.getByTitle("Employees")
      .items
      .select("*")
      .top(5000)
      .filter(finalFilterString)
      .get();
  }


  /**
   * Creates a request number
   * @param locationCode Location code
   * @returns Request number
   */
  public async createRequestNo(locationCode: string): Promise<string> {
    const list = sp.web.lists.getByTitle("RefNoCount");
    const refNoCount = await list.items
      .select("*")
      .top(5000)
      .filter(`Title eq 'Visitor'`)
      .get();

    let last = 0;

    if (refNoCount.length > 0) {
      const dt = moment(refNoCount[0].DateRef).endOf('day').toISOString();
      const dt2 = moment().endOf('day').toISOString();

      if (dt === dt2) {
        last = parseInt(refNoCount[0].LastNum) + 1;
        await list.items.getById(refNoCount[0].ID).update({
          LastNum: last,
          DateRef: moment().endOf('day').toISOString()
        });
      } else {
        last = 1;
        await list.items.getById(refNoCount[0].ID).update({
          LastNum: last,
          DateRef: moment().endOf('day').toISOString()
        });
      }
    }

    const lastRefNo = "" + last;
    const pad = "000";
    return locationCode + '-' + moment().format('YYYYMMDD') + '-' + pad.substring(0, pad.length - lastRefNo.length) + lastRefNo;
  }

  /**
   * Saves a visitor
   * @param visitor Visitor data
   * @param visitorDetailsList List of visitor details
   * @param submitType Type of submission (1 = Save, 2 = Submit)
   * @param refNo Reference number
   * @param actualDeptName The actual department name of the contact person (e.g., "Test Department")
   * @returns Item ID of the newly created visitor record
   */
  public async saveVisitor(
    visitor: IVisitor,
    visitorDetailsList: IVisitorDetails[],
    submitType: number,
    refNo: string,
    actualDeptName: string // This parameter is used for the contact person lookup
  ): Promise<number> {
    // Find contact name based on EmpNo and DeptName
    let contactName = "";
    if (visitor.EmpNo) {
      // Use visitor.EmpNo as the search query. The findUsersByName method will handle if it's a number or might match a name.
      // Crucially, it will explicitly filter by EmpNo if visitor.EmpNo is a digit string.
      const contacts = await this.findUsersByName(visitor.EmpNo, actualDeptName);
      if (contacts.length > 0) {
        contactName = contacts[0].Name; // Get the Name field from the found employee
        console.log("DEBUG saveVisitor (SharePointService): Value derived for contactName:", contactName);
      } else {
        console.warn("DEBUG saveVisitor (SharePointService): No user found for EmpNo:", visitor.EmpNo, "with Dept:", actualDeptName);
      }
    } else {
        console.warn("DEBUG saveVisitor (SharePointService): visitor.EmpNo is empty. contactName will be empty.");
    }

    // Save visitor
    const requestDate = submitType === 2 ? moment().toISOString() : null;

    console.log("DEBUG saveVisitor (SharePointService): Payload for 'Visitors' list add:", {
        Title: refNo,
        ContactName: contactName, // This is the value being sent to your Single line of text column
        ExternalType: visitor.ExternalType,
        Purpose: visitor.Purpose,
        DeptId: visitor.DeptId,
        Bldg: visitor.Bldg,
        RoomNo: visitor.RoomNo,
        EmpNo: visitor.EmpNo,
        Position: visitor.Position,
        DirectNo: visitor.DirectNo,
        LocalNo: visitor.LocalNo,
        DateTimeVisit: moment(visitor.DateTimeVisit).toISOString(),
        DateTimeArrival: moment(visitor.DateTimeArrival).toISOString(),
        CompanyName: visitor.CompanyName,
        Address: visitor.Address,
        VisContactNo: visitor.VisContactNo,
        VisLocalNo: visitor.VisLocalNo,
        RequireParking: visitor.RequireParking,
        ApproverId: visitor.ApproverId,
        StatusId: submitType,
        RequestDate: requestDate,
        PurposeOthers: visitor.PurposeOthers,
        //VisitorType: visitor.VisitorType
    });

    const iar: IItemAddResult = await sp.web.lists.getByTitle("Visitors").items.add({
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
      DateTimeVisit: moment(visitor.DateTimeVisit).toISOString(),
      DateTimeArrival: moment(visitor.DateTimeArrival).toISOString(),
      CompanyName: visitor.CompanyName,
      Address: visitor.Address,
      VisContactNo: visitor.VisContactNo,
      VisLocalNo: visitor.VisLocalNo,
      RequireParking: visitor.RequireParking,
      ApproverId: visitor.ApproverId,
      StatusId: submitType,
      RequestDate: requestDate,
      PurposeOthers: visitor.PurposeOthers,
      //VisitorType: visitor.VisitorType
    });

    const itemId = iar.data.ID;

    // Create folder and upload files
    const folderPath = this.siteRelativeUrl + "/VisitorsLib/" + itemId;
    await sp.web.lists.getByTitle("VisitorsLib").rootFolder.folders.add(itemId.toString());

    // Upload files
    await Promise.all(visitor.Files.map(async (file) => {
      if (file.size <= 10485760) {
        // Small upload
        await sp.web.getFolderByServerRelativeUrl(folderPath).files.add(file.name, file, true);
      } else {
        // Large upload
        await sp.web.getFolderByServerRelativeUrl(folderPath).files.addChunked(file.name, file, data => {
          console.log({ data });
        }, true);
      }
    }));

    // Save visitor details
    await Promise.all(visitorDetailsList.map(async (visitorDetail) => {
      const iar2: IItemAddResult = await sp.web.lists.getByTitle("VisitorDetails").items.add({
        ParentId: itemId,
        Title: visitorDetail.Title,
        FirstName: visitorDetail.FirstName,
        Car: visitorDetail.Car,
        Color: visitorDetail.Color,
        DriverLastName: visitorDetail.DriverLastName,
        DriverFirstName: visitorDetail.DriverFirstName,
        TypeofVehicle: visitorDetail.TypeofVehicle,
        PlateNo: visitorDetail.PlateNo,
        GateNo: visitorDetail.GateNo,
        IDPresented: visitorDetail.IDPresented,
        AccessCardId: visitorDetail.AccessCard && typeof visitorDetail.AccessCard === 'number'
        ? visitorDetail.AccessCard
        : null,
        RequestDate: requestDate,
        DeptId: visitor.DeptId,
        RefNo: refNo,
        DateFrom: moment(visitor.DateTimeVisit).toISOString(),
        DateTo: moment(visitor.DateTimeArrival).toISOString(),
        CompanyName: visitor.CompanyName,
        StatusId: submitType,
        //VisitorType: visitorDetail.VisitorType // Added VisitorType field
        VisitorTypeId: await this.getVisitorTypeIdByTitle(visitorDetail.VisitorType)
      });

      await sp.web.lists.getByTitle("VisitorDetailsLib").rootFolder.folders.add(iar2.data.ID.toString());
    }));

    return itemId;
  }

  /**
   * Updates the RefNo in the PrivacyConsents list for a specific user.
   * This is called after a RefNo has been generated during form submission.
   * @param userEmail The email of the user whose consent record needs updating.
   * @param newRefNo The newly generated Reference Number to associate with the consent.
   */
  public async updatePrivacyConsentRefNo(userEmail: string, newRefNo: string): Promise<void> {
    try {
      const list = sp.web.lists.getByTitle("PrivacyConsents");

      // Find the most recent consent entry for the given user email
      const items = await list.items
        .filter(`UserEmail eq '${userEmail}'`)
        .orderBy("Created", false) // Sort by creation date descending to get the latest
        .top(1) // Get only the most recent one
        .get();

      if (items.length > 0) {
        const consentItemId = items[0].ID;
        await list.items.getById(consentItemId).update({
          RefNo: newRefNo
        });
        console.log(`Privacy consent for ${userEmail} (ID: ${consentItemId}) updated with RefNo: ${newRefNo}`);
      } else {
        console.warn(`No existing privacy consent found for user: ${userEmail}. Cannot update RefNo.`);
      }
    } catch (error) {
      console.error(`Error updating privacy consent RefNo for ${userEmail}:`, error);
      throw error; // Re-throw to propagate error if necessary
    }
  }
    /**
   * Gets the lookup ID from the VisitorType list based on a title
   * @param title Title of the visitor type (e.g., "Service Provider")
   */
  private async getVisitorTypeIdByTitle(title: string): Promise<number | null> {
    const items = await sp.web.lists.getByTitle("VisitorType")
      .items
      .select("Id", "Title")
      .filter(`Title eq '${title}'`)
      .top(1)
      .get();

    return items.length > 0 ? items[0].Id : null;
  }

}
