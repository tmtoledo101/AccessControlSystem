import * as React from 'react';
import { useState, useEffect } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import { IEmployeeDetails, IErrorDetails, EMPLOYEE_TYPES } from '../../models/IEmployeeDetails';
import { validateEmployeeDetailsInput, validateEmployeeDetailsSubmit } from '../../validations/formValidation';
import { formatDateTime } from '../../helpers/dateHelpers';

export interface IEmployeeDetailsDialogProps {
  open: boolean;
  mode: 'add' | 'edit';
  employeeDetails: IEmployeeDetails;
  departmentId: number;
  departmentName: string;
  personnelTypeList: any[];
  onClose: (confirmed: boolean, employeeDetails?: IEmployeeDetails) => void;
  onSearch: (searchTerm: string, employeeType: string, otherSource: string) => Promise<any[]>;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      fontFamily: '"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif'
    },
    paper: {
      padding: theme.spacing(1),
      borderColor: "transparent",
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 300,
    },
    dateField: {
      width: 300,
    },
    labeltop: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      fontSize: '12px',
      color: '#0000008A',
    },
    labelbottom: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      fontSize: '18px',
    },
    datelabel: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  }),
);

/**
 * Employee details dialog component
 * @param props Component properties
 * @returns JSX element
 */
const EmployeeDetailsDialog: React.FC<IEmployeeDetailsDialogProps> = (props) => {
  const classes = useStyles();
  const { 
    open, 
    mode, 
    employeeDetails: initialEmployeeDetails, 
    departmentId,
    departmentName,
    personnelTypeList,
    onClose, 
    onSearch 
  } = props;
  
  const [employeeDetails, setEmployeeDetails] = useState<IEmployeeDetails>(initialEmployeeDetails);
  const [errorDetails, setErrorDetails] = useState<IErrorDetails>({});
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isAutocompleteOpen, setAutocompleteOpen] = useState(false);
  
  useEffect(() => {
    setEmployeeDetails(initialEmployeeDetails);
    setErrorDetails({});
    setSearchResults([]);
  }, [initialEmployeeDetails, open]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    const updatedEmployeeDetails = { ...employeeDetails, [name]: value };
    
    if (name === 'Etype') {
      updatedEmployeeDetails.EmpNo = '';
      updatedEmployeeDetails.Title = '';
      updatedEmployeeDetails.OtherSource = '';
      setSearchResults([]);
    }
    
    setEmployeeDetails(updatedEmployeeDetails);
    
    const updatedErrorDetails = validateEmployeeDetailsInput(
      name as string, 
      value as string, 
      updatedEmployeeDetails, 
      errorDetails
    );
    
    setErrorDetails(updatedErrorDetails);
  };
  
  const handleTimeChange = (date: Date, name: string) => {
    const updatedEmployeeDetails = { ...employeeDetails, [name]: date };
    setEmployeeDetails(updatedEmployeeDetails);
    
    const updatedErrorDetails = validateEmployeeDetailsInput(
      name, 
      date, 
      updatedEmployeeDetails, 
      errorDetails
    );
    
    setErrorDetails(updatedErrorDetails);
  };
  
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    
    if (searchTerm.length > 2) {
      const results = await onSearch(
        searchTerm, 
        employeeDetails.Etype, 
        employeeDetails.OtherSource
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };
  
  const handleAutocompleteChange = (event: React.ChangeEvent<{}>, value: any) => {
    const updatedEmployeeDetails = { ...employeeDetails };
    
    if (value) {
      if (employeeDetails.Etype === 'BSP') {
        updatedEmployeeDetails.EmpNo = value.EmpNo;
        updatedEmployeeDetails.Title = value.Name;
      } else {
        updatedEmployeeDetails.EmpNo = value.Id.toString();
        updatedEmployeeDetails.Title = value.Title;
      }
      
      const updatedErrorDetails = validateEmployeeDetailsInput(
        'EmpNo', 
        updatedEmployeeDetails.EmpNo, 
        updatedEmployeeDetails, 
        errorDetails
      );
      
      setErrorDetails(updatedErrorDetails);
    } else {
      updatedEmployeeDetails.EmpNo = '';
      updatedEmployeeDetails.Title = '';
      
      const updatedErrorDetails = validateEmployeeDetailsInput(
        'EmpNo', 
        '', 
        updatedEmployeeDetails, 
        errorDetails
      );
      
      setErrorDetails(updatedErrorDetails);
      setSearchResults([]);
    }
    
    setEmployeeDetails(updatedEmployeeDetails);
  };
  
  const handleCancel = () => {
    onClose(false);
  };
  
  const handleSave = () => {
    const { isValid, errors } = validateEmployeeDetailsSubmit(employeeDetails, errorDetails);
    
    if (isValid) {
      onClose(true, employeeDetails);
    } else {
      setErrorDetails(errors);
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      aria-labelledby="employee-details-dialog-title"
      fullWidth
      maxWidth="md"
    >
      <DialogTitle id="employee-details-dialog-title">
        {mode === 'add' ? 'Add Employee Details' : 'Edit Employee Details'}
      </DialogTitle>
      <DialogContent>
        <div className={classes.root}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" className={classes.paper}>
                <div className={classes.datelabel}>
                  <FormControl component="fieldset">
                    <RadioGroup 
                      row 
                      aria-label="Etype" 
                      name="Etype" 
                      value={employeeDetails.Etype || 'BSP'} 
                      onChange={handleInputChange}
                    >
                      {EMPLOYEE_TYPES.map(type => (
                        <FormControlLabel 
                          key={type.value} 
                          value={type.value} 
                          control={<Radio color="primary" />} 
                          label={type.label} 
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </div>
              </Paper>
            </Grid>
            
            {employeeDetails.Etype === 'Others' && (
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                  <FormControl className={classes.textField} error={!!errorDetails.OtherSource}>
                    <InputLabel id="othersOutsourceLabel">Others *</InputLabel>
                    <Select
                      labelId="othersOutsourceLabel"
                      id="OtherSource"
                      value={employeeDetails.OtherSource || ''}
                      onChange={handleInputChange}
                      name="OtherSource"
                    >
                      {personnelTypeList.map((item) => (
                        <MenuItem key={item.Title} value={item.Title}>
                          {item.Title}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errorDetails.OtherSource}</FormHelperText>
                  </FormControl>
                </Paper>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Paper variant="outlined" className={classes.paper}>
                <FormControl className={classes.textField} error={!!errorDetails.EmpNo}>
                  <Autocomplete
                    freeSolo
                    id="employee-search"
                    style={{ width: 300 }}
                    open={isAutocompleteOpen}
                    onChange={handleAutocompleteChange}
                    onOpen={() => setAutocompleteOpen(true)}
                    onClose={() => setAutocompleteOpen(false)}
                    getOptionSelected={(option, value) => {
                      if (employeeDetails.Etype === 'BSP') {
                        return option.EmpNo === value.EmpNo;
                      } else {
                        return option.Id === value.Id;
                      }
                    }}
                    getOptionLabel={(option) => {
                      if (employeeDetails.Etype === 'BSP') {
                        return option.Name || '';
                      } else {
                        return option.Title || '';
                      }
                    }}
                    options={searchResults}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        onChange={handleSearch}
                        label={employeeDetails.Etype === 'BSP' ? 'Employee Name' : `${employeeDetails.OtherSource || 'Personnel'} Name`}
                        variant="standard"
                        helperText={errorDetails.EmpNo}
                        error={!!errorDetails.EmpNo}
                      />
                    )}
                  />
                </FormControl>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" className={classes.paper}>
                <FormControl className={classes.textField} error={!!errorDetails.TimeFrom}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <TimePicker
                      error={!!errorDetails.TimeFrom}
                      format="MM/dd/yyyy HH:mm"
                      label="Time From"
                      value={employeeDetails.TimeFrom}
                      onChange={(date) => handleTimeChange(date as Date, 'TimeFrom')}
                      InputProps={{ className: classes.dateField }}
                    />
                  </MuiPickersUtilsProvider>
                  <FormHelperText>{errorDetails.TimeFrom}</FormHelperText>
                </FormControl>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" className={classes.paper}>
                <FormControl className={classes.textField} error={!!errorDetails.TimeTo}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <TimePicker
                      error={!!errorDetails.TimeTo}
                      format="MM/dd/yyyy HH:mm"
                      label="Time To"
                      value={employeeDetails.TimeTo}
                      onChange={(date) => handleTimeChange(date as Date, 'TimeTo')}
                      InputProps={{ className: classes.dateField }}
                    />
                  </MuiPickersUtilsProvider>
                  <FormHelperText>{errorDetails.TimeTo}</FormHelperText>
                </FormControl>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="default">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeDetailsDialog;
