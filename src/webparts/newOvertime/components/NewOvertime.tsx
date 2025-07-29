import * as React from 'react';
import { useState, useEffect } from 'react';
import { INewOvertimeProps } from './INewOvertimeProps';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Grid, Backdrop, CircularProgress, Snackbar } from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { sp } from '@pnp/sp';
import { SPHttpClient } from '@microsoft/sp-http';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/profiles';
import '@pnp/sp/site-users/web';
import '@pnp/sp/site-groups';
import '@pnp/sp/regional-settings/web';
import '@pnp/sp/sputilities';
import moment from 'moment';

// Custom hooks
import { useFormState } from '../hooks/useFormState';
import { useEmployeeDetails } from '../hooks/useEmployeeDetails';

// Components
import { ConfirmationDialog } from './dialogs/ConfirmationDialog';
import { EmployeeDetailsDialog } from './dialogs/EmployeeDetailsDialog';
import { HeaderSection } from './sections/HeaderSection';
import { RequestInfoSection } from './sections/RequestInfoSection';
import { AttachmentsSection } from './sections/AttachmentsSection';
import { EmployeeDetailsSection } from './sections/EmployeeDetailsSection';
import { ApprovalSection } from './sections/ApprovalSection';
import { ActionButtonsSection } from './sections/ActionButtonsSection';

// Services
import { SharePointService } from '../services/SharePointService';
import { EmailService } from '../services/EmailService';
import { FileService } from '../services/FileService';

// Constants
const ENCODERS_GROUP = 'Encoders';
const RECEPTIONIST_GROUP = 'Receptionist';

// Styles
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
 * New overtime component
 * @param props Component props
 * @returns JSX element
 */
