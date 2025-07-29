import { sp } from '@pnp/sp';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IOvertimeForm } from '../models/IOvertimeForm';
import { IOvertimeEmployee } from '../models/IOvertimeEmployee';
import { formatISODate } from '../utils/dateUtils';
import moment from 'moment';

/**
 * SharePoint service
 */
export class SharePointService {
  /**
   * Initialize SharePoint service
   * @param context Web part context
   */
  public static init(context: WebPartContext): void {
    sp.setup({
      spfxContext: context,
      sp: {
        headers: {
          Accept: 'application/json;odata=verbose',
        },
        baseUrl: context.pageContext.web.absoluteUrl,
      },
    });
  }

  /**
   * Get current user
   * @returns Current user
   */
  public static async getCurrentUser(): Promise<any> {
    return await sp.web.currentUser();
  }

  /**
   * Get user groups
   * @returns User groups
   */
  public static async getUserGroups(): Promise<any[]> {
    return await sp.web.currentUser.groups();
  }

  /**
   * Get users per department
   * @param userId User ID
   * @returns Users per department
   */
  public static async getUsersPerDept(userId: number): Promise<any[]> {
    return await sp.web.lists.getByTitle('UsersPerDept')
      .items
      .select('*,Name/Title,Dept/Title')
      .expand('Name,Dept')
      .top(5000)
      .orderBy('Modified', true)
      .filter(`NameId eq ${userId}`)
      .get();
  }

  /**
   * Get purposes
   * @returns Purposes
   */
  public static async getPurposes(): Promise<any[]> {
    return await sp.web.lists.getByTitle('Purpose')
      .items
      .select('*')
      .top(5000)
      .filter(`Group eq 'Organic'`)
      .get();
  }

  /**
   * Get buildings
   * @returns Buildings
   */
  public static async getBuildings(): Promise<any[]> {
    return await sp.web.lists.getByTitle('Building')
      .items
      .select('*')
      .top(5000)
      .orderBy('Title', true)
      .get();
  }

  /**
   * Get departments
   * @returns Departments
   */
  public static async getDepartments(): Promise<any[]> {
    return await sp.web.lists.getByTitle('Departments')
      .items
      .select('*')
      .top(5000)
      .get();
  }

  /**
   * Get personnel types
   * @returns Personnel types
   */
  public static async getPersonnelTypes(): Promise<any[]> {
    return await sp.web.lists.getByTitle('PersonnelType')
      .items
      .select('*')
      .top(5000)
      .get();
  }

  /**
   * Get approvers
   * @param deptId Department ID
   * @param currentUserId Current user ID
   * @returns Approvers
   */
  public static async getApprovers(deptId: number, currentUserId: number): Promise<any[]> {
    const approvers = await sp.web.lists.getByTitle('Approvers')
      .items
      .select('*,Name/Title,Dept/Title')
      .expand('Name,Dept')
      .top(5000)
      .filter(`DeptId eq ${deptId}`)
      .get();

    // Filter out current user
    return approvers.filter(item => item.NameId !== currentUserId);
  }

  /**
   * Get employees
   * @param searchText Search text
   * @param deptName Department name
   * @returns Employees
   */
  public static async getEmployees(searchText: string, deptName: string): Promise<any[]> {
    if (searchText.length < 3) {
      return [];
    }

    return await sp.web.lists.getByTitle('Employees')
      .items
      .select('*')
      .top(5000)
      .filter(`substringof('${searchText}', Name) and Dept eq '${deptName}'`)
      .get();
  }

  /**
   * Get outsource
   * @param searchText Search text
   * @param deptId Department ID
   * @param personnelType Personnel type
   * @returns Outsource
   */
  public static async getOutsource(searchText: string, deptId: number, personnelType: string): Promise<any[]> {
    if (searchText.length < 3) {
      return [];
    }

    return await sp.web.lists.getByTitle('Outsource')
      .items
      .select('*,PersonnelType/Title,Dept/Title')
      .expand('PersonnelType,Dept')
      .top(5000)
      .filter(`substringof('${searchText}', Title) and DeptId eq ${deptId} and PersonnelType/Title eq '${personnelType}'`)
      .get();
  }

