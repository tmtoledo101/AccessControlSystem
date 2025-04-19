import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import SendIcon from '@material-ui/icons/Send';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import DoneIcon from '@material-ui/icons/Done';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paperbutton: {
      textTransform: "none",
      margin: "5px",
    },
  }),
);

export interface IActionButtonsSectionProps {
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
   * The current status ID
   */
  statusId: number;
  
  /**
   * Callback when the submit button is clicked
   * @param e Event
   * @param action Action type
   */
  onSubmit: (e: React.MouseEvent, action: string) => void;
  
  /**
   * Callback when the cancel button is clicked
   * @param e Event
   */
  onCancel: (e: React.MouseEvent) => void;
  
  /**
   * Callback when the close button is clicked
   */
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
    isEncoder,
    isReceptionist,
    isApproverUser,
    isWalkinApproverUser,
    isSSDUser,
    statusId,
    onSubmit,
    onCancel,
    onClose
  } = props;
  
  const classes = useStyles();
  
  /**
   * Checks if a button should be visible based on user role and form state
   * @param element Element name
   * @returns Whether the element should be visible
   */
  const checkVisibility = (element: string): boolean => {
    const forApprover = isApproverUser && statusId === 2;
    const forWalkinApprover = isWalkinApproverUser && statusId === 2;
    const forSSD = isSSDUser && statusId === 3;
    const forEncoder = isEncoder && (statusId === 1 || statusId === 2);
    const forReceptionist = isReceptionist && (statusId === 1 || statusId === 2);
    const forReceptionistCompletion = isReceptionist && (statusId === 4 || statusId === 9);
    
    switch (element) {
      case 'addmain1':
        return isEdit && (forEncoder || forReceptionist || forReceptionistCompletion);
      case 'addmain2':
        return isEdit && ((isEncoder && statusId === 1) || (isReceptionist && statusId === 1));
      case 'close':
        return !isEdit;
      case 'addapproval':
        return isEdit && (forApprover || forSSD);
      case 'markcomplete':
        return isEdit && forReceptionistCompletion;
      default:
        return false;
    }
  };
  
  return (
    <Grid container justify="flex-end">
      {isEdit && (
        <ButtonGroup>
          {checkVisibility('addmain1') && (
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
                onClick={(e) => onSubmit(e, 'savedraft')}
              >
                Save
              </Button>
            </>
          )}
          
          {checkVisibility('addmain2') && (
            <Button 
              name="submit" 
              className={classes.paperbutton} 
              endIcon={<SendIcon />} 
              variant="contained" 
              color="primary" 
              onClick={(e) => onSubmit(e, 'submit')}
            >
              Submit
            </Button>
          )}
          
          {checkVisibility('markcomplete') && (
            <Button 
              name="markcomplete" 
              className={classes.paperbutton} 
              startIcon={<DoneIcon />} 
              variant="contained" 
              color="default" 
              onClick={(e) => onSubmit(e, 'markcomplete')}
            >
              Mark complete
            </Button>
          )}
        </ButtonGroup>
      )}
      
      {checkVisibility('addapproval') && (
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
            onClick={(e) => onSubmit(e, 'deny')}
          >
            Deny
          </Button>
          <Button 
            name="approve" 
            className={classes.paperbutton} 
            startIcon={<ThumbUpIcon />} 
            variant="contained" 
            color="primary" 
            onClick={(e) => onSubmit(e, 'approve')}
          >
            Approve
          </Button>
        </ButtonGroup>
      )}
      
      {checkVisibility('close') && (
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
