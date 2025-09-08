import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import "@pnp/sp/site-users/web";
import "@pnp/sp/fields";
import "@pnp/sp/regional-settings/web";
import "@pnp/sp/site-groups";
import {
  IVisitor,
  IVisitorDetail,
  IUserDept,
  IVisitorCount,
  IVisitorDetailExtended,
} from "../interfaces/IViewVisitors";

/** Escapes single quotes for OData string literals (e.g., O'Brien -> O''Brien) */
function odataEscape(str: string = ""): string {
  return String(str).replace(/'/g, "''");
}

/** Inclusive whole-day math, optionally clipped to [clipFrom, clipTo] */
function inclusiveDaysInRange(
  dateFrom?: string | Date | null,
  dateTo?: string | Date | null,
  clipFrom?: Date,
  clipTo?: Date
): number {
  if (!dateFrom || !dateTo) return 0;

  const start = new Date(dateFrom);
  const end = new Date(dateTo);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

  // Clip to selection window if provided
  const s = new Date(
    Math.max(start.getTime(), clipFrom ? clipFrom.getTime() : start.getTime())
  );
  const e = new Date(
    Math.min(end.getTime(), clipTo ? clipTo.getTime() : end.getTime())
  );

  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);

  if (e < s) return 0;

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.floor((e.getTime() - s.getTime()) / MS_PER_DAY) + 1; // inclusive
}

export default class SharePointService {
  /** Get current user */
  public static async getCurrentUser() {
    try {
      return await sp.web.currentUser();
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error);
      throw error;
    }
  }

  /** Get current user groups */
  public static async getCurrentUserGroups() {
    try {
      return await sp.web.currentUser.groups();
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error);
      throw error;
    }
  }

  /** Get users per department */
  public static async getUsersPerDept(userId: number): Promise<IUserDept[]> {
    try {
      return await sp.web.lists
        .getByTitle("UsersPerDept")
        .items.select("*,Name/Title,Dept/Title")
        .expand("Name,Dept")
        .top(5000)
        .orderBy("Modified", true)
        .filter(`NameId eq ${userId}`)
        .get();
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error);
      throw error;
    }
  }

  /** Get approvers */
  public static async getApprovers(userId: number): Promise<IUserDept[]> {
    try {
      return await sp.web.lists
        .getByTitle("Approvers")
        .items.select("*,Name/Title, Dept/Title")
        .expand("Name,Dept")
        .top(5000)
        .filter(`NameId eq ${userId}`)
        .get();
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error);
      throw error;
    }
  }

  /** Get walk-in approvers */
  public static async getWalkinApprovers(
    userId: number
  ): Promise<IUserDept[]> {
    try {
      return await sp.web.lists
        .getByTitle("WalkinApprovers")
        .items.select("*,Name/Title, Dept/Title")
        .expand("Name,Dept")
        .top(5000)
        .filter(`NameId eq ${userId}`)
        .get();
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error);
      throw error;
    }
  }

  /**
   * Load visitor requests
   * @param from From date
   * @param to   To date
   */
  public static async loadVisitorRequests(
    from: Date,
    to: Date
  ): Promise<IVisitor[]> {
    try {
      return await sp.web.lists
        .getByTitle("Visitors")
        .items.select(
          "*,Approver/Title,Approver/EMail, Status/Title,Dept/Title,SSDApprover/Title,Author/Title,Author/EMail,Bldg"
        )
        .expand("Approver,Dept,Status,SSDApprover,Author")
        .top(5000)
        .orderBy("Modified", false)
        .filter(
          `Modified ge '${from.toISOString()}' and Modified le '${to.toISOString()}'`
        )
        .get();
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error);
      throw error;
    }
  }

  /**
   * Load visitor details that OVERLAP the window
   * (DateTo >= from) AND (DateFrom <= to)
   */
  public static async loadVisitorDetails(
    from: Date,
    to: Date
  ): Promise<IVisitorDetail[]> {
    try {
      return await sp.web.lists
        .getByTitle("VisitorDetails")
        .items.select("*, Status/Title,Dept/Title,Author/Title,Author/EMail")
        .expand("Dept,Status,Author")
        .top(5000)
        .orderBy("Modified", false)
        .filter(
          `DateTo ge '${from.toISOString()}' and DateFrom le '${to.toISOString()}'`
        )
        .get();
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error);
      throw error;
    }
  }

  /** Search visitors by name */
  public static async searchVisitorsByName(
    searchText: string
  ): Promise<IVisitorDetail[]> {
    try {
      const q = odataEscape(searchText || "");
      return await sp.web.lists
        .getByTitle("VisitorDetails")
        .items.select("*, Status/Title,Dept/Title,Author/Title,Author/EMail")
        .expand("Dept,Status,Author")
        .top(5000)
        .orderBy("Modified", false)
        .filter(`substringof('${q}', Title) or substringof('${q}', FirstName)`)
        .get();
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error);
      throw error;
    }
  }

  /**
   * Get visitor entry counts within a date range
   * - Uses overlap filter (DateTo >= from && DateFrom <= to)
   * - Counts only Status = "Approved by Dept Head"
   * - Sums inclusive days per visitor (DateFrom..DateTo), clipped to [from..to]
   */
  public static async getVisitorEntryCounts(
    from: Date,
    to: Date
  ): Promise<IVisitorCount[]> {
    try {
      // Pull only fields we actually need
      const visitorDetails = await sp.web.lists
        .getByTitle("VisitorDetails")
        .items.select(
          "ID,Title,FirstName,CompanyName,DateFrom,DateTo,Status/Title"
        )
        .expand("Status")
        .top(5000)
        .filter(
          `DateTo ge '${from.toISOString()}' and DateFrom le '${to.toISOString()}'`
        )
        .get();

      const APPROVED = "approved by dept head";

      // Aggregate by FirstName + LastName (Title)
      const map: { [key: string]: IVisitorCount } = {};

      for (const d of visitorDetails) {
        const statusTitle = d && d.Status && d.Status.Title ? d.Status.Title : "";
        if (statusTitle.toLowerCase() !== APPROVED) continue;

        const lastName = d.Title || "";
        const firstName = d.FirstName || "";
        const key = `${firstName}__${lastName}`.toLowerCase();

        const add = inclusiveDaysInRange(d.DateFrom, d.DateTo, from, to);

        if (!map[key]) {
          map[key] = {
            ID: d.ID,
            FirstName: firstName,
            LastName: lastName,
            CompanyName: d.CompanyName || "",
            VisitCount: add,
            isExpanded: false,
            detailsData: [],
          };
        } else {
          map[key].VisitCount += add;
        }
      }

      // Convert to array and sort by VisitCount (desc), then by name
      return Object.values(map).sort((a, b) => {
        if (b.VisitCount !== a.VisitCount) return b.VisitCount - a.VisitCount;
        const ln = a.LastName.localeCompare(b.LastName);
        return ln !== 0 ? ln : a.FirstName.localeCompare(b.FirstName);
      });
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error);
      throw error;
    }
  }

  /**
   * Get detailed visitor information for a specific visitor
   * - Uses overlap date filter
   * - (Optionally) you can also filter Approved only by appending: and (Status/Title eq 'Approved by Dept Head')
   */
