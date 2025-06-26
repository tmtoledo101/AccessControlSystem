import * as React from 'react';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import moment from 'moment';
import { IOvertimeRequest, IErrorFields } from '../../models/IOvertimeRequest';
import { checkComponentVisibility } from '../../helpers/uiHelpers';
import { IUserRoles } from '../../models/IEmployeeDetails';

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
    },
  }),
);

export interface IApprovalSectionProps {
  isEdit: boolean;
  formData: IOvertimeRequest;
  errorFields: IErrorFields;
  userRoles: IUserRoles;
  approverList: any[];
  onDropdownChange: (e: React.ChangeEvent<{ name?: string; value: unknown }>) => void;
  onTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Approval section component
 * @param props Component properties
 * @returns JSX element
 */
const ApprovalSection: React.FC<IApprovalSectionProps> = (props) => {
  const { 
    isEdit, 
    formData, 
    errorFields, 
    userRoles, 
    approverList, 
    onDropdownChange, 
    onTextChange 
  } = props;
  
  const classes = useStyles();

  return (
    <>
      <Grid item xs={12} sm={12}>
        <Paper variant="outlined" className={classes.paper}>
          {checkComponentVisibility('approverSelect', isEdit, userRoles, { statusId: formData.StatusId }) && (
            <FormControl className={classes.textField} error={errorFields.ApproverId.length > 0}>
              <InputLabel id="approversLabel">Forward for Approval *</InputLabel>
              <Select
                labelId="approversLabel"
                id="ApproverId"
                value={formData.ApproverId || ''}
                onChange={onDropdownChange}
                name="ApproverId"
              >
                {approverList.map((item) => (
                  <MenuItem key={item.NameId} value={item.NameId}>
                    {item.Name.Title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errorFields.ApproverId}</FormHelperText>
            </FormControl>
          )}
          
          {checkComponentVisibility('approverDisplay', isEdit, userRoles, { statusId: formData.StatusId }) && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Approver
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {formData.Approver?.Title}
              </Box>
            </>
          )}
          
          {checkComponentVisibility('deptDateDisplay', isEdit, userRoles, { statusId: formData.StatusId }) && (
            <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
              {moment(formData.DeptApproverDate).format('MM/DD/yyyy HH:mm')}
            </Box>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={12}>
        <Paper variant="outlined" className={classes.paper}>
          {checkComponentVisibility('remarks1Input', isEdit, userRoles, { statusId: formData.StatusId }) && (
            <TextField
              error={errorFields.Remarks1.length > 0}
              multiline
              label="Approver's Remarks"
              name="Remarks1"
              onChange={onTextChange}
              value={formData.Remarks1 || ''}
              variant="standard"
              className={classes.textField}
              helperText={errorFields.Remarks1}
            />
          )}
          
          {checkComponentVisibility('remarks1Display', isEdit, userRoles, { statusId: formData.StatusId }) && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Approver's Remarks
              </Box>
              <Box 
                component="span" 
                style={{ 
                  display: 'block', 
                  fontWeight: 500, 
                  margin: '4px', 
                  whiteSpace: 'pre-wrap', 
                  wordWrap: 'break-word' 
                }} 
                className={classes.labelbottom}
              >
                {formData.Remarks1}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={12}>
        <Paper variant="outlined" className={classes.paper}>
          {checkComponentVisibility('ssdApproverDisplay', isEdit, userRoles, { statusId: formData.StatusId }) && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                SSD Approver
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {formData.SSDApprover?.Title}
              </Box>
              {formData.SSDDate && (
                <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                  {moment(formData.SSDDate).format('MM/DD/yyyy HH:mm')}
                </Box>
              )}
            </>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={12}>
        <Paper variant="outlined" className={classes.paper}>
          {checkComponentVisibility('remarks2Input', isEdit, userRoles, { statusId: formData.StatusId }) && (
            <TextField
              error={errorFields.Remarks2.length > 0}
              multiline
              label="SSD Remarks"
              name="Remarks2"
              onChange={onTextChange}
              value={formData.Remarks2 || ''}
              variant="standard"
              className={classes.textField}
              helperText={errorFields.Remarks2}
            />
          )}
          
          {checkComponentVisibility('remarks2Display', isEdit, userRoles, { statusId: formData.StatusId }) && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                SSD Remarks
              </Box>
              <Box 
                component="span" 
                style={{ 
                  display: 'block', 
                  fontWeight: 500, 
                  margin: '4px', 
                  whiteSpace: 'pre-wrap', 
                  wordWrap: 'break-word' 
                }} 
                className={classes.labelbottom}
              >
                {formData.Remarks2}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
    </>
  );
};

export default ApprovalSection;
