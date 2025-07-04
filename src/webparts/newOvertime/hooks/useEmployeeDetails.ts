import { useState, useCallback } from 'react';
import { IOvertimeEmployee, IOvertimeEmployeeErrors, EmployeeMode, createDefaultOvertimeEmployee, defaultOvertimeEmployeeErrors } from '../models/IOvertimeEmployee';
import { validateEmployee, hasEmployeeErrors } from '../utils/validationUtils';

/**
 * Employee details hook
 * @param initialDateFrom Initial date from
 * @param initialDateTo Initial date to
 * @returns Employee details hook
 */
export const useEmployeeDetails = (initialDateFrom: Date, initialDateTo: Date) => {
  const [employees, setEmployees] = useState<IOvertimeEmployee[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<IOvertimeEmployee>(createDefaultOvertimeEmployee(initialDateFrom, initialDateTo));
  const [employeeErrors, setEmployeeErrors] = useState<IOvertimeEmployeeErrors>(defaultOvertimeEmployeeErrors);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<EmployeeMode>(EmployeeMode.Add);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [contactList, setContactList] = useState<any[]>([]);
  const [outsourceList, setOutsourceList] = useState<any[]>([]);
  const [detailsError, setDetailsError] = useState<string>('');

  /**
   * Handle text change
   * @param e Event
   */
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setCurrentEmployee(prevEmployee => {
      const updatedEmployee = {
        ...prevEmployee,
        [name]: value
      };
      
      // Reset employee number and title when changing employee type
      if (name === 'Etype') {
        updatedEmployee.EmpNo = '';
        updatedEmployee.Title = '';
        updatedEmployee.OtherSource = '';
      }
      
      return updatedEmployee;
    });
    
    // Clear error for this field
    setEmployeeErrors(prevErrors => ({
      ...prevErrors,
      [name]: ''
    }));
  }, []);

  /**
   * Handle select change
   * @param e Event
   */
  const handleSelectChange = useCallback((e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    
    if (name) {
      setCurrentEmployee(prevEmployee => {
        const updatedEmployee = {
          ...prevEmployee,
          [name]: value
        };
        
        // Reset employee number and title when changing other source
        if (name === 'OtherSource') {
          updatedEmployee.EmpNo = '';
          updatedEmployee.Title = '';
        }
        
        return updatedEmployee;
      });
      
      // Clear error for this field
      setEmployeeErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  }, []);

  /**
   * Handle time change
   * @param time Time
   * @param name Field name
   */
  const handleTimeChange = useCallback((time: Date, name: string) => {
    setCurrentEmployee(prevEmployee => ({
      ...prevEmployee,
      [name]: time
    }));
    
    // Clear error for this field
    setEmployeeErrors(prevErrors => ({
      ...prevErrors,
      [name]: ''
    }));
  }, []);

  /**
   * Handle employee select
   * @param event Event
   * @param value Value
   */
  const handleEmployeeSelect = useCallback((event: any, value: any) => {
    if (!value) {
      return;
    }
    
    setCurrentEmployee(prevEmployee => {
      const updatedEmployee = { ...prevEmployee };
      
      if (prevEmployee.Etype === 'BSP') {
        updatedEmployee.EmpNo = value.EmpNo;
        updatedEmployee.Title = value.Name;
      } else {
        updatedEmployee.EmpNo = value.Id.toString();
        updatedEmployee.Title = value.Title;
      }
      
      return updatedEmployee;
    });
    
    // Clear error for employee number
    setEmployeeErrors(prevErrors => ({
      ...prevErrors,
      EmpNo: ''
    }));
  }, []);

  /**
   * Add employee
   */
  const addEmployee = useCallback(() => {
    const isValid = validateEmployeeData();
    
    if (isValid) {
      if (dialogMode === EmployeeMode.Add) {
        setEmployees(prevEmployees => [...prevEmployees, currentEmployee]);
        clearDetailsError();
      } else {
        setEmployees(prevEmployees => {
          const updatedEmployees = [...prevEmployees];
          updatedEmployees[currentIndex] = currentEmployee;
          return updatedEmployees;
        });
      }
      
      closeDialog();
    }
  }, [currentEmployee, dialogMode, currentIndex]);

  /**
   * Delete employee
   * @param employee Employee
   * @param index Index
   */
  const deleteEmployee = useCallback((employee: IOvertimeEmployee, index: number) => {
    setEmployees(prevEmployees => {
      const updatedEmployees = [...prevEmployees];
      updatedEmployees.splice(index, 1);
      
      // Set details error if no employees left
      if (updatedEmployees.length === 0) {
        setDetailsError('Employee Details are required. Please add employees by clicking the (+) button.');
      }
      
      return updatedEmployees;
    });
  }, []);

  /**
   * Open add dialog
   */
  const openAddDialog = useCallback(() => {
    // Create a new employee with the latest time values if there are existing employees
    const newEmployee = employees.length > 0
      ? {
          ...createDefaultOvertimeEmployee(initialDateFrom, initialDateTo),
          TimeFrom: employees[employees.length - 1].TimeFrom,
          TimeTo: employees[employees.length - 1].TimeTo,
          Etype: employees[employees.length - 1].Etype,
          OtherSource: employees[employees.length - 1].OtherSource
        }
      : createDefaultOvertimeEmployee(initialDateFrom, initialDateTo);
    
    setCurrentEmployee(newEmployee);
    setEmployeeErrors(defaultOvertimeEmployeeErrors);
    setDialogMode(EmployeeMode.Add);
    setDialogOpen(true);
  }, [employees, initialDateFrom, initialDateTo]);

  /**
   * Open edit dialog
   * @param employee Employee
   * @param index Index
   */
  const openEditDialog = useCallback((employee: IOvertimeEmployee, index: number) => {
    setCurrentEmployee(employee);
    setEmployeeErrors(defaultOvertimeEmployeeErrors);
    setDialogMode(EmployeeMode.Edit);
    setCurrentIndex(index);
    setDialogOpen(true);
  }, []);

  /**
   * Close dialog
   */
  const closeDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  /**
   * Validate employee data
   * @returns Whether employee is valid
   */
  const validateEmployeeData = useCallback((): boolean => {
    const newErrors = validateEmployee(currentEmployee);
    setEmployeeErrors(newErrors);
    return !hasEmployeeErrors(newErrors);
  }, [currentEmployee]);

  /**
   * Set details error
   * @param error Error
   */
  const setEmployeeDetailsError = useCallback((error: string) => {
    setDetailsError(error);
  }, []);

  /**
   * Clear details error
   */
  const clearDetailsError = useCallback(() => {
    setDetailsError('');
  }, []);

  /**
   * Set contact list
   * @param contacts Contacts
   */
  const setContacts = useCallback((contacts: any[]) => {
    setContactList(contacts);
  }, []);

  /**
   * Set outsource list
   * @param outsource Outsource
   */
  const setOutsource = useCallback((outsource: any[]) => {
    setOutsourceList(outsource);
  }, []);

  return {
    employees,
    currentEmployee,
    employeeErrors,
    dialogOpen,
    dialogMode,
    contactList,
    outsourceList,
    detailsError,
    handleTextChange,
    handleSelectChange,
    handleTimeChange,
    handleEmployeeSelect,
    addEmployee,
    deleteEmployee,
    openAddDialog,
    openEditDialog,
    closeDialog,
    validateEmployeeData,
    setEmployeeDetailsError,
    clearDetailsError,
    setContacts,
    setOutsource
  };
};
