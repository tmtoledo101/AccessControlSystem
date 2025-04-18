import { IVisitor, IErrorFields, IApproverDetails } from './IVisitor';
import { IVisitorDetails, IVisitorDetailsError } from './IVisitorDetails';

export interface IDisplayVisitorState {
    // User roles
    isEncoder: boolean;
    isReceptionist: boolean;
    isApproverUser: boolean;
    isSSDUser: boolean;
    isWalkinApproverUser: boolean;

    // Form data
    inputFields: IVisitor;
    errorFields: IErrorFields;
    visitorDetails: IVisitorDetails;
    visitorDetailsList: IVisitorDetails[];
    errorDetails: IVisitorDetailsError;
    approverDetails: IApproverDetails;

    // Lists
    purposeList: any[];
    deptList: any[];
    bldgList: any[];
    approverList: any[];
    contactList: any[];
    IDList: any[];
    GateList: any[];
    usersPerDept: any[];
    SSDUsers: any[];
    WalkinApprovers: any[];
    colorList: any[];

    // UI state
    isEdit: boolean;
    isProgress: boolean;
    isSavingDone: boolean;
    isHidePrint: boolean;
    modifiedDate: Date;
    colorValue: string;

    // Dialog state
    openDialog: boolean;
    openDialogFab: boolean;
    openDialogIDFab: boolean;
    dialogMessage: string;
    visitorDetailsMode: 'add' | 'edit';

    // Other state
    sAction: string;
    _idx: number;
    _itemId: number;
    _itemIdDetails: number;
    _refno: string;
    _sourceURL: string;
    _deptName: string;
    deleteFiles: any[];
    deleteFilesDetails: any[];
    _origVisitorDetailsList: any[];
}

export const initialState: IDisplayVisitorState = {
    // User roles
    isEncoder: false,
    isReceptionist: false,
    isApproverUser: false,
    isSSDUser: false,
    isWalkinApproverUser: false,

    // Form data
    inputFields: {
        ID: null,
        Title: '',
        ExternalType: '',
        Purpose: '',
        PurposeOthers: '',
        DeptId: null,
        Dept: { Title: '' },
        Bldg: '',
        RoomNo: '',
        EmpNo: '',
        ContactName: '',
        Position: '',
        DirectNo: '',
        LocalNo: '',
        DateTimeVisit: new Date(),
        DateTimeArrival: new Date(),
        CompanyName: '',
        Address: '',
        VisContactNo: '',
        VisLocalNo: '',
        RequireParking: false,
        StatusId: 0,
        Status: { Title: '' },
        ApproverId: null,
        Approver: { Title: '', EMail: '', ID: null },
        Files: [],
        initFiles: [],
        origFiles: [],
        SSDApproverId: null,
        SSDApprover: { Title: '' },
        RequestDate: new Date(),
        Author: { Title: '', EMail: '' },
        AuthorId: null,
        Remarks1: '',
        Remarks2: '',
        SSDDate: null,
        DeptApproverDate: null,
        MarkCompleteDate: null,
        Receptionist: { Title: '' },
        ReceptionistId: null,
        colorAccess: 'General',
        Modified: new Date()
    },
    errorFields: {
        ExternalType: '',
        Purpose: '',
        DeptId: '',
        Bldg: '',
        RoomNo: '',
        EmpNo: '',
        ContactName: '', // Added to match IErrorFields interface
        Title: '',
        Position: '',
        DirectNo: '',
        LocalNo: '',
        DateTimeVisit: '',
        DateTimeArrival: '',
        CompanyName: '',
        Address: '',
        VisContactNo: '',
        VisLocalNo: '',
        RequireParking: '',
        ApproverId: '',
        Details: '',
        Remarks1: '',
        Remarks2: '',
        PurposeOthers: ''
    },
    visitorDetails: {
        ID: null,
        Title: '',
        Car: false,
        AccessCard: '',
        PlateNo: '',
        TypeofVehicle: '',
        Color: '',
        DriverName: '',
        IDPresented: '',
        GateNo: '',
        ParentId: null,
        Files: [],
        initFiles: [],
        origFiles: []
    },
    visitorDetailsList: [],
    errorDetails: {
        Title: '',
        Car: '',
        AccessCard: '',
        PlateNo: '',
        TypeofVehicle: '',
        Color: '',
        DriverName: '',
        IDPresented: '',
        GateNo: '',
        Files: ''
    },
    approverDetails: {
        email: '',
        name: ''
    },

    // Lists
    purposeList: [],
    deptList: [],
    bldgList: [],
    approverList: [],
    contactList: [],
    IDList: [],
    GateList: [],
    usersPerDept: [],
    SSDUsers: [],
    WalkinApprovers: [],
    colorList: [],

    // UI state
    isEdit: false,
    isProgress: false,
    isSavingDone: false,
    isHidePrint: true,
    modifiedDate: null,
    colorValue: 'Green',

    // Dialog state
    openDialog: false,
    openDialogFab: false,
    openDialogIDFab: false,
    dialogMessage: '',
    visitorDetailsMode: 'add',

    // Other state
    sAction: '',
    _idx: -1,
    _itemId: 0,
    _itemIdDetails: 0,
    _refno: '',
    _sourceURL: null,
    _deptName: '',
    deleteFiles: [],
    deleteFilesDetails: [],
    _origVisitorDetailsList: []
};
