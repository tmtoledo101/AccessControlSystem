import * as React from 'react';
import { IVisitor, IFormError } from '../../models/IVisitor';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { formatDateTime } from '../../helpers/dateHelpers';

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
  /**
   * Visitor data
   */
  visitor: IVisitor;
  
  /**
   * Error state
   */
  errorFields: IFormError;
  
  /**
   * Whether the form is in edit mode
   */
  isEdit: boolean;
  
  /**
   * Whether the current user is an encoder
   */
  isEncoder: boolean;
  
  /**
   * Whether the current user is a receptionist
   */
  isReceptionist: boolean;
  
  /**
   * Whether the current user is an approver
   */
  isApproverUser: boolean;
  
  /**
   * Whether the current user is a walkin approver
   */
  isWalkinApproverUser: boolean;
  
  /**
   * Whether the current user is an SSD user
   */
  isSSDUser: boolean;
  
  /**
   * List of approvers
   */
  approverList: any[];
  
  /**
   * List of walkin approvers
   */
  walkinApproverList: any[];
  
  /**
   * Callback when a text field is changed
   * @param e Change event
   */
  onChangeTxt: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  /**
   * Callback when a select field is changed
   * @param e Change event
   */
  onChangeCbo: (e: React.ChangeEvent<{ name?: string; value: any }>) => void;
}

/**
 * Approval section component
 * @param props Component properties
 * @returns JSX element
 */
const ApprovalSection: React.FC<IApprovalSectionProps> = (props) => {
  const {
    visitor,
    errorFields,
    isEdit,
    isEncoder,
    isReceptionist,
    isApproverUser,
    isWalkinApproverUser,
    isSSDUser,
    approverList,
    walkinApproverList,
    onChangeTxt,
    onChangeCbo
  } = props;
  
  const classes = useStyles();
  
  /**
   * Checks if a field should be visible based on user role and form state
   * @param element Element name
   * @returns Whether the element should be visible
   */
  const checkVisibility = (element: string): boolean => {
    const forApprover = isApproverUser && visitor.StatusId === 2;
    const forWalkinApprover = isWalkinApproverUser && visitor.StatusId === 2;
    const forSSD = isSSDUser && visitor.StatusId === 3;
    const forEncoder = isEncoder && (visitor.StatusId === 1 || visitor.StatusId === 2);
    const forReceptionist = isReceptionist && (visitor.StatusId === 1 || visitor.StatusId === 2);
    const forReceptionistCompletion = isReceptionist && (visitor.StatusId === 4 || visitor.StatusId === 9);
    
    switch (element) {
      case 'approversedit':
        return isEdit && forEncoder && visitor.StatusId === 1;
      case 'walkinapproversedit':
        return isEdit && forReceptionist && visitor.StatusId === 1;
      case 'approversdisp':
        return visitor.ApproverId !== null && (!isEdit || (isEdit && !forEncoder && !forReceptionist));
      case 'remarks1edit':
        return isEdit && forApprover;
      case 'remarks1disp':
        return !!visitor.Remarks1 && (!isEdit || (isEdit && !forApprover));
      case 'remarks2edit':
        return isEdit && forSSD;
      case 'remarks2disp':
        return !!visitor.Remarks2 && (!isEdit || (isEdit && !forSSD));
      case 'ssdapproverdisp':
        return !!visitor.SSDApproverId && (!isEdit || isEdit);
      case 'ssddatedisp':
        return !!visitor.SSDDate && (!isEdit || isEdit);
      case 'deptdatedisp':
        return !!visitor.DeptApproverDate && (!isEdit || isEdit);
      case 'markcompletedatedisp':
        return !!visitor.MarkCompleteDate && (!isEdit || isEdit);
      default:
        return false;
    }
  };
  
  return (
    <>
      <Grid item xs={12} sm={12}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('approversedit') && (
            <FormControl className={classes.textField} error={!!errorFields.ApproverId}>
              <InputLabel id="approversLabel">Forward for Approval *</InputLabel>
              <Select
                labelId="approversLabel"
                id="ApproverId"
                value={visitor.ApproverId}
                onChange={onChangeCbo}
                name='ApproverId'
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
          
          {checkVisibility('walkinapproversedit') && (
            <FormControl className={classes.textField} error={!!errorFields.ApproverId}>
              <InputLabel id="approversLabel">Forward for Approval *</InputLabel>
              <Select
                labelId="approversLabel"
                id="ApproverId"
                value={visitor.ApproverId}
                onChange={onChangeCbo}
                name='ApproverId'
              >
                {walkinApproverList.map((item) => (
                  <MenuItem key={item.NameId} value={item.NameId}>
                    {item.Name.Title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errorFields.ApproverId}</FormHelperText>
            </FormControl>
          )}
          
          {checkVisibility('approversdisp') && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Dept. Approver
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {visitor.Approver && visitor.Approver.Title}

              </Box>
            </>
          )}
          
          {checkVisibility('deptdatedisp') && (
            <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
              {formatDateTime(visitor.DeptApproverDate)}
            </Box>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={12}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('remarks1edit') && (
            <TextField
              error={!!errorFields.Remarks1}
              multiline
              label="Approver's Remarks"
              name="Remarks1"
              onChange={onChangeTxt}
              value={visitor.Remarks1}
              variant="standard"
              className={classes.textField}
              helperText={errorFields.Remarks1}
            />
          )}
          
          {checkVisibility('remarks1disp') && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Dept. Approver's Remarks
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
                {visitor.Remarks1}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={12}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('ssdapproverdisp') && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                SSD Approver
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
              {visitor.SSDApprover && visitor.SSDApprover.Title}
              </Box>
            </>
          )}
          
          {checkVisibility('ssddatedisp') && (
            <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
              {formatDateTime(visitor.SSDDate)}
            </Box>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={12}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('remarks2edit') && (
            <TextField
              error={!!errorFields.Remarks2}
              multiline
              label="SSD Remarks"
              name="Remarks2"
              onChange={onChangeTxt}
              value={visitor.Remarks2}
              variant="standard"
              className={classes.textField}
              helperText={errorFields.Remarks2}
            />
          )}
          
          {checkVisibility('remarks2disp') && (
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
                {visitor.Remarks2}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={12}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('markcompletedatedisp') && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Completed by
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
              {visitor.Receptionist && visitor.Receptionist.Title}
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {formatDateTime(visitor.MarkCompleteDate)}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
    </>
  );
};

export default ApprovalSection;
