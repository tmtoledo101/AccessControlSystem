import { IVisitor } from "../models/IVisitor";
import { IVisitorDetails } from "../models/IVisitorDetails";
import { IFormErrors, IVisitorDetailsErrors } from "../models/IFormErrors";

/**
 * Validates a visitor form
 * @param visitor Visitor
 * @param visitorDetailsList Visitor details list
 * @param submitType Submit type
 * @returns Validation result
 */
export function validateVisitorForm(
  visitor: IVisitor,
  visitorDetailsList: IVisitorDetails[],
  submitType: number
): { isValid: boolean; errors: IFormErrors } {
  const errors: IFormErrors = {};
  let isValid = true;

  // Required fields
  const requiredFields = [
    "Purpose", "DeptId", "Bldg", "RoomNo", "DateTimeVisit", "DateTimeArrival",
    "CompanyName", "Address", "VisContactNo"
  ];

  // Add ApproverId if submitting
  if (submitType === 2) {
    requiredFields.push("ApproverId");
  }

  // Add PurposeOthers if Purpose is Others
  if (visitor.Purpose === 'Others') {
    requiredFields.push("PurposeOthers");
  }

  // Validate required fields
  for (const field of requiredFields) {
    if (field === "EmpNo" && visitor.Purpose === "For receiving") {
      // Skip EmpNo validation for "For receiving" purpose
      continue;
    } else if (field === "DateTimeVisit") {
      if (visitor.DateTimeVisit > visitor.DateTimeArrival) {
        errors[field] = "From Date should be earlier than To Date";
        isValid = false;
      }
    } else if (field === "DateTimeArrival") {
      if (visitor.DateTimeVisit > visitor.DateTimeArrival) {
        errors[field] = "From Date should be earlier than To Date";
        isValid = false;
      }
    } else {
      if (!visitor[field]) {
        errors[field] = "This is a required input field";
        isValid = false;
      }
    }
  }

  // Validate visitor details
  if (visitorDetailsList.length === 0) {
    errors.Details = "Visitor Details are required. Please add visitor names by clicking the (+) button.";
    isValid = false;
  }

  return { isValid, errors };
}

/**
 * Validates a visitor details form
 * @param visitorDetails Visitor details
 * @returns Validation result
 */
export function validateVisitorDetailsForm(
  visitorDetails: IVisitorDetails
): { isValid: boolean; errors: IVisitorDetailsErrors } {
  const errors: IVisitorDetailsErrors = {};
  let isValid = true;

  // Required fields
  const requiredFields = ["Title", "FirstName"];

  // Add car-related fields if Car is true
  if (visitorDetails.Car) {
    requiredFields.push("PlateNo", "TypeofVehicle", "Color", "DriverName","DriverFirstName");
  }

  // Validate required fields
  for (const field of requiredFields) {
    if (!visitorDetails[field]) {
      errors[field] = "This is a required input field";
      isValid = false;
    }
  }

  return { isValid, errors };
}

/**
 * Validates a single field
 * @param name Field name
 * @param value Field value
 * @param visitor Visitor
 * @returns Error message
 */
export function validateField(name: string, value: any, visitor: IVisitor): string {
  if (value === "" || value === null || value === undefined) {
    return "This is a required input field";
  }

  if (name === "DateTimeVisit" && visitor.DateTimeArrival) {
    if (value > visitor.DateTimeArrival) {
      return "From Date should be earlier than To Date";
    }
  }

  if (name === "DateTimeArrival" && visitor.DateTimeVisit) {
    if (visitor.DateTimeVisit > value) {
      return "From Date should be earlier than To Date";
    }
  }

  return "";
}
