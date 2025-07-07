import { IVisitor, IFormError } from '../models/IVisitor';
import { IVisitorDetails, IVisitorDetailsError } from '../models/IVisitorDetails';

/**
 * Validates input fields
 * @param name Field name
 * @param value Field value
 * @param inputFields Current form values
 * @param errorFields Current error values
 * @returns Updated error values
 */
export function validateInputs(
  name: string, 
  value: any, 
  inputFields: IVisitor, 
  errorFields: IFormError
): IFormError {
  const tempProps = { ...errorFields };
  
  if (value.length === 0 && name !== 'EmpNo') {
    tempProps[name] = "This is a required input field";
  } else if (name === 'EmpNo' && inputFields.Purpose !== "For receiving" && value.length === 0) {
    tempProps[name] = "This is a required input field";
  } else {
    if (name === "DateTimeVisit") {
      if (value > inputFields.DateTimeArrival) {
        tempProps[name] = "From Date should be earlier than To Date";
      } else {
        tempProps[name] = "";
      }
    } else if (name === "DateTimeArrival") {
      if (inputFields.DateTimeVisit > value) {
        tempProps[name] = "From Date should be earlier than To Date";
      } else {
        tempProps[name] = "";
      }
    } else {
      tempProps[name] = "";
    }
  }
  
  return tempProps;
}

/**
 * Validates visitor details input fields
 * @param name Field name
 * @param value Field value
 * @param errorDetails Current error values
 * @returns Updated error values
 */
export function validateInputsDetails(
  name: string, 
  value: any, 
  errorDetails: IVisitorDetailsError
): IVisitorDetailsError {
  const tempProps = { ...errorDetails };
  
  if (value.length === 0) {
    tempProps[name] = "This is a required input field";
  } else {
    tempProps[name] = "";
  }
  
  return tempProps;
}

/**
 * Validates the form before submission
 * @param inputFields Form values
 * @param errorFields Error values
 * @param visitorDetailsList Visitor details list
 * @param action Action type
 * @param isEncoder Encoder role
 * @param isReceptionist Receptionist role
 * @param isApproverUser Approver role
 * @param isWalkinApproverUser Walkin approver role
 * @param isSSDUser SSD role
 * @returns Whether the form is valid and updated error values
 */
export function validateOnSubmit(
  inputFields: IVisitor,
  errorFields: IFormError,
  visitorDetailsList: IVisitorDetails[],
  action: string,
  isEncoder: boolean,
  isReceptionist: boolean,
  isApproverUser: boolean,
  isWalkinApproverUser: boolean,
  isSSDUser: boolean
): { isValid: boolean; errors: IFormError } {
  const tempProps = { ...errorFields };
  const required = [];
  
  // Determine required fields based on user role and action
  if ((isEncoder) && ((inputFields.StatusId === 1) || (inputFields.StatusId === 2))) {
    required.push("Purpose", "DeptId", "Bldg", "RoomNo", "DateTimeVisit", "DateTimeArrival",
      'CompanyName', 'Address', 'VisContactNo', 'ApproverId'
    );
    if (inputFields.Purpose === 'Others') {
      required.push('PurposeOthers');
    }
  } else if ((isReceptionist) && ((inputFields.StatusId === 1) || (inputFields.StatusId === 2))) {
    required.push("Purpose", "DeptId", "Bldg", "RoomNo", "EmpNo", "DateTimeVisit", "DateTimeArrival",
      'CompanyName', 'Address', 'VisContactNo', 'ApproverId'
    );
    if (inputFields.Purpose === 'Others') {
      required.push('PurposeOthers');
    }
  } else if ((isApproverUser) && (inputFields.StatusId === 2) && (action === 'deny')) {
    required.push('Remarks1');
  } else if ((isWalkinApproverUser) && (inputFields.StatusId === 2) && (action === 'deny')) {
    required.push('Remarks1');
  } else if ((isSSDUser) && (inputFields.StatusId === 3) && (action === 'deny')) {
    required.push('Remarks2');
  }
  
  const validbit = [];
  
  // Validate each required field
  for (let i = 0; i < required.length; i++) {
    if ((required[i] === "EmpNo") && (inputFields.Purpose === "For receiving")) {
      tempProps[required[i]] = "";
    } else if (required[i] === "DateTimeVisit") {
      if (inputFields.DateTimeVisit > inputFields.DateTimeArrival) {
        tempProps[required[i]] = "From Date should be earlier than To Date";
        validbit.push(required[i]);
      }
    } else if (required[i] === "DateTimeArrival") {
      if (inputFields.DateTimeVisit > inputFields.DateTimeArrival) {
        tempProps[required[i]] = "From Date should be earlier than To Date";
        validbit.push(required[i]);
      }
    } else if ((required[i] === "ApproverId") && (action === 'save')) {
      tempProps[required[i]] = "";
    } else {
      if (!inputFields[required[i]]) {
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
  
  return {
    isValid: validbit.length === 0,
    errors: tempProps
  };
}

/**
 * Validates visitor details before submission
 * @param visitorDetails Visitor details
 * @param errorDetails Error values
 * @param inputFields Form values
 * @param isEncoder Encoder role
 * @param isReceptionist Receptionist role
 * @returns Whether the visitor details are valid and updated error values
 */
export function validateOnSubmitDetails(
  visitorDetails: IVisitorDetails,
  errorDetails: IVisitorDetailsError,
  inputFields: IVisitor,
  isEncoder: boolean,
  isReceptionist: boolean
): { isValid: boolean; errors: IVisitorDetailsError } {
  const tempProps = { ...errorDetails };
  const required = ['Title', 'PlateNo', 'TypeofVehicle', 'Color', 'DriverName'];
  
  // Add additional required fields for receptionist
  if (isReceptionist && (inputFields.StatusId === 4 || inputFields.StatusId === 9)) {
    required.push('AccessCard', 'IDPresented', 'GateNo');
    
    // Check for files
    if (visitorDetails.Files.length === 0 && (!visitorDetails.initFiles || visitorDetails.initFiles.length === 0)) {
      tempProps.Files = "Please upload a file";
    }
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
