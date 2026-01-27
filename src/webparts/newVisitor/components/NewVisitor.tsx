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
const RECEPTIONIST_GROUP = 'Receptionist';

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
    .map((s) => s.trim())
    .filter(Boolean);
};

const validateBldgNotMixed = (bldgText: string): string => {
  const selected = splitBldgText(bldgText);

  const hasHO = selected.some((s) => s.toUpperCase().startsWith('(HO)'));
  const hasSPC = selected.some((s) => {
    const u = s.toUpperCase();
    return u === 'SPC' || u.startsWith('(SPC)');
  });

  if (hasHO && hasSPC) {
    return 'Please select buildings from only one site (HO or SPC).';
  }
  return '';
};

const getLocationCodeFromBldgText = (bldgText: string, bldgList: any[]): string => {
  const selected = splitBldgText(bldgText);

  // Prefer exact match from the building list (uses your LocationCode field)
  for (const title of selected) {
    const match = (bldgList || []).find((b) => b.Title === title);
    if (match && match.LocationCode) return match.LocationCode;
  }

  // Fallback: infer by prefix / value
  const hasHO = selected.some((s) => s.toUpperCase().startsWith('(HO)'));
  const hasSPC = selected.some((s) => {
    const u = s.toUpperCase();
    return u === 'SPC' || u.startsWith('(SPC)');
  });

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
  const [dialogMessage, setDialogMessage] = useState('');
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
  const [purposeList, setPurposeList] = useState<any[]>([]);
  const [deptList, setDeptList] = useState<any[]>([]);
  const [bldgList, setBldgList] = useState<any[]>([]);
  const [approverList, setApproverList] = useState<any[]>([]);
  const [walkinApproverList, setWalkinApproverList] = useState<any[]>([]);
  const [contactList, setContactList] = useState<any[]>([]);
  const [visitorDetailsList, setVisitorDetailsList] = useState<IVisitorDetails[]>([]);
  const [visitorTypeList, setVisitorTypeList] = useState<any[]>([]);

  // Form data
  const [visitor, setVisitor] = useState<IVisitor>({
    ExternalType: '',
    Purpose: '',
    DeptId: null,
    Bldg: '', // Option 1: stays string "A; B; C"
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
    VisitorType: 'Visitor',

    // Option 1: free-text (saved to VisitorDetails.OtherVisitorType, not to VisitorType list)
    OtherVisitorType: '',
  });

  // Form errors
  const [errors, setErrors] = useState<IFormErrors>({});
  const [approverDetails, setApproverDetails] = useState({ email: '', name: '' });
  const [deptName, setDeptName] = useState('');
  const [refNo, setRefNo] = useState('');
  const [itemId, setItemId] = useState(0);

  // --- Handlers ---

  const saveVisitor = async () => {
    const validation = validateVisitorForm(visitor, visitorDetailsList, submitType);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Option 1: require textbox value if VisitorType is Others
    if ((visitor as any).VisitorType === 'Others') {
      const other = ((visitor as any).OtherVisitorType || '').toString().trim();
      if (!other) {
        setErrors((prev: any) => ({ ...prev, OtherVisitorType: 'Please specify visitor type.' }));
        return;
      }
    }

    // prevent selecting both HO and SPC buildings
    const bldgMixError = validateBldgNotMixed((visitor as any).Bldg);
    if (bldgMixError) {
      setErrors((prev: any) => ({ ...prev, Bldg: bldgMixError }));
      return;
    }

    setProgress(true);

    try {
      // locationCode works even if visitor.Bldg is "A; B; C"
      const locationCode = getLocationCodeFromBldgText((visitor as any).Bldg, bldgList);

      // If submitting and we still can't infer the code, stop with a friendly error
      if (submitType === 2 && !locationCode) {
        setErrors((prev: any) => ({ ...prev, Bldg: 'Unable to determine site code from selected building(s).' }));
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
          (visitor as any).Purpose,
          savedItemId,
          approverDetails.email,
          approverDetails.name,
          isEncoder,
        );

        const currentUserEmail = props.context.pageContext.user.email;
        await spService.updatePrivacyConsentRefNo(currentUserEmail, generatedRefNo);
        localStorage.setItem(`privacyAccepted_${currentUserEmail}`, JSON.stringify({ date: new Date().toISOString() }));
      }

      setSavingDone(true);
      setTimeout(() => window.open(props.siteUrl, '_self'), 1000);
    } catch (error) {
      console.error('Error saving visitor:', error);
      setProgress(false);
    }
  };

  const handleDeptChange = async (deptId: number) => {
    const dept = (deptList || []).find((d: any) => d.Id === deptId);
    if (dept) setDeptName(dept.Title);

    if ((visitor as any).ExternalType === 'Walk-in') {
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
    } else {
      setContactList([]);
    }
  };

  const handleContactSelect = (contact: any) => {
    if (contact) {
      setVisitor((prev: any) => ({
        ...prev,
        EmpNo: contact.EmpNo,
        DirectNo: contact.DirectNo,
        LocalNo: contact.LocalNo,
        Position: contact.Position,
      }));
      setErrors((prev: any) => ({ ...prev, EmpNo: '' }));
    } else {
      setVisitor((prev: any) => ({ ...prev, EmpNo: '', DirectNo: '', LocalNo: '', Position: '' }));
      setContactList([]);
    }
  };

  const handleDateChange = (date: Date, name: string) => {
    const updatedVisitor: any = { ...visitor, [name]: date };
    setVisitor(updatedVisitor);

    if (name === 'DateTimeVisit' && date > (visitor as any).DateTimeArrival) {
      setErrors((prev: any) => ({ ...prev, DateTimeVisit: 'From Date should be earlier than To Date' }));
    } else if (name === 'DateTimeArrival' && (visitor as any).DateTimeVisit > date) {
      setErrors((prev: any) => ({ ...prev, DateTimeArrival: 'From Date should be earlier than To Date' }));
    } else {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFilesChange = (files: File[]) => setVisitor((prev: any) => ({ ...prev, Files: files }));

  const handleAddVisitor = (v: IVisitorDetails) => {
    setVisitorDetailsList([...visitorDetailsList, v]);
    setErrors((prev: any) => ({ ...prev, Details: '' }));
  };

  const handleEditVisitor = (v: IVisitorDetails, i: number) => {
    const l = [...visitorDetailsList];
    l[i] = v;
    setVisitorDetailsList(l);
  };

  const handleDeleteVisitor = (i: number) => {
    const l = [...visitorDetailsList];
    l.splice(i, 1);
    setVisitorDetailsList(l);
    if (l.length === 0) setErrors((prev: any) => ({ ...prev, Details: 'Visitor Details are required.' }));
  };

  const handleFieldChange = (name: string, value: any) => {
    // If Bldg changes, run the HO/SPC mixing validation immediately
    if (name === 'Bldg') {
      const bldgMixError = validateBldgNotMixed(value as string);
      setErrors((prev: any) => ({ ...prev, Bldg: bldgMixError }));
      if (bldgMixError) {
        // still update so user sees selection, but they cannot submit until fixed
        setVisitor((prev: any) => ({ ...prev, [name]: value }));
        return;
      }
    }

    // If VisitorType changes away from Others, clear textbox
    if (name === 'VisitorType' && value !== 'Others') {
      setVisitor((prev: any) => ({ ...prev, VisitorType: value, OtherVisitorType: '' }));
      setErrors((prev: any) => ({ ...prev, OtherVisitorType: '' }));
    } else {
      setVisitor((prev: any) => ({ ...prev, [name]: value }));
    }

    const errorMessage = validateField(name, value, { ...visitor, [name]: value });
    setErrors((prev: any) => ({ ...prev, [name]: errorMessage }));

    if (name === 'DeptId') handleDeptChange(value);
    if (name === 'Purpose' && value !== 'Others') setVisitor((prev: any) => ({ ...prev, PurposeOthers: '' }));
    if (name === 'ApproverId') handleApproverChange(value);

    // Clear OtherVisitorType error as user types
    if (name === 'OtherVisitorType') {
      setErrors((prev: any) => ({ ...prev, OtherVisitorType: '' }));
    }
  };

  const handleSave = () => {
    setSubmitType(1);
    setDialogMessage('Do you want to save and exit?');
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    setSubmitType(2);
    setDialogMessage('Do you want to submit this form?');
    setDialogOpen(true);
  };

  const handleCancel = () => {
    setDialogMessage('Do you want to discard changes and exit?');
    setDialogOpen(true);
  };

  const handleDialogClose = (confirmed: boolean) => {
    setDialogOpen(false);
    if (!confirmed) return;
    if (dialogMessage.includes('save') || dialogMessage.includes('submit')) saveVisitor();
    else window.open(props.siteUrl, '_self');
  };

  // Privacy Modal Handlers
  const handlePrivacyAccept = () => {
    setPrivacyConsentGiven(true);
    setShowPrivacyModal(false);
  };

  const handlePrivacyDecline = () => {
    alert('You must accept the privacy policy to use this application.');
    window.open(props.siteUrl, '_self');
  };

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
          setVisitor((prev: any) => ({ ...prev, ExternalType: 'Pre-arranged' }));
        }

        const isReceptionistResult = await spSvc.isUserInGroup(RECEPTIONIST_GROUP);
        if (isReceptionistResult) {
          setReceptionist(true);
          setVisitor((prev: any) => ({ ...prev, ExternalType: 'Walk-in' }));
        }

        if (usersPerDept.length > 0 || isReceptionistResult) {
          setPurposeList(await spSvc.getPurposeList());
          setBldgList(await spSvc.getBuildingList());
          setDeptList(await spSvc.getDepartmentList(usersPerDept.length > 0, usersPerDept));

          const vt = await spSvc.getVisitorTypeList();
          setVisitorTypeList(vt || []);
        } else {
          alert('You are not authorized to access this page!');
          window.open(props.siteUrl, '_self');
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Init error:', error);
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
      <PrivacyModal onAccept={handlePrivacyAccept} onDecline={handlePrivacyDecline} context={props.context} refNo={refNo} />
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
              externalType={(visitor as any).ExternalType}
              purposeList={purposeList}
              deptList={deptList}
              bldgList={bldgList}
              contactList={contactList}
              visitorTypeList={visitorTypeList}
              onChange={handleFieldChange}
              onContactSearch={handleContactSearch}
              onContactSelect={handleContactSelect}
              onDateChange={handleDateChange}
              onFilesChange={handleFilesChange}
            />

            <VisitorDetailsSection
              visitorDetailsList={visitorDetailsList}
              requireParking={(visitor as any).RequireParking}
              detailsError={(errors as any).Details}
              visitorType={(visitor as any).VisitorType || 'Visitor'}
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
                approverId={(visitor as any).ApproverId}
                error={(errors as any).ApproverId}
                onChange={handleFieldChange}
              />
            </Grid>

            <Grid container justify="flex-end">
              <ActionButtonsSection onSave={handleSave} onSubmit={handleSubmit} onCancel={handleCancel} />
            </Grid>
          </Grid>
        </Container>

        <ConfirmationDialog open={dialogOpen} title="Confirmation" message={dialogMessage} onClose={handleDialogClose} />

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
              <div style={{ marginTop: '5px' }}>An email notification has been sent to {approverDetails.name}.</div>
            )}
          </Alert>
        </Snackbar>
      </div>
    </form>
  );
};

export default NewVisitor;
