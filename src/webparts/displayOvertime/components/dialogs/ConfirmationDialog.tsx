import * as React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

export interface IConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: (confirmed: boolean) => void;
}

/**
 * Confirmation dialog component
 * @param props Component properties
 * @returns JSX element
 */
const ConfirmationDialog: React.FC<IConfirmationDialogProps> = (props) => {
  const { open, title, message, onClose } = props;
  
  const handleCancel = () => {
    onClose(false);
  };
  
  const handleConfirm = () => {
    onClose(true);
  };
  
  return (
    <Dialog
      open={open}
      onClose={handleCancel}
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
        <Button onClick={handleCancel} color="default">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
