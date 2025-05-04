import * as React from 'react';
import { IVisitorDetails, IVisitorDetailsError } from '../../models/IVisitorDetails';
import { validateVisitorDetailsInput, validateVisitorDetailsOnSubmit } from '../../validations/formValidation';

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
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import { DropzoneArea } from 'material-ui-dropzone';

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
    previewChip: {
      minWidth: 160,
      maxWidth: 210
    },
    rootChip: {
      display: 'flex',
      justifyContent: 'flex-start',
      flexWrap: 'wrap',
      '& > *': {
        margin: theme.spacing(0.5),
      },
    },
  }),
);

export interface IVisitorDetailsDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  
  /**
   * Visitor details data
   */
  visitorDetails: IVisitorDetails;
  
  /**
   * Error details
   */
  errorDetails: IVisitorDetailsError;
  
  /**
   * Whether the form is in edit mode
   */
  isEdit: boolean;
  
  /**
   * List of ID types
   */
  idList: any[];
  
  /**
   * List of gates
   */
  gateList: any[];
  
  /**
   * Whether the current user is a department approver
   */
  isApproverUser?: boolean;
  
  /**
   * Whether the current user is an SSD user
   */
  isSSDUser?: boolean;
  
  /**
   * Callback when the dialog is closed
   * @param confirmed Whether the user confirmed the action
   */
  onClose: (confirmed: boolean) => void;
  
  /**
   * Callback when a text field is changed
   * @param e Change event
   */
  onChangeTxt: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  /**
   * Callback when a select field is changed
   * @param e Change event
   */
  onChangeCbo: (e: React.ChangeEvent<{ name?: string; value: any }>) => void;
  
  /**
   * Callback when the dropzone is changed
   * @param files Files
   */
  onChangeDropZone: (files: any[]) => void;
  
  /**
   * Callback when a chip is clicked
   * @param e Event
   * @param row Row data
   * @param ctrl Control name
   */
  onChipClick: (e: React.MouseEvent, row: any, ctrl: string) => void;
}

