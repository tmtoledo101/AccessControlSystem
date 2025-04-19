/**
 * Visitor details interface
 */
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
  Files: any[];
  initFiles: any[];
  origFiles: any[];
}

/**
 * Visitor details error interface
 */
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
