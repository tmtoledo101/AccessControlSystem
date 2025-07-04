import { useState, useCallback } from 'react';
import { IOvertimeForm, IOvertimeFormErrors, defaultOvertimeForm, defaultOvertimeFormErrors } from '../models/IOvertimeForm';
import { validateForm, hasFormErrors } from '../utils/validationUtils';

/**
 * Form state hook
 * @returns Form state hook
 */
export const useFormState = () => {
  const [form, setForm] = useState<IOvertimeForm>(defaultOvertimeForm);
  const [errors, setErrors] = useState<IOvertimeFormErrors>(defaultOvertimeFormErrors);
  const [isSubmitMode, setSubmitMode] = useState<boolean>(false);

  /**
   * Handle text change
   * @param e Event
   */
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setForm(prevForm => ({
      ...prevForm,
      [name]: value
    }));
    
    // Clear error for this field
    setErrors(prevErrors => ({
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
      setForm(prevForm => ({
        ...prevForm,
        [name]: value
      }));
      
      // Clear error for this field
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  }, []);

  /**
   * Handle date change
   * @param date Date
   * @param name Field name
   */
  const handleDateChange = useCallback((date: Date, name: string) => {
    setForm(prevForm => ({
      ...prevForm,
      [name]: date
    }));
    
    // Clear error for this field
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: ''
    }));
  }, []);

  /**
   * Handle files change
   * @param files Files
   */
  const handleFilesChange = useCallback((files: File[]) => {
    setForm(prevForm => ({
      ...prevForm,
      Files: files
    }));
  }, []);

  /**
   * Validate form
   * @param submitMode Whether in submit mode
   * @param employeeCount Employee count
   * @returns Whether form is valid
   */
  const validateFormData = useCallback((submitMode: boolean, employeeCount: number): boolean => {
    const newErrors = validateForm(form, submitMode, employeeCount);
    setErrors(newErrors);
    return !hasFormErrors(newErrors);
  }, [form]);

  /**
   * Set submit mode
   * @param mode Submit mode
   */
  const setMode = useCallback((mode: boolean) => {
    setSubmitMode(mode);
  }, []);

  return {
    form,
    errors,
    isSubmitMode,
    handleTextChange,
    handleSelectChange,
    handleDateChange,
    handleFilesChange,
    validateFormData,
    setMode
  };
};
