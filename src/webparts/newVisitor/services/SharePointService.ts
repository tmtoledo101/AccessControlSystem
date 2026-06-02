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
    const items = await sp.web.lists
      .getByTitle("Building")
      .items.select("*")
      .top(5000)
      .get();

    return (items || []).sort((a: any, b: any) => {
      const at = ((a && a.Title) ? String(a.Title) : "").trim();
      const bt = ((b && b.Title) ? String(b.Title) : "").trim();

      const aFirstChar = at.charAt(5);
      const bFirstChar = bt.charAt(5);

      const aIsNumber = !isNaN(Number(aFirstChar));
      const bIsNumber = !isNaN(Number(bFirstChar));

      if (aIsNumber && !bIsNumber) return 1;
      if (!aIsNumber && bIsNumber) return -1;

      return at.localeCompare(bt, undefined, { sensitivity: "base" });
    });
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

  private sanitizeODataValue(value: string): string {
    return (value || "").toString().trim().replace(/'/g, "''");
  }

  private async findUserByEmpNo(empNo: string, deptName?: string): Promise<any | null> {
    const safeEmpNo = this.sanitizeODataValue(empNo);

    if (!safeEmpNo) return null;

    let filterString = `EmpNo eq '${safeEmpNo}'`;

    if (deptName) {
      const safeDept = this.sanitizeODataValue(deptName);

      if (safeDept) {
        filterString = `${filterString} and Dept eq '${safeDept}'`;
      }
    }

    const items = await sp.web.lists
      .getByTitle("Employees")
      .items.select("Id", "Name", "EmpNo", "Dept")
      .top(1)
      .filter(filterString)
      .get();

    return items.length > 0 ? items[0] : null;
  }

  public async findUsersByName(searchQuery: string, deptName: string): Promise<any[]> {
    const safeQuery = this.sanitizeODataValue(searchQuery);

    if (!safeQuery) return [];

    let filterString = "";

    if (/^\d+$/.test(safeQuery)) {
      filterString = `EmpNo eq '${safeQuery}'`;
    } else {
      filterString = `startswith(Name, '${safeQuery}')`;
    }

    if (deptName) {
      const safeDept = this.sanitizeODataValue(deptName);

      if (safeDept) {
        filterString = `(${filterString}) and Dept eq '${safeDept}'`;
      }
    }

    return await sp.web.lists
      .getByTitle("Employees")
      .items.select("Id", "Name", "EmpNo", "Dept")
      .top(20)
      .filter(filterString)
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
    const requestVisitorType = ((visitor as any).VisitorType || "").toString().trim();
    const requestOtherVisitorType = ((visitor as any).OtherVisitorType || "").toString().trim();

    let contactName = "";
    if (visitor.EmpNo) {
      const contact = await this.findUserByEmpNo(visitor.EmpNo, actualDeptName);
      if (contact) contactName = contact.Name;
    }

    const requestDate = submitType === 2 ? moment().toISOString() : null;

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

    const othersVisitorTypeId = await this.getVisitorTypeIdByTitle("Others");

    await Promise.all(
      (visitorDetailsList || []).map(async (visitorDetail) => {
        const detailVisitorType = ((visitorDetail as any).VisitorType || requestVisitorType || "").toString().trim();

        let visitorTypeLookupTitle = detailVisitorType;
        let otherVisitorTypeToSave = "";

        if (detailVisitorType === "Others") {
          visitorTypeLookupTitle = "Others";
          otherVisitorTypeToSave = requestOtherVisitorType;
        }

        let visitorTypeId: number | null = null;

        if (visitorTypeLookupTitle === "Others") {
          visitorTypeId = othersVisitorTypeId;
        } else {
          visitorTypeId = await this.getVisitorTypeIdByTitle(visitorTypeLookupTitle);
        }

        const payload: any = {
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
          AccessCardsId:
            (visitorDetail as any).AccessCards && typeof (visitorDetail as any).AccessCards === "number"
              ? (visitorDetail as any).AccessCards
              : null,
          RequestDate: requestDate,
          DeptId: visitor.DeptId,
          RefNo: refNo,
          DateFrom: moment(visitor.DateTimeVisit).toISOString(),
          DateTo: moment(visitor.DateTimeArrival).toISOString(),
          CompanyName: visitor.CompanyName,
          StatusId: submitType,
          VisitorTypeId: visitorTypeId,
          OtherVisitorType: otherVisitorTypeToSave,
        };

        const iar2: IItemAddResult = await sp.web.lists.getByTitle("VisitorDetails").items.add(payload);

        await sp.web.lists.getByTitle("VisitorDetailsLib").rootFolder.folders.add(iar2.data.ID.toString());
      }),
    );

    return itemId;
  }

  public async updatePrivacyConsentRefNo(userEmail: string, newRefNo: string): Promise<void> {
    try {
      const list = sp.web.lists.getByTitle("PrivacyConsents");
      const safeEmail = this.sanitizeODataValue(userEmail);

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
    const clean = (title || "").toString().trim();

    if (!clean) return null;

    const safeTitle = this.sanitizeODataValue(clean);

    const items = await sp.web.lists
      .getByTitle("VisitorType")
      .items.select("Id", "Title")
      .filter(`Title eq '${safeTitle}'`)
      .top(1)
      .get();

    return items.length > 0 ? items[0].Id : null;
  }
}