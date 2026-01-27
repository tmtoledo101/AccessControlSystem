import { WebPartContext } from "@microsoft/sp-webpart-base";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups";
import "@pnp/sp/fields";
import { IItemAddResult } from "@pnp/sp/items";
import { SPHttpClient } from "@microsoft/sp-http";
import moment from "moment";
import { IVisitor } from "../models/IVisitor";
import { IVisitorDetails } from "../models/IVisitorDetails";

export class SharePointService {
  private context: WebPartContext;
  private siteUrl: string;
  private siteRelativeUrl: string;
  private currentUser: any;

  constructor(context: WebPartContext, siteUrl: string, siteRelativeUrl: string) {
    this.context = context;
    this.siteUrl = siteUrl;
    this.siteRelativeUrl = siteRelativeUrl;
  }

  public async initialize(): Promise<void> {
    sp.setup({ spfxContext: this.context });
    this.currentUser = await sp.web.currentUser();
  }

  public getCurrentUser(): any {
    return this.currentUser;
  }

  public async isUserInGroup(groupName: string): Promise<boolean> {
    const groups = await sp.web.currentUser.groups();
    return groups.some((g) => g.LoginName === groupName);
  }

  public async getUsersPerDept(): Promise<any[]> {
    return await sp.web.lists
      .getByTitle("UsersPerDept")
      .items.select("*,Name/Title,Dept/Title")
      .expand("Name,Dept")
      .top(5000)
      .orderBy("Modified", true)
      .filter(`NameId eq ${this.currentUser.Id}`)
      .get();
  }

  public async getPurposeList(): Promise<any[]> {
    return await sp.web.lists
      .getByTitle("Purpose")
      .items.select("*")
      .top(5000)
      .filter(`Group eq 'Visitor'`)
      .get();
  }

  public async getBuildingList(): Promise<any[]> {
    return await sp.web.lists
      .getByTitle("Building")
      .items.select("*")
      .top(5000)
      .orderBy("Title", true)
      .get();
  }

  public async getDepartmentList(isEncoder: boolean, usersPerDept: any[]): Promise<any[]> {
    const depts = await sp.web.lists
      .getByTitle("Departments")
      .items.select("*")
      .top(5000)
      .get();

    if (isEncoder) {
      return depts.filter((dept) => usersPerDept.some((upd) => upd.DeptId === dept.Id));
    }

    return depts;
  }

  public async getApproverList(deptId: number): Promise<any[]> {
    const approvers = await sp.web.lists
      .getByTitle("Approvers")
      .items.select("*,Name/Title, Dept/Title")
      .expand("Name,Dept")
      .top(5000)
      .filter(`DeptId eq ${deptId}`)
      .get();

    return approvers.filter((a) => a.NameId !== this.currentUser.Id);
  }

  public async getWalkinApproverList(deptId: number): Promise<any[]> {
    return await sp.web.lists
      .getByTitle("WalkinApprovers")
      .items.select("*,Name/Title, Dept/Title")
      .expand("Name,Dept")
      .top(5000)
      .filter(`DeptId eq ${deptId}`)
      .get();
  }

  public async getApproverDetails(approverId: number): Promise<{ email: string; name: string }> {
    const url: string = this.siteUrl + `/_api/web/siteusers?$top=5000&$filter=ID eq ${approverId}`;
    const response = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    const result = await response.json();

    if (result.value && result.value.length > 0) {
      return { email: result.value[0].Email, name: result.value[0].Title };
    }

    return { email: "", name: "" };
  }

