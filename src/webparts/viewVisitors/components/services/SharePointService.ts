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

function odataEscape(str: string = ""): string {
  return String(str).replace(/'/g, "''");
}

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

function buildVisitorTypeFilter(lookupInternalName: string, titles: string[]): string {
  const left = lookupInternalName + "/Title";
  return titles.map(t => `${left} eq '${odataEscape(t)}'`).join(" or ");
}

function splitLegacyVisitorName(title: any, firstName: any) {
  const titleText = String(title || "").trim();
  const firstText = String(firstName || "").trim();

  if (firstText) {
    return {
      LastName: titleText,
      FirstName: firstText,
      FullName: `${firstText} ${titleText}`.trim(),
      LegacyTitle: titleText,
    };
  }

  const parts = titleText.split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return {
      LastName: titleText,
      FirstName: "",
      FullName: titleText,
      LegacyTitle: titleText,
    };
  }

  return {
    LastName: parts[0],
    FirstName: parts.slice(1).join(" "),
    FullName: titleText,
    LegacyTitle: titleText,
  };
}

export default class SharePointService {
  public static async getCurrentUser() {
    return await sp.web.currentUser();
  }

  public static async getCurrentUserGroups() {
    return await sp.web.currentUser.groups();
  }

  public static async getUsersPerDept(userId: number): Promise<IUserDept[]> {
    return await sp.web.lists
      .getByTitle("UsersPerDept")
      .items.select("*,Name/Title,Dept/Title")
      .expand("Name,Dept")
      .top(5000)
      .orderBy("Modified", true)
      .filter(`NameId eq ${userId}`)
      .get();
  }

  public static async getApprovers(userId: number): Promise<IUserDept[]> {
    return await sp.web.lists
      .getByTitle("Approvers")
      .items.select("*,Name/Title, Dept/Title")
      .expand("Name,Dept")
      .top(5000)
      .filter(`NameId eq ${userId}`)
      .get();
  }

  public static async getWalkinApprovers(userId: number): Promise<IUserDept[]> {
    return await sp.web.lists
      .getByTitle("WalkinApprovers")
      .items.select("*,Name/Title, Dept/Title")
      .expand("Name,Dept")
      .top(5000)
      .filter(`NameId eq ${userId}`)
      .get();
  }

  public static async loadVisitorRequests(from: Date, to: Date): Promise<IVisitor[]> {
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
  }

  public static async loadVisitorDetails(from: Date, to: Date): Promise<IVisitorDetail[]> {
    const items = await sp.web.lists
      .getByTitle("VisitorDetails")
      .items.select(
        "ID",
        "Title",
        "FirstName",
        "CompanyName",
        "PlateNo",
        "DateFrom",
        "DateTo",
        "ParentId",
        "RefNo",
        "DeptId",
        "StatusId",
        "AuthorId",
        "Modified",
        "AccessCardsId",
        "AccessCards/Title",
        "Status/Title",
        "Dept/Title",
        "Author/Title",
        "Author/EMail"
      )
      .expand("Dept", "Status", "Author", "AccessCards")
      .top(5000)
      .filter(`DateTo ge '${from.toISOString()}'`)
      .get();

    return items
      .filter((item: any) => {
        if (!item.DateFrom) return false;
        return new Date(item.DateFrom) <= to;
      })
      .sort((a: any, b: any) => {
        return new Date(b.Modified).getTime() - new Date(a.Modified).getTime();
      }) as IVisitorDetail[];
  }

