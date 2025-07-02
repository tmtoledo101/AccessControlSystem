import { useState, useCallback } from 'react';
import { IEmployeeDetails, IEmployeeDetailsErrors } from '../models/IEmployeeDetails';
import { validateEmployeeDetailsField } from '../utils/validationUtils';
import moment from 'moment';
import { SharePointService } from '../services/SharePointService';

/**
 * Custom hook for managing employee details
 * @param initialState Initial employee details state
 * @returns Employee details state and handlers
 */
export const useEmployeeDetails = (
  initialState: IEmployeeDetails
) => {
  const [detailsData, setDetailsData] = useState<IEmployeeDetails>(initialState);
  const [detailsList, setDetailsList] = useState<IEmployeeDetails[]>([]);
  const [errors, setErrors] = useState<IEmployeeDetailsErrors>({
    TimeFrom: '',
    TimeTo: '',
    OtherSource: '',
    EmpNo: '',
    Etype: '',
    Title: ''
  });
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [contactList, setContactList] = useState<any[]>([]);
  const [outsourceList, setOutsourceList] = useState<any[]>([]);
  const [isAutocompleteOpen, setAutocompleteOpen] = useState<boolean>(false);

  /**
   * Handles text input changes
   * @param e The change event
   */
  const handleChangeTxt = useCallback((e) => {
    const { name, value } = e.target;
    const updatedData = { ...detailsData };
    updatedData[name] = value;
    
    if (name === 'Etype') {
      updatedData.EmpNo = '';
      updatedData.Title = '';
      setContactList([]);
      setOutsourceList([]);
    }
    
    setDetailsData(updatedData);
    
    // Validate the field
    const errorMessage = validateEmployeeDetailsField(name, value, detailsData);
    const updatedErrors = { ...errors, [name]: errorMessage };
    setErrors(updatedErrors);
  }, [detailsData, errors]);

  /**
   * Handles dropdown changes
   * @param e The change event
   */
  const handleChangeCbo = useCallback((e) => {
    const { name, value } = e.target;
    const updatedData = { ...detailsData };
    
    if (name === 'OtherSource') {
      updatedData[name] = value;
      updatedData.EmpNo = '';
      updatedData.Title = '';
      setContactList([]);
      setOutsourceList([]);
    } else {
      updatedData[name] = value;
    }
    
    setDetailsData(updatedData);
    
    // Validate the field
    const errorMessage = validateEmployeeDetailsField(name, value, detailsData);
    const updatedErrors = { ...errors, [name]: errorMessage };
    setErrors(updatedErrors);
  }, [detailsData, errors]);

  /**
   * Handles time changes
   * @param time The new time
   * @param name The field name
   */
  const onTimeChange = useCallback((time, name) => {
    const updatedData = { ...detailsData };
    updatedData[name] = time;
    setDetailsData(updatedData);
    
    // Validate the field
    const errorMessage = validateEmployeeDetailsField(name, time, detailsData);
    const updatedErrors = { ...errors, [name]: errorMessage };
    setErrors(updatedErrors);
  }, [detailsData, errors]);

  /**
   * Handles autocomplete selection
   * @param event The event
   * @param value The selected value
   */
  const handleAutocompleteSelection = useCallback((event, value) => {
    const updatedData = { ...detailsData };
    
    if (value) {
      if (detailsData.Etype === 'BSP') {
        updatedData.EmpNo = value.EmpNo;
        updatedData.Title = value.Name;
      } else {
        updatedData.EmpNo = value.Id.toString();
        updatedData.Title = value.Title;
      }
      
      // Validate the field
      const errorMessage = validateEmployeeDetailsField('EmpNo', updatedData.EmpNo, detailsData);
      const updatedErrors = { ...errors, EmpNo: errorMessage };
      setErrors(updatedErrors);
    } else {
      updatedData.EmpNo = "";
      
      if (detailsData.Etype === 'BSP') {
        setContactList([]);
      } else {
        setOutsourceList([]);
      }
      
      // Validate the field
      const errorMessage = validateEmployeeDetailsField('EmpNo', "", detailsData);
      const updatedErrors = { ...errors, EmpNo: errorMessage };
      setErrors(updatedErrors);
    }
    
    setDetailsData(updatedData);
  }, [detailsData, errors]);

  /**
   * Searches for employees or outsource personnel
   * @param e The change event
   */
  const findUser = useCallback(async (e) => {
    const searchText = e.target.value;
    const updatedData = { ...detailsData };
    
    updatedData.EmpNo = "";
    updatedData.Title = "";
    setDetailsData(updatedData);
    
    if (searchText.length > 2) {
      if (detailsData.Etype === 'BSP') {
        const options = await SharePointService.searchEmployees(searchText, detailsData['deptName']);
        setContactList(options);
      } else {
        const options = await SharePointService.searchOutsource(searchText, detailsData['deptId'], detailsData.OtherSource);
        setOutsourceList(options);
      }
    } else if (searchText.length < 3) {
      if (detailsData.Etype === 'BSP') {
        setContactList([]);
      } else {
        setOutsourceList([]);
      }
    }
  }, [detailsData]);

  /**
   * Adds or updates an employee detail
   */
  const addOrUpdateDetail = useCallback(() => {
    if (mode === 'add') {
      setDetailsList([...detailsList, detailsData]);
      // We'll handle the Details error in the parent component
    } else {
      const updatedList = [...detailsList];
      updatedList[selectedIndex] = { ...detailsData };
      setDetailsList(updatedList);
    }
  }, [mode, detailsData, detailsList, selectedIndex]);

  /**
   * Opens the dialog to add a new employee detail
   * @param deptId The department ID
   * @param deptName The department name
   */
  const openAddDialog = useCallback((deptId: number, deptName: string) => {
    if (!deptId) {
      alert('Please select a department before adding employees!');
      return;
    }
    
    setMode('add');
    
    const newDetail: IEmployeeDetails = {
      ID: null,
      ParentId: null,
      Title: '',
      EmpNo: '',
      Etype: 'BSP',
      OtherSource: '',
      Files: [],
      initFiles: [],
      origFiles: [],
    TimeFrom: detailsList.length === 0 
        ? new Date(moment().startOf('day').toISOString()) 
        : new Date(moment(detailsList[detailsList.length - 1].TimeFrom).toISOString()),
    TimeTo: detailsList.length === 0 
        ? new Date(moment().startOf('day').toISOString()) 
        : new Date(moment(detailsList[detailsList.length - 1].TimeTo).toISOString())
    };
    
    // Add department info for reference (not part of the interface)
    newDetail['deptId'] = deptId;
    newDetail['deptName'] = deptName;
    
    setDetailsData(newDetail);
    setOpenDialog(true);
  }, [detailsList]);

  /**
   * Opens the dialog to edit an employee detail
   * @param detail The employee detail to edit
   * @param index The index of the detail in the list
   * @param deptId The department ID
   * @param deptName The department name
   */
  const openEditDialog = useCallback((detail: IEmployeeDetails, index: number, deptId: number, deptName: string) => {
    setMode('edit');
    setSelectedIndex(index);
    
    const detailToEdit = { ...detail };
    
    // Add department info for reference (not part of the interface)
    detailToEdit['deptId'] = deptId;
    detailToEdit['deptName'] = deptName;
    
    setDetailsData(detailToEdit);
    setOpenDialog(true);
  }, []);

  /**
   * Deletes an employee detail
   * @param index The index of the detail to delete
   */
  const deleteDetail = useCallback((index: number) => {
    const updatedList = [...detailsList];
    updatedList.splice(index, 1);
    setDetailsList(updatedList);
    
    // We'll handle the Details error in the parent component
  }, [detailsList]);

  return {
    detailsData,
    setDetailsData,
    detailsList,
    setDetailsList,
    errors,
    setErrors,
    mode,
    setMode,
    openDialog,
    setOpenDialog,
    selectedIndex,
    setSelectedIndex,
    contactList,
    setContactList,
    outsourceList,
    setOutsourceList,
    isAutocompleteOpen,
    setAutocompleteOpen,
    handleChangeTxt,
    handleChangeCbo,
    onTimeChange,
    handleAutocompleteSelection,
    findUser,
    addOrUpdateDetail,
    openAddDialog,
    openEditDialog,
    deleteDetail
  };
};
