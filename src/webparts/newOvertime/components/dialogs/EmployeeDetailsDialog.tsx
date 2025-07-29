import * as React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider, TimePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { IOvertimeEmployee, IOvertimeEmployeeErrors, EmployeeMode } from '../../models/IOvertimeEmployee';

/**
 * Employee details dialog props
 */
export interface IEmployeeDetailsDialogProps {
  /**
   * Open
   */
  open: boolean;
  
  /**
   * Mode
   */
  mode: EmployeeMode;
  
  /**
   * Employee
   */
  employee: IOvertimeEmployee;
  
  /**
   * Errors
   */
  errors: IOvertimeEmployeeErrors;
  
  /**
   * Personnel type list
   */
  personnelTypeList: any[];
  
  /**
   * Contact list
   */
  contactList: any[];
  
  /**
   * Outsource list
   */
  outsourceList: any[];
  
  /**
   * On close callback
   */
  onClose: () => void;
  
  /**
   * On save callback
   */
  onSave: () => void;
  
  /**
   * On text change callback
   */
  onTextChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  
  /**
   * On select change callback
   */
  onSelectChange: (e: React.ChangeEvent<{ name?: string; value: any }>) => void;
  
  /**
   * On time change callback
   */
  onTimeChange: (time: Date, name: string) => void;
  
  /**
   * On employee select callback
   */
  onEmployeeSelect: (event: any, value: any) => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(1),
      borderColor: 'transparent',
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 300,
    },
    dateField: {
      width: 300,
    },
  }),
);

/**
 * Employee details dialog component
 * @param props Component props
 * @returns Employee details dialog component
 */
export const EmployeeDetailsDialog: React.FC<IEmployeeDetailsDialogProps> = (props) => {
  const {
    open,
    mode,
    employee,
    errors,
    personnelTypeList,
    contactList,
    outsourceList,
    onClose,
    onSave,
    onTextChange,
    onSelectChange,
    onTimeChange,
    onEmployeeSelect
  } = props;
  
  const classes = useStyles();
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);

  /**
   * Handle find user
   * @param e Event
   */
  const handleFindUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTextChange(e);
  };

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={onClose}
      aria-labelledby="employee-dialog-title"
    >
      <DialogTitle id="employee-dialog-title">
        {mode === EmployeeMode.Add ? 'Add Employee Details' : 'Edit Employee Details'}
      </DialogTitle>
      <DialogContent>
        <form noValidate autoComplete="off">
          <div style={{ padding: '0px' }}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                  <div>
                    <FormControl component="fieldset">
                      <RadioGroup
                        row
                        aria-label="Etype"
                        name="Etype"
                        value={employee.Etype}
                        onChange={onTextChange}
                      >
                        <FormControlLabel value="BSP" control={<Radio color="primary" />} label="BSP" />
                        <FormControlLabel value="Others" control={<Radio color="primary" />} label="Others" />
                      </RadioGroup>
                    </FormControl>
                  </div>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                  {employee.Etype === 'Others' && (
                    <FormControl className={classes.textField} error={!!errors.OtherSource}>
                      <InputLabel id="othersOutsourceLabel">Others *</InputLabel>
                      <Select
                        labelId="othersOutsourceLabel"
                        id="OtherSource"
                        value={employee.OtherSource || ''}
                        onChange={onSelectChange}
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
              <Grid item xs={12} sm={12}>
                <Paper variant="outlined" className={classes.paper}>
                  {employee.Etype === 'BSP' ? (
                    <FormControl className={classes.textField} error={!!errors.EmpNo}>
                      <Autocomplete
                        freeSolo
                        id="Contact"
                        style={{ width: 300 }}
                        open={autocompleteOpen}
                        onChange={onEmployeeSelect}
                        onOpen={() => {
                          setAutocompleteOpen(true);
                        }}
                        onClose={() => {
                          setAutocompleteOpen(false);
                        }}
                        getOptionSelected={(option, value) => option.EmpNo === value.EmpNo}
                        getOptionLabel={(option) => option.Name}
                        options={contactList}
                        defaultValue={{ EmpNo: employee.EmpNo, Name: employee.Title }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            onChange={handleFindUser}
                            label="Employee Name"
                            variant="standard"
                            helperText={errors.EmpNo}
                            error={!!errors.EmpNo}
                          />
                        )}
                      />
                    </FormControl>
                  ) : (
                    <FormControl className={classes.textField} error={!!errors.EmpNo}>
                      <Autocomplete
                        freeSolo
                        id="OutsourceList"
                        style={{ width: 300 }}
                        open={autocompleteOpen}
                        onChange={onEmployeeSelect}
                        onOpen={() => {
                          setAutocompleteOpen(true);
                        }}
                        onClose={() => {
                          setAutocompleteOpen(false);
                        }}
                        getOptionSelected={(option, value) => option.Id === value.Id}
                        getOptionLabel={(option) => option.Title}
                        options={outsourceList}
                        defaultValue={{ Id: employee.EmpNo, Title: employee.Title }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            onChange={handleFindUser}
                            label={`${employee.OtherSource || ''} Name`}
                            variant="standard"
                            helperText={errors.EmpNo}
                            error={!!errors.EmpNo}
                          />
                        )}
                      />
                    </FormControl>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                  <FormControl className={classes.textField} error={!!errors.TimeFrom}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                      <TimePicker
                        error={!!errors.TimeFrom}
                        format="MM/dd/yyyy HH:mm"
                        label="Time From"
                        value={employee.TimeFrom}
                        onChange={(d) => onTimeChange(d, 'TimeFrom')}
                        InputProps={{ className: classes.dateField }}
                      />
                    </MuiPickersUtilsProvider>
                    <FormHelperText>{errors.TimeFrom}</FormHelperText>
                  </FormControl>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                  <FormControl className={classes.textField} error={!!errors.TimeTo}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                      <TimePicker
                        error={!!errors.TimeTo}
                        format="MM/dd/yyyy HH:mm"
                        label="Time To"
                        value={employee.TimeTo}
                        onChange={(d) => onTimeChange(d, 'TimeTo')}
                        InputProps={{ className: classes.dateField }}
                      />
                    </MuiPickersUtilsProvider>
                    <FormHelperText>{errors.TimeTo}</FormHelperText>
                  </FormControl>
                </Paper>
              </Grid>
            </Grid>
          </div>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="default">
          Cancel
        </Button>
        <Button onClick={onSave} color="primary" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};
