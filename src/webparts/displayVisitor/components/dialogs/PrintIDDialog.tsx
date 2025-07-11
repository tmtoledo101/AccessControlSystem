import * as React from 'react';
import { IVisitor } from '../../models/IVisitor';
import { IVisitorDetails } from '../../models/IVisitorDetails';
import { formatDate } from '../../helpers/dateHelpers';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ReactToPrint from 'react-to-print';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(1),
      borderColor: "transparent",
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 300,
    },
  }),
);

export interface IPrintIDDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  
  /**
   * Visitor details data
   */
  visitorDetails: IVisitorDetails;
  
  /**
   * Visitor data
   */
  visitor: IVisitor;
  
  /**
   * Color value
   */
  colorValue: string;
  
  /**
   * Item ID
   */
  itemId: number;
  
  /**
   * Item details ID
   */
  itemIdDetails: number;
  
  /**
   * Site URL
   */
  siteUrl: string;
  
  /**
   * Callback when the dialog is closed
   */
  onClose: () => void;
  
  /**
   * Print reference
   */
  printRef: React.RefObject<HTMLDivElement>;
}

/**
 * Print ID dialog component
 * @param props Component properties
 * @returns JSX element
 */
const PrintIDDialog: React.FC<IPrintIDDialogProps> = (props) => {
  const {
    open,
    visitorDetails,
    visitor,
    colorValue,
    itemId,
    itemIdDetails,
    siteUrl,
    onClose,
    printRef
  } = props;
  
  const classes = useStyles();
  const [fullWidth, setFullWidth] = React.useState(true);
  const [maxWidth, setMaxWidth] = React.useState<DialogProps['maxWidth']>('md');
  const [selectedColor, setSelectedColor] = React.useState('General');
  
  /**
   * Handles color change
   * @param e Event
   */
  const handleColorChange = (e: React.ChangeEvent<{ name?: string; value: any }>) => {
    setSelectedColor(e.target.value as string);
  };
  
  return (
    <Dialog
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      open={open}
      onClose={onClose}
      aria-labelledby="print-id-dialog-title"
    >
      <DialogTitle id="print-id-dialog-title">Print Preview of ID</DialogTitle>
      <DialogContent>
        <form noValidate autoComplete="off">
          <div style={{ padding: '0px' }}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Paper variant="outlined" className={classes.paper}>
                  <FormControl className={classes.textField}>
                    <InputLabel id="colorAccessLabel">Color Access</InputLabel>
                    <Select
                      labelId="colorAccessLabel"
                      id="colorAccess"
                      value={selectedColor}
                      onChange={handleColorChange}
                      name='colorAccess'
                    >
                      <MenuItem value="General">General</MenuItem>
                      <MenuItem value="Restricted">Restricted</MenuItem>
                      <MenuItem value="Confidential">Confidential</MenuItem>
                    </Select>
                  </FormControl>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper variant="outlined" className={classes.paper}>
                  <div style={{ maxWidth: '224px', fontFamily: 'Roboto' }} ref={printRef}>
                    <div>
                      <img src={`${siteUrl}/DocOthers/idprinthdr.png`} alt="BSP Logo" />
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
                            {visitorDetails.initFiles && visitorDetails.initFiles.length > 0 && (
                              <img 
                                src={`${siteUrl}/VisitorDetailsLib/${itemIdDetails}/${visitorDetails.initFiles[0]}`} 
                                alt="ID Photo" 
                                width="110px" 
                                height="110px" 
                              />
                            )}
                          </td>
                          <td style={{ fontSize: '8px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                            {`${visitorDetails.GateNo}\n${visitor.Title}\nValidity:\n${formatDate(visitor.DateTimeVisit)}-\n${formatDate(visitor.DateTimeArrival)}`}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div style={{ paddingLeft: '10px', fontSize: '10px', textAlign: 'left' }}>
                      Person to Visit
                    </div>
                    <div style={{ paddingLeft: '10px', fontSize: '10px', fontWeight: 'bold', textAlign: 'left' }}>
                      {visitor.ContactName}
                    </div>
                    <div style={{ paddingLeft: '10px', fontSize: '10px', textAlign: 'left' }}>
                      Department
                    </div>
                    <div style={{ paddingLeft: '10px', fontSize: '10px', fontWeight: 'bold', textAlign: 'left' }}>
                      {visitor.Dept.Title}
                    </div>
                    <div>&nbsp;</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', backgroundColor: colorValue }}>
                      {visitor.Bldg}
                    </div>
                  </div>
                </Paper>
              </Grid>
            </Grid>
          </div>
        </form>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="default">
          Cancel
        </Button>
        <ReactToPrint
          trigger={() => (
            <Button color="primary" autoFocus>
              Print
            </Button>
          )}
          content={() => printRef.current}
        />
      </DialogActions>
    </Dialog>
  );
};

export default PrintIDDialog;
