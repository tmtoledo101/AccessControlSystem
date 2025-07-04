import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import TextField from '@material-ui/core/TextField';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { IOvertimeForm, IOvertimeFormErrors } from '../../models/IOvertimeForm';

/**
 * Request info section props
 */
export interface IRequestInfoSectionProps {
  /**
   * Form
   */
  form: IOvertimeForm;
  
  /**
   * Form errors
   */
  errors: IOvertimeFormErrors;
  
  /**
   * Purposes
   */
  purposes: any[];
  
  /**
   * Departments
   */
  departments: any[];
  
  /**
   * Buildings
   */
  buildings: any[];
  
  /**
   * On text change callback
   */
  onTextChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  
  /**
   * On select change callback
   */
  onSelectChange: (e: React.ChangeEvent<{ name?: string; value: unknown }>) => void;
  
  /**
   * On date change callback
   */
  onDateChange: (date: Date, name: string) => void;
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
 * Request info section component
 * @param props Component props
 * @returns Request info section component
 */
export const RequestInfoSection: React.FC<IRequestInfoSectionProps> = (props) => {
  const { form, errors, purposes, departments, buildings, onTextChange, onSelectChange, onDateChange } = props;
  const classes = useStyles();

  return (
    <>
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField} error={!!errors.DeptId}>
            <InputLabel id="deptLabel">Requesting Department *</InputLabel>
            <Select
              labelId="deptLabel"
              id="DeptId"
              value={form.DeptId || ''}
              onChange={onSelectChange}
              name="DeptId"
            >
              {departments.map((item) => (
                <MenuItem key={item.Id} value={item.Id}>
                  {item.Title}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.DeptId}</FormHelperText>
          </FormControl>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField} error={!!errors.Bldg}>
            <InputLabel id="bldgLabel">Building *</InputLabel>
            <Select
              labelId="bldgLabel"
              id="Bldg"
              value={form.Bldg || ''}
              onChange={onSelectChange}
              name="Bldg"
            >
              {buildings.map((item) => (
                <MenuItem key={item.Title} value={item.Title}>
                  {item.Title}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.Bldg}</FormHelperText>
          </FormControl>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField} error={!!errors.DateFrom}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DatePicker
                error={!!errors.DateFrom}
                disablePast
                format="MM/dd/yyyy"
                label="Entry Permit Valid From"
                value={form.DateFrom}
                onChange={(d) => onDateChange(d, 'DateFrom')}
                InputProps={{ className: classes.dateField }}
              />
            </MuiPickersUtilsProvider>
            <FormHelperText>{errors.DateFrom}</FormHelperText>
          </FormControl>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField} error={!!errors.DateTo}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DatePicker
                error={!!errors.DateTo}
                disablePast
                format="MM/dd/yyyy"
                label="Entry Permit Valid To"
                value={form.DateTo}
                onChange={(d) => onDateChange(d, 'DateTo')}
                InputProps={{ className: classes.dateField }}
              />
            </MuiPickersUtilsProvider>
            <FormHelperText>{errors.DateTo}</FormHelperText>
          </FormControl>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField} error={!!errors.Purpose}>
            <InputLabel id="purposeLabel">Purpose *</InputLabel>
            <Select
              labelId="purposeLabel"
              id="Purpose"
              value={form.Purpose || ''}
              onChange={onSelectChange}
              name="Purpose"
            >
              {purposes.map((item) => (
                <MenuItem key={item.Title} value={item.Title}>
                  {item.Title}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.Purpose}</FormHelperText>
          </FormControl>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {form.Purpose === 'Others' && (
            <TextField
              inputProps={{ maxLength: 255 }}
              error={!!errors.Others}
              required
              label="Others"
              name="Others"
              onChange={onTextChange}
              value={form.Others || ''}
              variant="standard"
              className={classes.textField}
              helperText={errors.Others}
            />
          )}
        </Paper>
      </Grid>
    </>
  );
};
