import * as React from 'react';
import { Grid, Paper, Box, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
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
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word'
    }
  }),
);

interface IApprovalSectionProps {
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
   * The approver list
   */
  approverList: any[];
  
  /**
   * Text change handler
   */
  handleChangeTxt: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  /**
   * Combo box change handler
   */
  handleChangeCbo: (e: React.ChangeEvent<{ name?: string; value: any }>) => void;
}

/**
 * Approval Section component
 */
export const ApprovalSection: React.FC<IApprovalSectionProps> = ({
  formData,
  errors,
  permissions,
  statusId,
  isEditMode,
  approverList,
  handleChangeTxt,
  handleChangeCbo
}) => {
  const classes = useStyles();
  
  /**
   * Checks if a component should be visible in display mode
   */
  const isVisibleInDisplayMode = (component: string): boolean => {
    if (component === 'approver') {
      return !isEditMode && !!formData.ApproverId;
    } else if (component === 'remarks1') {
      return !isEditMode && !!formData.Remarks1;
    } else if (component === 'remarks2') {
      return !isEditMode && !!formData.Remarks2;
    } else if (component === 'ssdApprover') {
      return !isEditMode && !!formData.SSDApproverId;
    } else if (component === 'ssdDate') {
      return !isEditMode && !!formData.SSDDate;
    } else if (component === 'deptDate') {
      return !isEditMode && !!formData.DeptApproverDate;
    }
    
    return false;
  };
  
  /**
   * Checks if a component should be visible in edit mode
   */
  const isVisibleInEditMode = (component: string): boolean => {
    if (component === 'approver') {
      return isEditMode && permissions.isEncoder && statusId === STATUS.DRAFT;
    } else if (component === 'remarks1') {
      return isEditMode && permissions.isApproverUser;
    } else if (component === 'remarks2') {
      return isEditMode && permissions.isSSDUser;
    }
    
    return false;
  };
  
  return (
    <>
      {/* Approver */}
      <Grid item xs={12} sm={12}>
        <Paper variant="outlined" className={classes.paper}>
          {isVisibleInEditMode('approver') && (
            <FormControl className={classes.textField} error={errors.ApproverId ? true : false}>
              <InputLabel id="approversLabel">Forward for Approval *</InputLabel>
              <Select
                labelId="approversLabel"
                id="ApproverId"
                value={formData.ApproverId || ''}
                onChange={handleChangeCbo}
                name="ApproverId"
              >
                {approverList.map((item) => (
                  <MenuItem key={item.NameId} value={item.NameId}>
                    {item.Name.Title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.ApproverId}</FormHelperText>
            </FormControl>
          )}
          
          {isVisibleInDisplayMode('approver') && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Approver
              </Box>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labelbottom}>
                {formData.Approver && formData.Approver.Title}
              </Box>
              
              {isVisibleInDisplayMode('deptDate') && (
                <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labelbottom}>
                  {moment(formData.DeptApproverDate).format('MM/DD/yyyy HH:mm')}
                </Box>
              )}
            </>
          )}
        </Paper>
      </Grid>
      
      {/* Department Approver Remarks */}
      <Grid item xs={12} sm={12}>
        <Paper variant="outlined" className={classes.paper}>
          {isVisibleInEditMode('remarks1') && (
            <TextField
              error={errors.Remarks1 ? true : false}
              multiline
              label="Approver's Remarks"
              name="Remarks1"
              onChange={handleChangeTxt}
              value={formData.Remarks1 || ''}
              variant="standard"
              className={classes.textField}
              helperText={errors.Remarks1}
            />
          )}
          
          {isVisibleInDisplayMode('remarks1') && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Approver's Remarks
              </Box>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labelbottom}>
                {formData.Remarks1}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      {/* SSD Approver */}
      <Grid item xs={12} sm={12}>
        <Paper variant="outlined" className={classes.paper}>
          {isVisibleInDisplayMode('ssdApprover') && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                SSD Approver
              </Box>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labelbottom}>
                {formData.SSDApprover && formData.SSDApprover.Title}

              </Box>
              
              {isVisibleInDisplayMode('ssdDate') && (
                <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labelbottom}>
                  {moment(formData.SSDDate).format('MM/DD/yyyy HH:mm')}
                </Box>
              )}
            </>
          )}
        </Paper>
      </Grid>
      
      {/* SSD Remarks */}
      <Grid item xs={12} sm={12}>
        <Paper variant="outlined" className={classes.paper}>
          {isVisibleInEditMode('remarks2') && (
            <TextField
              error={errors.Remarks2 ? true : false}
              multiline
              label="SSD Remarks"
              name="Remarks2"
              onChange={handleChangeTxt}
              value={formData.Remarks2 || ''}
              variant="standard"
              className={classes.textField}
              helperText={errors.Remarks2}
            />
          )}
          
          {isVisibleInDisplayMode('remarks2') && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                SSD Remarks
              </Box>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labelbottom}>
                {formData.Remarks2}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
    </>
  );
};
