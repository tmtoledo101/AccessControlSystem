import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import SendIcon from '@material-ui/icons/Send';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { checkComponentVisibility } from '../../helpers/uiHelpers';
import { IUserRoles } from '../../models/IEmployeeDetails';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paperbutton: {
      textTransform: "none",
      margin: "5px",
    },
  }),
);

export interface IActionButtonsSectionProps {
  isEdit: boolean;
  userRoles: IUserRoles;
  statusId: number;
  onCancel: () => void;
  onSave: () => void;
  onSubmit: () => void;
  onApprove: () => void;
  onDeny: () => void;
  onClose: () => void;
}

/**
 * Action buttons section component
 * @param props Component properties
 * @returns JSX element
 */
const ActionButtonsSection: React.FC<IActionButtonsSectionProps> = (props) => {
  const { 
    isEdit, 
    userRoles, 
    statusId, 
    onCancel, 
    onSave, 
    onSubmit, 
    onApprove, 
    onDeny, 
    onClose 
  } = props;
  
  const classes = useStyles();

  return (
    <Grid container justify="flex-end">
      {isEdit && (
        <ButtonGroup>
          {checkComponentVisibility('saveButton', isEdit, userRoles, { statusId }) && (
            <>
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
                name="savedraft" 
                className={classes.paperbutton} 
                startIcon={<SaveIcon />} 
                variant="contained" 
                color="default" 
                onClick={onSave}
              >
                Save
              </Button>
            </>
          )}
          
          {checkComponentVisibility('submitButton', isEdit, userRoles, { statusId }) && (
            <Button 
              name="submit" 
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
      
      {checkComponentVisibility('approvalButtons', isEdit, userRoles, { statusId }) && (
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
            name="deny" 
            className={classes.paperbutton} 
            startIcon={<ThumbDownIcon />} 
            variant="contained" 
            color="default" 
            onClick={onDeny}
          >
            Deny
          </Button>
          <Button 
            name="approve" 
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
      
      {checkComponentVisibility('closeButton', isEdit, userRoles, { statusId }) && (
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

export default ActionButtonsSection;