  public static async loadVisitorDetailsByParentIds(parentIds: number[]): Promise<IVisitorDetail[]> {
    if (!parentIds || parentIds.length === 0) return [];

    const cleanParentIds = parentIds
      .map((id) => Number(id))
      .filter((id) => !isNaN(id) && id > 0);

    if (cleanParentIds.length === 0) return [];

    const uniqueParentIds = cleanParentIds.filter((id, index, array) => {
      return array.indexOf(id) === index;
    });

    const results: IVisitorDetail[] = [];
    const batchSize = 20;

    for (let i = 0; i < uniqueParentIds.length; i += batchSize) {
      const batchIds = uniqueParentIds.slice(i, i + batchSize);
      const filter = batchIds.map((id) => `ParentId eq ${id}`).join(" or ");

      const items = await sp.web.lists
        .getByTitle("VisitorDetails")
        .items.select(
          "ID",
          "Title",
          "FirstName",
          "CompanyName",
          "PlateNo",
          "DateFrom",
          "DateTo",
          "ParentId",
          "RefNo",
          "DeptId",
          "StatusId",
          "AuthorId",
          "Modified",
          "AccessCardsId",
          "AccessCards/Id",
          "AccessCards/Title",
          "Status/Title",
          "Dept/Title",
          "Author/Title",
          "Author/EMail"
        )
        .expand("Dept", "Status", "Author", "AccessCards")
        .filter(filter)
        .top(5000)
        .get();

      results.push(...items as IVisitorDetail[]);
    }

    return results.sort((a: any, b: any) => {
      return new Date(b.Modified).getTime() - new Date(a.Modified).getTime();
    });
  }

  public static async searchVisitorsByName(searchText: string): Promise<IVisitorDetail[]> {
    const rawSearch = String(searchText || "").trim();

    if (!rawSearch) {
      return [];
    }

    const selectFields = [
      "ID",
      "Title",
      "FirstName",
      "CompanyName",
      "PlateNo",
      "DateFrom",
      "DateTo",
      "ParentId",
      "RefNo",
      "DeptId",
      "StatusId",
      "AuthorId",
      "Modified",
      "AccessCardsId",
      "AccessCards/Id",
      "AccessCards/Title",
      "Status/Title",
      "Dept/Title",
      "Author/Title",
      "Author/EMail"
    ].join(",");

    const tokens = rawSearch
      .replace(/[.,]/g, " ")
      .split(/\s+/)
      .filter((x) => x);

    if (tokens.length === 0) {
      return [];
    }

    const firstToken = odataEscape(tokens[0]);
    const lastToken = odataEscape(tokens[tokens.length - 1]);
    const fullName = odataEscape(tokens.join(" "));

    const filters: string[] = [];

    // New format:
    // Title = Last Name
    // FirstName = First Name
    if (tokens.length === 1) {
      filters.push(`FirstName eq '${firstToken}'`);
      filters.push(`Title eq '${firstToken}'`);
    } else {
      filters.push(`FirstName eq '${firstToken}'`);
      filters.push(`Title eq '${lastToken}'`);
      filters.push(`Title eq '${lastToken}' and FirstName eq '${firstToken}'`);

      // Legacy format:
      // Title = Full Name
      // FirstName = blank
      filters.push(`Title eq '${fullName}'`);
    }

    const resultsMap: { [key: number]: any } = {};

    for (const filter of filters) {
      try {
        const items = await sp.web.lists
          .getByTitle("VisitorDetails")
          .items.select(selectFields)
          .expand("Dept", "Status", "Author", "AccessCards")
          .filter(filter)
          .orderBy("Modified", false)
          .top(500)
          .get();

        items.forEach((item: any) => {
          if (item && item.ID) {
            resultsMap[item.ID] = item;
          }
        });
      } catch (err) {
        console.log("Visitor name search filter failed:", filter, err);
      }
    }

    const searchTokens = tokens.map((x) => x.toLowerCase());

    const results = Object.values(resultsMap).filter((item: any) => {
      const name = splitLegacyVisitorName(item.Title, item.FirstName);

      const nameText = `${item.Title || ""} ${item.FirstName || ""} ${name.FirstName || ""} ${name.LastName || ""} ${name.FullName || ""}`
        .toLowerCase()
        .replace(/[.,]/g, " ");

      return searchTokens.every((token) => {
        if (token.length === 1) return true;
        return nameText.indexOf(token) >= 0;
      });
    });

    return results.sort((a: any, b: any) => {
      return new Date(b.Modified).getTime() - new Date(a.Modified).getTime();
    }) as IVisitorDetail[];
  }

  public static async getVisitorEntryCounts(
    from: Date,
    to: Date,
    minCount?: number,
    statusMatch?: 'exact' | 'prefix'
  ): Promise<IVisitorCount[]> {
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

      const name = splitLegacyVisitorName(d.Title, d.FirstName);
      const lastName = name.LastName || "";
      const firstName = name.FirstName || "";
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
  }

