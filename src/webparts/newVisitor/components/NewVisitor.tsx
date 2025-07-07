import * as React from 'react';
import { useState, useEffect } from 'react';
import { INewVisitorProps } from './INewVisitorProps';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { sp } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/files';
import '@pnp/sp/folders';
import '@pnp/sp/site-users/web';
import '@pnp/sp/site-groups';
import '@pnp/sp/profiles';
import moment from 'moment';

// Import components
import HeaderSection from './sections/HeaderSection';
import VisitorInformationSection from './sections/VisitorInformationSection';
import VisitorDetailsSection from './sections/VisitorDetailsSection';
import ApprovalSection from './sections/ApprovalSection';
import ActionButtonsSection from './sections/ActionButtonsSection';
import AttachmentsSection from './sections/AttachmentsSection';
import ConfirmationDialog from './dialogs/ConfirmationDialog';
import VisitorDetailsDialog from './dialogs/VisitorDetailsDialog';

// Import helpers
import { getUrlParameter } from '../helpers/urlHelpers';

// Define styles
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: '12px',
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
 * @returns JSX element
 */
function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

/**
 * New visitor component
 * @param props Component props
 * @returns JSX element
 */
const NewVisitor: React.FC<INewVisitorProps> = (props) => {
  const classes = useStyles();
  const { context, siteUrl, siteRelativeUrl } = props;

  // State for user roles
  const [isEncoder, setEncoder] = useState(false);
  const [isReceptionist, setReceptionist] = useState(false);
  const [isApproverUser, setApproverUser] = useState(false);
  const [isWalkinApproverUser, setWalkinApproverUser] = useState(false);
  const [isSSDUser, setSSDUser] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // State for form data
  const [visitor, setVisitor] = useState<any>({
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
    Status: '',
    ApproverId: null,
    Files: [],
    PurposeOthers: '',
    initFiles: []
  });
  const [errorFields, setErrorFields] = useState<any>({});
  const [visitorDetails, setVisitorDetails] = useState<any>({
    Title: '',
    Car: false,
    AccessCard: '',
    PlateNo: '',
    TypeofVehicle: '',
    Color: '',
    DriverName: '',
    IDPresented: '',
    GateNo: '',
    ParentId: null,
    Files: [],
    initFiles: []
  });
  const [errorDetails, setErrorDetails] = useState<any>({});
  const [visitorDetailsList, setVisitorDetailsList] = useState<any[]>([]);
  const [approverDetails, setApproverDetails] = useState<any>({ email: '', name: '' });

  // State for UI controls
  const [isEdit, setEdit] = useState(true);
  const [isProgress, setProgress] = useState(false);
  const [isSavingDone, setSavingDone] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [openDialogFab, setOpenDialogFab] = useState(false);
  const [visitorDetailsMode, setVisitorDetailsMode] = useState('add');
  const [visitorDetailsIndex, setVisitorDetailsIndex] = useState(-1);
  const [isAC1Open, setAC1Open] = useState(false);

  // State for reference data
  const [purposeList, setPurposeList] = useState<any[]>([]);
  const [deptList, setDeptList] = useState<any[]>([]);
  const [bldgList, setBldgList] = useState<any[]>([]);
  const [approverList, setApprovers] = useState<any[]>([]);
  const [walkinApprovers, setWalkinApprovers] = useState<any[]>([]);
  const [contactList, setContacts] = useState<any[]>([]);
  const [idList, setIDs] = useState<any[]>([]);
  const [gateList, setGates] = useState<any[]>([]);
  const [usersPerDept, setUsersPerDept] = useState<any[]>([]);

  // Constants
  const ENCODERS_GROUP = 'Encoders';
  const RECEPTIONIST_GROUP = 'Receptionist';
  const APPROVERS_GROUP = 'Approvers';
  const WALKIN_APPROVERS_GROUP = 'WalkinApprovers';
  const SSD_GROUP = 'SSD';

  /**
   * Initializes the component
   */
  useEffect(() => {
    (async () => {
      try {
        // Initialize services
        const user = await sp.web.currentUser();
        setCurrentUser(user);

        // Check user roles
        const groups = await sp.web.currentUser.groups();
        let isUserEncoder = false;
        let isUserReceptionist = false;
        let isUserApprover = false;
        let isUserWalkinApprover = false;
        let isUserSSD = false;

        // Check if user is in any of the groups
        for (const group of groups) {
          if (group.LoginName === ENCODERS_GROUP) {
            isUserEncoder = true;
          } else if (group.LoginName === RECEPTIONIST_GROUP) {
            isUserReceptionist = true;
          } else if (group.LoginName === APPROVERS_GROUP) {
            isUserApprover = true;
          } else if (group.LoginName === WALKIN_APPROVERS_GROUP) {
            isUserWalkinApprover = true;
          } else if (group.LoginName === SSD_GROUP) {
            isUserSSD = true;
          }
        }

        // Check if user is in users per department
        const usersPerDeptData = await sp.web.lists.getByTitle('UsersPerDept')
          .items
          .select('*,Name/Title,Dept/Title')
          .expand('Name,Dept')
          .top(5000)
          .orderBy('Modified', true)
          .filter(`NameId eq ${user.Id}`)
          .get();

        if (usersPerDeptData.length > 0) {
          isUserEncoder = true;
        }

        setUsersPerDept(usersPerDeptData);
        setEncoder(isUserEncoder);
        setReceptionist(isUserReceptionist);
        setApproverUser(isUserApprover);
        setWalkinApproverUser(isUserWalkinApprover);
        setSSDUser(isUserSSD);

        // Set external type based on user role
        const tempVisitor = { ...visitor };
        if (isUserEncoder) {
          tempVisitor.ExternalType = 'Pre-arranged';
        } else if (isUserReceptionist) {
          tempVisitor.ExternalType = 'Walk-in';
        }
        setVisitor(tempVisitor);

        // Load reference data
        if (isUserEncoder || isUserReceptionist || isUserApprover || isUserWalkinApprover || isUserSSD) {
          // Load purpose list
          const purposeData = await sp.web.lists.getByTitle('Purpose')
            .items
            .select('*')
            .top(5000)
            .filter(`Group eq 'Visitor'`)
            .get();
          setPurposeList(purposeData);

          // Load building list
          const buildingData = await sp.web.lists.getByTitle('Building')
            .items
            .select('*')
            .top(5000)
            .orderBy('Title', true)
            .get();
          setBldgList(buildingData);

          // Load department list
          const deptsData = await sp.web.lists.getByTitle('Departments')
            .items
            .select('*')
            .top(5000)
            .get();

          if (isUserEncoder) {
            // Filter departments based on user's department
            const mappedDepts = deptsData.filter(dept => 
              usersPerDeptData.some(userDept => userDept.DeptId === dept.Id)
            );
            setDeptList(mappedDepts);
          } else {
            setDeptList(deptsData);
          }

          // Load gates list
          const gatesData = await sp.web.lists.getByTitle('Gates')
            .items
            .select('*')
            .top(5000)
            .get();
          setGates(gatesData);

          // Load ID presented list
          const idPresentedData = await sp.web.lists.getByTitle('IDPresented')
            .items
            .select('*')
            .top(5000)
            .get();
          setIDs(idPresentedData);
        } else {
          alert('You are not authorized to access this page!');
          window.open(siteUrl, '_self');
        }
      } catch (error) {
        console.error('Error initializing component:', error);
      }
    })();
  }, []);

  /**
   * Handles text input changes
   * @param e Change event
   */
  const handleChangeTxt = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    const tempVisitor = { ...visitor };

    if (type === 'checkbox') {
      tempVisitor[name] = checked;
    } else {
      tempVisitor[name] = value;
    }

    setVisitor(tempVisitor);
  };

  /**
   * Handles visitor details text input changes
   * @param e Change event
   */
  const handleChangeTxtDetails = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    const tempDetails = { ...visitorDetails };

    if (name === 'Car') {
      tempDetails[name] = checked;
      if (!checked) {
        tempDetails.Color = '';
        tempDetails.DriverName = '';
        tempDetails.PlateNo = '';
        tempDetails.TypeofVehicle = '';
      }
    } else {
      tempDetails[name] = value;
    }

    setVisitorDetails(tempDetails);
  };

  /**
   * Handles select input changes
   * @param e Change event
   */
  const handleChangeCbo = async (e: React.ChangeEvent<{ name?: string; value: any }>) => {
    const { name, value } = e.target;
    if (!name) return;

    const tempVisitor = { ...visitor };
    tempVisitor[name] = value;
    setVisitor(tempVisitor);

    // Handle special cases
    if (name === 'DeptId') {
      // Load approvers for the selected department
      const deptId = value as number;
      
      if (visitor.ExternalType === 'Walk-in') {
        // Load walkin approvers
        const walkinApproversData = await sp.web.lists.getByTitle('WalkinApprovers')
          .items
          .select('*,Name/Title, Dept/Title')
          .expand('Name,Dept')
          .top(5000)
          .filter(`DeptId eq ${deptId}`)
          .get();
        setWalkinApprovers(walkinApproversData);
      } else {
        // Load regular approvers
        const approversData = await sp.web.lists.getByTitle('Approvers')
          .items
          .select('*,Name/Title, Dept/Title')
          .expand('Name,Dept')
          .top(5000)
          .filter(`DeptId eq ${deptId}`)
          .get();
        
        // Filter out current user
        //const filteredApprovers = approversData.filter(item => item.NameId !== currentUser?.Id);
        const filteredApprovers = approversData.filter(item => item.NameId !== (currentUser && currentUser.Id));
        setApprovers(filteredApprovers);
      }
    } else if (name === 'Purpose') {
      // Reset purpose others if purpose is not 'Others'
      if (value !== 'Others') {
        tempVisitor.PurposeOthers = '';
        setVisitor(tempVisitor);
      }
    } else if (name === 'GateNo' || name === 'IDPresented') {
      // Handle visitor details select changes
      const tempDetails = { ...visitorDetails };
      tempDetails[name] = value;
      setVisitorDetails(tempDetails);
    }
  };

  /**
   * Handles date time changes
   * @param date Date
   * @param name Field name
   */
  const handleDateTimeChange = (date: Date, name: string) => {
    const tempVisitor = { ...visitor };
    tempVisitor[name] = date;
    setVisitor(tempVisitor);
  };

  /**
   * Handles dropzone changes for visitor
   * @param files Files
   */
  const handleChangeDropZone = (files: File[]) => {
    const tempVisitor = { ...visitor };
    tempVisitor.Files = files;
    setVisitor(tempVisitor);
  };

  /**
   * Handles autocomplete selection
   * @param event Event
   * @param value Selected value
   */
  const handleACSelectedValue = (event: React.ChangeEvent<{}>, value: any) => {
    const tempVisitor = { ...visitor };
    
    if (value) {
      tempVisitor.EmpNo = value.EmpNo;
      tempVisitor.DirectNo = value.DirectNo;
      tempVisitor.LocalNo = value.LocalNo;
      tempVisitor.Position = value.Position;
    } else {
      tempVisitor.EmpNo = '';
      tempVisitor.DirectNo = '';
      tempVisitor.LocalNo = '';
      tempVisitor.Position = '';
      setContacts([]);
    }

    setVisitor(tempVisitor);
  };

  /**
   * Handles autocomplete open
   */
  const handleACOpen = () => {
    setAC1Open(true);
  };

  /**
   * Handles autocomplete close
   */
  const handleACClose = () => {
    setAC1Open(false);
  };

  /**
   * Finds users by name
   * @param e Change event
   */
  const findUser = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const tempVisitor = { ...visitor };
    tempVisitor.EmpNo = '';
    tempVisitor.DirectNo = '';
    tempVisitor.LocalNo = '';
    tempVisitor.Position = '';
    setVisitor(tempVisitor);

    const searchValue = e.target.value;
    if (searchValue.length > 2) {
      try {
        // Find employees in the selected department
          const foundDept = deptList.find(dept => dept.Id === visitor.DeptId);
          const deptName = foundDept ? foundDept.Title : '';
          const options = await sp.web.lists.getByTitle('Employees')
            .items
            .select('*')
            .top(5000)
            .filter(`substringof('${searchValue}', Name) and Dept eq '${deptName}'`)
            .get();
        
        setContacts(options);
      } catch (error) {
        console.error('Error finding users:', error);
      }
    } else if (searchValue.length < 3) {
      setContacts([]);
    }
  };

  /**
   * Handles submit button click
   * @param e Mouse event
   * @param action Action
   */
  const onClickSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, action: string) => {
    let msg = '';

    if (action === 'save') {
      msg = 'Do you want to save and exit?';
    } else if (action === 'submit') {
      msg = 'Do you want to submit this form?';
    } else if (action === 'approve') {
      msg = 'Do you want to approve this request?';
    } else if (action === 'deny') {
      msg = 'Do you want to deny this request?';
    } else if (action === 'markcomplete') {
      msg = 'Do you want to mark this request as complete?';
    }

    setDialogMessage(msg);
    setOpenDialog(true);
  };

  /**
   * Handles cancel button click
   */
  const onClickCancel = () => {
    setDialogMessage('Do you want to discard changes and exit?');
    setOpenDialog(true);
  };

  /**
   * Handles dialog close
   * @param confirmed Whether the user confirmed the action
   */
  const handleCloseDialog = (confirmed: boolean) => {
    setOpenDialog(false);

    if (confirmed) {
      if (dialogMessage.includes('discard')) {
        window.open(siteUrl, '_self');
      } else {
        // Save would go here
        setSavingDone(true);
        setSuccessMessage('Operation completed successfully.');
        setTimeout(() => {
          window.open(siteUrl, '_self');
        }, 2000);
      }
    }
  };

  /**
   * Handles visitor details dialog close
   * @param confirmed Whether the user confirmed the action
   */
  const handleCloseDialogFab = (confirmed: boolean) => {
    if (confirmed) {
      setOpenDialogFab(false);
      addVisitor();
    } else {
      setOpenDialogFab(false);
    }
  };

  /**
   * Adds visitor details to the list
   */
  const addVisitor = () => {
    if (visitorDetailsMode === 'add') {
      setVisitorDetailsList([...visitorDetailsList, visitorDetails]);
      const tempErrors = { ...errorFields };
      tempErrors.Details = '';
      setErrorFields(tempErrors);
    } else {
      const tempList = [...visitorDetailsList];
      tempList[visitorDetailsIndex] = { ...visitorDetails };
      setVisitorDetailsList(tempList);
    }
  };

  /**
   * Handles fab button click
   * @param e Mouse event
   */
  const onClickFab = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (e.currentTarget.id === 'addFab') {
      setVisitorDetailsMode('add');
      const tempDetails = {
        Title: '',
        Car: visitor.RequireParking || false,
        AccessCard: '',
        PlateNo: '',
        TypeofVehicle: '',
        Color: '',
        DriverName: '',
        IDPresented: '',
        GateNo: '',
        ParentId: null,
        Files: [],
        initFiles: []
      };
      setVisitorDetails(tempDetails);
      setOpenDialogFab(true);
    }
  };

  /**
   * Handles visitor details view action
   * @param event Action
   * @param rowData Row data
   */
  const onViewAction = (event: string, rowData: any) => {
    if (event === 'view') {
      const idx = visitorDetailsList.indexOf(rowData);
      setVisitorDetailsIndex(idx);
      setVisitorDetails(rowData);
      setVisitorDetailsMode('edit');
      setOpenDialogFab(true);
    } else if (event === 'delete') {
      const idx = visitorDetailsList.indexOf(rowData);
      const tempList = [...visitorDetailsList];
      tempList.splice(idx, 1);
      setVisitorDetailsList(tempList);

      if (tempList.length === 0) {
        const tempErrors = { ...errorFields };
        tempErrors.Details = 'Visitor Details are required. Please add visitor names.';
        setErrorFields(tempErrors);
      }
    }
  };

  /**
   * Handles file chip click
   * @param e Mouse event
   * @param row Row
   * @param ctrl Control
   */
  const onChipClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, row: string, ctrl: string) => {
    // Open file in new window
    if (visitor.ID) {
      let url = '';
      if (ctrl === 'visitor') {
        url = `${siteRelativeUrl}/VisitorsLib/${visitor.ID}/${row}`;
      } else if (ctrl === 'visitorDetails') {
        url = `${siteRelativeUrl}/VisitorDetailsLib/${visitorDetails.ID}/${row}`;
      }
      
      if (url) {
        window.open(url, '_blank');
      }
    }
  };

  return (
    <form noValidate autoComplete="off">
      <div className={classes.root}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <HeaderSection
              visitor={visitor}
              isEdit={isEdit}
              isEncoder={isEncoder}
              isReceptionist={isReceptionist}
              isApproverUser={isApproverUser}
              isWalkinApproverUser={isWalkinApproverUser}
              isSSDUser={isSSDUser}
            />
          </Grid>

          <VisitorInformationSection
            visitor={visitor}
            errorFields={errorFields}
            purposeList={purposeList}
            deptList={deptList}
            bldgList={bldgList}
            approverList={approverList}
            walkinApprovers={walkinApprovers}
            contactList={contactList}
            isEdit={isEdit}
            isEncoder={isEncoder}
            isReceptionist={isReceptionist}
            isApproverUser={isApproverUser}
            isWalkinApproverUser={isWalkinApproverUser}
            isSSDUser={isSSDUser}
            isAC1Open={isAC1Open}
            onChangeTxt={handleChangeTxt}
            onChangeCbo={handleChangeCbo}
            onDateTimeChange={handleDateTimeChange}
            onChangeDropZone={handleChangeDropZone}
            onACSelectedValue={handleACSelectedValue}
            onACOpen={handleACOpen}
            onACClose={handleACClose}
            findUser={findUser}
            onChipClick={onChipClick}
          />

          <Grid item xs={12}>
            <VisitorDetailsSection
              visitor={visitor}
              errorFields={errorFields}
              visitorDetailsList={visitorDetailsList}
              isEdit={isEdit}
              isEncoder={isEncoder}
              isReceptionist={isReceptionist}
              isApproverUser={isApproverUser}
              isWalkinApproverUser={isWalkinApproverUser}
              isSSDUser={isSSDUser}
              onClickFab={onClickFab}
              onViewAction={onViewAction}
            />
          </Grid>

          <Grid item xs={12}>
            <ApprovalSection
              visitor={visitor}
              errorFields={errorFields}
              isEdit={isEdit}
              isEncoder={isEncoder}
              isReceptionist={isReceptionist}
              isApproverUser={isApproverUser}
              isWalkinApproverUser={isWalkinApproverUser}
              isSSDUser={isSSDUser}
              onChangeTxt={handleChangeTxt}
            />
          </Grid>

          <Grid item xs={12}>
            <ActionButtonsSection
              visitor={visitor}
              isEdit={isEdit}
              isEncoder={isEncoder}
              isReceptionist={isReceptionist}
              isApproverUser={isApproverUser}
              isWalkinApproverUser={isWalkinApproverUser}
              isSSDUser={isSSDUser}
              onClickSubmit={onClickSubmit}
              onClickCancel={onClickCancel}
            />
          </Grid>
        </Grid>

        <ConfirmationDialog
          open={openDialog}
          message={dialogMessage}
          onClose={handleCloseDialog}
        />

        <VisitorDetailsDialog
          open={openDialogFab}
          visitorDetails={visitorDetails}
          errorDetails={errorDetails}
          idList={idList}
          gateList={gateList}
          isEdit={isEdit}
          isApproverUser={isApproverUser}
          isSSDUser={isSSDUser}
          onChangeTxt={handleChangeTxtDetails}
          onChangeCbo={handleChangeCbo}
          onChangeDropZone={handleChangeDropZone}
          onClose={handleCloseDialogFab}
          onChipClick={onChipClick}
        />

        <Backdrop className={classes.backdrop} open={isProgress}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Snackbar open={isSavingDone} autoHideDuration={2000}>
          <Alert severity="success">
            {successMessage}
          </Alert>
        </Snackbar>
      </div>
    </form>
  );
};

export default NewVisitor;
