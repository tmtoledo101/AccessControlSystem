import * as React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button 
} from '@material-ui/core';

interface IConfirmationDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  
  /**
   * The dialog title
   */
  title: string;
  
  /**
   * The dialog message
   */
  message: string;
  
  /**
   * The cancel button text
   */
  cancelText?: string;
  
  /**
   * The confirm button text
   */
  confirmText?: string;
  
  /**
   * The dialog close handler
   * @param confirmed Whether the dialog was confirmed
   */
  onClose: (confirmed: boolean) => void;
}

/**
 * Confirmation Dialog component
 */
export const ConfirmationDialog: React.FC<IConfirmationDialogProps> = ({
  open,
  title,
  message,
  cancelText = 'Cancel',
  confirmText = 'OK',
  onClose
}) => {
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
          {cancelText}
        </Button>
        <Button onClick={() => onClose(true)} color="primary" autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
