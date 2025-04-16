export interface IVisitorDetails {
    ID: number;
    Title: string;
    Car: boolean;
    AccessCard: string;
    PlateNo: string;
    TypeofVehicle: string;
    Color: string;
    DriverName: string;
    IDPresented: string;
    GateNo: string;
    ParentId: number;
    Files: File[];
    initFiles: string[];
    origFiles: any[];
}

export interface IVisitorDetailsError {
    Title: string;
    Car: string;
    AccessCard: string;
    PlateNo: string;
    TypeofVehicle: string;
    Color: string;
    DriverName: string;
    IDPresented: string;
    GateNo: string;
    Files: string;
}
