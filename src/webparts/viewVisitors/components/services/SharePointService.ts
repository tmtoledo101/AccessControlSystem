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
import { IVisitor, IVisitorDetail, IUserDept, IVisitorCount } from "../interfaces/IViewVisitors";

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
            VisitCount: 1
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
}
