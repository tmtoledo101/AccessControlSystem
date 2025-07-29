import * as React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

/**
 * Confirmation dialog props
 */
export interface IConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: (confirmed: boolean) => void;
}

/**
 * Confirmation dialog component
 * @param props Component props
 * @returns Confirmation dialog component
 */
const ConfirmationDialog: React.FC<IConfirmationDialogProps> = (props) => {
  const { open, title, message, onClose } = props;

  /**
   * Handles dialog close
   * @param confirmed Whether the action was confirmed
   */
  const handleClose = (confirmed: boolean) => {
    onClose(confirmed);
  };

  return (
    <Dialog
      open={open}
      onClose={() => handleClose(false)}
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
        <Button onClick={() => handleClose(false)} color="default">
          Cancel
        </Button>
        <Button onClick={() => handleClose(true)} color="primary" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
