import * as React from 'react';
import { IVisitor, IFormError } from '../../models/IVisitor';
import { formatDateTime } from '../../helpers/dateHelpers';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { DropzoneArea } from 'material-ui-dropzone';
import Chip from '@material-ui/core/Chip';
import AttachFileIcon from '@material-ui/icons/AttachFile';

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
    dateField: {
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

export interface IVisitorInformationSectionProps {
  /**
   * Visitor data
   */
  visitor: IVisitor;
  
  /**
   * Error fields
   */
  errorFields: IFormError;
  
  /**
   * Whether the form is in edit mode
   */
  isEdit: boolean;
  
  /**
   * Whether the current user is an encoder
   */
  isEncoder: boolean;
  
  /**
   * Whether the current user is a receptionist
   */
  isReceptionist: boolean;
  
  /**
   * Whether the current user is a department approver
   */
  isApproverUser?: boolean;
  
  /**
   * Whether the current user is an SSD user
   */
  isSSDUser?: boolean;
  
  /**
   * List of purposes
   */
  purposeList: any[];
  
  /**
   * List of departments
   */
  deptList: any[];
  
  /**
   * List of buildings
   */
  bldgList: any[];
  
  /**
   * List of contacts
   */
  contactList: any[];
  
  /**
   * Whether the autocomplete is open
   */
  isAC1Open: boolean;
  
  /**
   * Site URL
   */
  siteUrl: string;
  
  /**
   * Item ID
   */
  itemId: number;
  
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
   * Callback when a date time field is changed
   * @param e Date value
   * @param name Field name
   */
  onDateTimeVisitChange: (e: Date, name: string) => void;
  
  /**
   * Callback when an autocomplete value is selected
   * @param event Event
   * @param value Selected value
   */
  onACSelectedValue: (event: React.ChangeEvent<{}>, value: any) => void;
  
  /**
   * Callback when a user is searched
   * @param e Change event
   */
  onFindUser: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  /**
   * Callback when the autocomplete is opened
   */
  onACOpen: () => void;
  
  /**
   * Callback when the autocomplete is closed
   */
  onACClose: () => void;
  
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
 * Visitor information section component
 * @param props Component properties
 * @returns JSX element
 */
const VisitorInformationSection: React.FC<IVisitorInformationSectionProps> = (props) => {
  const {
    visitor,
    errorFields,
    isEdit,
    isEncoder,
    isReceptionist,
    isApproverUser,
    isSSDUser,
    purposeList,
    deptList,
    bldgList,
    contactList,
    isAC1Open,
    siteUrl,
    itemId,
    onChangeTxt,
    onChangeCbo,
    onDateTimeVisitChange,
    onACSelectedValue,
    onFindUser,
    onACOpen,
    onACClose,
    onChangeDropZone,
    onChipClick
  } = props;
  
  const classes = useStyles();
  
  /**
   * Checks if a field should be visible based on user role and form state
   * @param element Element name
   * @returns Whether the element should be visible
   */
  const checkVisibility = (element: string): boolean => {
    const forEncoder = isEncoder && (visitor.StatusId === 1 || visitor.StatusId === 2);
    const forReceptionist = isReceptionist && (visitor.StatusId === 1 || visitor.StatusId === 2);
    
    switch (element) {
      case 'cedit':
        return isEdit && (forEncoder || forReceptionist);
      case 'cdisp':
        return !isEdit || (isEdit && !forEncoder && !forReceptionist);
      case 'deptedit':
        return isEdit && ((isEncoder && visitor.StatusId === 1) || forReceptionist);
      case 'deptdisp':
        return !isEdit || (isEdit && (visitor.StatusId === 2 || !forEncoder));
      default:
        return false;
    }
  };
  
  return (
    <>
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('cedit') && (
            <FormControl className={classes.textField} error={!!errorFields.Purpose}>
              <InputLabel id="purposeLabel">Purpose *</InputLabel>
              <Select
                labelId="purposeLabel"
                id="Purpose"
                value={visitor.Purpose}
                onChange={onChangeCbo}
                name='Purpose'
              >
                {purposeList.map((item) => (
                  <MenuItem key={item.Title} value={item.Title}>
                    {item.Title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errorFields.Purpose}</FormHelperText>
            </FormControl>
          )}
          
          {checkVisibility('cedit') && visitor.Purpose === 'Others' && (
            <TextField
              inputProps={{ maxLength: 255 }}
              error={!!errorFields.PurposeOthers}
              required
              label="Others"
              name="PurposeOthers"
              onChange={onChangeTxt}
              value={visitor.PurposeOthers}
              variant="standard"
              className={classes.textField}
              helperText={errorFields.PurposeOthers}
            />
          )}
          
          {checkVisibility('cdisp') && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Purpose
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {visitor.Purpose}
              </Box>
            </>
          )}
          
          {checkVisibility('cdisp') && visitor.PurposeOthers && (
            <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
              {visitor.PurposeOthers}
            </Box>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('deptedit') && (
            <FormControl className={classes.textField} error={!!errorFields.DeptId}>
              <InputLabel id="deptLabel">Department to Visit *</InputLabel>
              <Select
                labelId="deptLabel"
                id="Dept"
                value={visitor.DeptId}
                onChange={onChangeCbo}
                name='DeptId'
              >
                {deptList.map((item) => (
                  <MenuItem key={item.Id} value={item.Id}>
                    {item.Title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errorFields.DeptId}</FormHelperText>
            </FormControl>
          )}
          
          {checkVisibility('deptdisp') && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Department to Visit
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {visitor.Dept.Title}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('cedit') && (
            <FormControl className={classes.textField} error={!!errorFields.Bldg}>
              <InputLabel id="bldgLabel">Building</InputLabel>
              <Select
                labelId="bldgLabel"
                id="bldg"
                value={visitor.Bldg}
                onChange={onChangeCbo}
                name='Bldg'
              >
                {bldgList.map((item) => (
                  <MenuItem key={item.Title} value={item.Title}>
                    {item.Title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errorFields.Bldg}</FormHelperText>
            </FormControl>
          )}
          
          {checkVisibility('cdisp') && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Building
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {visitor.Bldg}
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
              error={!!errorFields.RoomNo}
              required
              label="Room No."
              name="RoomNo"
              onChange={onChangeTxt}
              value={visitor.RoomNo}
              variant="standard"
              className={classes.textField}
              helperText={errorFields.RoomNo}
            />
          )}
          
          {checkVisibility('cdisp') && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Room No.
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {visitor.RoomNo}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('cedit') && (
            <FormControl className={classes.textField} error={!!errorFields.EmpNo}>
              <Autocomplete
                freeSolo={true}
                id="Contact"
                style={{ width: 300 }}
                open={isAC1Open}
                onChange={onACSelectedValue}
                onOpen={onACOpen}
                onClose={onACClose}
                getOptionSelected={(option, value) => option.EmpNo === value.EmpNo}
                getOptionLabel={(option) => option.Name}
                options={contactList}
                defaultValue={{ EmpNo: visitor.EmpNo, Name: visitor.ContactName }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    onChange={onFindUser}
                    label="Contact Person"
                    variant="standard"
                    helperText={errorFields.EmpNo}
                    error={!!errorFields.EmpNo}
                  />
                )}
              />
            </FormControl>
          )}
          
          {checkVisibility('cdisp') && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Contact Person
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {visitor.ContactName}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
            Position
          </Box>
          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
            {visitor.Position}
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
            Direct No.
          </Box>
          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
            {visitor.DirectNo}
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
            Local No.
          </Box>
          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
            {visitor.LocalNo}
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('cedit') && (
            <FormControl className={classes.textField} error={!!errorFields.DateTimeVisit}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DateTimePicker
                  error={!!errorFields.DateTimeVisit}
                  disablePast
                  format="MM/dd/yyyy HH:mm"
                  label="Date and Time of Visit From"
                  value={visitor.DateTimeVisit}
                  onChange={(d) => onDateTimeVisitChange(d, 'DateTimeVisit')}
                  InputProps={{ className: classes.dateField }}
                />
              </MuiPickersUtilsProvider>
              <FormHelperText>{errorFields.DateTimeVisit}</FormHelperText>
            </FormControl>
          )}
          
          {checkVisibility('cdisp') && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Date and Time of Visit From
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {formatDateTime(visitor.DateTimeVisit)}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('cedit') && (
            <FormControl className={classes.textField} error={!!errorFields.DateTimeArrival}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DateTimePicker
                  error={!!errorFields.DateTimeArrival}
                  disablePast
                  format="MM/dd/yyyy HH:mm"
                  label="Date and Time of Visit To"
                  value={visitor.DateTimeArrival}
                  onChange={(d) => onDateTimeVisitChange(d, 'DateTimeArrival')}
                  InputProps={{ className: classes.dateField }}
                />
              </MuiPickersUtilsProvider>
              <FormHelperText>{errorFields.DateTimeArrival}</FormHelperText>
            </FormControl>
          )}
          
          {checkVisibility('cdisp') && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Date and Time of Visit To
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {formatDateTime(visitor.DateTimeArrival)}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      {/* Hide the entire attachment section for SSD users and approvers */}
      {!(isApproverUser || isSSDUser) && (
        <Grid item xs={12} sm={12}>
          <Paper variant="outlined" className={classes.paper}>
            {checkVisibility('cedit') && (
              <DropzoneArea
                acceptedFiles={['.docx', '.xlsx', '.xls', 'doc', '.mov', 'image/*', 'video/*', ' application/*']}
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
                dropzoneText="Add an attachment"
                initialFiles={visitor.initFiles}
              />
            )}
            
            {checkVisibility('cdisp') && (
              <div className={classes.rootChip}>
                {visitor.initFiles.map((row) => (
                  <Chip
                    key={row}
                    icon={<AttachFileIcon />}
                    label={row}
                    onClick={(e) => onChipClick(e, row, 'inputFields')}
                    variant="outlined"
                  />
                ))}
              </div>
            )}
          </Paper>
        </Grid>
      )}
      
      <Grid item xs={12}>
        <Paper variant="outlined" className={classes.paper}>
          <Box style={{ fontSize: "1rem" }}>
            Company Information
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('cedit') && (
            <TextField
              inputProps={{ maxLength: 255 }}
              error={!!errorFields.CompanyName}
              required
              label="Company Name"
              name="CompanyName"
              onChange={onChangeTxt}
              value={visitor.CompanyName}
              variant="standard"
              className={classes.textField}
              helperText={errorFields.CompanyName}
            />
          )}
          
          {checkVisibility('cdisp') && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Company Name
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {visitor.CompanyName}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('cedit') && (
            <TextField
              multiline
              error={!!errorFields.Address}
              required
              label="Address"
              name="Address"
              onChange={onChangeTxt}
              value={visitor.Address}
              variant="standard"
              className={classes.textField}
              helperText={errorFields.Address}
            />
          )}
          
          {checkVisibility('cdisp') && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Address
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {visitor.Address}
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
              error={!!errorFields.VisContactNo}
              required
              label="Contact No."
              name="VisContactNo"
              onChange={onChangeTxt}
              value={visitor.VisContactNo}
              variant="standard"
              className={classes.textField}
              helperText={errorFields.VisContactNo}
            />
          )}
          
          {checkVisibility('cdisp') && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Contact No.
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {visitor.VisContactNo}
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
              label="Local No."
              name="VisLocalNo"
              onChange={onChangeTxt}
              value={visitor.VisLocalNo}
              variant="standard"
              className={classes.textField}
              helperText={errorFields.VisLocalNo}
            />
          )}
          
          {checkVisibility('cdisp') && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Local No.
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {visitor.VisLocalNo}
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
                  checked={visitor.RequireParking}
                  onChange={onChangeTxt}
                  name="RequireParking"
                  color="primary"
                  disabled={!checkVisibility('cedit')}
                />
              }
              label="Request for Parking"
            />
          </div>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
            Form Status
          </Box>
          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
            {visitor.Status.Title}
          </Box>
        </Paper>
      </Grid>
    </>
  );
};

export default VisitorInformationSection;
