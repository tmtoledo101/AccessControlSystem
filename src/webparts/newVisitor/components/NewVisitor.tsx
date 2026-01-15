import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { IFormErrors } from '../models/IFormErrors';
import { IVisitor } from '../models/IVisitor';
import { IVisitorDetails } from '../models/IVisitorDetails';
import { EmailService } from '../services/EmailService';
import { FileService } from '../services/FileService';
import { SharePointService } from '../services/SharePointService';
import { validateField, validateVisitorForm } from '../validations/formValidation';
import ConfirmationDialog from './dialogs/ConfirmationDialog';
import PrivacyModal from './dialogs/PrivacyModal';
import { INewVisitorProps } from './INewVisitorProps';
import ActionButtonsSection from './sections/ActionButtonsSection';
import ApprovalSection from './sections/ApprovalSection';
import VisitorDetailsSection from './sections/VisitorDetailsSection';
import VisitorInformationSection from './sections/VisitorInformationSection';

// Constants
const RECEPTIONIST_GROUP = "Receptionist";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: { flexGrow: 1 },
    backdrop: { zIndex: theme.zIndex.drawer + 1, color: '#fff' },
  }),
);

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

/**
 * Helpers for Option 1 (Bldg is Single line of text, but UI is multi-select):
 * - UI saves string as "A; B; C"
 * - Ref generation must infer LocationCode from the selected building(s)
 * - Prevent mixing HO and SPC in the same selection
 */
const splitBldgText = (bldgText: string): string[] => {
  if (!bldgText) return [];
  return bldgText
    .split(';')
    .map(s => s.trim())
    .filter(Boolean);
};

const validateBldgNotMixed = (bldgText: string): string => {
  const selected = splitBldgText(bldgText);
  const hasHO = selected.some(s => s.startsWith('(HO)'));
  const hasSPC = selected.some(s => s.startsWith('(SPC)'));
  if (hasHO && hasSPC) {
    return 'Please select buildings from only one site (HO or SPC).';
  }
  return '';
};

const getLocationCodeFromBldgText = (bldgText: string, bldgList: any[]): string => {
  const selected = splitBldgText(bldgText);

  // Prefer exact match from the building list (uses your LocationCode field)
  for (const title of selected) {
    const match = (bldgList || []).find(b => b.Title === title);
    if (match && match.LocationCode) return match.LocationCode;
  }

  // Fallback: infer by prefix
  const hasHO = selected.some(s => s.startsWith('(HO)'));
  const hasSPC = selected.some(s => s.startsWith('(SPC)'));
  if (hasHO && !hasSPC) return 'HO';
  if (hasSPC && !hasHO) return 'SPC';

  return '';
};