  public async findUsersByName(searchQuery: string, deptName: string): Promise<any[]> {
    const filterParts: string[] = [];
    const safeQuery = (searchQuery || "").replace(/'/g, "''");

    filterParts.push(`substringof('${safeQuery}', Name)`);

    if (/^\d+$/.test(searchQuery)) {
      filterParts.push(`EmpNo eq '${safeQuery}'`);
    }

    const combinedSearchFilter = filterParts.join(" or ");
    let finalFilterString = combinedSearchFilter;

    if (deptName) {
      const safeDept = deptName.replace(/'/g, "''");
      finalFilterString = `(${combinedSearchFilter}) and Dept eq '${safeDept}'`;
    }

    return await sp.web.lists
      .getByTitle("Employees")
      .items.select("*")
      .top(5000)
      .filter(finalFilterString)
      .get();
  }

  public async getVisitorTypeList(): Promise<any[]> {
    return await sp.web.lists
      .getByTitle("VisitorType")
      .items.select("Id", "Title", "VisID")
      .top(5000)
      .orderBy("VisID", true)
      .get();
  }

  public async createRequestNo(locationCode: string): Promise<string> {
    const list = sp.web.lists.getByTitle("RefNoCount");
    const refNoCount = await list.items.select("*").top(5000).filter(`Title eq 'Visitor'`).get();

    let last = 0;

    if (refNoCount.length > 0) {
      const dt = moment(refNoCount[0].DateRef).endOf("day").toISOString();
      const dt2 = moment().endOf("day").toISOString();

      if (dt === dt2) {
        last = parseInt(refNoCount[0].LastNum, 10) + 1;
        await list.items.getById(refNoCount[0].ID).update({
          LastNum: last,
          DateRef: moment().endOf("day").toISOString(),
        });
      } else {
        last = 1;
        await list.items.getById(refNoCount[0].ID).update({
          LastNum: last,
          DateRef: moment().endOf("day").toISOString(),
        });
      }
    }

    const lastRefNo = "" + last;
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

  public async saveVisitor(
    visitor: IVisitor,
    visitorDetailsList: IVisitorDetails[],
    submitType: number,
    refNo: string,
    actualDeptName: string,
  ): Promise<number> {
    const rawVisitorType = ((visitor as any).VisitorType || "").toString();
    const otherVisitorType = ((visitor as any).OtherVisitorType || "").toString().trim();
    const finalVisitorType = rawVisitorType === "Others" ? otherVisitorType : rawVisitorType;

    let contactName = "";
    if (visitor.EmpNo) {
      const contacts = await this.findUsersByName(visitor.EmpNo, actualDeptName);
      if (contacts.length > 0) contactName = contacts[0].Name;
    }

    const requestDate = submitType === 2 ? moment().toISOString() : null;

    // Do NOT write VisitorType to Visitors list (your error proves it doesn't exist there)
    const visitorsPayload: any = {
      Title: refNo,
      ContactName: contactName,
      ExternalType: visitor.ExternalType,
      Purpose: visitor.Purpose,
      DeptId: visitor.DeptId,
      Bldg: (visitor as any).Bldg,
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
      PurposeOthers: (visitor as any).PurposeOthers,
    };

    const iar: IItemAddResult = await sp.web.lists.getByTitle("Visitors").items.add(visitorsPayload);
    const itemId = iar.data.ID;

    const folderPath = this.siteRelativeUrl + "/VisitorsLib/" + itemId;
    await sp.web.lists.getByTitle("VisitorsLib").rootFolder.folders.add(itemId.toString());

    await Promise.all(
      (visitor.Files || []).map(async (file: File) => {
        if (file.size <= 10485760) {
          await sp.web.getFolderByServerRelativeUrl(folderPath).files.add(file.name, file, true);
        } else {
          await sp.web.getFolderByServerRelativeUrl(folderPath).files.addChunked(
            file.name,
            file,
            (data) => console.log({ data }),
            true,
          );
        }
      }),
    );

    await Promise.all(
      (visitorDetailsList || []).map(async (visitorDetail) => {
        const detailTypeRaw = ((visitorDetail as any).VisitorType || finalVisitorType || "").toString().trim();
        const visitorTypeId = await this.getOrCreateVisitorTypeIdByTitle(detailTypeRaw);

        const iar2: IItemAddResult = await sp.web.lists.getByTitle("VisitorDetails").items.add({
          ParentId: itemId,
          Title: visitorDetail.Title,
          FirstName: visitorDetail.FirstName,
          Car: (visitorDetail as any).Car,
          Color: (visitorDetail as any).Color,
          DriverName: (visitorDetail as any).DriverName,
          TypeofVehicle: (visitorDetail as any).TypeofVehicle,
          PlateNo: (visitorDetail as any).PlateNo,
          GateNo: (visitorDetail as any).GateNo,
          IDPresented: (visitorDetail as any).IDPresented,
          AccessCardId:
            (visitorDetail as any).AccessCard && typeof (visitorDetail as any).AccessCard === "number"
              ? (visitorDetail as any).AccessCard
              : null,
          RequestDate: requestDate,
          DeptId: visitor.DeptId,
          RefNo: refNo,
          DateFrom: moment(visitor.DateTimeVisit).toISOString(),
          DateTo: moment(visitor.DateTimeArrival).toISOString(),
          CompanyName: visitor.CompanyName,
          StatusId: submitType,

          // Lookup internal name looks like "VisitorType", SharePoint expects "VisitorTypeId"
          VisitorTypeId: visitorTypeId,
        });

        await sp.web.lists.getByTitle("VisitorDetailsLib").rootFolder.folders.add(iar2.data.ID.toString());
      }),
    );

    return itemId;
  }

  public async updatePrivacyConsentRefNo(userEmail: string, newRefNo: string): Promise<void> {
    try {
      const list = sp.web.lists.getByTitle("PrivacyConsents");
      const safeEmail = (userEmail || "").replace(/'/g, "''");

      const items = await list.items
        .filter(`UserEmail eq '${safeEmail}'`)
        .orderBy("Created", false)
        .top(1)
        .get();

      if (items.length > 0) {
        const consentItemId = items[0].ID;
        await list.items.getById(consentItemId).update({ RefNo: newRefNo });
      }
    } catch (error) {
      console.error(`Error updating privacy consent RefNo for ${userEmail}:`, error);
      throw error;
    }
  }

  private async getVisitorTypeIdByTitle(title: string): Promise<number | null> {
    if (!title) return null;

    const safeTitle = title.replace(/'/g, "''");

    const items = await sp.web.lists
      .getByTitle("VisitorType")
      .items.select("Id", "Title")
      .filter(`Title eq '${safeTitle}'`)
      .top(1)
      .get();

    return items.length > 0 ? items[0].Id : null;
  }

  private async getOrCreateVisitorTypeIdByTitle(title: string): Promise<number | null> {
    const clean = (title || "").toString().trim();
    if (!clean) return null;

    const existingId = await this.getVisitorTypeIdByTitle(clean);
    if (existingId) return existingId;

    const created: any = await sp.web.lists.getByTitle("VisitorType").items.add({ Title: clean });

    // No optional chaining, compatible with older TS
    if (created && created.data) {
      if (typeof created.data.Id === "number") return created.data.Id;
      if (typeof created.data.ID === "number") return created.data.ID;
    }

    // If creation returned unexpected shape, try to re-query by title
    return await this.getVisitorTypeIdByTitle(clean);
  }
}
