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

/** OData filter for VisitorType lookup by Title(s). */
function buildVisitorTypeFilter(lookupInternalName: string, titles: string[]): string {
  const left = lookupInternalName + "/Title";
  return titles
    .map(t => `${left} eq '${odataEscape(t)}'`)
    .join(" or ");
}

export default class SharePointService {
  /** Get current user */
  public static async getCurrentUser() {
    try {
      return await sp.web.currentUser();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /** Get current user groups */
  public static async getCurrentUserGroups() {
    try {
      return await sp.web.currentUser.groups();
    } catch (error) {
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
      console.log(error);
      throw error;
    }
  }

  /** Get walk-in approvers */
  public static async getWalkinApprovers(userId: number): Promise<IUserDept[]> {
    try {
      return await sp.web.lists
        .getByTitle("WalkinApprovers")
        .items.select("*,Name/Title, Dept/Title")
        .expand("Name,Dept")
        .top(5000)
        .filter(`NameId eq ${userId}`)
        .get();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Load visitor requests
   * @param from From date
   * @param to   To date
   */
  public static async loadVisitorRequests(from: Date, to: Date): Promise<IVisitor[]> {
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
      console.log(error);
      throw error;
    }
  }

  /**
   * Load visitor details that OVERLAP the window
   * (DateTo >= from) AND (DateFrom <= to)
   */
  public static async loadVisitorDetails(from: Date, to: Date): Promise<IVisitorDetail[]> {
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
      console.log(error);
      throw error;
    }
  }

  /** Search visitors by name */
  public static async searchVisitorsByName(searchText: string): Promise<IVisitorDetail[]> {
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
      console.log(error);
      throw error;
    }
  }

  /**
   * Get visitor entry counts within a date range
   * - Overlap filter: (DateTo >= from && DateFrom <= to)
   * - Counts only Status = "Approved by Dept Head" (or prefix "Approved by")
   * - NOW also filters VisitorType to: Service Provider, Project Contractor
   * - Sums inclusive days per visitor (DateFrom..DateTo), clipped to [from..to]
   * - Returns only visitors with VisitCount > minCount (default 14)
   */
  public static async getVisitorEntryCounts(
    from: Date,
    to: Date,
    minCount?: number,
    statusMatch?: 'exact' | 'prefix'
  ): Promise<IVisitorCount[]> {
    try {
      var min = (typeof minCount === 'number') ? minCount : 14;
      var usePrefix = statusMatch === 'prefix';

      var statusFilter = usePrefix
        ? "startswith(Status/Title,'Approved by')"
        : "Status/Title eq 'Approved by SSD'";

      // ---- VisitorType filter (change VT if your internal name is encoded) ----
      const VT = "VisitorType"; // e.g., "Visitor_x0020_Type"
      const allowedVisitorTypes = ["Service Provider", "Project Contractor"];
      const vtFilter = buildVisitorTypeFilter(VT, allowedVisitorTypes);

      var visitorDetails: any[] = await sp.web.lists
        .getByTitle("VisitorDetails")
        .items.select(
          `ID,Title,FirstName,CompanyName,DateFrom,DateTo,Status/Title,${VT}/Title,${VT}Id`
        )
        .expand(`Status,${VT}`)
        .top(5000)
        .filter(
          "DateTo ge '" + from.toISOString() + "' and " +
          "DateFrom le '" + to.toISOString() + "' and " +
          statusFilter + " and (" + vtFilter + ")"
        )
        .get();

      var map: { [key: string]: IVisitorCount } = {};

      for (var i = 0; i < visitorDetails.length; i++) {
        var d: any = visitorDetails[i];
        var add = inclusiveDaysInRange(d.DateFrom, d.DateTo, from, to);
        if (add <= 0) continue;

        var lastName = d.Title || "";
        var firstName = d.FirstName || "";
        var key = (firstName + "__" + lastName).toLowerCase();

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
          map[key].VisitCount = (map[key].VisitCount || 0) + add;
        }
      }

      var filtered = Object.keys(map)
        .map(k => map[k])
        .filter(v => (v.VisitCount ? v.VisitCount : 0) > min);

      filtered.sort((a, b) => {
        if (b.VisitCount !== a.VisitCount) return b.VisitCount - a.VisitCount;
        var ln = a.LastName.localeCompare(b.LastName);
        return ln !== 0 ? ln : a.FirstName.localeCompare(b.FirstName);
      });

      return filtered;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Get detailed visitor information for a specific visitor
   * - Uses overlap date filter
   * - approvedOnly: adds server-side "Approved by Dept Head" filter (default true)
   * - NOW also filters VisitorType to: Service Provider, Project Contractor
   */
  public static async getVisitorDetailedInfo(
    firstName: string,
    lastName: string,
    from: Date,
    to: Date,
    approvedOnly: boolean = true,
    statusMatch: "exact" | "prefix" = "exact" // align with counts method if needed
  ): Promise<IVisitorDetailExtended[]> {
    try {
      const fn = odataEscape(firstName || "");
      const ln = odataEscape(lastName || "");

      const statusFilter =
        approvedOnly
          ? (statusMatch === "prefix"
            ? ` and startswith(Status/Title,'Approved by')`
            : ` and (Status/Title eq 'Approved by SSD')`)
          : "";

      // ---- VisitorType filter (change VT if your internal name is encoded) ----
      const VT = "VisitorType"; // e.g., "Visitor_x0020_Type"
      const allowedVisitorTypes = ["Service Provider", "Project Contractor"];
      const vtFilter = " and (" + buildVisitorTypeFilter(VT, allowedVisitorTypes) + ")";

      // 1) Detail rows for this visitor that OVERLAP the window (+ status + visitor type filters)
      const visitorDetails = await sp.web.lists
        .getByTitle("VisitorDetails")
        .items.select(
          "ID,Title,FirstName,DateFrom,DateTo,CompanyName,Status/Title,Dept/Title,ParentId," +
          `${VT}Id,${VT}/Title`
        )
        .expand(`Status,Dept,${VT}`)
        .top(5000)
        .filter(
          `(Title eq '${ln}' and FirstName eq '${fn}')` +
          ` and (DateTo ge '${from.toISOString()}' and DateFrom le '${to.toISOString()}')` +
          statusFilter +
          vtFilter
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
        .items.select("ID,VisContactNo,Author/Title,DateTimeArrival,DateTimeVisit,Bldg")
        .expand("Author")
        .top(5000)
        .filter(filterString)
        .get();

      const infoById: { [key: number]: any } = {};
      visitorInfo.forEach((v: any) => (infoById[v.ID] = v));

      // 4) Merge & return
      const detailedInfo: IVisitorDetailExtended[] = visitorDetails.map((detail: any) => {
        const parent = infoById[detail.ParentId] || {};
        return {
          ...detail,
          VisContactNo: parent.VisContactNo || "",
          CreatedBy: parent.Author ? parent.Author.Title : "",
          DateTimeArrival: parent.DateTimeArrival || null,
          DateTimeVisit: parent.DateTimeVisit || null,
          Bldg: parent.Bldg || "",
        } as IVisitorDetailExtended;
      });

      return detailedInfo;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
    /**
   * Update Access Card value for a specific VisitorDetails row
   */
  public static async updateAccessCard(id: number, newValue: string): Promise<void> {
    try {
      await sp.web.lists
        .getByTitle("VisitorDetails")
        .items.getById(id)
        .update({
          AccessCard: newValue
        });

      console.log(`✅ Access Card updated for ID ${id}: ${newValue}`);
    } catch (error) {
      console.error(`❌ Failed to update Access Card for ID ${id}`, error);
      throw error;
    }
  }
}
