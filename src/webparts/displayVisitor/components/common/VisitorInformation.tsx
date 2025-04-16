import * as React from 'react';
import {
    TextField,
    FormControl,
    FormControlLabel,
    Checkbox,
    Paper,
    Grid,
    Box
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { IVisitor, IErrorFields } from '../../interfaces/IVisitor';

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
    },
    datelabel: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    }
}));

interface IVisitorInformationProps {
    data: IVisitor;
    errors: IErrorFields;
    isEdit: boolean;
    onInputChange: (name: string, value: any) => void;
}

export const VisitorInformation: React.FC<IVisitorInformationProps> = ({
    data,
    errors,
    isEdit,
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

    const renderDisplayField = (label: string, value: any) => (
        <>
            <Box component="span" className={classes.labeltop}>{label}</Box>
            <Box component="span" className={classes.labelbottom}>{value}</Box>
        </>
    );

    return (
        <>
            <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                    {isEdit ? (
                        renderEditField('CompanyName', 'Company Name', data.CompanyName, errors.CompanyName)
                    ) : (
                        renderDisplayField('Company Name', data.CompanyName)
                    )}
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                    {isEdit ? (
                        renderEditField('Address', 'Address', data.Address, errors.Address, true)
                    ) : (
                        renderDisplayField('Address', data.Address)
                    )}
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                    {isEdit ? (
                        renderEditField('VisContactNo', 'Contact No.', data.VisContactNo, errors.VisContactNo)
                    ) : (
                        renderDisplayField('Contact No.', data.VisContactNo)
                    )}
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                    {isEdit ? (
                        renderEditField('VisLocalNo', 'Local No.', data.VisLocalNo, errors.VisLocalNo)
                    ) : (
                        renderDisplayField('Local No.', data.VisLocalNo)
                    )}
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                    <div className={classes.datelabel}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={data.RequireParking}
                                    onChange={(e) => onInputChange('RequireParking', e.target.checked)}
                                    name="RequireParking"
                                    color="primary"
                                    disabled={!isEdit}
                                />
                            }
                            label="Request for Parking"
                        />
                    </div>
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                {renderDisplayField('Form Status', data.Status && data.Status.Title)}
                </Paper>
            </Grid>
        </>
    );
};
