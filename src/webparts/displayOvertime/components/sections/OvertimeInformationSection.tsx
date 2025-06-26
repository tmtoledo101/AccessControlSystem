import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import { IOvertimeRequest, IErrorFields } from '../../models/IOvertimeRequest';
import { checkComponentVisibility } from '../../helpers/uiHelpers';
import { formatDate } from '../../helpers/dateHelpers';

export interface IOvertimeInformationSectionProps {
  overtimeRequest: IOvertimeRequest;
  errorFields: IErrorFields;
  isEdit: boolean;
  userRoles: {
    isEncoder: boolean;
    isReceptionist: boolean;
    isApproverUser: boolean;
    isSSDUser: boolean;
    isWalkinApproverUser: boolean;
  };
  purposeList: any[];
  departmentList: any[];
  buildingList: any[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => void;
  onDateChange: (date: Date, name: string) => void;
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
  }),
);

/**
 * Overtime information section component
 * @param props Component properties
 * @returns JSX element
 */
const OvertimeInformationSection: React.FC<IOvertimeInformationSectionProps> = (props) => {
  const classes = useStyles();
  const { 
    overtimeRequest, 
    errorFields, 
    isEdit, 
    userRoles, 
    purposeList, 
    departmentList, 
    buildingList,
    onInputChange,
    onDateChange
  } = props;
  
  return (
    <>
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkComponentVisibility('editField', isEdit, userRoles, { statusId: overtimeRequest.StatusId }) && (
            <FormControl className={classes.textField} error={!!errorFields.DeptId}>
              <InputLabel id="deptLabel">Requesting Department *</InputLabel>
              <Select
                labelId="deptLabel"
                id="DeptId"
                value={overtimeRequest.DeptId || ''}
                onChange={onInputChange}
                name="DeptId"
              >
                {departmentList.map((item) => (
                  <MenuItem key={item.Id} value={item.Id}>
                    {item.Title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errorFields.DeptId}</FormHelperText>
            </FormControl>
          )}
          
          {checkComponentVisibility('displayField', isEdit, userRoles, { statusId: overtimeRequest.StatusId }) && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Requesting Department
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {overtimeRequest.Dept?.Title}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkComponentVisibility('editField', isEdit, userRoles, { statusId: overtimeRequest.StatusId }) && (
            <FormControl className={classes.textField} error={!!errorFields.Bldg}>
              <InputLabel id="bldgLabel">Building</InputLabel>
              <Select
                labelId="bldgLabel"
                id="Bldg"
                value={overtimeRequest.Bldg || ''}
                onChange={onInputChange}
                name="Bldg"
              >
                {buildingList.map((item) => (
                  <MenuItem key={item.Title} value={item.Title}>
                    {item.Title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errorFields.Bldg}</FormHelperText>
            </FormControl>
          )}
          
          {checkComponentVisibility('displayField', isEdit, userRoles, { statusId: overtimeRequest.StatusId }) && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Building
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {overtimeRequest.Bldg}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkComponentVisibility('editField', isEdit, userRoles, { statusId: overtimeRequest.StatusId }) && (
            <FormControl className={classes.textField} error={!!errorFields.DateFrom}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker
                  error={!!errorFields.DateFrom}
                  disablePast
                  format="MM/dd/yyyy"
                  label="Entry Permit Valid From"
                  value={overtimeRequest.DateFrom}
                  onChange={(date) => onDateChange(date as Date, 'DateFrom')}
                  InputProps={{ className: classes.dateField }}
                />
              </MuiPickersUtilsProvider>
              <FormHelperText>{errorFields.DateFrom}</FormHelperText>
            </FormControl>
          )}
          
          {checkComponentVisibility('displayField', isEdit, userRoles, { statusId: overtimeRequest.StatusId }) && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Entry Permit Valid From
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {formatDate(overtimeRequest.DateFrom)}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkComponentVisibility('editField', isEdit, userRoles, { statusId: overtimeRequest.StatusId }) && (
            <FormControl className={classes.textField} error={!!errorFields.DateTo}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker
                  error={!!errorFields.DateTo}
                  disablePast
                  format="MM/dd/yyyy"
                  label="Entry Permit Valid To"
                  value={overtimeRequest.DateTo}
                  onChange={(date) => onDateChange(date as Date, 'DateTo')}
                  InputProps={{ className: classes.dateField }}
                />
              </MuiPickersUtilsProvider>
              <FormHelperText>{errorFields.DateTo}</FormHelperText>
            </FormControl>
          )}
          
          {checkComponentVisibility('displayField', isEdit, userRoles, { statusId: overtimeRequest.StatusId }) && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Entry Permit Valid To
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {formatDate(overtimeRequest.DateTo)}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkComponentVisibility('editField', isEdit, userRoles, { statusId: overtimeRequest.StatusId }) && (
            <FormControl className={classes.textField} error={!!errorFields.Purpose}>
              <InputLabel id="purposeLabel">Purpose *</InputLabel>
              <Select
                labelId="purposeLabel"
                id="Purpose"
                value={overtimeRequest.Purpose || ''}
                onChange={onInputChange}
                name="Purpose"
              >
                {purposeList.map((item) => (
                  <MenuItem key={item.Title} value={item.Title}>
                    {item.Title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errorFields.Purpose}</FormHelperText>
            </FormControl>
          )}
          
          {checkComponentVisibility('displayField', isEdit, userRoles, { statusId: overtimeRequest.StatusId }) && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Purpose
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {overtimeRequest.Purpose}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      {overtimeRequest.Purpose === 'Others' && (
        <Grid item xs={12} sm={6}>
          <Paper variant="outlined" className={classes.paper}>
            {checkComponentVisibility('editField', isEdit, userRoles, { statusId: overtimeRequest.StatusId }) && (
              <TextField
                inputProps={{ maxLength: 255 }}
                error={!!errorFields.Others}
                required
                label="Others"
                name="Others"
                onChange={onInputChange}
                value={overtimeRequest.Others || ''}
                variant="standard"
                className={classes.textField}
                helperText={errorFields.Others}
              />
            )}
            
            {checkComponentVisibility('displayField', isEdit, userRoles, { statusId: overtimeRequest.StatusId }) && (
              <>
                <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                  Others
                </Box>
                <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                  {overtimeRequest.Others}
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      )}
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
            Form Status
          </Box>
          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
            {overtimeRequest.Status?.Title}
          </Box>
        </Paper>
      </Grid>
      
      {overtimeRequest.RequestDate && (
        <Grid item xs={12} sm={6}>
          <Paper variant="outlined" className={classes.paper}>
            <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
              Request Date
            </Box>
            <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
              {formatDate(overtimeRequest.RequestDate)}
            </Box>
          </Paper>
        </Grid>
      )}
    </>
  );
};

export default OvertimeInformationSection;
