import * as React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Grid
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ReactToPrint from "react-to-print";
import { IVisitor } from '../../interfaces/IVisitor';
import { IVisitorDetails } from '../../interfaces/IVisitorDetails';
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
    }
}));

interface IPrintPreviewDialogProps {
    open: boolean;
    siteUrl: string;
    visitorData: IVisitor;
    visitorDetails: IVisitorDetails;
    colorList: any[];
    colorValue: string;
    onClose: () => void;
    onColorChange: (value: string) => void;
}

export const PrintPreviewDialog: React.FC<IPrintPreviewDialogProps> = ({
    open,
    siteUrl,
    visitorData,
    visitorDetails,
    colorList,
    colorValue,
    onClose,
    onColorChange
}) => {
    const classes = useStyles();
    const printRef = React.useRef<any>();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>Print Preview of ID</DialogTitle>
            <DialogContent>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Paper variant="outlined" className={classes.paper}>
                            <FormControl className={classes.textField}>
                                <InputLabel>Color Access</InputLabel>
                                <Select
                                    value={visitorData.colorAccess}
                                    onChange={(e) => onColorChange(e.target.value as string)}
                                    name='colorAccess'
                                >
                                    {colorList.map((item) => (
                                        <MenuItem key={item.Title} value={item.Title}>
                                            {item.Title}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper variant="outlined" className={classes.paper}>
                            <div style={{ maxWidth: '224px', fontFamily: 'Roboto' }} ref={printRef}>
                                <div>
                                    <img 
                                        src={`${siteUrl}/DocOthers/idprinthdr.png`} 
                                        alt="BSP Logo"
                                    />
                                </div>
                                <div>&nbsp;</div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>
                                    {visitorDetails.Title}
                                </div>
                                <div>&nbsp;</div>
                                <table style={{ padding: '1px' }}>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <img 
                                                    src={`${siteUrl}/VisitorDetailsLib/${visitorDetails.ID}/${visitorDetails.initFiles[0]}`}
                                                    alt="ID Photo"
                                                    width="110px"
                                                    height="110px"
                                                />
                                            </td>
                                            <td style={{ 
                                                fontSize: '8px', 
                                                whiteSpace: 'pre-wrap', 
                                                wordWrap: 'break-word' 
                                            }}>
                                                {`${visitorDetails.GateNo}\n${visitorData.Title}\nValidity:\n${moment(visitorData.DateTimeVisit).format('MM/DD/yyyy')}-\n${moment(visitorData.DateTimeArrival).format('MM/DD/yyyy')}`}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div style={{ paddingLeft: '10px', fontSize: '10px', textAlign: 'left' }}>
                                    Person to Visit
                                </div>
                                <div style={{ 
                                    paddingLeft: '10px', 
                                    fontSize: '10px', 
                                    fontWeight: 'bold', 
                                    textAlign: 'left' 
                                }}>
                                    {visitorData.ContactName}
                                </div>
                                <div style={{ paddingLeft: '10px', fontSize: '10px', textAlign: 'left' }}>
                                    Department
                                </div>
                                <div style={{ 
                                    paddingLeft: '10px', 
                                    fontSize: '10px', 
                                    fontWeight: 'bold', 
                                    textAlign: 'left' 
                                }}>
                                    {visitorData.Dept.Title}
                                </div>
                                <div>&nbsp;</div>
                                <div style={{ 
                                    fontSize: '16px', 
                                    fontWeight: 'bold', 
                                    textAlign: 'center', 
                                    backgroundColor: colorValue 
                                }}>
                                    {visitorData.Bldg}
                                </div>
                            </div>
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="default">
                    Cancel
                </Button>
                <ReactToPrint
                    trigger={() => (
                        <Button color="primary">
                            Print
                        </Button>
                    )}
                    content={() => printRef.current}
                />
            </DialogActions>
        </Dialog>
    );
};