const NewOvertime: React.FC<INewOvertimeProps> = (componentProps) => { // Renamed 'props' to 'componentProps'
  const classes = useStyles();

  // Form state
  const {
    form,
    errors,
    isSubmitMode,
    handleTextChange,
    handleSelectChange,
    handleDateChange,
    handleFilesChange,
    validateFormData,
    setMode
  } = useFormState();

  // Employee details state
  const {
    employees, // This is the state variable 'employees'
    currentEmployee,
    employeeErrors,
    dialogOpen,
    dialogMode,
    contactList,
    outsourceList,
    detailsError,
    handleTextChange: handleEmployeeTextChange,
    handleSelectChange: handleEmployeeSelectChange,
    handleTimeChange,
    handleEmployeeSelect,
    addEmployee,
    deleteEmployee,
    openAddDialog,
    openEditDialog,
    closeDialog,
    setContacts,
    setOutsource,
    setEmployeeDetailsError
  } = useEmployeeDetails(form.DateFrom, form.DateTo);

  // Local state
  const [isEncoder, setIsEncoder] = useState<boolean>(false);
  const [isReceptionist, setIsReceptionist] = useState<boolean>(false);
  const [isProgress, setProgress] = useState<boolean>(false);
  const [isSavingDone, setSavingDone] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>('');

  // Data state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [purposeList, setPurpose] = useState<any[]>([]);
  const [deptList, setDept] = useState<any[]>([]);
  const [bldgList, setBldg] = useState<any[]>([]);
  const [approverList, setApprovers] = useState<any[]>([]);
  const [personnelTypeList, setPersonnel] = useState<any[]>([]);
  const [usersPerDept, setUsersPerDept] = useState<any[]>([]);
  const [approverDetails, setApproverDetails] = useState<{ email: string, name: string }>({ email: '', name: '' });
  const [deptName, setDeptName] = useState<string>('');
  const [itemId, setItemId] = useState<number>(0);
  const [refNo, setRefNo] = useState<string>('');
  const [submitMode, setSubmitMode] = useState<number>(1);

  /**
   * Initialize component
   */
  useEffect(() => {
    (async () => {
      try {
        // Get current user
        const user = await SharePointService.getCurrentUser();
        setCurrentUser(user);

        // Check user permissions
        const userPerDept = await SharePointService.getUsersPerDept(user.Id);

        if (userPerDept.length > 0) {
          setIsEncoder(true);
          setUsersPerDept(userPerDept);
        } else {
          alert('You are not authorized to access this page!');
          window.open(componentProps.siteUrl, '_self'); // Use componentProps
          return;
        }

        // Load reference data
        const purposes = await SharePointService.getPurposes();
        setPurpose(purposes);

        const buildings = await SharePointService.getBuildings();
        setBldg(buildings);

        const departments = await SharePointService.getDepartments();

        // Filter departments based on user permissions
        const filteredDepts = departments.filter(dept =>
          userPerDept.some(upd => upd.DeptId === dept.Id)
        );

        setDept(filteredDepts);

        const personnelTypes = await SharePointService.getPersonnelTypes();
        setPersonnel(personnelTypes);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [componentProps.siteUrl]); // Use componentProps in dependency array

  /**
   * Handle department change
   * @param e Event
   */
  const handleChangeCbo = async (e: React.ChangeEvent<{ name?: string; value: any }>) => {
    const { name, value } = e.target;

    if (name === 'DeptId' && value) {
      // Get department name
      const deptFiltered = deptList.filter(item => item.Id === value);
      if (deptFiltered.length > 0) {
        setDeptName(deptFiltered[0].Title);
      }

      // Get approvers for department
      const approvers = await SharePointService.getApprovers(value as number, currentUser.Id);
      setApprovers(approvers);
    } else if (name === 'ApproverId' && value) {
      // Get approver details
      const url = `${componentProps.siteUrl}/_api/web/siteusers?$top=5000&$filter=ID eq ${value}`; // Use componentProps
      const response = await componentProps.context.spHttpClient.get(url, SPHttpClient.configurations.v1); // Use componentProps
      const result = await response.json();

      if (result.value && result.value.length > 0) {
        setApproverDetails({
          email: result.value[0].Email,
          name: result.value[0].Title
        });
      }
    }

    handleSelectChange(e);
  };

  /**
   * Find user
   * @param e Event
   */
  const findUser = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchText = e.target.value;
    handleEmployeeTextChange(e);

    if (searchText.length > 2) {
      if (currentEmployee.Etype === 'BSP') {
        // Search BSP employees
        const foundEmployees = await SharePointService.getEmployees(searchText, deptName); // Renamed local variable
        setContacts(foundEmployees);
      } else {
        // Search outsource personnel
        const foundOutsource = await SharePointService.getOutsource(searchText, form.DeptId, currentEmployee.OtherSource); // Renamed local variable
        setOutsource(foundOutsource);
      }
    } else if (searchText.length < 3) {
      // Clear search results
      if (currentEmployee.Etype === 'BSP') {
        setContacts([]);
      } else {
        setOutsource([]);
      }
    }
  };

  /**
   * Send email notification
   */
  const sendEmail = async () => {
    if (isEncoder) {
      await EmailService.sendApprovalEmail(
        currentUser.Email,
        approverDetails.email,
        refNo,
        form.Purpose,
        componentProps.siteUrl, // Use componentProps
        itemId
      );
    } else if (isReceptionist) {
      await EmailService.sendConfirmationEmail(
        currentUser.Email,
        approverDetails.email,
        refNo,
        form.Purpose,
        componentProps.siteUrl, // Use componentProps
        itemId
      );
    }
  };

  /**
   * Save form
   */
  const save = async () => {
    setProgress(true);

    try {
      // Get building location code
      const bldgFiltered = bldgList.filter(item => item.Title === form.Bldg);
      const locationCode = bldgFiltered.length > 0 ? bldgFiltered[0].LocationCode : '';

      // Create request number if submitting
      if (submitMode === 2) {
        const requestNo = await SharePointService.createRequestNumber(locationCode);
        setRefNo(requestNo);
      }

      // Save overtime request
      const id = await SharePointService.saveOvertimeRequest(
        form,
        employees,
        submitMode === 2 ? refNo : '',
        submitMode === 2
      );

      setItemId(id);

      // Send email notification if submitting
      if (submitMode === 2) {
        await sendEmail();
      }

      setSavingDone(true);

      // Redirect after delay
      setTimeout(() => {
        window.open(componentProps.siteUrl, '_self'); // Use componentProps
      }, 1000);
    } catch (error) {
      console.error(error);
      setProgress(false);
    }
  };

  /**
   * Handle dialog close
   * @param e Event
   */
  const handleCloseDialog = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpenDialog(false);

    if ((dialogMessage.indexOf('submit') > 0) || (dialogMessage.indexOf('save') > 0)) {
      if (e.currentTarget.textContent === 'OK') {
        save();
      }
    } else if (dialogMessage.indexOf('discard') > 0) {
      if (e.currentTarget.textContent === 'OK') {
        window.open(componentProps.siteUrl, '_self'); // Use componentProps
      }
    }
  };

  /**
   * Handle submit click
   * @param e Event
   * @param action Action
   */
  const onClickSubmit = (e: React.MouseEvent<HTMLButtonElement> | null, action: string) => {
    let msg = '';

    if (action === 'save') {
      setSubmitMode(1);
      msg = 'Do you want to save and exit?';
    } else if (action === 'submit') {
      setSubmitMode(2);
      msg = 'Do you want to submit this form?';
    }

    const isValid = validateFormData(action === 'submit', employees.length);

    if (isValid) {
      setDialogMessage(msg);
      setOpenDialog(true);
    }
  };

  /**
   * Handle cancel click
   */
  const onClickCancel = () => {
    setDialogMessage('Do you want to discard changes and exit?');
    setOpenDialog(true);
  };

  /**
   * Handle fab click
   * @param e Event
   */
  const onClickFab = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.currentTarget.id === 'addFab') {
      if (form.DeptId) {
        openAddDialog();
      } else {
        alert('Please select a department before adding employees!');
      }
    }
  };

  /**
   * Handle employee dialog close
   * @param e Event
   */
  const handleCloseDialogFab = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.currentTarget.textContent === 'OK') {
      addEmployee();
    } else {
      closeDialog();
    }
  };

  /**
   * Handle view action
   * @param action Action
   * @param rowData Row data
   */
  const viewAction = (action: string, rowData: any) => {
    const index = employees.indexOf(rowData); // 'employees' is the state variable, not a shadowed param

    if (action === 'view') {
      openEditDialog(rowData, index);
    } else if (action === 'delete') {
      deleteEmployee(rowData, index);
    }
  };

  /**
   * Alert component
   * @param alertProps Alert props
   * @returns Alert component
   */
  function Alert(alertProps: AlertProps) { // Renamed 'props' to 'alertProps'
    return <MuiAlert elevation={6} variant="filled" {...alertProps} />;
  }

  return (
    <form noValidate autoComplete="off">
      <div className={classes.root} style={{ padding: '12px' }}>
        <Grid container spacing={1}>
          {/* Header */}
          <HeaderSection title="New Overtime / Overstay" />

          {/* Request Information */}
          <RequestInfoSection
            form={form}
            errors={errors}
            purposes={purposeList}
            departments={deptList}
            buildings={bldgList}
            onTextChange={handleTextChange}
            onSelectChange={handleChangeCbo}
            onDateChange={handleDateChange}
          />

          {/* Attachments */}
          <AttachmentsSection onFilesChange={handleFilesChange} />

          {/* Employee Details */}
          <HeaderSection title="Employee Details" />

          <EmployeeDetailsSection
            employees={employees}
            detailsError={detailsError}
            departmentId={form.DeptId}
            onAddClick={() => openAddDialog()}
            onViewClick={(employee, index) => viewAction('view', employee)}
            onDeleteClick={(employee, index) => viewAction('delete', employee)}
          />

          {/* Approval */}
          <ApprovalSection
            form={form}
            errors={errors}
            approvers={approverList}
            onSelectChange={handleChangeCbo}
          />

          {/* Action Buttons */}
          <ActionButtonsSection
            onCancelClick={() => onClickCancel()}
            onSaveClick={() => onClickSubmit(null, 'save')}
            onSubmitClick={() => onClickSubmit(null, 'submit')}
          />
        </Grid>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={openDialog}
          message={dialogMessage}
          onClose={(confirmed) => {
            setOpenDialog(false);
            if (confirmed) {
              if (dialogMessage.indexOf('discard') > 0) {
                window.open(componentProps.siteUrl, '_self'); // Use componentProps
              } else {
                save();
              }
            }
          }}
        />

        {/* Employee Details Dialog */}
        <EmployeeDetailsDialog
          open={dialogOpen}
          mode={dialogMode}
          employee={currentEmployee}
          errors={employeeErrors}
          personnelTypeList={personnelTypeList}
          contactList={contactList}
          outsourceList={outsourceList}
          onClose={closeDialog}
          onSave={addEmployee}
          onTextChange={handleEmployeeTextChange}
          onSelectChange={handleEmployeeSelectChange}
          onTimeChange={handleTimeChange}
          onEmployeeSelect={handleEmployeeSelect}
        />

        {/* Loading Backdrop */}
        <Backdrop className={classes.backdrop} open={isProgress}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {/* Success Snackbar */}
        <Snackbar open={isSavingDone} autoHideDuration={2000}>
          <Alert severity="success">
            Data has been saved successfully.
            {isEncoder && submitMode === 2 && (
              <div>
                An email notification has been sent to {approverDetails.name}.
              </div>
            )}
            {isReceptionist && submitMode === 2 && (
              <div>
                An email notification has been sent to {approverDetails.name}.
              </div>
            )}
          </Alert>
        </Snackbar>
      </div>
    </form>
  );
};

export default NewOvertime;