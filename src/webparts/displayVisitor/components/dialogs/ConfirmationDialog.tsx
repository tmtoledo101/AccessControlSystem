import * as React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

export interface IConfirmationDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  
  /**
   * Dialog message
   */
  message: string;
  
  /**
   * Dialog title
   */
  title?: string;
  
  /**
   * Callback when the dialog is closed
   * @param confirmed Whether the user confirmed the action
   */
  onClose: (confirmed: boolean) => void;
}

/**
 * Confirmation dialog component
 * @param props Component properties
 * @returns JSX element
 */
const ConfirmationDialog: React.FC<IConfirmationDialogProps> = (props) => {
  const { open, message, title = 'Confirmation', onClose } = props;
  
  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} color="default">
          Cancel
        </Button>
        <Button onClick={() => onClose(true)} color="primary" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
