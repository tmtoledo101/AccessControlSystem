import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import "@pnp/sp/site-users/web";
import "@pnp/sp/sputilities";
import "@pnp/sp/site-groups";
import { IEmailProperties } from "@pnp/sp/sputilities";
import { IVisitor } from "../interfaces/IVisitor";
import { IVisitorDetails } from "../interfaces/IVisitorDetails";
import { IDisplayVisitorState } from "../interfaces/IDisplayVisitorState";
import moment from 'moment';

export class SharePointService {
    private static instance: SharePointService;
    private siteUrl: string;
    private siteRelativeUrl: string;

    private constructor() {}

    public static getInstance(): SharePointService {
        if (!SharePointService.instance) {
            SharePointService.instance = new SharePointService();
        }
        return SharePointService.instance;
    }

    public initialize(siteUrl: string, siteRelativeUrl: string): void {
        this.siteUrl = siteUrl;
        this.siteRelativeUrl = siteRelativeUrl;
    }

    public async getCurrentUser(): Promise<any> {
        return await sp.web.currentUser();
    }

    public async getCurrentUserGroups(): Promise<any[]> {
        return await sp.web.currentUser.groups();
    }

    public async getUsersPerDept(userId: number): Promise<any[]> {
        return await sp.web.lists.getByTitle("UsersPerDept")
            .items.select("*,Name/Title,Dept/Title")
            .expand('Name,Dept')
            .filter(`NameId eq ${userId}`)
            .get();
    }

    public async getVisitorById(id: number): Promise<IVisitor> {
        return await sp.web.lists.getByTitle("Visitors")
            .items
            .select("*,Receptionist/Title, Approver/Title,Approver/EMail,Approver/ID, Status/Title,Dept/Title,SSDApprover/Title,Author/Title,Author/EMail")
            .expand('Receptionist,Approver,Dept,Status,SSDApprover,Author')
            .filter(`ID eq ${id}`)
            .get()
            .then(items => items[0]);
    }

    public async getVisitorFiles(id: number): Promise<any[]> {
        return await sp.web.getFolderByServerRelativeUrl(this.siteRelativeUrl + '/VisitorsLib/' + id)
            .files
            .select("*")
            .expand('ListItemAllFields')
            .get();
    }

    public async getVisitorDetails(parentId: number): Promise<IVisitorDetails[]> {
        return await sp.web.lists.getByTitle("VisitorDetails")
            .items
            .select("*")
            .filter(`ParentId eq ${parentId}`)
            .get();
    }

    public async getVisitorDetailsFiles(id: number): Promise<any[]> {
        return await sp.web.getFolderByServerRelativeUrl(this.siteRelativeUrl + '/VisitorDetailsLib/' + id)
            .files
            .select("*")
            .expand('ListItemAllFields')
            .get();
    }

    public async getPurposeList(): Promise<any[]> {
        return await sp.web.lists.getByTitle("Purpose")
            .items
            .select("*")
            .filter(`Group eq 'Visitor'`)
            .get();
    }

    public async getBuildingList(): Promise<any[]> {
        return await sp.web.lists.getByTitle("Building")
            .items
            .select("*")
            .orderBy("Title", true)
            .get();
    }

    public async getDepartmentList(): Promise<any[]> {
        return await sp.web.lists.getByTitle("Departments")
            .items
            .select("*")
            .get();
    }

    public async getGateList(): Promise<any[]> {
        return await sp.web.lists.getByTitle("Gates")
            .items
            .select("*")
            .get();
    }

    public async getIDList(): Promise<any[]> {
        return await sp.web.lists.getByTitle("IDPresented")
            .items
            .select("*")
            .get();
    }

    public async getSSDUsers(): Promise<any[]> {
        const ssdGroup = await sp.web.siteGroups.getByName("SSD")();
        return await sp.web.siteGroups.getById(ssdGroup.Id).users();
    }

    public async getColorList(): Promise<any[]> {
        return await sp.web.lists.getByTitle("IDColor")
            .items
            .select("*")
            .get();
    }

    public async getApprovers(deptId: number): Promise<any[]> {
        return await sp.web.lists.getByTitle("Approvers")
            .items
            .select("*,Name/Title,Name/EMail,Dept/Title")
            .expand('Name,Dept')
            .filter(`DeptId eq ${deptId}`)
            .get();
    }

    public async getWalkinApprovers(deptId: number): Promise<any[]> {
        return await sp.web.lists.getByTitle("WalkinApprovers")
            .items
            .select("*,Name/Title,Name/EMail,Dept/Title")
            .expand('Name,Dept')
            .filter(`DeptId eq ${deptId}`)
            .get();
    }

    public async getContacts(empNo: string): Promise<any[]> {
        return await sp.web.lists.getByTitle("Employees")
            .items
            .select("*")
            .filter(`EmpNo eq '${empNo}'`)
            .get();
    }

