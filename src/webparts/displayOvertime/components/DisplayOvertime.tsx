import * as React from 'react';
import { useState, useEffect } from 'react';
import { Container, Grid, Backdrop, CircularProgress, Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { IDisplayOvertimeProps } from './IDisplayOvertimeProps';
import { HeaderSection } from './sections/HeaderSection';
import { RequestInfoSection } from './sections/RequestInfoSection';
import { EmployeeDetailsSection } from './sections/EmployeeDetailsSection';
import { ApprovalSection } from './sections/ApprovalSection';
import { AttachmentsSection } from './sections/AttachmentsSection';
import { ActionButtonsSection } from './sections/ActionButtonsSection';
import { ConfirmationDialog } from './dialogs/ConfirmationDialog';
import { EmployeeDetailsDialog } from './dialogs/EmployeeDetailsDialog';
import { useOvertimeRequest } from '../hooks/useOvertimeRequest';
import { useEmployeeDetails } from '../hooks/useEmployeeDetails';
import { useFormState } from '../hooks/useFormState';
import { IOvertimeRequest } from '../models/IOvertimeRequest';
import { IEmployeeDetails } from '../models/IEmployeeDetails';
import { STATUS } from '../constants/status';

// Styles
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      fontFamily: '"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
      padding: '12px'
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    }
  }),
);

/**
 * Alert component
 */
function Alert(props: any) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

/**
 * DisplayOvertime component
 */
