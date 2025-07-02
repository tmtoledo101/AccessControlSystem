import * as React from 'react';
import { Grid, Button, ButtonGroup } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import SendIcon from '@material-ui/icons/Send';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import { IUserPermissions } from '../../utils/permissionUtils';
import { STATUS } from '../../constants/status';

// Styles
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paperbutton: {
      textTransform: "none",
      margin: "5px",
    }
  }),
);

interface IActionButtonsSectionProps {
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
   * Save button click handler
   */
  onSave: () => void;
  
  /**
   * Submit button click handler
   */
  onSubmit: () => void;
  
  /**
   * Approve button click handler
   */
  onApprove: () => void;
  
  /**
   * Deny button click handler
   */
  onDeny: () => void;
  
  /**
   * Cancel button click handler
   */
  onCancel: () => void;
  
  /**
   * Close button click handler
   */
  onClose: () => void;
}

/**
 * Action Buttons Section component
 */
export const ActionButtonsSection: React.FC<IActionButtonsSectionProps> = ({
  permissions,
  statusId,
  isEditMode,
  onSave,
  onSubmit,
  onApprove,
  onDeny,
  onCancel,
  onClose
}) => {
  const classes = useStyles();
  
  /**
   * Checks if the save/submit buttons should be visible
   */
  const shouldShowSaveSubmitButtons = (): boolean => {
    return isEditMode && (permissions.isEncoder || permissions.isReceptionist);
  };
  
  /**
   * Checks if the submit button should be visible
   */
  const shouldShowSubmitButton = (): boolean => {
    return isEditMode && 
           (permissions.isEncoder || permissions.isReceptionist) && 
           statusId === STATUS.DRAFT;
  };
  
  /**
   * Checks if the approval buttons should be visible
   */
  const shouldShowApprovalButtons = (): boolean => {
    return isEditMode && 
           ((permissions.isApproverUser && statusId === STATUS.PENDING_DEPT_APPROVAL) || 
            (permissions.isSSDUser && statusId === STATUS.PENDING_SSD_APPROVAL));
  };
  
  /**
   * Checks if the close button should be visible
   */
  const shouldShowCloseButton = (): boolean => {
    return !isEditMode;
  };
  
  return (
    <Grid container justify="flex-end">
      {shouldShowSaveSubmitButtons() && (
        <ButtonGroup>
          <Button 
            className={classes.paperbutton} 
            startIcon={<CancelIcon />} 
            variant="contained" 
            color="secondary" 
            onClick={onCancel}
          >
            Close
          </Button>
          
          <Button 
            className={classes.paperbutton} 
            startIcon={<SaveIcon />} 
            variant="contained" 
            color="default" 
            onClick={onSave}
          >
            Save
          </Button>
          
          {shouldShowSubmitButton() && (
            <Button 
              className={classes.paperbutton} 
              endIcon={<SendIcon />} 
              variant="contained" 
              color="primary" 
              onClick={onSubmit}
            >
              Submit
            </Button>
          )}
        </ButtonGroup>
      )}
      
      {shouldShowApprovalButtons() && (
        <ButtonGroup>
          <Button 
            className={classes.paperbutton} 
            startIcon={<CancelIcon />} 
            variant="contained" 
            color="default" 
            onClick={onCancel}
          >
            Close
          </Button>
          
          <Button 
            className={classes.paperbutton} 
            startIcon={<ThumbDownIcon />} 
            variant="contained" 
            color="default" 
            onClick={onDeny}
          >
            Deny
          </Button>
          
          <Button 
            className={classes.paperbutton} 
            startIcon={<ThumbUpIcon />} 
            variant="contained" 
            color="primary" 
            onClick={onApprove}
          >
            Approve
          </Button>
        </ButtonGroup>
      )}
      
      {shouldShowCloseButton() && (
        <ButtonGroup>
          <Button 
            className={classes.paperbutton} 
            variant="contained" 
            color="default" 
            onClick={onClose}
          >
            Close
          </Button>
        </ButtonGroup>
      )}
    </Grid>
  );
};
