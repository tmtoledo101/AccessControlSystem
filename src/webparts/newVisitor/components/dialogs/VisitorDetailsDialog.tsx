import * as React from 'react';
import { IVisitorDetails, IVisitorDetailsError } from '../../models/IVisitorDetails';
import { IVisitor } from '../../models/IVisitor';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { DropzoneArea } from 'material-ui-dropzone';

// Define styles
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
    previewChip: {
      minWidth: 160,
      maxWidth: 210
    },
  }),
);

/**
 * Visitor details dialog props
 */
export interface IVisitorDetailsDialogProps {
  open: boolean;
  visitorDetails: IVisitorDetails;
  errorDetails: IVisitorDetailsError;
  isEdit: boolean;
  idList: any[];
  gateList: any[];
  isApproverUser: boolean;
  isSSDUser: boolean;
  onClose: (confirmed: boolean) => void;
  onChangeTxt: (e: React.ChangeEvent<HTMLInputElement>) => void;
  //onChangeCbo: (e: React.ChangeEvent<{ name?: string; value: unknown }>) => void;
  onChangeCbo: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  //onChangeDropZone: (files: File[]) => void;
  onChangeDropZone: (files: File[]) => void;
  //onChipClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, row: string, ctrl: string) => void;
  onChipClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, row: string, ctrl: string) => void;
}

/**
 * Visitor details dialog component
 * @param props Component props
 * @returns JSX element
 */