const NewVisitor: React.FC<INewVisitorProps> = (props) => {
  const classes = useStyles();

  // Services
  const [spService, setSpService] = useState<SharePointService>(null);
  const [emailService, setEmailService] = useState<EmailService>(null);
  const [fileService, setFileService] = useState<FileService>(null);

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isProgress, setProgress] = useState(false);
  const [isSavingDone, setSavingDone] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [submitType, setSubmitType] = useState(1); // 1 = Save, 2 = Submit

  // Privacy Modal State
  const [privacyConsentGiven, setPrivacyConsentGiven] = useState(() => {
    const currentUserEmail = props.context.pageContext.user.email;
    const data = localStorage.getItem(`privacyAccepted_${currentUserEmail}`);
    if (!data) return false;

    const { date } = JSON.parse(data);
    const acceptedDate = new Date(date);
    return acceptedDate.toDateString() === new Date().toDateString();
  });

  const [showPrivacyModal, setShowPrivacyModal] = useState(() => !privacyConsentGiven);

  // User roles
  const [isEncoder, setEncoder] = useState(false);
  const [isReceptionist, setReceptionist] = useState(false);

  // Lists
  const [purposeList, setPurposeList] = useState([]);
  const [deptList, setDeptList] = useState([]);
  const [bldgList, setBldgList] = useState([]);
  const [approverList, setApproverList] = useState([]);
  const [walkinApproverList, setWalkinApproverList] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [visitorDetailsList, setVisitorDetailsList] = useState<IVisitorDetails[]>([]);

  // Form data
  const [visitor, setVisitor] = useState<IVisitor>({
    ExternalType: '',
    Purpose: '',
    DeptId: null,
    Bldg: '', // stays string for Option 1
    RoomNo: '',
    EmpNo: '',
    Position: '',
    DirectNo: '',
    LocalNo: '',
    DateTimeVisit: new Date(),
    DateTimeArrival: new Date(),
    CompanyName: '',
    Address: '',
    VisContactNo: '',
    VisLocalNo: '',
    RequireParking: false,
    ApproverId: null,
    Files: [],
    PurposeOthers: '',
    VisitorType: 'Visitor'
  });

  // Form errors
  const [errors, setErrors] = useState<IFormErrors>({});
  const [approverDetails, setApproverDetails] = useState({ email: '', name: '' });
  const [deptName, setDeptName] = useState("");
  const [refNo, setRefNo] = useState("");
  const [itemId, setItemId] = useState(0);

  // --- Handlers ---

  const saveVisitor = async () => {
    const validation = validateVisitorForm(visitor, visitorDetailsList, submitType);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // NEW: prevent selecting both HO and SPC buildings
    const bldgMixError = validateBldgNotMixed(visitor.Bldg);
    if (bldgMixError) {
      setErrors(prev => ({ ...prev, Bldg: bldgMixError }));
      return;
    }

    setProgress(true);

    try {
      // NEW: locationCode works even if visitor.Bldg is "A; B; C"
      const locationCode = getLocationCodeFromBldgText(visitor.Bldg, bldgList);

      // If submitting and we still can't infer the code, stop with a friendly error
      if (submitType === 2 && !locationCode) {
        setErrors(prev => ({ ...prev, Bldg: 'Unable to determine site code from selected building(s).' }));
        setProgress(false);
        return;
      }

      let generatedRefNo = refNo;
      if (submitType === 2) {
        generatedRefNo = await spService.createRequestNo(locationCode);
        setRefNo(generatedRefNo);
      }

      const savedItemId = await spService.saveVisitor(visitor, visitorDetailsList, submitType, generatedRefNo, deptName);
      setItemId(savedItemId);

      if (submitType === 2) {
        await emailService.sendApprovalEmail(
          generatedRefNo,
          visitor.Purpose,
          savedItemId,
          approverDetails.email,
          approverDetails.name,
          isEncoder
        );

        const currentUserEmail = props.context.pageContext.user.email;
        await spService.updatePrivacyConsentRefNo(currentUserEmail, generatedRefNo);
        localStorage.setItem(`privacyAccepted_${currentUserEmail}`, JSON.stringify({ date: new Date().toISOString() }));
      }

      setSavingDone(true);
      setTimeout(() => window.open(props.siteUrl, "_self"), 1000);
    } catch (error) {
      console.error("Error saving visitor:", error);
      setProgress(false);
    }
  };

  const handleDeptChange = async (deptId: number) => {
    const dept = deptList.find(d => d.Id === deptId);
    if (dept) setDeptName(dept.Title);

    if (visitor.ExternalType === 'Walk-in') {
      const walkinApprovers = await spService.getWalkinApproverList(deptId);
      setWalkinApproverList(walkinApprovers);
    } else {
      const approvers = await spService.getApproverList(deptId);
      setApproverList(approvers);
    }
  };

  const handleApproverChange = async (approverId: number) => {
    const fetchedApproverDetails = await spService.getApproverDetails(approverId);
    setApproverDetails(fetchedApproverDetails);
  };

  const handleContactSearch = async (searchText: string) => {
    if (searchText.length > 2) {
      const contacts = await spService.findUsersByName(searchText, deptName);
      setContactList(contacts);
    } else setContactList([]);
  };

  const handleContactSelect = (contact: any) => {
    if (contact) {
      setVisitor(prev => ({
        ...prev,
        EmpNo: contact.EmpNo,
        DirectNo: contact.DirectNo,
        LocalNo: contact.LocalNo,
        Position: contact.Position
      }));
      setErrors(prev => ({ ...prev, EmpNo: '' }));
    } else {
      setVisitor(prev => ({ ...prev, EmpNo: '', DirectNo: '', LocalNo: '', Position: '' }));
      setContactList([]);
    }
  };

  const handleDateChange = (date: Date, name: string) => {
    const updatedVisitor = { ...visitor, [name]: date };
    setVisitor(updatedVisitor);
    if (name === 'DateTimeVisit' && date > visitor.DateTimeArrival) {
      setErrors(prev => ({ ...prev, DateTimeVisit: 'From Date should be earlier than To Date' }));
    } else if (name === 'DateTimeArrival' && visitor.DateTimeVisit > date) {
      setErrors(prev => ({ ...prev, DateTimeArrival: 'From Date should be earlier than To Date' }));
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFilesChange = (files: File[]) => setVisitor(prev => ({ ...prev, Files: files }));
  const handleAddVisitor = (v: IVisitorDetails) => { setVisitorDetailsList([...visitorDetailsList, v]); setErrors(prev => ({ ...prev, Details: '' })); };
  const handleEditVisitor = (v: IVisitorDetails, i: number) => { const l = [...visitorDetailsList]; l[i] = v; setVisitorDetailsList(l); };
  const handleDeleteVisitor = (i: number) => {
    const l = [...visitorDetailsList];
    l.splice(i, 1);
    setVisitorDetailsList(l);
    if (l.length === 0) setErrors(prev => ({ ...prev, Details: 'Visitor Details are required.' }));
  };

  const handleFieldChange = (name: string, value: any) => {
    // NEW: If Bldg changes, run the HO/SPC mixing validation immediately
    if (name === 'Bldg') {
      const bldgMixError = validateBldgNotMixed(value as string);
      setErrors(prev => ({ ...prev, Bldg: bldgMixError }));
      if (bldgMixError) {
        // Still update the value (so user sees selection), but it won't submit until fixed
        setVisitor(prev => ({ ...prev, [name]: value }));
        return;
      }
    }

    setVisitor(prev => ({ ...prev, [name]: value }));
    const errorMessage = validateField(name, value, { ...visitor, [name]: value });
    setErrors(prev => ({ ...prev, [name]: errorMessage }));

    if (name === 'DeptId') handleDeptChange(value);
    if (name === 'Purpose' && value !== 'Others') setVisitor(prev => ({ ...prev, PurposeOthers: '' }));
    if (name === 'ApproverId') handleApproverChange(value);
  };

  const handleSave = () => { setSubmitType(1); setDialogMessage("Do you want to save and exit?"); setDialogOpen(true); };
  const handleSubmit = () => { setSubmitType(2); setDialogMessage("Do you want to submit this form?"); setDialogOpen(true); };
  const handleCancel = () => { setDialogMessage("Do you want to discard changes and exit?"); setDialogOpen(true); };

  const handleDialogClose = (confirmed: boolean) => {
    setDialogOpen(false);
    if (!confirmed) return;
    if (dialogMessage.includes("save") || dialogMessage.includes("submit")) saveVisitor();
    else window.open(props.siteUrl, "_self");
  };

  // Privacy Modal Handlers
  const handlePrivacyAccept = () => { setPrivacyConsentGiven(true); setShowPrivacyModal(false); };
  const handlePrivacyDecline = () => { alert("You must accept the privacy policy to use this application."); window.open(props.siteUrl, "_self"); };

  // Initialization
  useEffect(() => {
    const init = async () => {
      try {
        const spSvc = new SharePointService(props.context, props.siteUrl, props.siteRelativeUrl);
        await spSvc.initialize();
        setSpService(spSvc);
        setEmailService(new EmailService(spSvc, props.siteUrl));
        setFileService(new FileService(props.siteRelativeUrl));

        const usersPerDept = await spSvc.getUsersPerDept();
        if (usersPerDept.length > 0) {
          setEncoder(true);
          setVisitor(prev => ({ ...prev, ExternalType: "Pre-arranged" }));
        }

        const isReceptionistResult = await spSvc.isUserInGroup(RECEPTIONIST_GROUP);
        if (isReceptionistResult) {
          setReceptionist(true);
          setVisitor(prev => ({ ...prev, ExternalType: "Walk-in" }));
        }

        if (usersPerDept.length > 0 || isReceptionist) {
          setPurposeList(await spSvc.getPurposeList());
          setBldgList(await spSvc.getBuildingList());
          setDeptList(await spSvc.getDepartmentList(usersPerDept.length > 0, usersPerDept));
        } else {
          alert("You are not authorized to access this page!");
          window.open(props.siteUrl, "_self");
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Init error:", error);
        setIsLoading(false);
      }
    };
    init();
  }, []);

  if (isLoading) {
    return (
      <Backdrop className={classes.backdrop} open={true}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (showPrivacyModal && !privacyConsentGiven) {
    return (
      <PrivacyModal
        onAccept={handlePrivacyAccept}
        onDecline={handlePrivacyDecline}
        context={props.context}
        refNo={refNo}
      />
    );
  }

  if (!privacyConsentGiven) return null;

  return (
    <form noValidate autoComplete="off">
      <div className={classes.root} style={{ padding: '12px' }}>
        <Container>
          <Grid container spacing={1}>
            <VisitorInformationSection
              visitor={visitor}
              errors={errors}
              externalType={visitor.ExternalType}
              purposeList={purposeList}
              deptList={deptList}
              bldgList={bldgList}
              contactList={contactList}
              onChange={handleFieldChange}
              onContactSearch={handleContactSearch}
              onContactSelect={handleContactSelect}
              onDateChange={handleDateChange}
              onFilesChange={handleFilesChange}
            />

            <VisitorDetailsSection
              visitorDetailsList={visitorDetailsList}
              requireParking={visitor.RequireParking}
              detailsError={errors.Details}
              visitorType={visitor.VisitorType || 'Visitor'}
              onAddVisitor={handleAddVisitor}
              onEditVisitor={handleEditVisitor}
              onDeleteVisitor={handleDeleteVisitor}
            />

            <Grid item xs={12} sm={12}>
              <ApprovalSection
                isEncoder={isEncoder}
                isReceptionist={isReceptionist}
                approverList={approverList}
                walkinApproverList={walkinApproverList}
                approverId={visitor.ApproverId}
                error={errors.ApproverId}
                onChange={handleFieldChange}
              />
            </Grid>

            <Grid container justify="flex-end">
              <ActionButtonsSection onSave={handleSave} onSubmit={handleSubmit} onCancel={handleCancel} />
            </Grid>
          </Grid>
        </Container>

        <ConfirmationDialog
          open={dialogOpen}
          title="Confirmation"
          message={dialogMessage}
          onClose={handleDialogClose}
        />

        <Backdrop className={classes.backdrop} open={isProgress}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Snackbar open={isSavingDone} autoHideDuration={2000}>
          <Alert severity="success">
            Data has been saved successfully.
            {submitType === 2 && refNo && (
              <div style={{ marginTop: '5px' }}>
                <strong>Reference Number: {refNo}</strong>
              </div>
            )}
            {(isEncoder || isReceptionist) && submitType === 2 && (
              <div style={{ marginTop: '5px' }}>
                An email notification has been sent to {approverDetails.name}.
              </div>
            )}
          </Alert>
        </Snackbar>
      </div>
    </form>
  );
};

export default NewVisitor;