/**
 * Visitor details dialog component
 * @param props Component properties
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
  
  /**
   * Checks if a field should be visible based on user role and form state
   * @param element Element name
   * @returns Whether the element should be visible
   */
  const checkVisibility = (element: string): boolean => {
    // For approvers and SSD users, we want to show display mode even if isEdit is true
    const isViewOnly = isApproverUser || isSSDUser;
    
    switch (element) {
      case 'cedit':
        return isEdit && !isViewOnly;
      case 'cdisp':
        return !isEdit || isViewOnly;
      case 'detailscaredit':
        return isEdit && !isViewOnly;
      case 'detailsidpresentededit':
        return isEdit && !isViewOnly;
      case 'detailsidpresenteddisp':
        return (!isEdit || isViewOnly) && !!visitorDetails.IDPresented;
      case 'detailsgateedit':
        return isEdit && !isViewOnly;
      case 'detailsgatedisp':
        return (!isEdit || isViewOnly) && !!visitorDetails.GateNo;
      case 'detailsaccesscardedit':
        return isEdit && !isViewOnly;
      case 'detailsaccesscarddisp':
        return (!isEdit || isViewOnly) && !!visitorDetails.AccessCard;
      case 'dropzone2edit':
        return isEdit && !isViewOnly;
      case 'dropzone2disp':
        return (!isEdit || isViewOnly) && visitorDetails.initFiles && visitorDetails.initFiles.length > 0;
      default:
        return false;
    }
  };
  
  /**
   * Validates the form before submission
   * @returns Whether the form is valid
   */
  const validateOnSubmit = (): boolean => {
    // This is a simplified validation for the dialog
    return true;
  };
  
  return (
    <Dialog
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      open={open}
      onClose={() => onClose(false)}
      aria-labelledby="visitor-details-dialog-title"
    >
      <DialogTitle id="visitor-details-dialog-title">Visitor Details</DialogTitle>
      <DialogContent>
        <form noValidate autoComplete="off">
          <div style={{ padding: '0px' }}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                  {checkVisibility('cedit') && (
                    <TextField
                      inputProps={{ maxLength: 255 }}
                      error={!!errorDetails.Title}
                      required
                      label="Visitor's Name"
                      name="Title"
                      onChange={onChangeTxt}
                      value={visitorDetails.Title}
                      variant="standard"
                      className={classes.textField}
                      helperText={errorDetails.Title}
                    />
                  )}
                  
                  {checkVisibility('cdisp') && (
                    <>
                      <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                        Visitor's Name
                      </Box>
                      <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                        {visitorDetails.Title}
                      </Box>
                    </>
                  )}
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
                          disabled={!checkVisibility('detailscaredit')}
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
                      {checkVisibility('cedit') && (
                        <TextField
                          inputProps={{ maxLength: 255 }}
                          error={!!errorDetails.Color}
                          required
                          label="Color"
                          name="Color"
                          onChange={onChangeTxt}
                          value={visitorDetails.Color}
                          variant="standard"
                          className={classes.textField}
                          helperText={errorDetails.Color}
                        />
                      )}
                      
                      {checkVisibility('cdisp') && (
                        <>
                          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                            Color
                          </Box>
                          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                            {visitorDetails.Color}
                          </Box>
                        </>
                      )}
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" className={classes.paper}>
                      {checkVisibility('cedit') && (
                        <TextField
                          inputProps={{ maxLength: 255 }}
                          error={!!errorDetails.PlateNo}
                          required
                          label="Plate No."
                          name="PlateNo"
                          onChange={onChangeTxt}
                          value={visitorDetails.PlateNo}
                          variant="standard"
                          className={classes.textField}
                          helperText={errorDetails.PlateNo}
                        />
                      )}
                      
                      {checkVisibility('cdisp') && (
                        <>
                          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                            Plate No.
                          </Box>
                          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                            {visitorDetails.PlateNo}
                          </Box>
                        </>
                      )}
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" className={classes.paper}>
                      {checkVisibility('cedit') && (
                        <TextField
                          inputProps={{ maxLength: 255 }}
                          error={!!errorDetails.DriverName}
                          required
                          label="Driver's Name"
                          name="DriverName"
                          onChange={onChangeTxt}
                          value={visitorDetails.DriverName}
                          variant="standard"
                          className={classes.textField}
                          helperText={errorDetails.DriverName}
                        />
                      )}
                      
                      {checkVisibility('cdisp') && (
                        <>
                          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                            Driver's Name
                          </Box>
                          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                            {visitorDetails.DriverName}
                          </Box>
                        </>
                      )}
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" className={classes.paper}>
                      {checkVisibility('cedit') && (
                        <TextField
                          inputProps={{ maxLength: 255 }}
                          error={!!errorDetails.TypeofVehicle}
                          required
                          label="Type of Vehicle"
                          name="TypeofVehicle"
                          onChange={onChangeTxt}
                          value={visitorDetails.TypeofVehicle}
                          variant="standard"
                          className={classes.textField}
                          helperText={errorDetails.TypeofVehicle}
                        />
                      )}
                      
                      {checkVisibility('cdisp') && (
                        <>
                          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                            Type of Vehicle
                          </Box>
                          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                            {visitorDetails.TypeofVehicle}
                          </Box>
                        </>
                      )}
                    </Paper>
                  </Grid>
                </>
              )}
              
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                  {checkVisibility('detailsidpresentededit') && (
                    <FormControl className={classes.textField} error={!!errorDetails.IDPresented}>
                      <InputLabel id="idPresentedLabel">ID Presented</InputLabel>
                      <Select
                        labelId="idPresentedLabel"
                        id="idPresented"
                        value={visitorDetails.IDPresented}
                        onChange={onChangeCbo}
                        name='IDPresented'
                      >
                        {idList.map((item) => (
                          <MenuItem key={item.Title} value={item.Title}>
                            {item.Title}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{errorDetails.IDPresented}</FormHelperText>
                    </FormControl>
                  )}
                  
                  {checkVisibility('detailsidpresenteddisp') && (
                    <>
                      <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                        ID Presented
                      </Box>
                      <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                        {visitorDetails.IDPresented}
                      </Box>
                    </>
                  )}
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                  {checkVisibility('detailsgateedit') && (
                    <FormControl className={classes.textField} error={!!errorDetails.GateNo}>
                      <InputLabel id="gateLabel">Gate</InputLabel>
                      <Select
                        labelId="gateLabel"
                        id="gate"
                        value={visitorDetails.GateNo}
                        onChange={onChangeCbo}
                        name='GateNo'
                      >
                        {gateList.map((item) => (
                          <MenuItem key={item.Title} value={item.Title}>
                            {item.Title}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{errorDetails.GateNo}</FormHelperText>
                    </FormControl>
                  )}
                  
                  {checkVisibility('detailsgatedisp') && (
                    <>
                      <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                        Gate
                      </Box>
                      <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                        {visitorDetails.GateNo}
                      </Box>
                    </>
                  )}
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                  {checkVisibility('detailsaccesscardedit') && (
                    <TextField
                      inputProps={{ maxLength: 255 }}
                      error={!!errorDetails.AccessCard}
                      required
                      label="Access Card No."
                      name="AccessCard"
                      onChange={onChangeTxt}
                      value={visitorDetails.AccessCard}
                      variant="standard"
                      className={classes.textField}
                      helperText={errorDetails.AccessCard}
                    />
                  )}
                  
                  {checkVisibility('detailsaccesscarddisp') && (
                    <>
                      <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                        Access Card
                      </Box>
                      <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                        {visitorDetails.AccessCard}
                      </Box>
                    </>
                  )}
                </Paper>
              </Grid>
              
              {/* Hide the entire attachment section for SSD users and approvers */}
              {!(isApproverUser || isSSDUser) && (
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" className={classes.paper}>
                    {checkVisibility('dropzone2edit') && (
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
                        initialFiles={visitorDetails.initFiles}
                      />
                    )}
                    
                    {checkVisibility('dropzone2disp') && (
                      <div className={classes.rootChip}>
                        {visitorDetails.initFiles.map((row) => (
                          <Chip
                            key={row}
                            icon={<AttachFileIcon />}
                            label={row}
                            onClick={(e) => onChipClick(e, row, 'visitorDetails')}
                            variant="outlined"
                          />
                        ))}
                      </div>
                    )}
                    
                    <FormControl error>
                      <FormHelperText>{errorDetails.Files}</FormHelperText>
                    </FormControl>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </div>
        </form>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={() => onClose(false)} color="default">
          Cancel
        </Button>
        <Button onClick={() => onClose(true)} color="primary" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VisitorDetailsDialog;