const VisitorDetailsDialog: React.FC<IVisitorDetailsDialogProps> = (props) => {
  const {
    open,
    visitorDetails,
    errorDetails,
    isEdit,
    idList,
    gateList,
    isApproverUser,
    isSSDUser,
    onClose,
    onChangeTxt,
    onChangeCbo,
    onChangeDropZone,
    onChipClick
  } = props;

  const classes = useStyles();
  const [fullWidth, setFullWidth] = React.useState(true);
  const [maxWidth, setMaxWidth] = React.useState<DialogProps['maxWidth']>('md');

  // Determine if the dialog is in view-only mode
  const isViewOnly = isApproverUser || isSSDUser || !isEdit;

  /**
   * Handles dialog close
   * @param confirmed Whether the user confirmed the action
   */
  const handleClose = (confirmed: boolean) => {
    onClose(confirmed);
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
        {visitorDetails.ID ? 'Edit Visitor Details' : 'Add Visitor Details'}
      </DialogTitle>
      <DialogContent>
        <form noValidate autoComplete="off">
          <div style={{ padding: '0px' }}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                  <TextField
                    inputProps={{ maxLength: 255, readOnly: isViewOnly }}
                    error={errorDetails.Title.length === 0 ? false : true}
                    required
                    label="Visitor's Name"
                    name="Title"
                    onChange={onChangeTxt}
                    value={visitorDetails.Title}
                    variant="standard"
                    className={classes.textField}
                    helperText={errorDetails.Title}
                    disabled={isViewOnly}
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
                          onChange={onChangeTxt}
                          name="Car"
                          color="primary"
                          disabled={isViewOnly}
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
                        inputProps={{ maxLength: 255, readOnly: isViewOnly }}
                        error={errorDetails.Color.length === 0 ? false : true}
                        required
                        label="Color"
                        name="Color"
                        onChange={onChangeTxt}
                        value={visitorDetails.Color}
                        variant="standard"
                        className={classes.textField}
                        helperText={errorDetails.Color}
                        disabled={isViewOnly}
                      />
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" className={classes.paper}>
                      <TextField
                        inputProps={{ maxLength: 255, readOnly: isViewOnly }}
                        error={errorDetails.PlateNo.length === 0 ? false : true}
                        required
                        label="Plate No."
                        name="PlateNo"
                        onChange={onChangeTxt}
                        value={visitorDetails.PlateNo}
                        variant="standard"
                        className={classes.textField}
                        helperText={errorDetails.PlateNo}
                        disabled={isViewOnly}
                      />
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" className={classes.paper}>
                      <TextField
                        inputProps={{ maxLength: 255, readOnly: isViewOnly }}
                        error={errorDetails.DriverName.length === 0 ? false : true}
                        required
                        label="Driver's Name"
                        name="DriverName"
                        onChange={onChangeTxt}
                        value={visitorDetails.DriverName}
                        variant="standard"
                        className={classes.textField}
                        helperText={errorDetails.DriverName}
                        disabled={isViewOnly}
                      />
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" className={classes.paper}>
                      <TextField
                        inputProps={{ maxLength: 255, readOnly: isViewOnly }}
                        error={errorDetails.TypeofVehicle.length === 0 ? false : true}
                        required
                        label="Type of Vehicle"
                        name="TypeofVehicle"
                        onChange={onChangeTxt}
                        value={visitorDetails.TypeofVehicle}
                        variant="standard"
                        className={classes.textField}
                        helperText={errorDetails.TypeofVehicle}
                        disabled={isViewOnly}
                      />
                    </Paper>
                  </Grid>
                </>
              )}

              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                  <FormControl className={classes.textField} error={errorDetails.IDPresented.length === 0 ? false : true}>
                    <InputLabel id="idPresentedLabel">ID Presented</InputLabel>
                    <Select
                      labelId="idPresentedLabel"
                      id="idPresented"
                      value={visitorDetails.IDPresented}
                      onChange={onChangeCbo}
                      name="IDPresented"
                      disabled={isViewOnly}
                    >
                      {idList.map((item) => (
                        <MenuItem key={item.Title} value={item.Title}>
                          {item.Title}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errorDetails.IDPresented}</FormHelperText>
                  </FormControl>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                  <FormControl className={classes.textField} error={errorDetails.GateNo.length === 0 ? false : true}>
                    <InputLabel id="gateLabel">Gate</InputLabel>
                    <Select
                      labelId="gateLabel"
                      id="gate"
                      value={visitorDetails.GateNo}
                      onChange={onChangeCbo}
                      name="GateNo"
                      disabled={isViewOnly}
                    >
                      {gateList.map((item) => (
                        <MenuItem key={item.Id} value={item.Title}>
                          {item.Title}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errorDetails.GateNo}</FormHelperText>
                  </FormControl>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                  <TextField
                    inputProps={{ maxLength: 255, readOnly: isViewOnly }}
                    error={errorDetails.AccessCard.length === 0 ? false : true}
                    required
                    label="Access Card No."
                    name="AccessCard"
                    onChange={onChangeTxt}
                    value={visitorDetails.AccessCard}
                    variant="standard"
                    className={classes.textField}
                    helperText={errorDetails.AccessCard}
                    disabled={isViewOnly}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                  {!isViewOnly ? (
                    <DropzoneArea
                      acceptedFiles={['image/*']}
                      showFileNames={true}
                      showPreviews={true}
                      maxFileSize={70000000}
                      onChange={onChangeDropZone}
                      filesLimit={10}
                      showPreviewsInDropzone={false}
                      useChipsForPreview
                      previewGridProps={{ container: { spacing: 1, direction: 'row' } }}
                      previewChipProps={{ classes: { root: classes.previewChip } }}
                      previewText="Selected files"
                      dropzoneText="Add a picture"
                      initialFiles={visitorDetails.Files}
                    />
                  ) : (
                    <div>
                      <h4>Files:</h4>
                      {visitorDetails.Files && visitorDetails.Files.length > 0 ? (
                        visitorDetails.Files.map((file: any, index: number) => (
                          <div key={index} style={{ marginBottom: '5px' }}>
                            {file.name || file.Name}
                          </div>
                        ))
                      ) : (
                        <div>No files attached</div>
                      )}
                    </div>
                  )}
                  <FormHelperText error={errorDetails.Files.length > 0}>{errorDetails.Files}</FormHelperText>
                </Paper>
              </Grid>

              {visitorDetails.initFiles && visitorDetails.initFiles.length > 0 && (
                <Grid item xs={12}>
                  <Paper variant="outlined" className={classes.paper}>
                    <div>
                      <h4>Existing Files:</h4>
                      {visitorDetails.initFiles.map((file, index) => (
                        <div
                          key={index}
                          onClick={(e) => onChipClick(e, file.Name, 'visitorDetails')}
                          style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline', marginBottom: '5px' }}
                        >
                          {file.Name}
                        </div>
                      ))}
                    </div>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </div>
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
