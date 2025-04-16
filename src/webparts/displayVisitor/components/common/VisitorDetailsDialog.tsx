import * as React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    FormControlLabel,
    Checkbox,
    Grid,
    Paper
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DropzoneArea } from 'material-ui-dropzone';
import { IVisitorDetails } from '../../interfaces/IVisitorDetails';
import { IVisitorDetailsError } from '../../interfaces/IVisitorDetails';

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
    previewChip: {
        minWidth: 160,
        maxWidth: 210
    }
}));

interface IVisitorDetailsDialogProps {
    open: boolean;
    data: IVisitorDetails;
    errors: IVisitorDetailsError;
    isEdit: boolean;
    IDList: any[];
    GateList: any[];
    onClose: () => void;
    onSave: () => void;
    onInputChange: (name: string, value: any) => void;
    onFileChange: (files: File[]) => void;
}

export const VisitorDetailsDialog: React.FC<IVisitorDetailsDialogProps> = ({
    open,
    data,
    errors,
    isEdit,
    IDList,
    GateList,
    onClose,
    onSave,
    onInputChange,
    onFileChange
}) => {
    const classes = useStyles();

    const renderEditField = (name: string, label: string, value: any, error: string) => (
        <TextField
            className={classes.textField}
            label={label}
            name={name}
            value={value}
            onChange={(e) => onInputChange(name, e.target.value)}
            error={!!error}
            helperText={error}
            required
        />
    );

    const renderSelectField = (name: string, label: string, value: any, error: string, options: any[]) => (
        <FormControl className={classes.textField} error={!!error}>
            <InputLabel>{label}</InputLabel>
            <Select
                value={value}
                onChange={(e) => onInputChange(name, e.target.value)}
                name={name}
            >
                {options.map((item) => (
                    <MenuItem key={item.Title} value={item.Title}>
                        {item.Title}
                    </MenuItem>
                ))}
            </Select>
            <FormHelperText>{error}</FormHelperText>
        </FormControl>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>Visitor Details</DialogTitle>
            <DialogContent>
                <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" className={classes.paper}>
                            {renderEditField('Title', "Visitor's Name", data.Title, errors.Title)}
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" className={classes.paper}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={data.Car}
                                        onChange={(e) => onInputChange('Car', e.target.checked)}
                                        name="Car"
                                        color="primary"
                                    />
                                }
                                label="With Vehicle?"
                            />
                        </Paper>
                    </Grid>

                    {data.Car && (
                        <>
                            <Grid item xs={12} sm={6}>
                                <Paper variant="outlined" className={classes.paper}>
                                    {renderEditField('Color', 'Color', data.Color, errors.Color)}
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Paper variant="outlined" className={classes.paper}>
                                    {renderEditField('PlateNo', 'Plate No.', data.PlateNo, errors.PlateNo)}
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Paper variant="outlined" className={classes.paper}>
                                    {renderEditField('DriverName', "Driver's Name", data.DriverName, errors.DriverName)}
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Paper variant="outlined" className={classes.paper}>
                                    {renderEditField('TypeofVehicle', 'Type of Vehicle', data.TypeofVehicle, errors.TypeofVehicle)}
                                </Paper>
                            </Grid>
                        </>
                    )}

                    <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" className={classes.paper}>
                            {renderSelectField('IDPresented', 'ID Presented', data.IDPresented, errors.IDPresented, IDList)}
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" className={classes.paper}>
                            {renderSelectField('GateNo', 'Gate', data.GateNo, errors.GateNo, GateList)}
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" className={classes.paper}>
                            {renderEditField('AccessCard', 'Access Card No.', data.AccessCard, errors.AccessCard)}
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper variant="outlined" className={classes.paper}>
                            <DropzoneArea
                                acceptedFiles={['image/*']}
                                showFileNames={true}
                                showPreviews={true}
                                maxFileSize={70000000}
                                onChange={onFileChange}
                                filesLimit={10}
                                showPreviewsInDropzone={false}
                                useChipsForPreview
                                previewGridProps={{ container: { spacing: 1, direction: 'row' } }}
                                previewChipProps={{ classes: { root: classes.previewChip } }}
                                previewText="Selected files"
                                dropzoneText="Add a picture"
                                initialFiles={data.initFiles}
                            />
                            <FormHelperText error>{errors.Files}</FormHelperText>
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="default">
                    Cancel
                </Button>
                <Button onClick={onSave} color="primary">
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    );
};
