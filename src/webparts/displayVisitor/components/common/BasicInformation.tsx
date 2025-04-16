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
import { Autocomplete } from '@material-ui/lab';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
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
    dateField: {
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

interface IBasicInformationProps {
    data: IVisitor;
    errors: IErrorFields;
    isEdit: boolean;
    purposeList: any[];
    deptList: any[];
    bldgList: any[];
    contactList: any[];
    refNo?: string;
    onInputChange: (name: string, value: any) => void;
    onContactSelect: (event: any, value: any) => void;
    onContactSearch: (value: string) => void;
}

export const BasicInformation: React.FC<IBasicInformationProps> = ({
    data,
    errors,
    isEdit,
    purposeList,
    deptList,
    bldgList,
    contactList,
    refNo,
    onInputChange,
    onContactSelect,
    onContactSearch
}) => {
    const classes = useStyles();
    const [isAC1Open, setAC1Open] = React.useState(false);

    const renderEditField = (
        name: string,
        label: string,
        value: any,
        error: string,
        type: 'text' | 'select' | 'datetime' | 'autocomplete' = 'text',
        options?: any[]
    ) => {
        if (type === 'select') {
            console.log(`Rendering ${name} dropdown:`, {
                value,
                options: (options || []).map((item) => ({
                    id: item.Id,
                    title: item.Title
                  }))
            });
            if (name === 'Purpose') {
                console.log('Purpose list:', purposeList);
            } else if (name === 'Bldg') {
                console.log('Building list:', bldgList);
            }
        }
        switch (type) {
            case 'select':
                return (
                    <FormControl className={classes.textField} error={!!error}>
                        <InputLabel>{label} *</InputLabel>
                        <Select
                            value={value}
                            onChange={(e) => onInputChange(name, e.target.value)}
                            name={name}
                        >
                           {options && options.map((item) => {
                                console.log(`MenuItem for ${name}:`, { 
                                    key: item.Id || item.Title,
                                    value: item.Title,
                                    title: item.Title,
                                    fullItem: item
                                });
                                return (
                                    <MenuItem 
                                        key={item.Id || item.Title} 
                                        value={item.Title}
                                    >
                                        {item.Title}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                        <FormHelperText>{error}</FormHelperText>
                    </FormControl>
                );
            case 'datetime':
                return (
                    <FormControl className={classes.textField} error={!!error}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <DateTimePicker
                                label={label}
                                value={value}
                                onChange={(date) => onInputChange(name, date)}
                                format="MM/dd/yyyy HH:mm"
                                error={!!error}
                                InputProps={{ className: classes.dateField }}
                            />
                        </MuiPickersUtilsProvider>
                        <FormHelperText>{error}</FormHelperText>
                    </FormControl>
                );
            case 'autocomplete':
                return (
                    <FormControl className={classes.textField} error={!!error}>
                        <Autocomplete
                            open={isAC1Open}
                            onOpen={() => setAC1Open(true)}
                            onClose={() => setAC1Open(false)}
                            getOptionSelected={(option, selectedValue) => option.EmpNo === selectedValue.EmpNo}
                            getOptionLabel={(option) => option.Name || ''}
                            options={contactList}
                            onChange={onContactSelect}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={label}
                                    variant="standard"
                                    onChange={(e) => onContactSearch(e.target.value)}
                                    error={!!error}
                                    helperText={error}
                                />
                            )}
                        />
                    </FormControl>
                );
            default:
                return (
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
        }
    };

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
                    {renderDisplayField('Request Date', data.RequestDate ? new Date(data.RequestDate).toLocaleString() : '')}
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                    {renderDisplayField('Reference No.', refNo || '')}
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                    {isEdit ? (
                        renderEditField('ExternalType', 'External Type', data.ExternalType, errors.ExternalType, 'select', [
                            { Title: 'Walk-in' },
                            { Title: 'Pre-registered' }
                        ])
                    ) : (
                        renderDisplayField('External Type', data.ExternalType)
                    )}
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                    {
                    isEdit ? (
                    renderEditField('Purpose', 'Purpose', data.Purpose, errors.Purpose, 'select', purposeList)
                    ) : (
                        renderDisplayField('Purpose',
                        (function () {
                            const match = purposeList.find(p => p.Title === data.Purpose);
                            return match ? match.Title : data.Purpose;
                        })()
                        )
                    )
                    }
                </Paper>
            </Grid>

            {data.Purpose === 'Others' && (
                <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" className={classes.paper}>
                        {isEdit ? (
                            renderEditField('PurposeOthers', 'Others', data.PurposeOthers, errors.PurposeOthers)
                        ) : (
                            renderDisplayField('Others', data.PurposeOthers)
                        )}
                    </Paper>
                </Grid>
            )}

            <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                    {isEdit ? (
                        renderEditField('DeptId', 'Department to Visit', data.DeptId, errors.DeptId, 'select', deptList)
                    ) : (
                        renderDisplayField('Department to Visit', data.Dept && data.Dept.Title)
                    )}
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                    {isEdit ? (
                    renderEditField('Bldg', 'Building', data.Bldg, errors.Bldg, 'select', bldgList)
                    ) : (
                    renderDisplayField('Building', (function () {
                        const matchedBldg = bldgList.find(b => b.Title === data.Bldg);
                        return matchedBldg ? matchedBldg.Title : data.Bldg;
                    })())
                    )}
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                    {isEdit ? (
                        renderEditField('RoomNo', 'Room No.', data.RoomNo, errors.RoomNo)
                    ) : (
                        renderDisplayField('Room No.', data.RoomNo)
                    )}
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                    {isEdit ? (
                        renderEditField('EmpNo', 'Contact Person', data.EmpNo, errors.EmpNo, 'autocomplete')
                    ) : (
                        renderDisplayField('Contact Person', data.ContactName)
                    )}
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                    {renderDisplayField('Position', data.Position)}
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                    {renderDisplayField('Direct No.', data.DirectNo)}
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                    {renderDisplayField('Local No.', data.LocalNo)}
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                    {isEdit ? (
                        renderEditField('DateTimeVisit', 'Date and Time of Visit From', data.DateTimeVisit, errors.DateTimeVisit, 'datetime')
                    ) : (
                        renderDisplayField('Date and Time of Visit From', data.DateTimeVisit)
                    )}
                </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                    {isEdit ? (
                        renderEditField('DateTimeArrival', 'Date and Time of Visit To', data.DateTimeArrival, errors.DateTimeArrival, 'datetime')
                    ) : (
                        renderDisplayField('Date and Time of Visit To', data.DateTimeArrival)
                    )}
                </Paper>
            </Grid>
        </>
    );
};
