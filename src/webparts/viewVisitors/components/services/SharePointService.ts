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
import { IVisitor, IVisitorDetail, IUserDept, IVisitorCount, IVisitorDetailExtended } from "../interfaces/IViewVisitors";

export default class SharePointService {
  /**
   * Get current user
   */
  public static async getCurrentUser() {
    try {
      return await sp.web.currentUser();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Get current user groups
   */
  public static async getCurrentUserGroups() {
    try {
      return await sp.web.currentUser.groups();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Get users per department
   * @param userId User ID
   */
  public static async getUsersPerDept(userId: number): Promise<IUserDept[]> {
    try {
      return await sp.web.lists.getByTitle("UsersPerDept")
        .items
        .select("*,Name/Title,Dept/Title")
        .expand('Name,Dept')
        .top(5000)
        .orderBy("Modified", true)
        .filter(`NameId eq ${userId}`)
        .get();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Get approvers
   * @param userId User ID
   */
  public static async getApprovers(userId: number): Promise<IUserDept[]> {
    try {
      return await sp.web.lists.getByTitle("Approvers")
        .items
        .select("*,Name/Title, Dept/Title")
        .expand('Name,Dept')
        .top(5000)
        .filter(`NameId eq ${userId}`)
        .get();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Get walkin approvers
   * @param userId User ID
   */
  public static async getWalkinApprovers(userId: number): Promise<IUserDept[]> {
    try {
      return await sp.web.lists.getByTitle("WalkinApprovers")
        .items
        .select("*,Name/Title, Dept/Title")
        .expand('Name,Dept')
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
   * @param to To date
   */
  public static async loadVisitorRequests(from: Date, to: Date): Promise<IVisitor[]> {
    try {
      return await sp.web.lists.getByTitle("Visitors")
        .items
        .select("*,Approver/Title,Approver/EMail, Status/Title,Dept/Title,SSDApprover/Title,Author/Title,Author/EMail,Bldg")
        .expand('Approver,Dept,Status,SSDApprover,Author')
        .top(5000)
        .orderBy("Modified", false)
        .filter(`Modified ge '${from.toISOString()}' and Modified le '${to.toISOString()}'`)
        .get();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Load visitor details
   * @param from From date
   * @param to To date
   */
  public static async loadVisitorDetails(from: Date, to: Date): Promise<IVisitorDetail[]> {
    try {
      return await sp.web.lists.getByTitle("VisitorDetails")
        .items
        .select("*, Status/Title,Dept/Title,Author/Title,Author/EMail")
        .expand('Dept,Status,Author')
        .top(5000)
        .orderBy("Modified", false)
        .filter(`DateFrom ge '${from.toISOString()}' and DateFrom le '${to.toISOString()}'`)
        .get();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Search visitors by name
   * @param searchText Search text
   */
  public static async searchVisitorsByName(searchText: string): Promise<IVisitorDetail[]> {
    try {
      return await sp.web.lists.getByTitle("VisitorDetails")
        .items
        .select("*, Status/Title,Dept/Title,Author/Title,Author/EMail")
        .expand('Dept,Status,Author')
        .top(5000)
        .orderBy("Modified", false)
        .filter(`substringof('${searchText}', Title) or substringof('${searchText}', FirstName)`)
        .get();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Get visitor entry counts within a date range
   * @param from From date
   * @param to To date
   */
  public static async getVisitorEntryCounts(from: Date, to: Date): Promise<IVisitorCount[]> {
    try {
      // First, get all visitor details within the date range
      const visitorDetails = await sp.web.lists.getByTitle("VisitorDetails")
        .items
        .select("ID,Title,FirstName,CompanyName,ParentId")
        .top(5000)
        .filter(`DateFrom ge '${from.toISOString()}' and DateFrom le '${to.toISOString()}'`)
        .get();
      
      // Process the data to count entries per visitor
      const visitorMap: { [key: string]: IVisitorCount } = {};
      
      visitorDetails.forEach(detail => {
        // Create a unique key using FirstName and LastName (Title)
        const key = `${detail.FirstName}_${detail.Title}`.toLowerCase();
        
        if (visitorMap[key]) {
          // Increment count if visitor already exists in map
          visitorMap[key].VisitCount += 1;
        } else {
          // Add new visitor to map
          visitorMap[key] = {
            ID: detail.ID,
            FirstName: detail.FirstName,
            LastName: detail.Title,
            CompanyName: detail.CompanyName || '',
            VisitCount: 1,
            isExpanded: false,
            detailsData: []
          };
        }
      });
      
      // Convert map to array
      return Object.values(visitorMap).sort((a, b) => b.VisitCount - a.VisitCount);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Get detailed visitor information for a specific visitor
   * @param firstName Visitor's first name
   * @param lastName Visitor's last name
   * @param from From date
   * @param to To date
   */
  public static async getVisitorDetailedInfo(firstName: string, lastName: string, from: Date, to: Date): Promise<IVisitorDetailExtended[]> {
    try {
      // First, get visitor details from VisitorDetails list
      const visitorDetails = await sp.web.lists.getByTitle("VisitorDetails")
        .items
        .select("ID,Title,FirstName,DateFrom,DateTo,CompanyName,Status/Title,ParentId")
        .expand("Status")
        .top(5000)
        .filter(`(Title eq '${lastName}' and FirstName eq '${firstName}') and DateFrom ge '${from.toISOString()}' and DateFrom le '${to.toISOString()}'`)
        .get();

      // Get all parent IDs to fetch data from Visitors list
      const parentIds = visitorDetails.map(detail => detail.ParentId).filter(id => id);
      
      // If no parent IDs, return the basic details
      if (parentIds.length === 0) {
        return visitorDetails.map(detail => ({
          ...detail,
          VisContactNo: '',
          CreatedBy: '',
          DateTimeArrival: null,
          DateTimeVisit: null,
          Bldg: ''
        }));
      }

      // Create a filter string for the Visitors list query
      const filterString = parentIds.map(id => `ID eq ${id}`).join(' or ');
      
      // Get visitor information from Visitors list
      const visitorInfo = await sp.web.lists.getByTitle("Visitors")
        .items
        .select("ID,VisContactNo,Author/Title,DateTimeArrival,DateTimeVisit,Bldg")
        .expand("Author")
        .top(5000)
        .filter(filterString)
        .get();

      // Create a map of visitor info by ID for easy lookup
      const visitorInfoMap: { [key: number]: any } = {};
      visitorInfo.forEach(info => {
        visitorInfoMap[info.ID] = info;
      });

      // Combine the data from both lists
      const detailedInfo = visitorDetails.map(detail => {
        const parentInfo = visitorInfoMap[detail.ParentId] || {};
        
        return {
          ...detail,
          VisContactNo: parentInfo.VisContactNo || '',
          CreatedBy: parentInfo.Author ? parentInfo.Author.Title : '',
          DateTimeArrival: parentInfo.DateTimeArrival || null,
          DateTimeVisit: parentInfo.DateTimeVisit || null,
          Bldg: parentInfo.Bldg || ''
        };
      });

      return detailedInfo;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