    public async saveVisitor(state: IDisplayVisitorState): Promise<void> {
        const { inputFields, visitorDetailsList, deleteFiles, deleteFilesDetails } = state;

        // Update visitor
        await sp.web.lists.getByTitle("Visitors")
            .items.getById(inputFields.ID)
            .update({
                Title: inputFields.Title,
                ExternalType: inputFields.ExternalType,
                Purpose: inputFields.Purpose,
                DeptId: inputFields.DeptId,
                Bldg: inputFields.Bldg,
                RoomNo: inputFields.RoomNo,
                EmpNo: inputFields.EmpNo,
                ContactName: inputFields.ContactName,
                Position: inputFields.Position,
                DirectNo: inputFields.DirectNo,
                LocalNo: inputFields.LocalNo,
                DateTimeVisit: moment(inputFields.DateTimeVisit).toISOString(),
                DateTimeArrival: moment(inputFields.DateTimeArrival).toISOString(),
                CompanyName: inputFields.CompanyName,
                Address: inputFields.Address,
                VisContactNo: inputFields.VisContactNo,
                VisLocalNo: inputFields.VisLocalNo,
                RequireParking: inputFields.RequireParking,
                ApproverId: inputFields.ApproverId,
                StatusId: inputFields.StatusId,
                Remarks1: inputFields.Remarks1,
                Remarks2: inputFields.Remarks2,
                SSDApproverId: inputFields.SSDApproverId,
                SSDDate: inputFields.SSDDate,
                DeptApproverDate: inputFields.DeptApproverDate,
                MarkCompleteDate: inputFields.MarkCompleteDate,
                ReceptionistId: inputFields.ReceptionistId,
                PurposeOthers: inputFields.PurposeOthers
            });

        // Handle visitor files
        const visitorFolder = this.siteRelativeUrl + '/VisitorsLib/' + inputFields.ID;
        await this.handleFileUploads(visitorFolder, inputFields.Files, inputFields.origFiles);
        await this.handleFileDeletes(deleteFiles);

        // Handle visitor details
        for (const detail of visitorDetailsList) {
            if (detail.ID) {
                await this.updateVisitorDetail(detail);
            } else {
                await this.createVisitorDetail(detail, inputFields.ID);
            }
        }

        // Handle visitor details files
        for (const deleteRecord of deleteFilesDetails) {
            const fullPath = this.siteRelativeUrl + '/VisitorDetailsLib/' + deleteRecord.Id + '/' + deleteRecord.Filename;
            await sp.web.getFolderByServerRelativeUrl(fullPath).delete();
        }
    }

    private async handleFileUploads(folderPath: string, newFiles: File[], origFiles: any[]): Promise<void> {
        for (const file of newFiles) {
            const exists = origFiles.some(f => f.Name === file.name);
            if (!exists) {
                if (file.size <= 10485760) {
                    await sp.web.getFolderByServerRelativeUrl(folderPath)
                        .files.add(file.name, file, true);
                } else {
                    await sp.web.getFolderByServerRelativeUrl(folderPath)
                        .files.addChunked(file.name, file, data => {
                            console.log({ data });
                        }, true);
                }
            }
        }
    }

    private async handleFileDeletes(files: any[]): Promise<void> {
        for (const file of files) {
            await sp.web.getFolderByServerRelativeUrl(file.ServerRelativeUrl).delete();
        }
    }

    private async updateVisitorDetail(detail: IVisitorDetails): Promise<void> {
        await sp.web.lists.getByTitle("VisitorDetails")
            .items.getById(detail.ID)
            .update({
                Title: detail.Title,
                Car: detail.Car,
                Color: detail.Color,
                DriverName: detail.DriverName,
                TypeofVehicle: detail.TypeofVehicle,
                PlateNo: detail.PlateNo,
                GateNo: detail.GateNo,
                IDPresented: detail.IDPresented,
                AccessCard: detail.AccessCard
            });

        const detailFolder = this.siteRelativeUrl + '/VisitorDetailsLib/' + detail.ID;
        await this.handleFileUploads(detailFolder, detail.Files, detail.origFiles);
    }

    private async createVisitorDetail(detail: IVisitorDetails, parentId: number): Promise<void> {
        const result = await sp.web.lists.getByTitle("VisitorDetails")
            .items.add({
                Title: detail.Title,
                Car: detail.Car,
                Color: detail.Color,
                DriverName: detail.DriverName,
                TypeofVehicle: detail.TypeofVehicle,
                PlateNo: detail.PlateNo,
                GateNo: detail.GateNo,
                IDPresented: detail.IDPresented,
                AccessCard: detail.AccessCard,
                ParentId: parentId
            });

        await sp.web.lists.getByTitle("VisitorDetailsLib")
            .rootFolder.folders.add(result.data.ID.toString());

        const detailFolder = this.siteRelativeUrl + '/VisitorDetailsLib/' + result.data.ID;
        await this.handleFileUploads(detailFolder, detail.Files, []);
    }
}
