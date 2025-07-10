import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups";
import { IOvertimeRequest, IOvertimeDetail, IUserDept } from '../interfaces/IViewOvertime';

class SharePointService {
  
  public static async getCurrentUser(): Promise<any> {
    try {
      return await sp.web.currentUser();
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }

  public static async getCurrentUserGroups(): Promise<any[]> {
    try {
      return await sp.web.currentUser.groups();
    } catch (error) {
      console.error('Error getting user groups:', error);
      throw error;
    }
  }

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
      console.error('Error getting users per department:', error);
      throw error;
    }
  }

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
      console.error('Error getting approvers:', error);
      throw error;
    }
  }

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
      console.error('Error getting walkin approvers:', error);
      return [];
    }
  }

  public static async loadOvertimeRequests(from: Date, to: Date): Promise<IOvertimeRequest[]> {
    try {
      return await sp.web.lists.getByTitle("Overtime")
        .items
        .select("*,Approver/Title,Approver/EMail, Status/Title,Dept/Title,SSDApprover/Title,Author/Title,Author/EMail")
        .expand('Approver,Dept,Status,SSDApprover,Author')
        .top(5000)
        .orderBy("Modified", false)
        .filter(`Modified ge '${from.toISOString()}' and Modified le '${to.toISOString()}'`)
        .get();
    } catch (error) {
      console.error('Error loading overtime requests:', error);
      alert('There was an error encountered while retrieving data.');
      throw error;
    }
  }

  public static async loadOvertimeDetails(from: Date, to: Date): Promise<IOvertimeDetail[]> {
    try {
      return await sp.web.lists.getByTitle("OvertimeDetails")
        .items
        .select("*, Status/Title,Dept/Title,Author/Title,Author/EMail")
        .expand('Dept,Status,Author')
        .top(5000)
        .orderBy("Modified", false)
        .filter(`TimeFrom ge '${from.toISOString()}' and TimeFrom le '${to.toISOString()}'`)
        .get();
    } catch (error) {
      console.error('Error loading overtime details:', error);
      alert('There was an error encountered while retrieving data.');
      throw error;
    }
  }

  public static async searchOvertimeByName(searchText: string): Promise<IOvertimeDetail[]> {
    try {
      return await sp.web.lists.getByTitle("OvertimeDetails")
        .items
        .select("*, Status/Title,Dept/Title,Author/Title,Author/EMail")
        .expand('Dept,Status,Author')
        .top(5000)
        .orderBy("Modified", false)
        .filter(`substringof('${searchText}', Title)`)
        .get();
    } catch (error) {
      console.error('Error searching overtime by name:', error);
      throw error;
    }
  }
}

export default SharePointService;