  public static async getVisitorDetailedInfo(
    firstName: string,
    lastName: string,
    from: Date,
    to: Date,
    approvedOnly: boolean = true,
    statusMatch: "exact" | "prefix" = "exact"
  ): Promise<IVisitorDetailExtended[]> {
    const fn = odataEscape(firstName || "");
    const ln = odataEscape(lastName || "");
    const legacyFullName = odataEscape(`${lastName || ""} ${firstName || ""}`.trim());

    const statusFilter =
      approvedOnly
        ? (statusMatch === "prefix"
          ? ` and startswith(Status/Title,'Approved by')`
          : ` and (Status/Title eq 'Approved by SSD')`)
        : "";

    const VT = "VisitorType";
    const vtFilter = " and (" + buildVisitorTypeFilter(VT, ["Service Provider", "Project Contractor"]) + ")";

    const nameFilter = legacyFullName
      ? `((Title eq '${ln}' and FirstName eq '${fn}') or (Title eq '${legacyFullName}' and (FirstName eq null or FirstName eq '')))`
      : `(Title eq '${ln}' and FirstName eq '${fn}')`;

    const visitorDetails = await sp.web.lists
      .getByTitle("VisitorDetails")
      .items.select(
        "ID,Title,FirstName,DateFrom,DateTo,CompanyName,Status/Title,Dept/Title,ParentId," +
        "VisitorTypeId,VisitorType/Title," +
        "AccessCardsId,AccessCards/Title"
      )
      .expand("Status", "Dept", "VisitorType", "AccessCards")
      .top(5000)
      .filter(
        nameFilter +
        ` and (DateTo ge '${from.toISOString()}' and DateFrom le '${to.toISOString()}')` +
        statusFilter +
        vtFilter
      )
      .get();

    const parentIds = visitorDetails.map((d: any) => d.ParentId).filter((id: any) => id);

    let infoById: { [key: number]: any } = {};
    if (parentIds.length > 0) {
      const uniqueParentIds = parentIds.filter((id: any, index: number, array: any[]) => {
        return array.indexOf(id) === index;
      });

      const batchSize = 20;

      for (let i = 0; i < uniqueParentIds.length; i += batchSize) {
        const batchIds = uniqueParentIds.slice(i, i + batchSize);
        const filterString = batchIds.map((id: any) => `ID eq ${id}`).join(" or ");

        const visitorInfo = await sp.web.lists
          .getByTitle("Visitors")
          .items.select("ID,VisContactNo,Author/Title,DateTimeArrival,DateTimeVisit,Bldg")
          .expand("Author")
          .top(5000)
          .filter(filterString)
          .get();

        visitorInfo.forEach((v: any) => (infoById[v.ID] = v));
      }
    }

    return visitorDetails.map((detail: any) => {
      const parent = infoById[detail.ParentId] || {};
      const name = splitLegacyVisitorName(detail.Title, detail.FirstName);

      return {
        ...detail,
        Title: name.LastName,
        FirstName: name.FirstName,
        FullName: name.FullName,
        VisContactNo: parent.VisContactNo || "",
        CreatedBy: parent.Author && parent.Author.Title ? parent.Author.Title : "",
        DateTimeArrival: parent.DateTimeArrival || null,
        DateTimeVisit: parent.DateTimeVisit || null,
        Bldg: parent.Bldg || "",
      } as IVisitorDetailExtended;
    });
  }

  public static async updateAccessCard(id: number, accessCardId: number): Promise<void> {
    await sp.web.lists
      .getByTitle("VisitorDetails")
      .items.getById(id)
      .update({
        AccessCardsId: accessCardId
      });
  }

  public static async getAccessCardOptions(): Promise<{
    [key: number]: { title: string; buildings: string[] };
  }> {
    const items = await sp.web.lists
      .getByTitle("AccessPass")
      .items.select("Id", "Title", "Building/Title", "Building/Id")
      .expand("Building")
      .top(5000)
      .get();

    const lookup: { [key: number]: { title: string; buildings: string[] } } = {};

    for (const item of items) {
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
        buildings
      };
    }

    return lookup;
  }
}