export default function DisplayOvertime(props: IDisplayOvertimeProps) {
  const classes = useStyles();
  const { siteUrl, siteRelativeUrl } = props;

  // Custom hooks
  const {
    isLoading,
    requestId,
    currentUser,
    permissions,
    purposeList,
    buildingList,
    departmentList,
    approverList,
    ssdUsers,
    personnelTypeList,
    sourceUrl,
    loadData,
    handleDepartmentChange,
    saveRequest
  } = useOvertimeRequest(siteUrl, siteRelativeUrl);

  // Initial state for form data
  const initialFormState: IOvertimeRequest = {
    ID: null,
    Title: '',
    Purpose: '',
    DeptId: null,
    Dept: { Id: null, Title: '' },
    Bldg: '',
    Others: '',
    DateFrom: new Date(),
    DateTo: new Date(),
    Remarks1: '',
    Remarks2: '',
    SSDDate: null,
    DeptApproverDate: null,
    StatusId: STATUS.DRAFT,
    Status: { Id: null, Title: '' },
    ApproverId: null,
    Approver: { Title: '', EMail: '' },
    Files: [],
    initFiles: [],
    origFiles: [],
    SSDApproverId: null,
    SSDApprover: { Title: '', EMail: '' },
    RequestDate: new Date(),
    Author: { Title: '', EMail: '' },
    AuthorId: null
  };

  // Initial state for employee details
  const initialEmployeeDetailsState: IEmployeeDetails = {
    ID: null,
    ParentId: null,
    Title: '',
    EmpNo: '',
    Etype: 'BSP',
    OtherSource: '',
    TimeFrom: new Date(),
    TimeTo: new Date(),
    Files: [],
    initFiles: [],
    origFiles: []
  };

  // Form state hook
  const {
    formData,
    setFormData,
    errors,
    setErrors,
    isEdit,
    setEditMode,
    resetEditMode,
    action,
    setAction,
    dialogMessage,
    setDialogMessage,
    openDialog,
    setOpenDialog,
    isProgress,
    setProgress,
    isSavingDone,
    setSavingDone,
    modifiedDate,
    setModifiedDate,
    handleChangeTxt,
    handleChangeCbo,
    onDateChange,
    handleChangeDropZone,
    setActionAndMessage
  } = useFormState(initialFormState);

  // Employee details hook
  const {
    detailsData,
    setDetailsData,
    detailsList,
    setDetailsList,
    errors: detailsErrors,
    setErrors: setDetailsErrors,
    mode,
    setMode,
    openDialog: openEmployeeDialog,
    setOpenDialog: setOpenEmployeeDialog,
    selectedIndex,
    setSelectedIndex,
    contactList,
    setContactList,
    outsourceList,
    setOutsourceList,
    isAutocompleteOpen,
    setAutocompleteOpen,
    handleChangeTxt: handleChangeTxtDetails,
    handleChangeCbo: handleChangeCboDetails,
    onTimeChange,
    handleAutocompleteSelection,
    findUser,
    addOrUpdateDetail,
    openAddDialog,
    openEditDialog,
    deleteDetail
  } = useEmployeeDetails(initialEmployeeDetailsState);

  // State for deleted files
  const [deleteFiles, setDeleteFiles] = useState<any[]>([]);

  /**
   * Saves the request
   */
  const save = async () => {
    setProgress(true);

    try {
      const result = await saveRequest(formData, action, detailsList);

      if (result.success) {
        setSavingDone(true);

        // Redirect after a delay
        setTimeout(() => {
          let url = siteUrl;
          if (sourceUrl) {
            url = sourceUrl;
          }
          window.open(url, "_self");
        }, 1000);
      } else if (result.errors) {
        setErrors(result.errors);
        setProgress(false);
      } else if (result.error) {
        alert(result.error);
        setProgress(false);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving the request.");
      setProgress(false);
    }
  };

  /**
   * Validates employee details
   */
  const validateEmployeeDetails = () => {
    const updatedErrors = { ...detailsErrors };
    let isValid = true;

    // Required fields
    const requiredFields = ['EmpNo'];
    if (detailsData.Etype === 'Others') {
      requiredFields.push('OtherSource');
    }

    // Check required fields
    requiredFields.forEach(field => {
      if (!detailsData[field]) {
        updatedErrors[field] = "This is a required input field";
        isValid = false;
      }
    });

    // Check time validity
    if (detailsData.TimeFrom > detailsData.TimeTo) {
      updatedErrors.TimeFrom = "From Time should be earlier than To Time";
      isValid = false;
    }

    setDetailsErrors(updatedErrors);
    return isValid;
  };

  /**
   * Load data on component mount
   */
  useEffect(() => {
    const fetchData = async () => {
      const result = await loadData();

      if (result) {
        setFormData(result.request);
        setDetailsList(result.employeeDetails);
        setModifiedDate(result.request.Modified);
      }
    };

    fetchData();
  }, []);

  /**
   * Handles department change
   */
  const onDepartmentChange = async (e) => {
    const { value } = e.target;
    const deptName = await handleDepartmentChange(value);

    // Update department name in employee details
    const updatedDetailsData = { ...detailsData };
    updatedDetailsData['deptId'] = value;
    updatedDetailsData['deptName'] = deptName;
    setDetailsData(updatedDetailsData);

    // Call the original handler
    handleChangeCbo(e);
  };

  /**
   * Handles file change
   */
  const onFileChange = (files) => {
    const deletedFiles = handleChangeDropZone(files);
    setDeleteFiles(deletedFiles);
  };

  /**
   * Handles file click
   */
  const handleFileClick = (e, fileName) => {
    const fileUrl = `${siteUrl}/OvertimeLib/${requestId}/${fileName}`;

    let link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  /**
   * Handles dialog close
   */
  const handleDialogClose = async (confirmed: boolean) => {
    setOpenDialog(false);

    if (confirmed) {
      if (action === 'cancel') {
        let url = siteUrl;
        if (sourceUrl) {
          url = sourceUrl;
        }
        window.open(url, "_self");
      } else {
        await save(); // Now 'save' is defined
      }
    }
  };

  /**
   * Handles employee details dialog close
   */
  const handleEmployeeDialogClose = (shouldSave: boolean) => { // Renamed parameter
    setOpenEmployeeDialog(false);

    if (shouldSave) {
      if (validateEmployeeDetails()) { // Now 'validateEmployeeDetails' is defined
        addOrUpdateDetail();

        // Clear the details error if we have at least one employee
        if (detailsList.length === 0) {
          const updatedErrors = { ...errors };
          updatedErrors.Details = '';
          setErrors(updatedErrors);
        }
      }
    }
  };


  /**
   * Handles save action
   */
  const handleSave = () => {
    setActionAndMessage('savedraft');
  };

  /**
   * Handles submit action
   */
  const handleSubmit = () => {
    setActionAndMessage('submit');
  };

  /**
   * Handles approve action
   */
  const handleApprove = () => {
    setActionAndMessage('approve');
  };

  /**
   * Handles deny action
   */
  const handleDeny = () => {
    setActionAndMessage('deny');
  };

  /**
   * Handles cancel action
   */
  const handleCancel = () => {
    setActionAndMessage('cancel');
  };

  /**
   * Handles close action
   */
  const handleClose = () => {
    let url = siteUrl;
    if (sourceUrl) {
      url = sourceUrl;
    }
    window.open(url, "_self");
  };

  // If loading, show progress indicator
  if (isLoading) {
    return (
      <Backdrop className={classes.backdrop} open={true}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  // If no request ID, don't render anything
  if (!requestId) {
    return null;
  }

  return (
    <form noValidate autoComplete="off">
      <div className={classes.root}>
        <Container>
          <Grid container spacing={1}>
            {/* Header Section */}
            <HeaderSection
              title={formData.Title}
              permissions={permissions}
              statusId={formData.StatusId}
              isEditMode={isEdit}
              onEditClick={setEditMode}
            />

            {/* Request Info Section */}
            <RequestInfoSection
              formData={formData}
              errors={errors}
              permissions={permissions}
              statusId={formData.StatusId}
              isEditMode={isEdit}
              departmentList={departmentList}
              purposeList={purposeList}
              buildingList={buildingList}
              handleChangeTxt={handleChangeTxt}
              handleChangeCbo={onDepartmentChange}
              onDateChange={onDateChange}
            />

            {/* Attachments Section */}
            <AttachmentsSection
              files={formData.Files}
              initFiles={formData.initFiles}
              permissions={permissions}
              statusId={formData.StatusId}
              isEditMode={isEdit}
              siteUrl={siteUrl}
              itemId={requestId}
              handleChangeDropZone={onFileChange}
              handleChipClick={handleFileClick}
            />

            {/* Employee Details Section */}
            <EmployeeDetailsSection
              employeeDetails={detailsList}
              permissions={permissions}
              statusId={formData.StatusId}
              isEditMode={isEdit}
              departmentId={formData.DeptId}
              departmentName={formData.Dept && formData.Dept.Title}
              detailsError={errors.Details}
              onAddClick={openAddDialog}
              onViewClick={(detail, index) => openEditDialog(
                detail,
                index,
                formData.DeptId,
                formData.Dept && formData.Dept.Title
              )}
              onDeleteClick={deleteDetail}
            />

            {/* Approval Section */}
            <ApprovalSection
              formData={formData}
              errors={errors}
              permissions={permissions}
              statusId={formData.StatusId}
              isEditMode={isEdit}
              approverList={approverList}
              handleChangeTxt={handleChangeTxt}
              handleChangeCbo={handleChangeCbo}
            />

            {/* Action Buttons Section */}
            <ActionButtonsSection
              permissions={permissions}
              statusId={formData.StatusId}
              isEditMode={isEdit}
              onCancel={handleCancel}
              onSave={handleSave}
              onSubmit={handleSubmit}
              onApprove={handleApprove}
              onDeny={handleDeny}
              onClose={handleClose}
            />
          </Grid>
        </Container>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={openDialog}
          onClose={handleDialogClose}
          title="Confirmation"
          message={dialogMessage}
        />

        {/* Employee Details Dialog */}
        <EmployeeDetailsDialog
          open={openEmployeeDialog}
          onClose={handleEmployeeDialogClose}
          mode={mode}
          detailsData={detailsData}
          errors={detailsErrors}
          contactList={contactList}
          outsourceList={outsourceList}
          personnelTypeList={personnelTypeList}
          isAutocompleteOpen={isAutocompleteOpen}
          setAutocompleteOpen={setAutocompleteOpen}
          handleChangeTxt={handleChangeTxtDetails}
          handleChangeCbo={handleChangeCboDetails}
          onTimeChange={onTimeChange}
          handleAutocompleteSelection={handleAutocompleteSelection}
          findUser={findUser}
        />

        {/* Progress Backdrop */}
        <Backdrop className={classes.backdrop} open={isProgress}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {/* Success Snackbar */}
        <Snackbar open={isSavingDone} autoHideDuration={2000}>
          <Alert severity="success">
            Data has been saved successfully.
            {permissions.isEncoder && action === 'submit' && (
              <div>
                An email notification has been sent to approver {formData.Author && formData.Author.Title}.
              </div>
            )}
            {permissions.isApproverUser && formData.StatusId === STATUS.PENDING_DEPT_APPROVAL && action === 'approve' && (
              <div>
                An email notification has been sent to the SSD group.
              </div>
            )}
            {permissions.isWalkinApproverUser && formData.StatusId === STATUS.PENDING_DEPT_APPROVAL && action === 'approve' && (
              <div>
                An email notification has been sent to requestor {formData.Author && formData.Author.Title}.
              </div>
            )}
            {permissions.isSSDUser && formData.StatusId === STATUS.PENDING_SSD_APPROVAL && action === 'approve' && (
              <div>
                An email notification has been sent to requestor {formData.Author && formData.Author.Title}.
              </div>
            )}
            {action === 'deny' && (
              <div>
                An email notification has been sent to requestor {formData.Author && formData.Author.Title}.
              </div>
            )}
          </Alert>
        </Snackbar>
      </div>
    </form>
  );
}