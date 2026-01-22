/**
 * Form errors interface
 */
export interface IFormErrors {
  ExternalType?: string;
  Purpose?: string;
  PurposeOthers?: string;
  DeptId?: string;
  Bldg?: string;
  RoomNo?: string;
  EmpNo?: string;
  Position?: string;
  DirectNo?: string;
  LocalNo?: string;
  DateTimeVisit?: string;
  DateTimeArrival?: string;
  CompanyName?: string;
  Address?: string;
  VisContactNo?: string;
  VisLocalNo?: string;
  RequireParking?: string;
  Status?: string;
  ApproverId?: string;
  Details?: string;
}

/**
 * Visitor details errors interface
 */
export interface IVisitorDetailsErrors {
  Title?: string;
  FirstName?: string;
  Car?: string;
  AccessCard?: string;
  PlateNo?: string;
  TypeofVehicle?: string;
  Color?: string;
  DriverName?: string;
  //DriverFirstName?: string;
  IDPresentedId?: string;
  GateNo?: string;
  Files?: string;
  VisitorType?: string;
}
