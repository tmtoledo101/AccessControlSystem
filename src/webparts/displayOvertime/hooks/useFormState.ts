import { useCallback, useState } from 'react';
import { IOvertimeRequest, IOvertimeRequestErrors } from '../models/IOvertimeRequest';
import { startOfDay } from '../utils/dateUtils';
import { validateOvertimeField } from '../utils/validationUtils';

/**
 * Custom hook for managing form state
 * @param initialState Initial form state
 * @returns Form state and handlers
 */
export const useFormState = (initialState: IOvertimeRequest) => {
  const [formData, setFormData] = useState<IOvertimeRequest>(initialState);
  const [errors, setErrors] = useState<IOvertimeRequestErrors>({
    Purpose: '',
    DeptId: '',
    Bldg: '',
    Others: '',
    DateFrom: '',
    DateTo: '',
    Title: '',
    ApproverId: '',
    Details: '',
    Remarks1: '',
    Remarks2: ''
  });
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [action, setAction] = useState<string>('');
  const [dialogMessage, setDialogMessage] = useState<string>('');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [isProgress, setProgress] = useState<boolean>(false);
  const [isSavingDone, setSavingDone] = useState<boolean>(false);
  const [modifiedDate, setModifiedDate] = useState<Date>(null);

  /**
   * Handles text input changes
   * @param e The change event
   */
  const handleChangeTxt = useCallback((e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData };
    
    if (name === 'RequireParking') {
      updatedFormData[name] = e.target.checked;
    } else {
      updatedFormData[name] = value;
    }
    
    setFormData(updatedFormData);
    
    // Validate the field
    const errorMessage = validateOvertimeField(name, value, formData);
    const updatedErrors = { ...errors, [name]: errorMessage };
    setErrors(updatedErrors);
  }, [formData, errors]);

  /**
   * Handles dropdown changes
   * @param e The change event
   */
  const handleChangeCbo = useCallback(async (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData };
    updatedFormData[name] = value;
    setFormData(updatedFormData);
    
    // Validate the field
    const errorMessage = validateOvertimeField(name, value, formData);
    const updatedErrors = { ...errors, [name]: errorMessage };
    setErrors(updatedErrors);
  }, [formData, errors]);

  /**
   * Handles date changes
   * @param date The new date
   * @param name The field name
   */
  const onDateChange = useCallback((date, name) => {
    const updatedFormData = { ...formData };
    updatedFormData[name] = startOfDay(date);
    setFormData(updatedFormData);
    
    // Validate the field
    const errorMessage = validateOvertimeField(name, date, formData);
    const updatedErrors = { ...errors, [name]: errorMessage };
    setErrors(updatedErrors);
  }, [formData, errors]);

  /**
   * Handles file changes
   * @param files The new files
   */
  const handleChangeDropZone = useCallback((files) => {
    const updatedFormData = { ...formData };
    updatedFormData.Files = files;
    setFormData(updatedFormData);
    
    // Track deleted files
    const deleteFiles = [];
    formData.origFiles.forEach(origFile => {
      const stillExists = files.some(file => file.name === origFile.Name);
      if (!stillExists) {
        const alreadyDeleted = deleteFiles.some(file => file.Name === origFile.Name);
        if (!alreadyDeleted) {
          deleteFiles.push(origFile);
        }
      }
    });
    
    return deleteFiles;
  }, [formData]);

  /**
   * Sets the form to edit mode
   */
  const setEditMode = useCallback(() => {
    setIsEdit(true);
  }, []);

  /**
   * Resets the form to view mode
   */
  const resetEditMode = useCallback(() => {
    setIsEdit(false);
  }, []);

  /**
   * Sets the action and dialog message
   * @param actionType The action type
   */
  const setActionAndMessage = useCallback((actionType: string) => {
    setAction(actionType);
    
    let message = "";
    switch (actionType) {
      case 'savedraft':
        message = "Do you want to save and exit?";
        break;
      case 'submit':
        message = "Do you want to submit this form?";
        break;
      case 'approve':
        message = "Do you want to approve this request?";
        break;
      case 'deny':
        message = "Do you want to deny this request?";
        break;
      case 'markcomplete':
        message = "Do you want to complete this request?";
        break;
      case 'cancel':
        message = "Do you want to discard changes and exit?";
        break;
      default:
        message = "";
    }
    
    setDialogMessage(message);
    setOpenDialog(true);
  }, []);

  return {
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
  };
};
