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
    open: boolean;
    title: string;
    message: string;
    onClose: (confirmed: boolean) => void;
}

export const ConfirmationDialog: React.FC<IConfirmationDialogProps> = ({
    open,
    title,
    message,
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
                    Cancel
                </Button>
                <Button onClick={() => onClose(true)} color="primary" autoFocus>
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    );
};
