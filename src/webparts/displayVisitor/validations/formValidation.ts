import { IVisitor, IFormError } from '../models/IVisitor';
import { IVisitorDetails, IVisitorDetailsError } from '../models/IVisitorDetails';

/**
 * Validates a visitor details input field
 * @param name Field name
 * @param value Field value
 * @param errorDetails Error details
 * @returns Updated error details
 */
export function validateVisitorDetailsInput(
  name: string, 
  value: any, 
  errorDetails: IVisitorDetailsError
): IVisitorDetailsError {
  const tempProps = { ...errorDetails };
  
  if (!value || value.length === 0) {
    tempProps[name] = "This is a required input field";
  } else {
    tempProps[name] = "";
  }
  
  return tempProps;
}

/**
 * Validates visitor details before submission
 * @param visitorDetails Visitor details data
 * @param errorDetails Error details
 * @param statusId Status ID
 * @param isEncoder Whether the current user is an encoder
 * @param isReceptionist Whether the current user is a receptionist
 * @returns Whether the visitor details are valid and updated error details
 */
export function validateVisitorDetailsOnSubmit(
  visitorDetails: IVisitorDetails,
  errorDetails: IVisitorDetailsError,
  statusId: number,
  isEncoder: boolean,
  isReceptionist: boolean
): { isValid: boolean; errors: IVisitorDetailsError } {
  return validateVisitorDetails(visitorDetails, errorDetails, statusId, isEncoder, isReceptionist);
}

/**
 * Validates a single input field
 * @param name Field name
 * @param value Field value
 * @param visitor Visitor data
 * @param errorFields Error fields
 * @returns Updated error fields
 */
export function validateInput(
  name: string, 
  value: any, 
  visitor: IVisitor, 
  errorFields: IFormError
): IFormError {
  const tempProps = { ...errorFields };
  
  if (!value || value.length === 0) {
    tempProps[name] = "This is a required input field";
    return tempProps;
  }
  
  if (name === "DateTimeVisit") {
    if (value > Date.parse(visitor.DateTimeArrival.toString())) {
      tempProps[name] = "From Date should be earlier than To Date";
      return tempProps;
    }
  } else if (name === "DateTimeArrival") {
    if (Date.parse(visitor.DateTimeVisit.toString()) > value) {
      tempProps[name] = "From Date should be earlier than To Date";
      return tempProps;
    }
  }
  
  tempProps[name] = "";
  return tempProps;
}

/**
 * Validates a single visitor details input field
 * @param name Field name
 * @param value Field value
 * @param visitorDetails Visitor details data
 * @param errorDetails Error details
 * @returns Updated error details
 */
export function validateInputDetails(
  name: string, 
  value: any, 
  visitorDetails: IVisitorDetails, 
  errorDetails: IVisitorDetailsError
): IVisitorDetailsError {
  const tempProps = { ...errorDetails };
  
  if (!value || value.length === 0) {
    tempProps[name] = "This is a required input field";
    return tempProps;
  }
  
  tempProps[name] = "";
  return tempProps;
}

/**
 * Validates the form before submission
 * @param visitor Visitor data
 * @param errorFields Error fields
 * @param visitorDetailsList Visitor details list
 * @param action Action type
 * @param isEncoder Whether the current user is an encoder
 * @param isReceptionist Whether the current user is a receptionist
 * @param isApproverUser Whether the current user is an approver
 * @param isWalkinApproverUser Whether the current user is a walkin approver
 * @param isSSDUser Whether the current user is an SSD user
 * @param onViewVisitorDetails Callback to view visitor details
 * @returns Whether the form is valid and updated error fields
 */