  /**
   * Create request number
   * @param locationCode Location code
   * @returns Request number
   */
  public static async createRequestNumber(locationCode: string): Promise<string> {
    const refNoCountList = await sp.web.lists.getByTitle('RefNoCount');
    const refNoCount = await refNoCountList.items
      .select('*')
      .top(5000)
      .filter(`Title eq 'Overtime'`)
      .get();

    let lastNumber = 0;

    if (refNoCount.length > 0) {
      const dateRef = moment(refNoCount[0].DateRef).endOf('day').toISOString();
      const currentDate = moment().endOf('day').toISOString();

      if (dateRef === currentDate) {
        lastNumber = parseInt(refNoCount[0].LastNum) + 1;
        await refNoCountList.items.getById(refNoCount[0].ID).update({
          LastNum: lastNumber,
          DateRef: moment().endOf('day').toISOString()
        });
      } else {
        lastNumber = 1;
        await refNoCountList.items.getById(refNoCount[0].ID).update({
          LastNum: lastNumber,
          DateRef: moment().endOf('day').toISOString()
        });
      }
    }

    const lastRefNo = lastNumber.toString();
    const pad = '000';
    const refNo = locationCode + '-' + moment().format('YYYYMMDD') + '-' + pad.substring(0, pad.length - lastRefNo.length) + lastRefNo;

    return refNo;
  }

  /**
   * Save overtime request
   * @param form Form
   * @param employees Employees
   * @param refNo Reference number
   * @param submitMode Submit mode
   * @returns Item ID
   */
  public static async saveOvertimeRequest(
    form: IOvertimeForm,
    employees: IOvertimeEmployee[],
    refNo: string,
    submitMode: boolean
  ): Promise<number> {
    const requestDate = submitMode ? moment().toISOString() : null;

    // Add overtime request
    const result = await sp.web.lists.getByTitle('Overtime').items.add({
      Title: refNo,
      Purpose: form.Purpose,
      DeptId: form.DeptId,
      Bldg: form.Bldg,
      Others: form.Purpose === 'Others' ? form.Others : null,
      DateFrom: formatISODate(form.DateFrom),
      DateTo: formatISODate(form.DateTo),
      ApproverId: form.ApproverId,
      StatusId: submitMode ? 2 : 1,
      RequestDate: requestDate
    });

    const itemId = result.data.ID;

    // Create folder for attachments
    const folderPath = `/OvertimeLib/${itemId}`;
    await sp.web.lists.getByTitle('OvertimeLib').rootFolder.folders.add(itemId.toString());

    // Upload files
    await Promise.all(form.Files.map(async (file) => {
      if (file.size <= 10485760) {
        // Small upload
        await sp.web.getFolderByServerRelativeUrl(folderPath).files.add(file.name, file, true);
      } else {
        // Large upload
        await sp.web.getFolderByServerRelativeUrl(folderPath).files.addChunked(file.name, file, (data) => {
          console.log({ data });
        }, true);
      }
    }));

    // Add employee details
    await Promise.all(employees.map(async (employee) => {
      await sp.web.lists.getByTitle('OvertimeDetails').items.add({
        ParentId: itemId,
        Title: employee.Title,
        TimeFrom: formatISODate(employee.TimeFrom),
        TimeTo: formatISODate(employee.TimeTo),
        Etype: employee.Etype,
        OtherSource: employee.Etype === 'Others' ? employee.OtherSource : null,
        EmpNo: employee.EmpNo.toString(),
        RequestDate: requestDate,
        DeptId: form.DeptId,
        RefNo: refNo,
        StatusId: submitMode ? 2 : 1
      });
    }));

    return itemId;
  }
}
