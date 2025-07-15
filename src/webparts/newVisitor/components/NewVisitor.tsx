import * as React from 'react';
import { useState, useEffect } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { INewVisitorProps } from './INewVisitorProps';
import { IVisitor } from '../models/IVisitor';
import { IVisitorDetails } from '../models/IVisitorDetails';
import { IFormErrors } from '../models/IFormErrors';
import { validateVisitorForm, validateField } from '../validations/formValidation';
import { SharePointService } from '../services/SharePointService';
import { EmailService } from '../services/EmailService';
import { FileService } from '../services/FileService';
import VisitorInformationSection from './sections/VisitorInformationSection';
import VisitorDetailsSection from './sections/VisitorDetailsSection';
import ApprovalSection from './sections/ApprovalSection';
import ActionButtonsSection from './sections/ActionButtonsSection';
import ConfirmationDialog from './dialogs/ConfirmationDialog';
import PrivacyModal from './dialogs/PrivacyModal';

// Constants
const ENCODERS_GROUP = "Encoders";
const RECEPTIONIST_GROUP = "Receptionist";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
  }),
);

/**
 * Alert component
 * @param props Alert props
 * @returns Alert component
 */
function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

/**
 * New visitor component
 * @param props Component props
 * @returns New visitor component
 */
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
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [privacyConsentGiven, setPrivacyConsentGiven] = useState(false); // New state to track consent

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
    Bldg: '',
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
    PurposeOthers: ''
  });

  // Form errors
  const [errors, setErrors] = useState<IFormErrors>({});

  // Approver details
  const [approverDetails, setApproverDetails] = useState({ email: '', name: '' });

  // Department name
  const [deptName, setDeptName] = useState("");

  // Reference number
  const [refNo, setRefNo] = useState(""); // This is where the Ref No will be stored

  // Item ID
  const [itemId, setItemId] = useState(0);

  /**
   * Initializes the component
   */
  useEffect(() => {
    const init = async () => {
      console.log("useEffect: Starting initialization."); // DEBUG LOG
      try {
        const spSvc = new SharePointService(props.context, props.siteUrl, props.siteRelativeUrl);
        await spSvc.initialize();
        setSpService(spSvc);

        setEmailService(new EmailService(spSvc, props.siteUrl));
        setFileService(new FileService(props.siteRelativeUrl));

        // Check user permissions
        const usersPerDept = await spSvc.getUsersPerDept();
        if (usersPerDept.length > 0) {
          setEncoder(true);
          setVisitor(prev => ({ ...prev, ExternalType: "Pre-arranged" }));
        }

        const isUserInReceptionistGroup = await spSvc.isUserInGroup(RECEPTIONIST_GROUP);
        if (isUserInReceptionistGroup) {
          setReceptionist(true);
          setVisitor(prev => ({ ...prev, ExternalType: "Walk-in" }));
        }

        // Check if user is authorized
        if (usersPerDept.length > 0 || isUserInReceptionistGroup) {
          console.log("useEffect: User is authorized. Loading lists."); // DEBUG LOG
          // Load lists
          const purpose = await spSvc.getPurposeList();
          setPurposeList(purpose);

          const building = await spSvc.getBuildingList();
          setBldgList(building);

          const depts = await spSvc.getDepartmentList(usersPerDept.length > 0, usersPerDept);
          setDeptList(depts);

          // Force display of PrivacyModal for *every* access
          console.log("useEffect: Forcing PrivacyModal to show every time per requirement."); // DEBUG LOG
          setShowPrivacyModal(true);
          setPrivacyConsentGiven(false); // Ensure consent is always considered not given initially

        } else {
          console.log("useEffect: User is NOT authorized. Redirecting.");
          alert("You are not authorized to access this page!");
          window.open(props.siteUrl, "_self");
          return; // Exit early if not authorized
        }

        setIsLoading(false); // Set isLoading to false once all initial data is fetched or permission checked
        console.log("useEffect: Initialization complete. isLoading set to false.");
      } catch (error) {
        console.error("Error during component initialization:", error);
        setIsLoading(false);
      }
    };

    init();
  }, []);

  /**
   * Handles privacy modal acceptance
   */
  const handlePrivacyAccept = () => {
    console.log("handlePrivacyAccept: User accepted privacy. Allowing access to form."); // DEBUG LOG
    // IMPORTANT: No cookie is set here, so the modal will reappear on next visit.
    setPrivacyConsentGiven(true);
    setShowPrivacyModal(false);
  };

  /**
   * Handles privacy modal declining
   */
  const handlePrivacyDecline = () => {
    console.log("handlePrivacyDecline: User declined privacy. Alerting and redirecting."); // DEBUG LOG
    // No cookie is set here either.
    alert("You must accept the privacy policy to use this application.");
    window.open(props.siteUrl, "_self"); // Redirect or take appropriate action
  };

  /**
   * Handles form field change
   * @param name Field name
   * @param value Field value
   */
  const handleFieldChange = (name: string, value: any) => {
    const updatedVisitor = { ...visitor };
    updatedVisitor[name] = value;
    setVisitor(updatedVisitor);

    // Validate field
    const errorMessage = validateField(name, value, updatedVisitor);
    setErrors(prev => ({ ...prev, [name]: errorMessage }));

    // Special handling for certain fields
    if (name === 'DeptId') {
      handleDeptChange(value);
    } else if (name === 'Purpose' && value !== 'Others') {
      updatedVisitor.PurposeOthers = '';
    } else if (name === 'ApproverId') {
      handleApproverChange(value);
    }
  };

  /**
   * Handles department change
   * @param deptId Department ID
   */
  const handleDeptChange = async (deptId: number) => {
    try {
      // Get department name
      const dept = deptList.find(d => d.Id === deptId);
      if (dept) {
        setDeptName(dept.Title);
      }

      // Get approvers
      if (visitor.ExternalType === 'Walk-in') {
        const walkinApprovers = await spService.getWalkinApproverList(deptId);
        setWalkinApproverList(walkinApprovers);
      } else {
        const approvers = await spService.getApproverList(deptId);
        setApproverList(approvers);
      }
    } catch (error) {
      console.error("Error handling department change:", error);
    }
  };

  /**
   * Handles approver change
   * @param approverId Approver ID
   */
  const handleApproverChange = async (approverId: number) => {
    try {
      const approverDetails = await spService.getApproverDetails(approverId);
      setApproverDetails(approverDetails);
    } catch (error) {
      console.error("Error handling approver change:", error);
    }
  };

  /**
   * Handles contact search
   * @param searchText Search text
   */
  const handleContactSearch = async (searchText: string) => {
    if (searchText.length > 2) {
      try {
        const contacts = await spService.findUsersByName(searchText, deptName);
        setContactList(contacts);
      } catch (error) {
        console.error("Error searching contacts:", error);
      }
    } else {
      setContactList([]);
    }
  };

  /**
   * Handles contact selection
   * @param contact Contact
   */
  const handleContactSelect = (contact: any) => {
    if (contact) {
      setVisitor(prev => ({
        ...prev,
        EmpNo: contact.EmpNo,
        DirectNo: contact.DirectNo,
        LocalNo: contact.LocalNo,
        Position: contact.Position
      }));

      // Clear error
      setErrors(prev => ({ ...prev, EmpNo: '' }));
    } else {
      setVisitor(prev => ({
        ...prev,
        EmpNo: '',
        DirectNo: '',
        LocalNo: '',
        Position: ''
      }));
      setContactList([]);
    }
  };

  /**
   * Handles date change
   * @param date Date
   * @param name Field name
   */
  const handleDateChange = (date: Date, name: string) => {
    const updatedVisitor = { ...visitor };
    updatedVisitor[name] = date;
    setVisitor(updatedVisitor);

    // Validate dates
    if (name === 'DateTimeVisit') {
      if (date > visitor.DateTimeArrival) {
        setErrors(prev => ({ ...prev, DateTimeVisit: 'From Date should be earlier than To Date' }));
      } else {
        setErrors(prev => ({ ...prev, DateTimeVisit: '' }));
      }
    } else if (name === 'DateTimeArrival') {
      if (visitor.DateTimeVisit > date) {
        setErrors(prev => ({ ...prev, DateTimeArrival: 'From Date should be earlier than To Date' }));
      } else {
        setErrors(prev => ({ ...prev, DateTimeArrival: '' }));
      }
    }
  };

  /**
   * Handles files change
   * @param files Files
   */
  const handleFilesChange = (files: File[]) => {
    setVisitor(prev => ({ ...prev, Files: files }));
  };

  /**
   * Handles add visitor
   * @param visitorDetails Visitor details
   */
  const handleAddVisitor = (visitorDetails: IVisitorDetails) => {
    setVisitorDetailsList([...visitorDetailsList, visitorDetails]);
    setErrors(prev => ({ ...prev, Details: '' }));
  };

  /**
   * Handles edit visitor
   * @param visitorDetails Visitor details
   * @param index Index
   */
  const handleEditVisitor = (visitorDetails: IVisitorDetails, index: number) => {
    const updatedList = [...visitorDetailsList];
    updatedList[index] = visitorDetails;
    setVisitorDetailsList(updatedList);
  };

  /**
   * Handles delete visitor
   * @param index Index
   */
  const handleDeleteVisitor = (index: number) => {
    const updatedList = [...visitorDetailsList];
    updatedList.splice(index, 1);
    setVisitorDetailsList(updatedList);

    if (updatedList.length === 0) {
      setErrors(prev => ({ ...prev, Details: 'Visitor Details are required. Please add visitor names.' }));
    }
  };

  /**
   * Handles save
   */
  const handleSave = () => {
    setSubmitType(1);
    setDialogMessage("Do you want to save and exit?");
    setDialogOpen(true);
  };

  /**
   * Handles submit
   */
  const handleSubmit = () => {
    setSubmitType(2);
    setDialogMessage("Do you want to submit this form?");
    setDialogOpen(true);
  };

  /**
   * Handles cancel
   */
  const handleCancel = () => {
    setDialogMessage("Do you want to discard changes and exit?");
    setDialogOpen(true);
  };

  /**
   * Handles dialog close
   * @param confirmed Whether the action was confirmed
   */
  const handleDialogClose = (confirmed: boolean) => {
    setDialogOpen(false);

    if (confirmed) {
      if (dialogMessage.includes("save") || dialogMessage.includes("submit")) {
        saveVisitor();
      } else if (dialogMessage.includes("discard")) {
        window.open(props.siteUrl, "_self");
      }
    }
  };

  /**
   * Saves the visitor
   */
  const saveVisitor = async () => {
    // Validate form
    const validation = validateVisitorForm(visitor, visitorDetailsList, submitType);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setProgress(true);

    try {
      // Get building location code
      const bldg = bldgList.find(b => b.Title === visitor.Bldg);
      let locationCode = '';

      if (bldg) {
        locationCode = bldg.LocationCode;
      }

      // Create request number if submitting
      let generatedRefNo = refNo; // Use existing refNo or generate new
      if (submitType === 2) {
        generatedRefNo = await spService.createRequestNo(locationCode); // Generate new Ref No
        setRefNo(generatedRefNo); // Update state with the newly generated Ref No
        console.log("saveVisitor: Generated RefNo:", generatedRefNo); // DEBUG LOG
      }

      // Save visitor
      const itemId = await spService.saveVisitor(visitor, visitorDetailsList, submitType, generatedRefNo); // Pass the potentially new refNo
      setItemId(itemId);
      console.log("saveVisitor: Visitor saved with Item ID:", itemId); // DEBUG LOG


      // Send email if submitting
      if (submitType === 2) {
        await emailService.sendApprovalEmail(
          generatedRefNo, // Use the generatedRefNo for the email
          visitor.Purpose,
          itemId,
          approverDetails.email,
          approverDetails.name,
          isEncoder
        );
        console.log("saveVisitor: Approval email sent."); 

        if (spService) { // Check if spService is available
            const currentUserEmail = props.context.pageContext.user.email;
            console.log(`saveVisitor: Attempting to update privacy consent for ${currentUserEmail} with RefNo: ${generatedRefNo}`);
            await spService.updatePrivacyConsentRefNo(currentUserEmail, generatedRefNo);
            console.log("saveVisitor: Privacy consent update initiated.");
        }

      }

      setSavingDone(true);

      // Redirect after 1 second
      setTimeout(() => {
        window.open(props.siteUrl, "_self");
      }, 1000);
    } catch (error) {
      console.error("Error saving visitor or updating consent:", error);
      setProgress(false);
    }
  };

  if (isLoading) {
    console.log("Render: Currently isLoading. Showing CircularProgress.");
    return (
      <Backdrop className={classes.backdrop} open={true}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  console.log(`Render: isLoading=false. Checking showPrivacyModal=${showPrivacyModal}, privacyConsentGiven=${privacyConsentGiven}`); // DEBUG LOG
  if (showPrivacyModal && !privacyConsentGiven) {
    console.log("Render: Conditions met for PrivacyModal. Displaying PrivacyModal."); // DEBUG LOG
    return (
      <PrivacyModal
        onAccept={handlePrivacyAccept}
        onDecline={handlePrivacyDecline}
        context={props.context}
        refNo={refNo} 
      />
    );
  }

  if (!privacyConsentGiven) {
    console.log("Render: Privacy consent not given AND showPrivacyModal is false. This state should ideally be avoided."); // DEBUG LOG
    return null;
  }


  console.log("Render: Privacy consent given. Displaying main form.");
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
              <ActionButtonsSection
                onSave={handleSave}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </Grid>
          </Grid>
        </Container>

        <ConfirmationDialog
          open={dialogOpen}
          title="Confirmation"
          message={dialogMessage} // Display the specific message set by handleSave/Submit/Cancel
          onClose={handleDialogClose}
        />

        <Backdrop className={classes.backdrop} open={isProgress}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {/* Display the RefNo in the Snackbar */}
        <Snackbar open={isSavingDone} autoHideDuration={2000}>
          <Alert severity="success">
            Data has been saved successfully.
            {/* Display Ref No only if it was a 'Submit' action (submitType === 2) and refNo exists */}
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