import * as React from 'react';
import { Grid, Paper, Box, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import { IUserPermissions } from '../../utils/permissionUtils';
import { IOvertimeRequest, IOvertimeRequestErrors } from '../../models/IOvertimeRequest';
import { STATUS } from '../../constants/status';

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
      fontWeight: 500,
    }
  }),
);

interface IRequestInfoSectionProps {
  /**
   * The form data
   */
  formData: IOvertimeRequest;
  
  /**
   * The form validation errors
   */
  errors: IOvertimeRequestErrors;
  
  /**
   * User permissions
   */
  permissions: IUserPermissions;
  
  /**
   * The request status ID
   */
  statusId: number;
  
  /**
   * Whether the form is in edit mode
   */
  isEditMode: boolean;
  
  /**
   * The department list
   */
  departmentList: any[];
  
  /**
   * The purpose list
   */
  purposeList: any[];
  
  /**
   * The building list
   */
  buildingList: any[];
  
  /**
   * Text change handler
   */
  handleChangeTxt: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  /**
   * Combo box change handler
   */
  handleChangeCbo: (e: React.ChangeEvent<{ name?: string; value: any }>) => void;
  
  /**
   * Date change handler
   */
  onDateChange: (date: Date, name: string) => void;
}

/**
 * Request Info Section component
 */
export const RequestInfoSection: React.FC<IRequestInfoSectionProps> = ({
  formData,
  errors,
  permissions,
  statusId,
  isEditMode,
  departmentList,
  purposeList,
  buildingList,
  handleChangeTxt,
  handleChangeCbo,
  onDateChange
}) => {
  const classes = useStyles();
  
  /**
   * Checks if a component should be visible in display mode
   */
  const isVisibleInDisplayMode = (component: string): boolean => {
    if (component === 'department') {
      return !isEditMode || (isEditMode && ((permissions.isApproverUser || permissions.isSSDUser) || (permissions.isEncoder && statusId === STATUS.PENDING_DEPT_APPROVAL)));
    } else if (component === 'status') {
      return true;
    } else {
      return !isEditMode;
    }
  };
  
  /**
   * Checks if a component should be visible in edit mode
   */
  const isVisibleInEditMode = (component: string): boolean => {
    if (component === 'department') {
      return isEditMode && permissions.isEncoder && statusId === STATUS.DRAFT;
    } else if (component === 'others') {
      return isEditMode && formData.Purpose === 'Others';
    } else {
      return isEditMode && (permissions.isEncoder || permissions.isReceptionist);
    }
  };
  
  return (
    <>
      {/* Department */}
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {isVisibleInEditMode('department') && (
            <FormControl className={classes.textField} error={errors.DeptId ? true : false}>
              <InputLabel id="deptLabel">Requesting Department *</InputLabel>
              <Select
                labelId="deptLabel"
                id="Dept"
                value={formData.DeptId || ''}
                onChange={handleChangeCbo}
                name="DeptId"
              >
                {departmentList.map((item) => (
                  <MenuItem key={item.Id} value={item.Id}>
                    {item.Title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.DeptId}</FormHelperText>
            </FormControl>
          )}
          
          {isVisibleInDisplayMode('department') && formData.Dept && formData.Dept.Title && (
          <>
            <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
              Requesting Department
            </Box>
            <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labelbottom}>
              {formData.Dept.Title}
            </Box>
          </>
        )}
        </Paper>
      </Grid>
      
      {/* Building */}
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {isVisibleInEditMode('building') && (
            <FormControl className={classes.textField} error={errors.Bldg ? true : false}>
              <InputLabel id="bldgLabel">Building</InputLabel>
              <Select
                labelId="bldgLabel"
                id="bldg"
                value={formData.Bldg || ''}
                onChange={handleChangeCbo}
                name="Bldg"
              >
                {buildingList.map((item) => (
                  <MenuItem key={item.Title} value={item.Title}>
                    {item.Title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.Bldg}</FormHelperText>
            </FormControl>
          )}
          
          {isVisibleInDisplayMode('building') && formData.Bldg && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Building
              </Box>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labelbottom}>
                {formData.Bldg}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      {/* Date From */}
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {isVisibleInEditMode('dateFrom') && (
            <FormControl className={classes.textField} error={errors.DateFrom ? true : false}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker
                  error={errors.DateFrom ? true : false}
                  disablePast
                  format="MM/dd/yyyy"
                  label="Entry Permit Valid From"
                  value={formData.DateFrom}
                  onChange={(d) => onDateChange(d, 'DateFrom')}
                  InputProps={{ className: classes.dateField }}
                />
              </MuiPickersUtilsProvider>
              <FormHelperText>{errors.DateFrom}</FormHelperText>
            </FormControl>
          )}
          
          {isVisibleInDisplayMode('dateFrom') && formData.DateFrom && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Entry Permit Valid From
              </Box>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labelbottom}>
                {moment(formData.DateFrom).format('MM/DD/yyyy')}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      {/* Date To */}
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {isVisibleInEditMode('dateTo') && (
            <FormControl className={classes.textField} error={errors.DateTo ? true : false}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker
                  error={errors.DateTo ? true : false}
                  disablePast
                  format="MM/dd/yyyy"
                  label="Entry Permit Valid To"
                  value={formData.DateTo}
                  onChange={(d) => onDateChange(d, 'DateTo')}
                  InputProps={{ className: classes.dateField }}
                />
              </MuiPickersUtilsProvider>
              <FormHelperText>{errors.DateTo}</FormHelperText>
            </FormControl>
          )}
          
          {isVisibleInDisplayMode('dateTo') && formData.DateTo && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Entry Permit Valid To
              </Box>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labelbottom}>
                {moment(formData.DateTo).format('MM/DD/yyyy')}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      {/* Purpose */}
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {isVisibleInEditMode('purpose') && (
            <FormControl className={classes.textField} error={errors.Purpose ? true : false}>
              <InputLabel id="purposeLabel">Purpose *</InputLabel>
              <Select
                labelId="purposeLabel"
                id="Purpose"
                value={formData.Purpose || ''}
                onChange={handleChangeCbo}
                name="Purpose"
              >
                {purposeList.map((item) => (
                  <MenuItem key={item.Title} value={item.Title}>
                    {item.Title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.Purpose}</FormHelperText>
            </FormControl>
          )}
          
          {isVisibleInDisplayMode('purpose') && formData.Purpose && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Purpose
              </Box>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labelbottom}>
                {formData.Purpose}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      {/* Others (for Purpose = Others) */}
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {isVisibleInEditMode('others') && (
            <TextField
              inputProps={{ maxLength: 255 }}
              error={errors.Others ? true : false}
              required
              label="Others"
              name="Others"
              onChange={handleChangeTxt}
              value={formData.Others || ''}
              variant="standard"
              className={classes.textField}
              helperText={errors.Others}
            />
          )}
          
          {isVisibleInDisplayMode('others') && formData.Purpose === 'Others' && formData.Others && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Others
              </Box>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labelbottom}>
                {formData.Others}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      {/* Status */}
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {isVisibleInDisplayMode('status') && formData.Status && formData.Status.Title && (
          <>
            <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
              Form Status
            </Box>
            <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labelbottom}>
              {formData.Status.Title}
            </Box>
          </>
        )}

        </Paper>
      </Grid>
      
      {/* Request Date */}
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {isVisibleInDisplayMode('requestDate') && formData.RequestDate && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Request Date
              </Box>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labelbottom}>
                {moment(formData.RequestDate).format('MM/DD/yyyy')}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
    </>
  );
};
