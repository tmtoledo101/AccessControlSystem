import * as React from 'react';
import { Snackbar } from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

interface INotificationProps {
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onClose: () => void;
    additionalMessages?: string[];
}

export const Notification: React.FC<INotificationProps> = ({
    open,
    message,
    type,
    onClose,
    additionalMessages = []
}) => {
    return (
        <Snackbar 
            open={open} 
            autoHideDuration={2000} 
            onClose={onClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <Alert severity={type} onClose={onClose}>
                {message}
                {additionalMessages.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </Alert>
        </Snackbar>
    );
};