export function validateForm(
  visitor: IVisitor,
  errorFields: IFormError,
  visitorDetailsList: IVisitorDetails[],
  action: string,
  isEncoder: boolean,
  isReceptionist: boolean,
  isApproverUser: boolean,
  isWalkinApproverUser: boolean,
  isSSDUser: boolean,
  onViewVisitorDetails: (action: string, rowData: IVisitorDetails) => void
): { isValid: boolean; errors: IFormError } {
  const tempProps = { ...errorFields };
  const required = [];
  
  // Determine required fields based on user role and action
  if ((isEncoder) && ((visitor.StatusId === 1) || (visitor.StatusId === 2))) {
    required.push("Purpose", "DeptId", "Bldg", "RoomNo", "EmpNo", "DateTimeVisit", "DateTimeArrival",
      'CompanyName', 'Address', 'VisContactNo', 'ApproverId'
    );
    if (visitor.Purpose === 'Others') {
      required.push('PurposeOthers');
    }
  } else if ((isReceptionist) && ((visitor.StatusId === 1) || (visitor.StatusId === 2))) {
    required.push("Purpose", "DeptId", "Bldg", "RoomNo", "EmpNo", "DateTimeVisit", "DateTimeArrival",
      'CompanyName', 'Address', 'VisContactNo', 'ApproverId'
    );
    if (visitor.Purpose === 'Others') {
      required.push('PurposeOthers');
    }
  } else if ((isApproverUser) && (visitor.StatusId === 2) && (action === 'deny')) {
    required.push('Remarks1');
  } else if ((isWalkinApproverUser) && (visitor.StatusId === 2) && (action === 'deny')) {
    required.push('Remarks1');
  } else if ((isSSDUser) && (visitor.StatusId === 3) && (action === 'deny')) {
    required.push('Remarks2');
  }
  
  const validbit = [];
  
  // Validate each required field
  for (let i = 0; i < required.length; i++) {
    if ((required[i] === "EmpNo") && (visitor.Purpose === "For receiving")) {
      tempProps[required[i]] = "";
    } else if (required[i] === "DateTimeVisit") {
      if (Date.parse(visitor.DateTimeVisit.toString()) > Date.parse(visitor.DateTimeArrival.toString())) {
        tempProps[required[i]] = "From Date should be earlier than To Date";
        validbit.push(required[i]);
      }
    } else if (required[i] === "DateTimeArrival") {
      if (Date.parse(visitor.DateTimeVisit.toString()) > Date.parse(visitor.DateTimeArrival.toString())) {
        tempProps[required[i]] = "From Date should be earlier than To Date";
        validbit.push(required[i]);
      }
    } else if ((required[i] === "ApproverId") && (action === 'savedraft')) {
      tempProps[required[i]] = "";
    } else {
      if (!visitor[required[i]]) {
        tempProps[required[i]] = "This is a required input field";
        validbit.push(required[i]);
      }
    }
  }
  
  // Check visitor details
  if (visitorDetailsList.length === 0) {
    tempProps.Details = "Visitor Details are required. Please add visitor names by clicking the (+) button.";
    validbit.push('Details');
  }
  
  // Check visitor details files for receptionist
  if ((visitor.StatusId === 4) || (visitor.StatusId === 9)) {
    for (let i = 0; i < visitorDetailsList.length; i++) {
      const rowData = visitorDetailsList[i];
      let havefiles = false;
      
      if ((rowData.Files.length > 0) || (rowData.initFiles.length > 0)) {
        havefiles = true;
      }
      
      if ((!havefiles) || (!rowData.AccessCard) || (!rowData.GateNo) || (!rowData.IDPresented)) {
        validbit.push('Details');
        alert(`Please complete Visitor Details of ${rowData.Title} on row ${i + 1} before saving!`);
        onViewVisitorDetails('view', rowData);
        break;
      }
    }
  }
  
  return {
    isValid: validbit.length === 0,
    errors: tempProps
  };
}

/**
 * Validates visitor details before submission
 * @param visitorDetails Visitor details data
 * @param errorDetails Error details
 * @param statusId Status ID
 * @param isEncoder Whether the current user is an encoder
 * @param isReceptionist Whether the current user is a receptionist
 * @returns Whether the visitor details are valid and updated error details
 */
export function validateVisitorDetails(
  visitorDetails: IVisitorDetails,
  errorDetails: IVisitorDetailsError,
  statusId: number,
  isEncoder: boolean,
  isReceptionist: boolean
): { isValid: boolean; errors: IVisitorDetailsError } {
  const tempProps = { ...errorDetails };
  const required = [];
  
  // Determine required fields based on user role and status
  if ((isEncoder) && ((statusId === 1) || (statusId === 2))) {
    required.push('Title', 'PlateNo', 'TypeofVehicle', 'Color', 'DriverName');
  } else if ((isReceptionist) && ((statusId === 4) || (statusId === 9))) {
    required.push('Title', 'PlateNo', 'TypeofVehicle', 'Color', 'DriverName', 'AccessCard', 'IDPresented', 'GateNo');
    
    // Check for files
    if (visitorDetails.Files.length === 0 && visitorDetails.initFiles.length === 0) {
      tempProps.Files = "Please upload a file.";
    } else {
      tempProps.Files = "";
    }
  } else if ((isReceptionist) && ((statusId === 1) || (statusId === 2))) {
    required.push('Title', 'PlateNo', 'TypeofVehicle', 'Color', 'DriverName');
  }
  
  const validbit = [];
  
  // Validate each required field
  for (let i = 0; i < required.length; i++) {
    if ((required[i] === "PlateNo") && (visitorDetails.Car === false)) {
      tempProps[required[i]] = "";
    } else if ((required[i] === "TypeofVehicle") && (visitorDetails.Car === false)) {
      tempProps[required[i]] = "";
    } else if ((required[i] === "Color") && (visitorDetails.Car === false)) {
      tempProps[required[i]] = "";
    } else if ((required[i] === "DriverName") && (visitorDetails.Car === false)) {
      tempProps[required[i]] = "";
    } else {
      if (!visitorDetails[required[i]]) {
        tempProps[required[i]] = "This is a required input field";
        validbit.push(required[i]);
      }
    }
  }
  
  return {
    isValid: validbit.length === 0,
    errors: tempProps
  };
}
