import * as React from 'react';
import {
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Paper,
    Grid,
    Box
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { IVisitor, IErrorFields } from '../../interfaces/IVisitor';
import moment from 'moment';

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(1),
        borderColor: "transparent",
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 300,
    },
    labeltop: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        fontSize: '12px',
        color: '#0000008A',
    },
    labelbottom: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        fontSize: '18px',
    }
}));

interface IApprovalSectionProps {
    data: IVisitor;
    errors: IErrorFields;
    isEdit: boolean;
    approverList: any[];
    walkinApproverList: any[];
    onInputChange: (name: string, value: any) => void;
}

export const ApprovalSection: React.FC<IApprovalSectionProps> = ({
    data,
    errors,
    isEdit,
    approverList,
    walkinApproverList,
    onInputChange
}) => {
    const classes = useStyles();

    const renderEditField = (name: string, label: string, value: any, error: string, multiline: boolean = false) => (
        <TextField
            className={classes.textField}
            label={label}
            name={name}
            value={value}
            onChange={(e) => onInputChange(name, e.target.value)}
            error={!!error}
            helperText={error}
            required
            multiline={multiline}
        />
    );

    const renderSelectField = (name: string, label: string, value: any, error: string, options: any[]) => (
        <FormControl className={classes.textField} error={!!error}>
            <InputLabel>{label} *</InputLabel>
            <Select
                value={value}
                onChange={(e) => onInputChange(name, e.target.value)}
                name={name}
            >
                {options.map((item) => (
                    <MenuItem key={item.NameId} value={item.NameId}>
                        {item.Name.Title}
                    </MenuItem>
                ))}
            </Select>
            <FormHelperText>{error}</FormHelperText>
        </FormControl>
    );

    const renderDisplayField = (label: string, value: any) => (
        <>
            <Box component="span" className={classes.labeltop}>{label}</Box>
            <Box component="span" className={classes.labelbottom}>{value}</Box>
        </>
    );

    const renderDateField = (label: string, date: Date) => (
        date && (
            <>
                <Box component="span" className={classes.labeltop}>{label}</Box>
                <Box component="span" className={classes.labelbottom}>
                    {moment(date).format('MM/DD/yyyy HH:mm')}
                </Box>
            </>
        )
    );

    return (
        <>
            <Grid item xs={12} sm={12}>
                <Paper variant="outlined" className={classes.paper}>
                    {isEdit ? (
                        data.ExternalType === 'Walk-in' ? (
                            renderSelectField('ApproverId', 'Forward for Approval', data.ApproverId, errors.ApproverId, walkinApproverList)
                        ) : (
                            renderSelectField('ApproverId', 'Forward for Approval', data.ApproverId, errors.ApproverId, approverList)
                        )
                    ) : (
                        data.Approver && data.Approver.Title && (
                            <>
                              {renderDisplayField('Dept. Approver', data.Approver.Title)}
                              {renderDateField('Approval Date', data.DeptApproverDate)}
                            </>
                          )                          
                    )}
                </Paper>
            </Grid>

            <Grid item xs={12} sm={12}>
                <Paper variant="outlined" className={classes.paper}>
                    {isEdit && data.StatusId === 2 ? (
                        renderEditField('Remarks1', "Approver's Remarks", data.Remarks1, errors.Remarks1, true)
                    ) : (
                        data.Remarks1 && renderDisplayField('Dept. Approver\'s Remarks', data.Remarks1)
                    )}
                </Paper>
            </Grid>

            <Grid item xs={12} sm={12}>
                <Paper variant="outlined" className={classes.paper}>
                {data.SSDApprover && data.SSDApprover.Title && (
                    <>
                        {renderDisplayField('SSD Approver', data.SSDApprover.Title)}
                        {renderDateField('SSD Approval Date', data.SSDDate)}
                    </>
                    )}
                </Paper>
            </Grid>

            <Grid item xs={12} sm={12}>
                <Paper variant="outlined" className={classes.paper}>
                    {isEdit && data.StatusId === 3 ? (
                        renderEditField('Remarks2', 'SSD Remarks', data.Remarks2, errors.Remarks2, true)
                    ) : (
                        data.Remarks2 && renderDisplayField('SSD Remarks', data.Remarks2)
                    )}
                </Paper>
            </Grid>

            {data.Receptionist && data.Receptionist.Title && (
            <Grid item xs={12} sm={12}>
                <Paper variant="outlined" className={classes.paper}>
                {renderDisplayField('Completed by', data.Receptionist.Title)}
                {renderDateField('Completion Date', data.MarkCompleteDate)}
                </Paper>
            </Grid>
            )}
        </>
    );
};
