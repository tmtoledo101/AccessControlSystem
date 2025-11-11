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
  return Math.floor((e.getTime() - s.getTime()) / MS_PER_DAY) + 1;
}

/** OData filter for VisitorType lookup by Title(s). */
function buildVisitorTypeFilter(lookupInternalName: string, titles: string[]): string {
  const left = lookupInternalName + "/Title";
  return titles.map(t => `${left} eq '${odataEscape(t)}'`).join(" or ");
}

export default class SharePointService {
  public static async getCurrentUser() {
    try {
      return await sp.web.currentUser();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public static async getCurrentUserGroups() {
    try {
      return await sp.web.currentUser.groups();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

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

  public static async getVisitorEntryCounts(
    from: Date,
    to: Date,
    minCount?: number,
    statusMatch?: 'exact' | 'prefix'
  ): Promise<IVisitorCount[]> {
    try {
      const min = typeof minCount === 'number' ? minCount : 14;
      const usePrefix = statusMatch === 'prefix';

      const statusFilter = usePrefix
        ? "startswith(Status/Title,'Approved by')"
        : "Status/Title eq 'Approved by SSD'";

      const VT = "VisitorType";
      const allowedVisitorTypes = ["Service Provider", "Project Contractor"];
      const vtFilter = buildVisitorTypeFilter(VT, allowedVisitorTypes);

      const visitorDetails = await sp.web.lists
        .getByTitle("VisitorDetails")
        .items.select(`ID,Title,FirstName,CompanyName,DateFrom,DateTo,Status/Title,${VT}/Title,${VT}Id`)
        .expand(`Status,${VT}`)
        .top(5000)
        .filter(
          "DateTo ge '" + from.toISOString() + "' and " +
          "DateFrom le '" + to.toISOString() + "' and " +
          statusFilter + " and (" + vtFilter + ")"
        )
        .get();

      const map: { [key: string]: IVisitorCount } = {};

      for (const d of visitorDetails) {
        const add = inclusiveDaysInRange(d.DateFrom, d.DateTo, from, to);
        if (add <= 0) continue;

        const lastName = d.Title || "";
        const firstName = d.FirstName || "";
        const key = (firstName + "__" + lastName).toLowerCase();

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

      return Object.values(map)
        .filter(v => (v.VisitCount || 0) > min)
        .sort((a, b) => b.VisitCount - a.VisitCount || a.LastName.localeCompare(b.LastName));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

public static async getVisitorDetailedInfo(
  firstName: string,
  lastName: string,
  from: Date,
  to: Date,
  approvedOnly: boolean = true,
  statusMatch: "exact" | "prefix" = "exact"
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

    const VT = "VisitorType";
    const vtFilter = " and (" + buildVisitorTypeFilter(VT, ["Service Provider", "Project Contractor"]) + ")";

    const visitorDetails = await sp.web.lists
      .getByTitle("VisitorDetails")
      .items.select(
        "ID,Title,FirstName,DateFrom,DateTo,CompanyName,Status/Title,Dept/Title,ParentId," +
        "VisitorTypeId,VisitorType/Title," +
        "AccessCardId,AccessCard/Title" // ✅ Add AccessCard lookup fields
      )
      .expand("Status", "Dept", "VisitorType", "AccessCard")
      .top(5000)
      .filter(
        `(Title eq '${ln}' and FirstName eq '${fn}')` +
        ` and (DateTo ge '${from.toISOString()}' and DateFrom le '${to.toISOString()}')` +
        statusFilter +
        vtFilter
      )
      .get();

    const parentIds = visitorDetails.map((d: any) => d.ParentId).filter((id: any) => id);

    let infoById: { [key: number]: any } = {};
    if (parentIds.length > 0) {
      const filterString = parentIds.map((id) => `ID eq ${id}`).join(" or ");
      const visitorInfo = await sp.web.lists
        .getByTitle("Visitors")
        .items.select("ID,VisContactNo,Author/Title,DateTimeArrival,DateTimeVisit,Bldg")
        .expand("Author")
        .top(5000)
        .filter(filterString)
        .get();
      visitorInfo.forEach((v: any) => (infoById[v.ID] = v));
    }

    return visitorDetails.map((detail: any) => {
      const parent = infoById[detail.ParentId] || {};
      return {
        ...detail,
        VisContactNo: parent.VisContactNo || "",
        CreatedBy: parent.Author && parent.Author.Title ? parent.Author.Title : "",
        DateTimeArrival: parent.DateTimeArrival || null,
        DateTimeVisit: parent.DateTimeVisit || null,
        Bldg: parent.Bldg || "",
      } as IVisitorDetailExtended;
    });
  } catch (error) {
    console.error("❌ Error in getVisitorDetailedInfo:", error);
    throw error;
  }
}


/** ✅ Updates AccessCard lookup field using AccessCardId */
public static async updateAccessCard(id: number, accessCardId: number): Promise<void> {
  try {
    await sp.web.lists
      .getByTitle("VisitorDetails")
      .items.getById(id)
      .update({
        AccessCardId: accessCardId   // ✅ lookup field update
      });

    console.log(`✅ Access Card updated for ID ${id} → AccessPass ID: ${accessCardId}`);
  } catch (error) {
    console.error(`❌ Failed to update Access Card for ID ${id}`, error);
    throw error;
  }
}

/** ✅ Returns lookup options for MaterialTable */
public static async getAccessCardOptions(): Promise<{ [key: number]: string }> {
  try {
    const items = await sp.web.lists
      .getByTitle("AccessPass")
      .items.select("Id", "Title")
      .top(5000)
      .get();

    const lookup: { [key: number]: string } = {};
    items.forEach(item => {
      lookup[item.Id] = item.Title;
    });

    return lookup;
  } catch (error) {
    console.error("❌ Failed to load Access Card options", error);
    return {};
  }
}
}
