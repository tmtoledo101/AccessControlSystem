/**
 * Visitor details interface
 */
export interface IVisitorDetails {
  ID: number;
  Title: string;
  FirstName: string;
  Car: boolean;
  AccessCards?: {
    Id: number;
    Title: string;
  };
  AccessCardId?: number;
  AccessCardNo?: string;
  PlateNo: string;
  TypeofVehicle: string;
  Color: string;
  DriverName: string;
  IDPresented: string;
  ParentId: number;
  Files: any[];
  initFiles: any[];
  origFiles: any[];
  SSDApprove?: string; // Yes/No value for SSD approval
  ParkingRequest?: string; // Yes/No value for Parking Request
}

/**
 * Visitor details error interface
 */
export interface IVisitorDetailsError {
  Title: string;
  FirstName: string;
  Car: string;
  AccessCardId?: string;
  PlateNo: string;
  Color: string;
  DriverName: string;
  IDPresented: string;
  Files: string;
}