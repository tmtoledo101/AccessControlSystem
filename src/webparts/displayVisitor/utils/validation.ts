import { IErrorFields } from "../interfaces/IVisitor";
import { IVisitorDetailsError } from "../interfaces/IVisitorDetails";
import moment from 'moment';

export const validateVisitorFields = (fields: any, required: string[], action: string): IErrorFields => {
    const errors: IErrorFields = {
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
    };

    for (const field of required) {
        if (field === "EmpNo" && fields.Purpose === "For receiving") {
            continue;
        }
        
        if (field === "DateTimeVisit") {
            if (moment(fields.DateTimeVisit).isAfter(fields.DateTimeArrival)) {
                errors[field] = "From Date should be earlier than To Date";
            }
            continue;
        }

        if (field === "DateTimeArrival") {
            if (moment(fields.DateTimeVisit).isAfter(fields.DateTimeArrival)) {
                errors[field] = "From Date should be earlier than To Date";
            }
            continue;
        }

        if (field === "ApproverId" && action === "savedraft") {
            continue;
        }

        if (!fields[field]) {
            errors[field] = "This is a required input field";
        }
    }

    if (fields.Purpose === 'Others' && !fields.PurposeOthers) {
        errors.PurposeOthers = "This is a required input field";
    }

    return errors;
};

export const validateVisitorDetails = (details: any, isReceptionist: boolean, statusId: number): IVisitorDetailsError => {
    const errors: IVisitorDetailsError = {
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
    };

    // Basic validation for all cases
    if (!details.Title) {
        errors.Title = "This is a required input field";
    }

    // Car-related validations
    if (details.Car) {
        if (!details.PlateNo) {
            errors.PlateNo = "This is a required input field";
        }
        if (!details.TypeofVehicle) {
            errors.TypeofVehicle = "This is a required input field";
        }
        if (!details.Color) {
            errors.Color = "This is a required input field";
        }
        if (!details.DriverName) {
            errors.DriverName = "This is a required input field";
        }
    }

    // Receptionist-specific validations for completed or walk-in approved status
    if (isReceptionist && (statusId === 4 || statusId === 9)) {
        if (!details.AccessCard) {
            errors.AccessCard = "This is a required input field";
        }
        if (!details.IDPresented) {
            errors.IDPresented = "This is a required input field";
        }
        if (!details.GateNo) {
            errors.GateNo = "This is a required input field";
        }
        if ((!details.Files || details.Files.length === 0) && (!details.initFiles || details.initFiles.length === 0)) {
            errors.Files = "Please upload a file";
        }
    }

    return errors;
};

export const hasErrors = (errors: any): boolean => {
    return Object.values(errors).some(error => error !== '');
};