public static async getVisitorDetailedInfo(
  firstName: string,
  lastName: string,
  from: Date,
  to: Date
): Promise<IVisitorDetailExtended[]> {
  try {
    const fn = odataEscape(firstName || "");
    const ln = odataEscape(lastName || "");

    // 1) Detail rows for this visitor that OVERLAP the window
    const visitorDetails = await sp.web.lists
      .getByTitle("VisitorDetails")
      .items
      .select(
        "ID,Title,FirstName,DateFrom,DateTo,CompanyName,Status/Title,Dept/Title,ParentId"
      )
      .expand("Status,Dept")
      .top(5000)
      .filter(
        `(Title eq '${ln}' and FirstName eq '${fn}') and (DateTo ge '${from.toISOString()}' and DateFrom le '${to.toISOString()}')`
      )
      .get();

    // 2) Collect parent IDs to enrich from "Visitors"
    const parentIds = visitorDetails
      .map((d: any) => d.ParentId)
      .filter((id: any) => id);

    if (parentIds.length === 0) {
      // Return basic details with empty enrichments
      return visitorDetails.map((detail: any) => ({
        ...detail,
        VisContactNo: "",
        CreatedBy: "",
        DateTimeArrival: null,
        DateTimeVisit: null,
        Bldg: "",
      }));
    }

    // SharePoint REST doesn't accept "in (...)" so OR-chain
    const filterString = parentIds.map((id) => `ID eq ${id}`).join(" or ");

    // 3) Enrich from "Visitors"
    const visitorInfo = await sp.web.lists
      .getByTitle("Visitors")
      .items
      .select(
        "ID,VisContactNo,Author/Title,DateTimeArrival,DateTimeVisit,Bldg"
      )
      .expand("Author")
      .top(5000)
      .filter(filterString)
      .get();

    const infoById: { [key: number]: any } = {};
    visitorInfo.forEach((v: any) => (infoById[v.ID] = v));

    // 4) Merge & return
    const detailedInfo: IVisitorDetailExtended[] = visitorDetails.map(
      (detail: any) => {
        const parent = infoById[detail.ParentId] || {};
        return {
          ...detail,
          VisContactNo: parent.VisContactNo || "",
          CreatedBy: parent.Author ? parent.Author.Title : "",
          DateTimeArrival: parent.DateTimeArrival || null,
          DateTimeVisit: parent.DateTimeVisit || null,
          Bldg: parent.Bldg || "",
        } as IVisitorDetailExtended;
      }
    );

    return detailedInfo;
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.log(error);
    throw error;
  }
  }
}