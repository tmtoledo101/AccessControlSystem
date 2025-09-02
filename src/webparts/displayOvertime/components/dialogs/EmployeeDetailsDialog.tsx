import DateFnsUtils from '@date-io/date-fns';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  TextField
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { MuiPickersUtilsProvider, TimePicker } from '@material-ui/pickers';
import * as React from 'react';
import { IEmployeeDetails, IEmployeeDetailsErrors } from '../../models/IEmployeeDetails';

// Styles
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
    datelabel: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    }
  }),
);

interface IEmployeeDetailsDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  
  /**
   * The dialog mode (add or edit)
   */
  mode: string;
  
  /**
   * The employee details data
   */
  detailsData: IEmployeeDetails;
  
  /**
   * The employee details validation errors
   */
  errors: IEmployeeDetailsErrors;
  
  /**
   * The contact list for BSP employees
   */
  contactList: any[];
  
  /**
   * The outsource list for non-BSP employees
   */
  outsourceList: any[];
  
  /**
   * The personnel type list
   */
  personnelTypeList: any[];
  
  /**
   * Whether the autocomplete is open
   */
  isAutocompleteOpen: boolean;
  
  /**
   * Set autocomplete open state
   */
  setAutocompleteOpen: (isOpen: boolean) => void;
  
  /**
   * Text change handler
   */
  handleChangeTxt: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  /**
   * Combo box change handler
   */
  handleChangeCbo: (e: React.ChangeEvent<{ name?: string; value: any }>) => void;
  
  /**
   * Time change handler
   */
  onTimeChange: (date: Date, name: string) => void;
  
  /**
   * Autocomplete selection handler
   */
  handleAutocompleteSelection: (event: any, value: any) => void;
  
  /**
   * Find user handler
   */
  findUser: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  /**
   * Dialog close handler
   * @param save Whether to save the data
   */
  onClose: (save: boolean) => void;
}

/**
 * Employee Details Dialog component
 */
export const EmployeeDetailsDialog: React.FC<IEmployeeDetailsDialogProps> = ({
  open,
  mode,
  detailsData,
  errors,
  contactList,
  outsourceList,
  personnelTypeList,
  isAutocompleteOpen,
  setAutocompleteOpen,
  handleChangeTxt,
  handleChangeCbo,
  onTimeChange,
  handleAutocompleteSelection,
  findUser,
  onClose
}) => {
  const classes = useStyles();
  
  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      aria-labelledby="employee-dialog-title"
      fullWidth
      maxWidth="md"
    >
      <DialogTitle id="employee-dialog-title">
        {mode === 'add' ? 'Add Employee Details' : 'Edit Employee Details'}
      </DialogTitle>
      
      <DialogContent>
        <form noValidate autoComplete="off">
          <Grid container spacing={1}>
            {/* Employee Type */}
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" className={classes.paper}>
                <div className={classes.datelabel}>
                  <FormControl component="fieldset">
                    <RadioGroup 
                      row 
                      aria-label="Etype" 
                      name="Etype" 
                      value={detailsData.Etype} 
                      onChange={handleChangeTxt}
                    >
                      <FormControlLabel value="BSP" control={<Radio color="primary" />} label="BSP" />
                      <FormControlLabel value="Others" control={<Radio color="primary" />} label="Others" />
                    </RadioGroup>
                  </FormControl>
                </div>
              </Paper>
            </Grid>
            
            {/* Other Source (for non-BSP employees) */}
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" className={classes.paper}>
                {detailsData.Etype === 'Others' && (
                  <FormControl 
                    className={classes.textField} 
                    error={errors.OtherSource ? true : false}
                  >
                    <InputLabel id="othersOutsourceLabel">Others *</InputLabel>
                    <Select
                      labelId="othersOutsourceLabel"
                      id="OtherSource"
                      value={detailsData.OtherSource}
                      onChange={handleChangeCbo}
                      name="OtherSource"
                    >
                      {personnelTypeList.map((item) => (
                        <MenuItem key={item.Title} value={item.Title}>
                          {item.Title}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.OtherSource}</FormHelperText>
                  </FormControl>
                )}
              </Paper>
            </Grid>
            
            {/* Employee Name */}
            <Grid item xs={12} sm={12}>
              <Paper variant="outlined" className={classes.paper}>
                <FormControl 
                  className={classes.textField} 
                  error={errors.EmpNo ? true : false}
                >
                  {detailsData.Etype === 'BSP' ? (
                    <Autocomplete
                      freeSolo={true}
                      id="Contact"
                      style={{ width: 300 }}
                      open={isAutocompleteOpen}
                      onChange={handleAutocompleteSelection}
                      onOpen={() => setAutocompleteOpen(true)}
                      onClose={() => setAutocompleteOpen(false)}
                      getOptionSelected={(option, value) => option.EmpNo === value.EmpNo}
                      getOptionLabel={(option) => option.Name || ''}
                      options={contactList}
                      defaultValue={{ EmpNo: detailsData.EmpNo, Name: detailsData.Title }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          onChange={findUser}
                          label="Employee Name"
                          variant="standard"
                          helperText={errors.EmpNo}
                          error={errors.EmpNo ? true : false}
                        />
                      )}
                    />
                  ) : (
                    <Autocomplete
                      freeSolo={true}
                      id="OutsourceList"
                      style={{ width: 300 }}
                      open={isAutocompleteOpen}
                      onChange={handleAutocompleteSelection}
                      onOpen={() => setAutocompleteOpen(true)}
                      onClose={() => setAutocompleteOpen(false)}
                      getOptionSelected={(option, value) => option.Id === value.Id}
                      getOptionLabel={(option) => option.Title || ''}
                      options={outsourceList}
                      defaultValue={{ Id: detailsData.EmpNo, Title: detailsData.Title }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          onChange={findUser}
                          label={`${detailsData.OtherSource || 'Employee'} Name`}
                          variant="standard"
                          helperText={errors.EmpNo}
                          error={errors.EmpNo ? true : false}
                        />
                      )}
                    />
                  )}
                </FormControl>
              </Paper>
            </Grid>
            
            {/* Time From */}
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" className={classes.paper}>
                <FormControl 
                  className={classes.textField} 
                  error={errors.TimeFrom ? true : false}
                >
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <TimePicker
                      error={errors.TimeFrom ? true : false}
                      format="MM/dd/yyyy HH:mm"
                      label="Time From"
                      value={detailsData.TimeFrom}
                      onChange={(d) => onTimeChange(d, 'TimeFrom')}
                      InputProps={{ className: classes.dateField }}
                    />
                  </MuiPickersUtilsProvider>
                  <FormHelperText>{errors.TimeFrom}</FormHelperText>
                </FormControl>
              </Paper>
            </Grid>
            
            {/* Time To */}
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" className={classes.paper}>
                <FormControl 
                  className={classes.textField} 
                  error={errors.TimeTo ? true : false}
                >
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <TimePicker
                      error={errors.TimeTo ? true : false}
                      format="MM/dd/yyyy HH:mm"
                      label="Time To"
                      value={detailsData.TimeTo}
                      onChange={(d) => onTimeChange(d, 'TimeTo')}
                      InputProps={{ className: classes.dateField }}
                    />
                  </MuiPickersUtilsProvider>
                  <FormHelperText>{errors.TimeTo}</FormHelperText>
                </FormControl>
              </Paper>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={() => onClose(false)} color="default">
          Cancel
        </Button>
        <Button onClick={() => onClose(true)} color="primary" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};
