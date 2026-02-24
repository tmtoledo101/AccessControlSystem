/**
 * Visitor details interface
 */
export interface IVisitorDetails {
  ID: number;
  Title: string;
  FirstName: string;
  Car: boolean;

  // Lookup object from SharePoint (after expand)
  AccessCard?: {
    Id: number;
    Title: string;
  };

  // NEW lookup ID (this is what we save)
  AccessCardId?: number;

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

  // Change error field to match lookup
  AccessCardId?: string;

  PlateNo: string;
  Color: string;
  DriverName: string;
  IDPresented: string;
  Files: string;
}