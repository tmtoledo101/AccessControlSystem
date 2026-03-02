import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { IDisplayVisitorProps } from "./IDisplayVisitorProps";
import { IVisitor, IFormError, IApproverDetails } from "../models/IVisitor";
import { IVisitorDetails, IVisitorDetailsError } from "../models/IVisitorDetails";
import { SharePointService } from "../services/SharePointService";
import { EmailService } from "../services/EmailService";
import { FileService } from "../services/FileService";
import { getUrlParameter } from "../helpers/urlHelpers";

import HeaderSection from "./sections/HeaderSection";
import VisitorInformationSection from "./sections/VisitorInformationSection";
import VisitorDetailsSection from "./sections/VisitorDetailsSection";
import ApprovalSection from "./sections/ApprovalSection";
import ActionButtonsSection from "./sections/ActionButtonsSection";

import ConfirmationDialog from "./dialogs/ConfirmationDialog";
import VisitorDetailsDialog from "./dialogs/VisitorDetailsDialog";
import PrintIDDialog from "./dialogs/PrintIDDialog";

import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";

// UI for count panel
import { Chip, LinearProgress, Typography } from "@material-ui/core";

// PnP setup for ViewVisitor SharePointService
import { sp } from "@pnp/sp";

// Reuse ViewVisitor’s VisitorCountTable + service + types
import VisitorCountTable from "../../viewVisitors/components/common/VisitorCountTable";
import ViewVisitorSharePointService from "../../viewVisitors/components/services/SharePointService";
import { IVisitorCount } from "../../viewVisitors/components/interfaces/IViewVisitors";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      fontFamily:
        '"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
      padding: "12px",
    },
    backdrop: { zIndex: theme.zIndex.drawer + 1, color: "#fff" },
  })
);

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const isEmptyString = (v: any) =>
  v === null || v === undefined || (typeof v === "string" && v.trim() === "");
const nowDate = () => new Date();

const checkVisibility = (
  element: string,
  visitor: IVisitor,
  isEdit: boolean,
  isEncoder: boolean,
  isReceptionist: boolean,
  isApproverUser: boolean,
  isWalkinApproverUser: boolean,
  isSSDUser: boolean
): boolean => {
  const forSSD =
    isSSDUser &&
    (visitor.StatusId === 3 || visitor.StatusId === 4 || visitor.StatusId === 7);
  const forEncoder = isEncoder && (visitor.StatusId === 1 || visitor.StatusId === 2);
  switch (element) {
    case "editicon":
      return !isEdit && (forEncoder || forSSD);
    default:
      return false;
  }
};

const initialVisitor: IVisitor = {
  ID: null,
  Title: "",
  ExternalType: "",
  Purpose: "",
  DeptId: null,
  Dept: { Title: "" },
  Bldg: "",
  RoomNo: "",
  EmpNo: "",
  ContactName: "",
  Position: "",
  DirectNo: "",
  LocalNo: "",
  DateTimeVisit: nowDate(),
  DateTimeArrival: nowDate(),
  CompanyName: "",
  Address: "",
  VisContactNo: "",
  VisLocalNo: "",
  RequireParking: false,
  Remarks1: "",
  Remarks2: "",
  StatusId: 0,
  Status: { Title: "" },
  ApproverId: null,
  Approver: { Title: "", EMail: "", ID: null },
  Files: [],
  initFiles: [],
  origFiles: [],
  SSDApproverId: null,
  SSDApprover: { Title: "" },
  RequestDate: nowDate(),
  Author: { Title: "", EMail: "" },
  AuthorId: null,
  colorAccess: "General",
  SSDDate: null,
  DeptApproverDate: null,
  MarkCompleteDate: null,
  Receptionist: { Title: "" },
  ReceptionistId: null,
  PurposeOthers: "",
};

const initialFormError: IFormError = {
  ExternalType: "",
  Purpose: "",
  DeptId: "",
  Bldg: "",
  RoomNo: "",
  EmpNo: "",
  Title: "",
  Position: "",
  DirectNo: "",
  LocalNo: "",
  DateTimeVisit: "",
  DateTimeArrival: "",
  CompanyName: "",
  Address: "",
  VisContactNo: "",
  VisLocalNo: "",
  RequireParking: "",
  ApproverId: "",
  Details: "",
  Remarks1: "",
  Remarks2: "",
  PurposeOthers: "",
};

const initialVisitorDetail: IVisitorDetails = {
  ID: null,
  Title: "",
  FirstName: "",
  Car: false,
  AccessCard: undefined,
  AccessCardId: undefined,
  AccessCardNo: "",
  PlateNo: "",
  TypeofVehicle: "",
  Color: "",
  DriverName: "",
  IDPresented: "",
  ParentId: null,
  Files: [],
  initFiles: [],
  origFiles: [],
};

const initialVisitorDetailError: IVisitorDetailsError = {
  Title: "",
  FirstName: "",
  Car: "",
  AccessCardId: "",
  PlateNo: "",
  Color: "",
  DriverName: "",
  IDPresented: "",
  Files: "",
};

function computeRequestWindow(v: IVisitor) {
  const rawFrom = v.DateTimeArrival ? new Date(v.DateTimeArrival as any) : new Date();
  const rawTo = v.DateTimeVisit ? new Date(v.DateTimeVisit as any) : new Date();

  const from = new Date(rawFrom);
  const to = new Date(rawTo);

  if (from.getTime() > to.getTime()) {
    const tmp = new Date(from);
    from.setTime(to.getTime());
    to.setTime(tmp.getTime());
  }

  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  return { from, to };
}

function toYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysToSet(
  set: Set<string>,
  dateFrom?: string | Date | null,
  dateTo?: string | Date | null,
  clipFrom?: Date,
  clipTo?: Date
) {
  if (!dateFrom || !dateTo) return;

  const startRaw = new Date(dateFrom);
  const endRaw = new Date(dateTo);
  if (isNaN(startRaw.getTime()) || isNaN(endRaw.getTime())) return;

  let start = new Date(startRaw);
  let end = new Date(endRaw);

  if (start.getTime() > end.getTime()) {
    const tmp = start;
    start = end;
    end = tmp;
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (clipFrom) {
    const cf = new Date(clipFrom);
    cf.setHours(0, 0, 0, 0);
    if (start < cf) start = cf;
  }
  if (clipTo) {
    const ct = new Date(clipTo);
    ct.setHours(0, 0, 0, 0);
    if (end > ct) end = ct;
  }

  if (end < start) return;

  const d = new Date(start);
  while (d <= end) {
    set.add(toYmd(d));
    d.setDate(d.getDate() + 1);
  }
}

function countUniqueVisitDays(records: any[], clipFrom?: Date, clipTo?: Date) {
  const days = new Set<string>();

  (records || []).forEach((r) => {
    const a = r.DateTimeArrival || null;
    const v = r.DateTimeVisit || null;

    addDaysToSet(days, a, v, clipFrom, clipTo);

    if (!a || !v) {
      addDaysToSet(days, r.DateFrom || null, r.DateTo || null, clipFrom, clipTo);
    }
  });

  return days.size;
}

/**
 * SSD decision is based ONLY on Entry Request (SSDApprove).
 * ParkingRequest must NOT affect header status nor email action.
 */
type SsdFormDecision = {
  statusId: number;
  statusTitle: string;
  action: "approve" | "deny";
};

function computeSsdFormDecision(list: IVisitorDetails[]): SsdFormDecision | null {
  const arr = list || [];

  const hasAny = arr.some((d: any) => d && d.SSDApprove !== undefined && d.SSDApprove !== null);
  if (!hasAny) return null;

  const anyDenied = arr.some((d: any) => {
    const v =
      d && d.SSDApprove !== undefined && d.SSDApprove !== null ? String(d.SSDApprove) : "";
    return v.toLowerCase() === "no";
  });

  if (anyDenied) {
    return { statusId: 7, statusTitle: "Denied by SSD", action: "deny" };
  }

  const anyApproved = arr.some((d: any) => {
    const v =
      d && d.SSDApprove !== undefined && d.SSDApprove !== null ? String(d.SSDApprove) : "";
    return v.toLowerCase() === "yes";
  });

  if (anyApproved) {
    return { statusId: 4, statusTitle: "Approved by SSD", action: "approve" };
  }

  return null;
}

const DisplayVisitor: React.FC<IDisplayVisitorProps> = (props) => {
  const classes = useStyles();
  const printRef = useRef<HTMLDivElement>(null);

  const Receptionist_Group = "Receptionist_V2";
  const SSD_Group = "SSD_v2";
  const SSD_Notify_Group = "SSD_EmailNotif";

  const sharePointService = new SharePointService(props.siteUrl, props.siteRelativeUrl);
  const fileService = new FileService(props.siteRelativeUrl);

  const [openDialog, setOpenDialog] = useState(false),
    [openDialogFab, setOpenDialogFab] = useState(false),
    [openDialogIDFab, setOpenDialogIDFab] = useState(false),
    [isProgress, setProgress] = useState(false),
    [isSavingDone, setSavingDone] = useState(false),
    [dialogMessage, setDialogMessage] = useState(""),
    [successMessage, setSuccessMessage] = useState("");

  const [isEncoder, setEncoder] = useState(false),
    [isReceptionist, setReceptionist] = useState(false),
    [isApproverUser, setApproverUser] = useState(false),
    [isSSDUser, setSSDUser] = useState(false),
    [isWalkinApproverUser, setisWalkinApproverUser] = useState(false);

  const [SSDUsers, setSSD] = useState<any[]>([]),
    [WalkinApprovers, setWalkinApprovers] = useState<any[]>([]),
    [colorList, setcolorList] = useState<any[]>([]),
    [purposeList, setPurpose] = useState<any[]>([]),
    [deptList, setDept] = useState<any[]>([]),
    [bldgList, setBldg] = useState<any[]>([]),
    [approverList, setApprovers] = useState<any[]>([]),
    [contactList, setContacts] = useState<any[]>([]),
    [IDList, setIDs] = useState<any[]>([]),
    [GateList, setGates] = useState<any[]>([]),
    [usersPerDept, setUsersPerDept] = useState<any[]>([]),
    [isAC1Open, setAC1Open] = useState(false);

  const [inputFields, setInputs] = useState<IVisitor>({ ...initialVisitor }),
    [errorFields, setError] = useState<IFormError>({ ...initialFormError }),
    [visitorDetails, setVisitorDetails] = useState<IVisitorDetails>({
      ...initialVisitorDetail,
    }),
    [visitorDetailsList, setVisitorDetailsList] = useState<IVisitorDetails[]>([]),
    [errorDetails, setErrorDetails] = useState<IVisitorDetailsError>({
      ...initialVisitorDetailError,
    });

  const [approverDetails, setApproverDetails] = useState<IApproverDetails>({
      email: "",
      name: "",
    }),
    [visitorDetailsMode, setVisitorDetailsMode] = useState<"add" | "edit">("add"),
    [sAction, setsAction] = useState(""),
    [modifiedDate, setModifiedDate] = useState<Date | null>(null),
    [isHidePrint, setHidePrint] = useState(true),
    [visitorIsEditMode, setEditMode] = useState(false),
    [currentUser, setCurrentUser] = useState<any>(null);

  // Persisted refs (avoid reinit every render)
  const idxRef = useRef<number>(-1);
  const deptNameRef = useRef<string>("");
  const itemIdRef = useRef<number>(0);
  const itemIdDetailsRef = useRef<number>(0);
  const sourceUrlRef = useRef<string | null>(null);
  const refNoRef = useRef<string>("");
  const colorValueRef = useRef<string>("Green");
  const deleteFilesRef = useRef<any[]>([]);
  const deleteFilesDetailsRef = useRef<any[]>([]);
  const origVisitorDetailsListRef = useRef<IVisitorDetails[]>([]);

  // Visitor count panel
  const countPanelRef = useRef<HTMLDivElement>(null);
  const [countLoading, setCountLoading] = useState(false);
  const [countError, setCountError] = useState("");
  const [countFromDate, setCountFromDate] = useState<Date>(new Date());
  const [countToDate, setCountToDate] = useState<Date>(new Date());
  const [countRows, setCountRows] = useState<IVisitorCount[]>([]);

  // Normalize departments so deptList always has { Id, Title }
  const normalizeDepartments = (rows: any[]): any[] => {
    return (rows || [])
      .map((d: any) => {
        const idRaw =
          d && d.Id !== undefined
            ? d.Id
            : d && d.ID !== undefined
            ? d.ID
            : d && d.DeptId !== undefined
            ? d.DeptId
            : d && d.DeptID !== undefined
            ? d.DeptID
            : d && d.DepartmentId !== undefined
            ? d.DepartmentId
            : d && d.departmentId !== undefined
            ? d.departmentId
            : undefined;

        const titleRaw =
          d && d.Title !== undefined
            ? d.Title
            : d && d.DeptTitle !== undefined
            ? d.DeptTitle
            : d && d.DepartmentTitle !== undefined
            ? d.DepartmentTitle
            : d && d.Dept && d.Dept.Title !== undefined
            ? d.Dept.Title
            : "";

        return {
          ...d,
          Id: idRaw !== undefined && idRaw !== null && idRaw !== "" ? Number(idRaw) : undefined,
          Title: titleRaw !== undefined && titleRaw !== null ? String(titleRaw) : "",
        };
      })
      .filter((d: any) => d.Id !== undefined && d.Id !== null && String(d.Title).trim() !== "");
  };

  const getUserDeptId = (row: any): number | null => {
    const raw =
      row && row.DeptId !== undefined
        ? row.DeptId
        : row && row.DeptID !== undefined
        ? row.DeptID
        : row && row.DepartmentId !== undefined
        ? row.DepartmentId
        : null;
    const n = Number(raw);
    return isNaN(n) ? null : n;
  };

  const loadAllVisitorCountsForAllRequests = async (list: IVisitorDetails[], req: IVisitor) => {
    if (!list || list.length === 0) {
      setCountRows([]);
      return;
    }

    const ctx = (props as any).context;
    if (ctx) sp.setup({ spfxContext: ctx });

    computeRequestWindow(req);

    const rangeFrom = new Date(2000, 0, 1);
    const rangeTo = new Date(2100, 11, 31);

    setCountFromDate(rangeFrom);
    setCountToDate(rangeTo);

    setCountLoading(true);
    setCountError("");
    setCountRows([]);

    try {
      const uniq: { [k: string]: { first: string; last: string; anyId: number } } = {};
      for (const d of list) {
        const first = (d.FirstName || "").trim();
        const last = (d.Title || "").trim();
        if (!first || !last) continue;
        const key = (first + "|" + last).toLowerCase();
        if (!uniq[key]) uniq[key] = { first, last, anyId: d.ID || 0 };
      }

      const keys = Object.keys(uniq);
      const rowsOut: IVisitorCount[] = [];

      for (const k of keys) {
        const { first, last, anyId } = uniq[k];

        const details = await ViewVisitorSharePointService.getVisitorDetailedInfo(
          first,
          last,
          rangeFrom,
          rangeTo,
          true,
          "exact"
        );

        const totalUniqueDays = countUniqueVisitDays(details);

        rowsOut.push({
          ID: anyId,
          FirstName: first,
          LastName: last,
          CompanyName:
            (details && details[0] && details[0].CompanyName) || req.CompanyName || "",
          VisitCount: totalUniqueDays,
          isExpanded: false,
          detailsData: [],
        });
      }

      rowsOut.sort(
        (a, b) =>
          (b.VisitCount || 0) - (a.VisitCount || 0) ||
          (a.LastName || "").localeCompare(b.LastName || "")
      );

      setCountRows(rowsOut);

      setTimeout(() => {
        if (countPanelRef.current) {
          countPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 0);
    } catch (e) {
      console.error(e);
      setCountError("Failed to load visitor entry counts.");
      setCountRows([]);
    } finally {
      setCountLoading(false);
    }
  };

  const validateInputs = (name: string, value: any) => {
    const tempErrors = { ...errorFields };
    if (name === "EmpNo") {
      (tempErrors as any)[name] = "";
      setError(tempErrors);
      return;
    }
    if (isEmptyString(value)) {
      (tempErrors as any)[name] = "This is a required input field";
    } else if (name === "DateTimeVisit" || name === "DateTimeArrival") {
      const visitDate = inputFields.DateTimeVisit ? new Date(inputFields.DateTimeVisit) : null;
      const arrivalDate = inputFields.DateTimeArrival
        ? new Date(inputFields.DateTimeArrival)
        : null;
      if (visitDate && arrivalDate && visitDate > arrivalDate) {
        tempErrors.DateTimeVisit = "From Date should be earlier than To Date";
        tempErrors.DateTimeArrival = "To Date should be later than From Date";
      } else {
        tempErrors.DateTimeVisit = "";
        tempErrors.DateTimeArrival = "";
      }
    } else {
      (tempErrors as any)[name] = "";
    }
    setError(tempErrors);
  };

  const validateInputsDetails = (name: string, value: any) => {
    const tempErrors = { ...errorDetails };
    (tempErrors as any)[name] = isEmptyString(value) ? "This is a required input field" : "";
    setErrorDetails(tempErrors);
  };

  const validateOnSubmit = (t: string) => {
    let isValid = true;
    const tempErrors = { ...errorFields };
    const requiredFields: string[] = [];

    if (
      (isEncoder || isReceptionist) &&
      (inputFields.StatusId === 1 || inputFields.StatusId === 2)
    ) {
      requiredFields.push(
        "Purpose",
        "DeptId",
        "Bldg",
        "RoomNo",
        "DateTimeVisit",
        "DateTimeArrival",
        "CompanyName",
        "Address",
        "VisContactNo",
        "ApproverId"
      );
      if (inputFields.Purpose === "Others") requiredFields.push("PurposeOthers");
    } else if (
      (isApproverUser || isWalkinApproverUser) &&
      inputFields.StatusId === 2 &&
      t === "deny"
    ) {
      requiredFields.push("Remarks1");
    } else if (isSSDUser && inputFields.StatusId === 3 && t === "deny") {
      requiredFields.push("Remarks2");
    }

    const validationErrorsFound: string[] = [];

    for (const field of requiredFields) {
      if (field === "EmpNo" && inputFields.Purpose === "For receiving") {
        (tempErrors as any)[field] = "";
      } else if (field === "DateTimeVisit" || field === "DateTimeArrival") {
        const v = inputFields.DateTimeVisit ? new Date(inputFields.DateTimeVisit) : null;
        const a = inputFields.DateTimeArrival ? new Date(inputFields.DateTimeArrival) : null;
        if (!v || !a) {
          (tempErrors as any)[field] = "This is a required input field";
          validationErrorsFound.push(field);
        } else if (v > a) {
          tempErrors.DateTimeVisit = "From Date should be earlier than To Date";
          tempErrors.DateTimeArrival = "To Date should be later than From Date";
          validationErrorsFound.push(field);
        } else {
          (tempErrors as any)[field] = "";
        }
      } else if (field === "ApproverId" && t === "savedraft") {
        (tempErrors as any)[field] = "";
      } else if (isEmptyString((inputFields as any)[field])) {
        (tempErrors as any)[field] = "This is a required input field";
        validationErrorsFound.push(field);
      } else {
        (tempErrors as any)[field] = "";
      }
    }

    if (visitorDetailsList.length === 0) {
      tempErrors.Details =
        "Visitor Details are required. Please add visitor names by clicking the (+) button.";
      validationErrorsFound.push("Details");
    }

    if (isReceptionist && (inputFields.StatusId === 4 || inputFields.StatusId === 9)) {
      for (let i = 0; i < visitorDetailsList.length; i++) {
        const row = visitorDetailsList[i];

        const hasFiles =
          (row.Files && row.Files.length > 0) || (row.initFiles && row.initFiles.length > 0);

        if (!hasFiles || !(row as any).AccessCardId || !(row as any).IDPresented) {
          tempErrors.Details = `Please complete Visitor Details of ${
            row.Title || `Visitor ${i + 1}`
          } on row ${i + 1} before saving!`;
          validationErrorsFound.push("Details");
          alert(tempErrors.Details);
          handleVisitorDetailsAction("view", row);
          isValid = false;
          break;
        }
      }
    }

    if (validationErrorsFound.length > 0) isValid = false;
    setError(tempErrors);
    return isValid;
  };

  const validateOnSubmitDetails = () => {
    let isValid = true;
    const tempErrors = { ...errorDetails };
    const requiredDetailFields: string[] = [];

    if (
      (isEncoder || isReceptionist) &&
      (inputFields.StatusId === 1 || inputFields.StatusId === 2)
    ) {
      requiredDetailFields.push("Title");
      if (visitorDetails.Car) requiredDetailFields.push("PlateNo", "Color", "DriverName");
    } else if (isReceptionist && (inputFields.StatusId === 4 || inputFields.StatusId === 9)) {
      requiredDetailFields.push("Title", "AccessCardId", "IDPresented");
      if (visitorDetails.Car) requiredDetailFields.push("PlateNo", "Color", "DriverName");
      if (!visitorDetails.Files || visitorDetails.Files.length === 0) {
        tempErrors.Files = "Please upload a file.";
        isValid = false;
      } else tempErrors.Files = "";
    }

    const detailValidationErrorsFound: string[] = [];
    for (const field of requiredDetailFields) {
      if (
        !visitorDetails.Car &&
        (field === "PlateNo" ||
          field === "TypeofVehicle" ||
          field === "Color" ||
          field === "DriverName")
      ) {
        (tempErrors as any)[field] = "";
      } else if (isEmptyString((visitorDetails as any)[field])) {
        (tempErrors as any)[field] = "This is a required input field";
        detailValidationErrorsFound.push(field);
      } else {
        (tempErrors as any)[field] = "";
      }
    }

    if (detailValidationErrorsFound.length > 0) isValid = false;
    setErrorDetails(tempErrors);
    return isValid;
  };

  // Lazy-load SSD users only when we actually need to notify SSD
  const sendEmail = async (visitorForEmail: IVisitor, actionOverride: string = "") => {
    const emailService = new EmailService(props.siteUrl, currentUser.Email);

    let ssdUsersToUse = SSDUsers;

    const needsSSDRecipients = visitorForEmail.StatusId === 3;

    if (needsSSDRecipients && (!ssdUsersToUse || ssdUsersToUse.length === 0)) {
      try {
        ssdUsersToUse = await sharePointService.getGroupUsersByName(SSD_Notify_Group);
        setSSD(ssdUsersToUse);
      } catch (e) {
        console.warn("Cannot read SSD group members. Skipping SSD recipients.", e);
        ssdUsersToUse = [];
      }
    }

    const finalAction = actionOverride && actionOverride.length > 0 ? actionOverride : sAction;

    await emailService.sendNotification(
      finalAction,
      visitorForEmail,
      approverDetails,
      isEncoder,
      isReceptionist,
      isApproverUser,
      isWalkinApproverUser,
      isSSDUser,
      ssdUsersToUse,
      visitorDetailsList
    );

    const message = emailService.getSuccessMessage(
      finalAction,
      visitorForEmail,
      approverDetails,
      isEncoder,
      isReceptionist,
      isApproverUser,
      isWalkinApproverUser,
      isSSDUser
    );

    setSuccessMessage(message);
  };

  const save = async () => {
    try {
      setProgress(true);

      const origVisitor = await sharePointService.getVisitorById(itemIdRef.current);
      if (origVisitor && origVisitor.Modified !== modifiedDate) {
        alert(
          "Record has been changed by another user! Please refresh the page to see the latest updates."
        );
        window.open(props.siteUrl, "_self");
        return;
      }

      // SSD: compute effective status/action from Entry Request (SSDApprove) at save-time
      let effectiveAction = sAction;
      let visitorToSave: IVisitor = inputFields;

      if (isSSDUser) {
        const decision = computeSsdFormDecision(visitorDetailsList);
        if (decision) {
          visitorToSave = {
            ...inputFields,
            StatusId: decision.statusId,
            Status: { Title: decision.statusTitle },
          } as any;

          // If SSD uses "Save" (not explicit approve/deny), still force proper email action
          if (!effectiveAction || effectiveAction === "savedraft" || effectiveAction === "save") {
            effectiveAction = decision.action;
          }
        }
      }

      const updatedVisitor = await sharePointService.saveVisitor(
        visitorToSave,
        effectiveAction,
        currentUser
      );
      refNoRef.current = updatedVisitor.Title;

      await fileService.uploadVisitorFiles(
        itemIdRef.current,
        visitorToSave.Files,
        visitorToSave.origFiles,
        deleteFilesRef.current
      );

      // Save details
      for (const visitorDetail of visitorDetailsList) {
        const detailToSave = { ...visitorDetail, ParentId: itemIdRef.current };
        let detailStatusId = updatedVisitor.StatusId;

        if (isSSDUser && (visitorDetail as any).SSDApprove !== undefined) {
          detailStatusId = (visitorDetail as any).SSDApprove === "Yes" ? 4 : 7;
        }

        const savedDetail = await sharePointService.saveVisitorDetails(
          detailToSave,
          itemIdRef.current,
          refNoRef.current,
          visitorToSave.DeptId,
          visitorToSave.DateTimeVisit,
          visitorToSave.DateTimeArrival,
          visitorToSave.CompanyName,
          detailStatusId,
          updatedVisitor.RequestDate
        );

        if (!visitorDetail.ID && savedDetail.ID) visitorDetail.ID = savedDetail.ID;

        if (visitorDetail.ID) {
          await fileService.uploadVisitorDetailsFiles(
            visitorDetail.ID,
            visitorDetail.Files,
            visitorDetail.origFiles
          );
        }
      }

      // Use the SAME effective status/action for email
      let visitorForEmail: IVisitor = updatedVisitor;
      if (isSSDUser) {
        const decision = computeSsdFormDecision(visitorDetailsList);
        if (decision) {
          visitorForEmail = {
            ...updatedVisitor,
            StatusId: decision.statusId,
            Status: { Title: decision.statusTitle },
          } as any;

          if (!effectiveAction || effectiveAction === "savedraft" || effectiveAction === "save") {
            effectiveAction = decision.action;
          }
        }
      }

      await sendEmail(visitorForEmail, effectiveAction);

      await fileService.deleteVisitorDetailsFiles(deleteFilesDetailsRef.current);

      // Remove deleted details
      for (const origDetail of origVisitorDetailsListRef.current) {
        const exists = visitorDetailsList.some((d) => d.ID === origDetail.ID);
        if (!exists && origDetail.ID) {
          await sharePointService.deleteVisitorDetails(origDetail.ID);
        }
      }

      // Keep UI header consistent after save
      if (isSSDUser) {
        const decision = computeSsdFormDecision(visitorDetailsList);
        if (decision) {
          setInputs((prev) => ({
            ...prev,
            StatusId: decision.statusId,
            Status: { Title: decision.statusTitle },
          }));
          // Also keep sAction aligned, so your existing Snackbar conditions work
          setsAction(decision.action);
        }
      }

      setSavingDone(true);

      setTimeout(() => {
        let url = props.siteUrl;
        if (sourceUrlRef.current) url = sourceUrlRef.current;
        if ((inputFields.StatusId === 4 || inputFields.StatusId === 9) && isReceptionist) {
          url = window.location.href;
        }
        window.open(url, "_self");
      }, 1000);
    } catch (error) {
      console.error("Error saving data:", error);
      setProgress(false);
    }
  };

  const handleCloseDialog = (confirmed: boolean) => {
    setOpenDialog(false);
    if (!confirmed) return;

    const msg = dialogMessage.toLowerCase();
    if (
      msg.includes("submit") ||
      msg.includes("save") ||
      msg.includes("approve") ||
      msg.includes("deny") ||
      msg.includes("complete")
    ) {
      save();
    } else if (msg.includes("discard")) {
      const url = sourceUrlRef.current || props.siteUrl;
      window.open(url, "_self");
    }
  };

  const handleCloseDialogIDFab = () => setOpenDialogIDFab(false);

  const handleCloseDialogFab = (confirmed: boolean) => {
    const isViewOnly = isApproverUser || isSSDUser;

    if (confirmed && !isViewOnly) {
      if (!validateOnSubmitDetails()) return;

      const detailToSave = { ...visitorDetails, ParentId: itemIdRef.current };

      if (visitorDetailsMode === "add") {
        setVisitorDetailsList((prev) => [...prev, detailToSave]);
        setError((prev) => ({ ...prev, Details: "" }));
      } else {
        const updated = [...visitorDetailsList];
        if (idxRef.current !== -1) {
          updated[idxRef.current] = detailToSave;
          setVisitorDetailsList(updated);
        }
      }
    }

    setOpenDialogFab(false);
  };

  useEffect(() => {
    (async () => {
      try {
        setProgress(true);

        const ctx = (props as any).context;
        if (ctx) sp.setup({ spfxContext: ctx });

        sourceUrlRef.current = document.referrer;

        const pidRaw = getUrlParameter("pid");
        const pid = Number(pidRaw);

        //dont forget to comment
        itemIdRef.current = Number.isFinite(pid) && pid > 0 ? pid : 130;

        if (!itemIdRef.current) {
          alert("Missing or invalid pid in the URL.");
          setProgress(false);
          return;
        }

        const user = await sharePointService.getCurrentUser();
        setCurrentUser(user);

        const groups = await sharePointService.getCurrentUserGroups();
        let isUser = false;
        let isencoder = false;
        let isreceptionist = false;

        const isApproverFromList = await sharePointService.isCurrentUserApprover();
        if (isApproverFromList) {
          setApproverUser(true);
          isUser = true;
        }

        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === Receptionist_Group) {
            setReceptionist(true);
            isUser = true;
            isreceptionist = true;
            break;
          }
        }

        const visitor = await sharePointService.getVisitorById(itemIdRef.current);
        if (!visitor) {
          setProgress(false);
          return;
        }

        setModifiedDate(visitor.Modified);

        const users_per_dept = await sharePointService.getDepartments(user.Id);
        if (users_per_dept.length > 0) {
          isUser = true;
          isencoder = true;
          setEncoder(true);
        }
        setUsersPerDept(users_per_dept);

        if ((visitor.StatusId === 4 || visitor.StatusId === 9) && isreceptionist) {
          setHidePrint(false);
          const colorlist = await sharePointService.getIDColors();
          setcolorList(colorlist);
        }

        if (visitor.ExternalType === "Pre-arranged") {
          const approvers = await sharePointService.getApprovers(visitor.DeptId, user.Id);
          setApprovers(approvers);
        } else if (visitor.ExternalType === "Walk-in") {
          const walkin = await sharePointService.getWalkinApprovers(visitor.DeptId);
          setWalkinApprovers(walkin);
          if (walkin.filter((a) => a.NameId === user.Id).length > 0) {
            setisWalkinApproverUser(true);
            isUser = true;
          }
        }

        if (visitor.ApproverId === user.Id) {
          if (visitor.ExternalType === "Pre-arranged") setApproverUser(true);
          else setisWalkinApproverUser(true);
          isUser = true;
        }

        if (visitor.ExternalType === "Pre-arranged" && isencoder) setEncoder(true);

        for (let i = 0; i < groups.length; i++) {
          if (groups[i].LoginName === SSD_Group) {
            setSSDUser(true);
            isUser = true;
            break;
          }
        }

        if (isUser) {
          deptNameRef.current = visitor.Dept.Title;

          const purpose = await sharePointService.getPurposes();
          setPurpose(purpose);

          const building = await sharePointService.getBuildings();
          setBldg(building);

          const deptsRaw = await sharePointService.getDepartments();
          const allDepts = normalizeDepartments(deptsRaw);

          const currentDeptId = Number((visitor as any).DeptId);
          const hasCurrent = allDepts.some((d: any) => Number(d.Id) === currentDeptId);

          let allDeptsWithCurrent = allDepts;
          if (!hasCurrent && !isNaN(currentDeptId) && currentDeptId) {
            allDeptsWithCurrent = [
              ...allDepts,
              {
                Id: currentDeptId,
                Title: (visitor.Dept && visitor.Dept.Title) || "Current Department",
              },
            ];
          }

          if (isencoder) {
            const mappedrows: any[] = [];

            allDeptsWithCurrent.forEach((deptRow: any) => {
              const deptRowId = Number(deptRow.Id);

              const filtered = (users_per_dept || []).filter((u: any) => {
                const uDeptId = getUserDeptId(u);
                if (uDeptId === null) return false;
                return Number(uDeptId) === deptRowId;
              });

              if (filtered.length > 0) mappedrows.push(deptRow);
            });

            if (mappedrows.length > 0) setDept(mappedrows);
            else setDept(allDeptsWithCurrent);
          } else if (isreceptionist) {
            setDept(allDeptsWithCurrent);
          } else {
            setDept(allDeptsWithCurrent);
          }

          const optionContacts = await sharePointService.getEmployeeByEmpNo(visitor.EmpNo);
          setContacts(optionContacts);

          setSSD([]);

          const visitordetails = await sharePointService.getVisitorDetailsByParentId(
            itemIdRef.current
          );
          origVisitorDetailsListRef.current = visitordetails;
          setVisitorDetailsList(visitordetails);

          const gates = await sharePointService.getGates();
          setGates(gates);

          const idpresented = await sharePointService.getIDTypes();
          setIDs(idpresented);

          setInputs({
            ...visitor,
            DeptId:
              (visitor as any).DeptId !== null && (visitor as any).DeptId !== undefined
                ? Number((visitor as any).DeptId)
                : (visitor as any).DeptId,
          } as any);
        } else {
          alert("You are not authorized to access this page!");
          window.open(props.siteUrl, "_self");
        }

        setProgress(false);
      } catch (e) {
        console.error("Initialization Error:", e);
        setProgress(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const hasList = visitorDetailsList && visitorDetailsList.length > 0;
    const hasDates = !!inputFields.DateTimeArrival && !!inputFields.DateTimeVisit;

    if (!hasList || !hasDates) return;

    loadAllVisitorCountsForAllRequests(visitorDetailsList, inputFields);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitorDetailsList, inputFields.DateTimeArrival, inputFields.DateTimeVisit]);

  const handleChangeCbo = async (event: any) => {
    const { name, value } = event.target;

    let nextValue: any = value;

    if (name === "DeptId") {
      const deptIdNum = Number(value);
      nextValue = deptIdNum;

      const deptfiltered = deptList.filter((d: any) => Number(d.Id) === deptIdNum);
      if (deptfiltered.length > 0) deptNameRef.current = deptfiltered[0].Title;

      if (inputFields.ExternalType === "Walk-in") {
        const walkinapprovers = await sharePointService.getWalkinApprovers(deptIdNum);
        setWalkinApprovers(walkinapprovers);
        setApprovers([]);
      } else {
        const approvers = await sharePointService.getApprovers(deptIdNum, currentUser.Id);
        setApprovers(approvers);
        setWalkinApprovers([]);
      }
    } else if (name === "Purpose") {
      if (value !== "Others") {
        setInputs((prev) => ({ ...prev, PurposeOthers: "" }));
        setError((prev) => ({ ...prev, PurposeOthers: "" }));
      }
    } else if (name === "colorAccess") {
      const filtered = colorList.filter((c: any) => c.Title === value);
      if (filtered.length > 0) colorValueRef.current = filtered[0].ColorCode;
    }

    setInputs((prev) => ({ ...prev, [name]: nextValue }));
    validateInputs(name, nextValue);
  };

  const handleChangeCboDetails = (event: any) => {
    const { name, value } = event.target;

    setVisitorDetails((prev) => {
      const next = { ...prev, [name]: value } as IVisitorDetails;
      return next;
    });

    validateInputsDetails(name, value);
  };

  const handleChangeTxt = (e: any) => {
    const { name, value, checked, type } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setInputs((prev) => ({ ...prev, [name]: newValue }));
    validateInputs(name, newValue);
  };

  const handleChangeTxtDetails = (e: any) => {
    const { name, value, checked, type } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setVisitorDetails((prev) => {
      const newDetails = { ...prev, [name]: newValue } as IVisitorDetails;
      if (name === "Car" && newValue === false) {
        newDetails.Color = "";
        newDetails.DriverName = "";
        newDetails.PlateNo = "";
        newDetails.TypeofVehicle = "";
        setErrorDetails((prevErr) => ({
          ...prevErr,
          PlateNo: "",
          TypeofVehicle: "",
          Color: "",
          DriverName: "",
        }));
      }
      return newDetails;
    });
    validateInputsDetails(name, newValue);
  };

  const onDateTimeVisitChange = (e: Date, name: string) => {
    setInputs((prev) => ({ ...prev, [name]: e }));
    validateInputs(name, e);
  };

  const handleChangeDropZone = (files: any[]) => {
    setInputs((prev) => ({ ...prev, Files: files }));
    const filesToDelete = inputFields.origFiles.filter(
      (origFile: any) => !files.some((f: any) => f.name === origFile.Name)
    );
    deleteFilesRef.current = filesToDelete;
  };

  const handleChangeDropZone2 = (files: any[]) => {
    setVisitorDetails((prev) => ({ ...prev, Files: files, initFiles: files }));
    const tempErrorDetails = { ...errorDetails };
    tempErrorDetails.Files = files.length > 0 ? "" : "Please upload a file.";
    setErrorDetails(tempErrorDetails);

    if (itemIdDetailsRef.current) {
      const filesToDeleteForDetail = visitorDetails.origFiles
        .filter((origFile: any) => !files.some((f: any) => f.name === origFile.Name))
        .map((file: any) => ({ Id: itemIdDetailsRef.current, Filename: file.Name }));

      filesToDeleteForDetail.forEach((fileToDelete: any) => {
        const exists = deleteFilesDetailsRef.current.some(
          (it) => it.Id === fileToDelete.Id && it.Filename === fileToDelete.Filename
        );
        if (!exists) deleteFilesDetailsRef.current.push(fileToDelete);
      });
    }
  };

  const handleACSelectedValue = (event: any, value: any) => {
    setInputs((prev) => {
      if (value) {
        validateInputs("EmpNo", value.EmpNo);
        return {
          ...prev,
          EmpNo: value.EmpNo,
          DirectNo: value.DirectNo,
          LocalNo: value.LocalNo,
          Position: value.Position,
        };
      } else {
        validateInputs("EmpNo", "");
        setContacts([]);
        return { ...prev, EmpNo: "", DirectNo: "", LocalNo: "", Position: "" };
      }
    });
  };

  const findUser = async (e: any) => {
    const searchTerm = e.target.value;
    setInputs((prev) => ({
      ...prev,
      EmpNo: "",
      DirectNo: "",
      LocalNo: "",
      Position: "",
    }));
    if (searchTerm.length > 2) {
      setAC1Open(true);
      const options = await sharePointService.getEmployeesByName(searchTerm, deptNameRef.current);
      setContacts(options);
    } else {
      setContacts([]);
      setAC1Open(false);
    }
  };

  const handleAddVisitorDetails = () => {
    setVisitorDetailsMode("add");
    idxRef.current = -1;
    itemIdDetailsRef.current = 0;
    setVisitorDetails({
      ...initialVisitorDetail,
      Car: inputFields.RequireParking,
      ParentId: inputFields.ID,
    });
    setErrorDetails({ ...initialVisitorDetailError });
    setOpenDialogFab(true);
  };

  function handleVisitorDetailsAction(action: string, rowData: IVisitorDetails) {
    if (action === "view") {
      const idxById = rowData.ID ? visitorDetailsList.findIndex((d) => d.ID === rowData.ID) : -1;
      idxRef.current = idxById !== -1 ? idxById : visitorDetailsList.indexOf(rowData);

      if (rowData.ID) itemIdDetailsRef.current = rowData.ID;

      const detailWithParentId = { ...rowData, ParentId: rowData.ParentId || itemIdRef.current };
      setVisitorDetails(detailWithParentId);
      setVisitorDetailsMode("edit");
      setOpenDialogFab(true);
    } else if (action === "delete") {
      const idxToDelete = rowData.ID
        ? visitorDetailsList.findIndex((d) => d.ID === rowData.ID)
        : visitorDetailsList.indexOf(rowData);

      if (idxToDelete > -1) {
        const tempList = [...visitorDetailsList];
        tempList.splice(idxToDelete, 1);
        setVisitorDetailsList(tempList);

        if (rowData.ID) deleteFilesDetailsRef.current.push({ Id: rowData.ID, Filename: null });

        if (tempList.length === 0)
          setError((prev) => ({
            ...prev,
            Details: "Visitor Details are required. Please add visitor names.",
          }));
      }
    } else if (action === "print") {
      const idxById = rowData.ID ? visitorDetailsList.findIndex((d) => d.ID === rowData.ID) : -1;
      idxRef.current = idxById !== -1 ? idxById : visitorDetailsList.indexOf(rowData);

      if (rowData.ID) itemIdDetailsRef.current = rowData.ID;

      setVisitorDetails(rowData);
      setOpenDialogIDFab(true);
    } else if (action === "updateSSDApprove") {
      const idx = visitorDetailsList.findIndex((i) => i.ID === rowData.ID);
      if (idx !== -1) {
        const temp = [...visitorDetailsList];
        if (isSSDUser && (rowData as any).SSDApprove === "No") {
          (rowData as any).ParkingRequest = "No";
        }
        temp[idx] = rowData;
        setVisitorDetailsList(temp);

        if (isSSDUser) {
          if ((rowData as any).SSDApprove === "Yes") {
            setInputs((prev) => ({
              ...prev,
              StatusId: 4,
              Status: { Title: "Approved by SSD" },
            }));
          } else if ((rowData as any).SSDApprove === "No") {
            setInputs((prev) => ({
              ...prev,
              StatusId: 7,
              Status: { Title: "Denied by SSD" },
            }));
          }
        }
      }
    } else if (action === "updateParkingRequest") {
      if (!isSSDUser) return;
      if ((rowData as any).SSDApprove !== "Yes") {
        (rowData as any).ParkingRequest = "No";
      }

      const idx = visitorDetailsList.findIndex((i) => i.ID === rowData.ID);
      if (idx !== -1) {
        const temp = [...visitorDetailsList];
        temp[idx] = rowData;
        setVisitorDetailsList(temp);

        if (isSSDUser && (rowData as any).SSDApprove === "Yes") {
          setInputs((prev) => ({
            ...prev,
            StatusId: 4,
            Status: { Title: "Approved by SSD" },
          }));
        }
      }
    }
  }

  const handleChipClick = (e: any, fileName: string, controlType: string) => {
    let fileUrl = "";
    if (controlType === "inputFields")
      fileUrl = `${props.siteUrl}/VisitorsLib/${itemIdRef.current}/${fileName}`;
    else fileUrl = `${props.siteUrl}/VisitorDetailsLib/${itemIdDetailsRef.current}/${fileName}`;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // IMPORTANT: support SSD "save_ssd" action (ActionButtonsSection must call onSubmit(e, "save_ssd"))
  const onClickSubmit = (e: any, t: string) => {
    if (t === "save_ssd" && isSSDUser) {
      const decision = computeSsdFormDecision(visitorDetailsList);

      // Align UI header now, but save() will also recompute to be safe
      if (decision) {
        setInputs((prev) => ({
          ...prev,
          StatusId: decision.statusId,
          Status: { Title: decision.statusTitle },
        }));
        setsAction(decision.action);
      } else {
        // default to approve if nothing set yet, keeps existing snackbar logic stable
        setsAction("approve");
      }

      setDialogMessage("Do you want to save this request?");
      setOpenDialog(true);
      return;
    }

    setsAction(t);

    const msgMap: Record<string, string> = {
      savedraft: "Do you want to save and exit?",
      submit: "Do you want to submit this form?",
      approve: "Do you want to approve this request?",
      deny: "Do you want to deny this request?",
      markcomplete: "Do you want to complete this request?",
    };
    const msg = msgMap[t] || "Do you want to proceed?";

    if (validateOnSubmit(t)) {
      setDialogMessage(msg);
      setOpenDialog(true);
    }
  };

  const onClickCancel = (e: any) => {
    setDialogMessage("Do you want to discard changes and exit?");
    setOpenDialog(true);
  };

  const handleCloseDisplay = () => {
    window.open(props.siteUrl + "/SitePages/ViewVisitorappge.aspx", "_self");
  };

  const handleEditClick = () => {
    const canEdit = checkVisibility(
      "editicon",
      inputFields,
      visitorIsEditMode,
      isEncoder,
      isReceptionist,
      isApproverUser,
      isWalkinApproverUser,
      isSSDUser
    );
    if (!canEdit) {
      alert("You don't have permission to edit this request.");
      return;
    }
    setEditMode(true);
  };

  const anyReached14 = countRows.some((r) => (r.VisitCount || 0) >= 14);

  const renderSnackbarLines = (msg: string) => {
    const safe = msg && msg.trim() ? msg : "Data has been saved successfully.";
    return safe.split("\n").map((line, i) => <div key={i}>{line}</div>);
  };

  return (
    <form noValidate autoComplete="off">
      {inputFields.ID && (
        <div className={classes.root}>
          <Grid container spacing={1}>
            <HeaderSection
              visitor={inputFields}
              showEditButton={checkVisibility(
                "editicon",
                inputFields,
                visitorIsEditMode,
                isEncoder,
                isReceptionist,
                isApproverUser,
                isWalkinApproverUser,
                isSSDUser
              )}
              onEditClick={handleEditClick}
            />

            <VisitorInformationSection
              visitor={inputFields}
              errorFields={errorFields}
              isEdit={visitorIsEditMode}
              isEncoder={isEncoder}
              isReceptionist={isReceptionist}
              isApproverUser={isApproverUser}
              isSSDUser={isSSDUser}
              purposeList={purposeList}
              deptList={deptList}
              bldgList={bldgList}
              contactList={contactList}
              isAC1Open={isAC1Open}
              siteUrl={props.siteUrl}
              itemId={itemIdRef.current}
              onChangeTxt={handleChangeTxt}
              onChangeCbo={handleChangeCbo}
              onDateTimeVisitChange={onDateTimeVisitChange}
              onACSelectedValue={handleACSelectedValue}
              onFindUser={findUser}
              onACOpen={() => setAC1Open(true)}
              onACClose={() => setAC1Open(false)}
              onChangeDropZone={handleChangeDropZone}
              onChipClick={handleChipClick}
            />

            <VisitorDetailsSection
              visitor={inputFields}
              errorFields={errorFields}
              isEdit={visitorIsEditMode}
              isEncoder={isEncoder}
              isReceptionist={isReceptionist}
              isSSDUser={isSSDUser}
              isApproverUser={isApproverUser}
              isWalkinApproverUser={isWalkinApproverUser}
              visitorDetailsList={visitorDetailsList}
              isHidePrint={isHidePrint}
              onAddClick={handleAddVisitorDetails}
              onVisitorDetailsAction={handleVisitorDetailsAction}
            />

            <Grid item xs={12}>
              <div ref={countPanelRef} style={{ marginTop: 8 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  {anyReached14 && <Chip size="small" color="secondary" label="Reached 14 days" />}
                </div>

                {countLoading && <LinearProgress />}

                {!countLoading && !!countError && <Typography color="error">{countError}</Typography>}

                {!countLoading && !countError && countRows.length > 0 && (
                  <VisitorCountTable
                    data={countRows}
                    title="Visitor Total Days"
                    fromDate={countFromDate}
                    toDate={countToDate}
                  />
                )}

                {!countLoading && !countError && countRows.length === 0 && (
                  <Typography color="textSecondary">No visitor count data.</Typography>
                )}
              </div>
            </Grid>

            <ApprovalSection
              visitor={inputFields}
              errorFields={errorFields}
              isEdit={visitorIsEditMode}
              isEncoder={isEncoder}
              isReceptionist={isReceptionist}
              isApproverUser={isApproverUser}
              isWalkinApproverUser={isWalkinApproverUser}
              isSSDUser={isSSDUser}
              approverList={approverList}
              walkinApproverList={WalkinApprovers}
              onChangeTxt={handleChangeTxt}
              onChangeCbo={handleChangeCbo}
            />

            <ActionButtonsSection
              isEdit={visitorIsEditMode}
              isEncoder={isEncoder}
              isReceptionist={isReceptionist}
              isApproverUser={isApproverUser}
              isWalkinApproverUser={isWalkinApproverUser}
              isSSDUser={isSSDUser}
              statusId={inputFields.StatusId}
              onSubmit={onClickSubmit}
              onCancel={onClickCancel}
              onClose={handleCloseDisplay}
            />
          </Grid>

          <ConfirmationDialog open={openDialog} message={dialogMessage} onClose={handleCloseDialog} />

          {openDialogFab && (
            <VisitorDetailsDialog
              open={openDialogFab}
              visitorDetails={visitorDetails}
              errorDetails={errorDetails}
              isEdit={visitorIsEditMode}
              idList={IDList}
              gateList={GateList}
              isApproverUser={isApproverUser}
              isSSDUser={isSSDUser}
              spService={sharePointService}
              parentBldg={inputFields.Bldg}
              onClose={handleCloseDialogFab}
              onChangeTxt={handleChangeTxtDetails}
              onChangeCbo={handleChangeCboDetails}
              onChangeDropZone={handleChangeDropZone2}
              onChipClick={handleChipClick}
            />
          )}

          {openDialogIDFab && (
            <PrintIDDialog
              open={openDialogIDFab}
              visitorDetails={visitorDetails}
              visitor={inputFields}
              colorValue={colorValueRef.current}
              itemId={itemIdRef.current}
              itemIdDetails={itemIdDetailsRef.current}
              siteUrl={props.siteUrl}
              printRef={printRef}
              onClose={handleCloseDialogIDFab}
            />
          )}

          <Backdrop className={classes.backdrop} open={isProgress}>
            <CircularProgress color="inherit" />
          </Backdrop>

          {/* DO NOT CHANGE YOUR SNACKBAR (kept as-is) */}
          <Snackbar open={isSavingDone} autoHideDuration={2000} onClose={() => setSavingDone(false)}>
            <Alert severity="success" onClose={() => setSavingDone(false)}>
              Data has been saved successfully.
              {(isEncoder || isReceptionist) && sAction === "submit" && (
                <div>An email notification has been sent to approver {approverDetails.name}.</div>
              )}
              {isApproverUser && inputFields.StatusId === 2 && sAction === "approve" && (
                <div>An email notification has been sent to the SSD group .</div>
              )}
              {isWalkinApproverUser && inputFields.StatusId === 2 && sAction === "approve" && (
                <div>An email notification has been sent to requestor {inputFields.Author.Title}.</div>
              )}
              {isSSDUser && inputFields.StatusId === 3 && sAction === "approve" && (
                <div>An email notification has been sent to requestor {inputFields.Author.Title}.</div>
              )}
              {sAction === "deny" && (
                <div>An email notification has been sent to requestor {inputFields.Author.Title}.</div>
              )}
            </Alert>
          </Snackbar>
        </div>
      )}
    </form>
  );
};

export default DisplayVisitor;