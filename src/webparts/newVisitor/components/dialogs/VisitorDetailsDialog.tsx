import * as React from 'react';
import { useState, useEffect } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { DialogProps } from '@material-ui/core/Dialog';
import { IVisitorDetails } from '../../models/IVisitorDetails';
import { IVisitorDetailsErrors } from '../../models/IFormErrors';
import { validateVisitorDetailsForm } from '../../validations/formValidation';

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
    datelabel: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  }),
);

/**
 * Visitor details dialog props
 */
export interface IVisitorDetailsDialogProps {
  open: boolean;
  mode: 'add' | 'edit';
  visitorDetails: IVisitorDetails;
  requireParking: boolean;
  onClose: (confirmed: boolean, visitorDetails?: IVisitorDetails) => void;
}

/**
 * Visitor details dialog component
 * @param props Component props
 * @returns Visitor details dialog component
 */
const VisitorDetailsDialog: React.FC<IVisitorDetailsDialogProps> = (props) => {
  const { open, mode, visitorDetails: initialVisitorDetails, requireParking, onClose } = props;
  const classes = useStyles();
  
  const [fullWidth, setFullWidth] = useState(true);
  const [maxWidth, setMaxWidth] = useState<DialogProps['maxWidth']>('md');
  const [visitorDetails, setVisitorDetails] = useState<IVisitorDetails>(initialVisitorDetails);
  const [errors, setErrors] = useState<IVisitorDetailsErrors>({});

  /**
   * Updates visitor details when props change
   */
  useEffect(() => {
    setVisitorDetails(initialVisitorDetails);
  }, [initialVisitorDetails]);

  /**
   * Handles text field change
   * @param e Event
   */
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedDetails = { ...visitorDetails };
    
    if (name === 'Car') {
      updatedDetails[name] = e.target.checked;
      
      if (!e.target.checked) {
        updatedDetails.Color = '';
        updatedDetails.DriverName = '';
        updatedDetails.DriverFirstName = '';
        updatedDetails.PlateNo = '';
        updatedDetails.TypeofVehicle = '';
      }
    } else {
      updatedDetails[name] = value;
    }
    
    setVisitorDetails(updatedDetails);
    
    // Validate field
    if (value === '') {
      setErrors(prev => ({ ...prev, [name]: 'This is a required input field' }));
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Handles dialog close
   * @param confirmed Whether the action was confirmed
   */
  const handleClose = (confirmed: boolean) => {
    if (confirmed) {
      const validation = validateVisitorDetailsForm(visitorDetails);
      
      if (validation.isValid) {
        onClose(true, visitorDetails);
      } else {
        setErrors(validation.errors);
      }
    } else {
      onClose(false);
    }
  };

  return (
    <Dialog
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      open={open}
      onClose={() => handleClose(false)}
      aria-labelledby="visitor-details-dialog-title"
    >
      <DialogTitle id="visitor-details-dialog-title">
        {mode === 'add' ? 'Add Visitor Details' : 'Edit Visitor Details'}
      </DialogTitle>
      <DialogContent>
        <form noValidate autoComplete="off">
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" className={classes.paper}>
                <TextField
                  inputProps={{ maxLength: 255 }}
                  error={Boolean(errors.Title)}
                  required
                  label="Visitor's Last Name"
                  name="Title"
                  onChange={handleTextChange}
                  value={visitorDetails.Title || ''}
                  variant="standard"
                  className={classes.textField}
                  helperText={errors.Title}
                />
              </Paper>
            </Grid>

              <Grid item xs={12} sm={6}>
              <Paper variant="outlined" className={classes.paper}>
                <TextField
                  inputProps={{ maxLength: 255 }}
                  error={Boolean(errors.FirstName)}
                  required
                  label="Visitor's First Name"
                  name="FirstName"
                  onChange={handleTextChange}
                  value={visitorDetails.FirstName || ''}
                  variant="standard"
                  className={classes.textField}
                  helperText={errors.FirstName}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" className={classes.paper}>
                <div className={classes.datelabel}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={visitorDetails.Car}
                        onChange={handleTextChange}
                        name="Car"
                        color="primary"
                      />
                    }
                    label="With Vehicle?"
                  />
                </div>
              </Paper>
            </Grid>

            {visitorDetails.Car && (
              <>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" className={classes.paper}>
                    <TextField
                      inputProps={{ maxLength: 255 }}
                      error={Boolean(errors.Color)}
                      required
                      label="Color"
                      name="Color"
                      onChange={handleTextChange}
                      value={visitorDetails.Color || ''}
                      variant="standard"
                      className={classes.textField}
                      helperText={errors.Color}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" className={classes.paper}>
                    <TextField
                      inputProps={{ maxLength: 255 }}
                      error={Boolean(errors.PlateNo)}
                      required
                      label="Plate No."
                      name="PlateNo"
                      onChange={handleTextChange}
                      value={visitorDetails.PlateNo || ''}
                      variant="standard"
                      className={classes.textField}
                      helperText={errors.PlateNo}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" className={classes.paper}>
                    <TextField
                      inputProps={{ maxLength: 255 }}
                      error={Boolean(errors.DriverName)}
                      required
                      label="Driver's Last Name"
                      name="DriverName"
                      onChange={handleTextChange}
                      value={visitorDetails.DriverName || ''}
                      variant="standard"
                      className={classes.textField}
                      helperText={errors.DriverName}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" className={classes.paper}>
                    <TextField
                      inputProps={{ maxLength: 255 }}
                      error={Boolean(errors.DriverFirstName)}
                      required
                      label="Driver's First Name"
                      name="DriverFirstName"
                      onChange={handleTextChange}
                      value={visitorDetails.DriverFirstName || ''}
                      variant="standard"
                      className={classes.textField}
                      helperText={errors.DriverFirstName}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" className={classes.paper}>
                    <TextField
                      inputProps={{ maxLength: 255 }}
                      error={Boolean(errors.TypeofVehicle)}
                      required
                      label="Type of Vehicle"
                      name="TypeofVehicle"
                      onChange={handleTextChange}
                      value={visitorDetails.TypeofVehicle || ''}
                      variant="standard"
                      className={classes.textField}
                      helperText={errors.TypeofVehicle}
                    />
                  </Paper>
                </Grid>
              </>
            )}
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose(false)} color="default">
          Cancel
        </Button>
        <Button onClick={() => handleClose(true)} color="primary" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VisitorDetailsDialog;
