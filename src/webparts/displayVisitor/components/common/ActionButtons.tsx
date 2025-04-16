import * as React from 'react';
import {
    Button,
    ButtonGroup,
    Grid,
    Theme
} from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import SendIcon from '@material-ui/icons/Send';
import DoneIcon from '@material-ui/icons/Done';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';

const useStyles = makeStyles((theme: Theme) => createStyles({
    paperbutton: {
        textTransform: "none",
        margin: "5px",
    }
}));

interface IActionButtonsProps {
    isEdit: boolean;
    isEncoder: boolean;
    isReceptionist: boolean;
    isApprover: boolean;
    isWalkinApprover: boolean;
    isSSDUser: boolean;
    statusId: number;
    onCancel: () => void;
    onSave: () => void;
    onSubmit: () => void;
    onApprove: () => void;
    onDeny: () => void;
    onMarkComplete: () => void;
    onClose: () => void;
}

export const ActionButtons: React.FC<IActionButtonsProps> = ({
    isEdit,
    isEncoder,
    isReceptionist,
    isApprover,
    isWalkinApprover,
    isSSDUser,
    statusId,
    onCancel,
    onSave,
    onSubmit,
    onApprove,
    onDeny,
    onMarkComplete,
    onClose
}) => {
    const classes = useStyles();

    const renderMainActions = () => (
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
            {((isEncoder && statusId === 1) || (isReceptionist && statusId === 1)) && (
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
            {isReceptionist && (statusId === 4 || statusId === 9) && (
                <Button 
                    className={classes.paperbutton} 
                    startIcon={<DoneIcon />} 
                    variant="contained" 
                    color="default" 
                    onClick={onMarkComplete}
                >
                    Mark complete
                </Button>
            )}
        </ButtonGroup>
    );

    const renderApprovalActions = () => (
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
    );

    const renderCloseButton = () => (
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
    );

    return (
        <Grid container justify="flex-end">
            {isEdit ? (
                ((isEncoder || isReceptionist) && (statusId === 1 || statusId === 4 || statusId === 9)) ? (
                    renderMainActions()
                ) : (
                    ((isApprover || isWalkinApprover) && statusId === 2) || (isSSDUser && statusId === 3) ? (
                        renderApprovalActions()
                    ) : null
                )
            ) : (
                renderCloseButton()
            )}
        </Grid>
    );
};
