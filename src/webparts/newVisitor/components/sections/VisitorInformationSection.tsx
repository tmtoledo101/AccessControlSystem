import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
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
import Box from '@material-ui/core/Box';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { DropzoneArea } from 'material-ui-dropzone';
import { IVisitor, IFormError } from '../../models/IVisitor';
import { formatDate } from '../../helpers/dateHelpers';
import { checkVisibility } from '../../helpers/uiHelpers';

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
  }),
);

/**
 * Visitor information section props
 */
export interface IVisitorInformationSectionProps {
  visitor: IVisitor;
  errorFields: IFormError;
  purposeList: any[];
  deptList: any[];
  bldgList: any[];
  approverList: any[];
  walkinApprovers: any[];
  contactList: any[];
  isEdit: boolean;
  isEncoder: boolean;
  isReceptionist: boolean;
  isApproverUser: boolean;
  isWalkinApproverUser: boolean;
  isSSDUser: boolean;
  isAC1Open: boolean;
  onChangeTxt: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeCbo: (e: React.ChangeEvent<{ name?: string; value: any }>) => void;
  onDateTimeChange: (date: Date, name: string) => void;
  onChangeDropZone: (files: File[]) => void;
  onACSelectedValue: (event: React.ChangeEvent<{}>, value: any) => void;
  onACOpen: () => void;
  onACClose: () => void;
  findUser: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChipClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, row: string, ctrl: string) => void;
}

/**
 * Visitor information section component
 * @param props Component props
 * @returns JSX element
 */
const VisitorInformationSection: React.FC<IVisitorInformationSectionProps> = (props) => {
  const {
    visitor,
    errorFields,
    purposeList,
    deptList,
    bldgList,
    approverList,
    walkinApprovers,
    contactList,
    isEdit,
    isEncoder,
    isReceptionist,
    isApproverUser,
    isWalkinApproverUser,
    isSSDUser,
    isAC1Open,
    onChangeTxt,
    onChangeCbo,
    onDateTimeChange,
    onChangeDropZone,
    onACSelectedValue,
    onACOpen,
    onACClose,
    findUser,
    onChipClick
  } = props;

  const classes = useStyles();

  return (
    <>
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField} error={Boolean(errorFields.Purpose && errorFields.Purpose.length > 0)}>
            <InputLabel id="purposeLabel">Purpose *</InputLabel>
            <Select
              labelId="purposeLabel"
              id="Purpose"
              value={visitor.Purpose || ''}
              onChange={onChangeCbo}
              name="Purpose"
              disabled={!isEdit || isApproverUser || isSSDUser}
            >
              {purposeList.map((item) => (
                <MenuItem key={item.Title} value={item.Title}>
                  {item.Title}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errorFields.Purpose}</FormHelperText>
          </FormControl>
          {visitor.Purpose === 'Others' && (
            <TextField
              inputProps={{ maxLength: 255, readOnly: !isEdit || isApproverUser || isSSDUser }}
              error={Boolean(errorFields.PurposeOthers && errorFields.PurposeOthers.length > 0)}
              required
              label="Others"
              name="PurposeOthers"
              onChange={onChangeTxt}
              value={visitor.PurposeOthers || ''}
              variant="standard"
              className={classes.textField}
              helperText={errorFields.PurposeOthers}
              disabled={!isEdit || isApproverUser || isSSDUser}
            />
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField} error={Boolean(errorFields.DeptId && errorFields.DeptId.length > 0)}>
            <InputLabel id="deptLabel">Department to Visit *</InputLabel>
            <Select
              labelId="deptLabel"
              id="Dept"
              value={visitor.DeptId || ''}
              onChange={onChangeCbo}
              name="DeptId"
              disabled={!isEdit || isApproverUser || isSSDUser}
            >
              {deptList.map((item) => (
                <MenuItem key={item.Id} value={item.Id}>
                  {item.Title}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errorFields.DeptId}</FormHelperText>
          </FormControl>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField} error={Boolean(errorFields.Bldg && errorFields.Bldg.length > 0)}>
            <InputLabel id="bldgLabel">Building</InputLabel>
            <Select
              labelId="bldgLabel"
              id="bldg"
              value={visitor.Bldg || ''}
              onChange={onChangeCbo}
              name="Bldg"
              disabled={!isEdit || isApproverUser || isSSDUser}
            >
              {bldgList.map((item) => (
                <MenuItem key={item.Title} value={item.Title}>
                  {item.Title}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errorFields.Bldg}</FormHelperText>
          </FormControl>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <TextField
            inputProps={{ maxLength: 255, readOnly: !isEdit || isApproverUser || isSSDUser }}
            error={Boolean(errorFields.RoomNo && errorFields.RoomNo.length > 0)}
            required
            label="Room No."
            name="RoomNo"
            onChange={onChangeTxt}
            value={visitor.RoomNo || ''}
            variant="standard"
            className={classes.textField}
            helperText={errorFields.RoomNo}
            disabled={!isEdit || isApproverUser || isSSDUser}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField} error={Boolean(errorFields.EmpNo && errorFields.EmpNo.length > 0)}>
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
              renderInput={(params) => (
                <TextField
                  {...params}
                  onChange={findUser}
                  label="Contact Person"
                  variant="standard"
                  disabled={!isEdit || isApproverUser || isSSDUser}
                />
              )}
              disabled={!isEdit || isApproverUser || isSSDUser}
            />
            <FormHelperText>{errorFields.EmpNo}</FormHelperText>
          </FormControl>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>Position</Box>
          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
            {visitor.Position || 'N/A'}
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>Direct No.</Box>
          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
            {visitor.DirectNo || 'N/A'}
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>Local No.</Box>
          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
            {visitor.LocalNo || 'N/A'}
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField} error={Boolean(errorFields.DateTimeVisit && errorFields.DateTimeVisit.length > 0)}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DateTimePicker
                error={Boolean(errorFields.DateTimeVisit && errorFields.DateTimeVisit.length > 0)}
                disablePast
                format="MM/dd/yyyy HH:mm"
                label="Date and Time of Visit From"
                value={visitor.DateTimeVisit || new Date()}
                onChange={(date) => date && onDateTimeChange(date as Date, 'DateTimeVisit')}
                InputProps={{ className: classes.dateField }}
                disabled={!isEdit || isApproverUser || isSSDUser}
              />
            </MuiPickersUtilsProvider>
            <FormHelperText>{errorFields.DateTimeVisit}</FormHelperText>
          </FormControl>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField} error={Boolean(errorFields.DateTimeArrival && errorFields.DateTimeArrival.length > 0)}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DateTimePicker
                error={Boolean(errorFields.DateTimeArrival && errorFields.DateTimeArrival.length > 0)}
                disablePast
                format="MM/dd/yyyy HH:mm"
                label="Date and Time of Visit To"
                value={visitor.DateTimeArrival || new Date()}
                onChange={(date) => date && onDateTimeChange(date as Date, 'DateTimeArrival')}
                InputProps={{ className: classes.dateField }}
                disabled={!isEdit || isApproverUser || isSSDUser}
              />
            </MuiPickersUtilsProvider>
            <FormHelperText>{errorFields.DateTimeArrival}</FormHelperText>
          </FormControl>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper variant="outlined" className={classes.paper}>
          {isEdit && !isApproverUser && !isSSDUser ? (
            <DropzoneArea
              acceptedFiles={['.docx', '.xlsx', '.xls', '.doc', '.mov', 'image/*', 'video/*', 'application/*']}
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
              initialFiles={visitor.Files}
            />
          ) : visitor.initFiles && visitor.initFiles.length > 0 ? (
            <div>
              <h4>Files:</h4>
              {visitor.initFiles.map((file, index) => (
                <div
                  key={index}
                  onClick={(e) => onChipClick(e, file.Name, 'visitor')}
                  style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline', marginBottom: '5px' }}
                >
                  {file.Name}
                </div>
              ))}
            </div>
          ) : (
            <div>No files attached</div>
          )}
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper variant="outlined" className={classes.paper}>
          <Box style={{ fontSize: "1rem" }}>
            Visitor Details
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <TextField
            inputProps={{ maxLength: 255, readOnly: !isEdit || isApproverUser || isSSDUser }}
            error={Boolean(errorFields.CompanyName && errorFields.CompanyName.length > 0)}
            required
            label="Company Name"
            name="CompanyName"
            onChange={onChangeTxt}
            value={visitor.CompanyName || ''}
            variant="standard"
            className={classes.textField}
            helperText={errorFields.CompanyName}
            disabled={!isEdit || isApproverUser || isSSDUser}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <TextField
            multiline
            error={Boolean(errorFields.Address && errorFields.Address.length > 0)}
            required
            label="Address"
            name="Address"
            onChange={onChangeTxt}
            value={visitor.Address || ''}
            variant="standard"
            className={classes.textField}
            helperText={errorFields.Address}
            disabled={!isEdit || isApproverUser || isSSDUser}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <TextField
            inputProps={{ maxLength: 255, readOnly: !isEdit || isApproverUser || isSSDUser }}
            error={Boolean(errorFields.VisContactNo && errorFields.VisContactNo.length > 0)}
            required
            label="Contact No."
            name="VisContactNo"
            onChange={onChangeTxt}
            value={visitor.VisContactNo || ''}
            variant="standard"
            className={classes.textField}
            helperText={errorFields.VisContactNo}
            disabled={!isEdit || isApproverUser || isSSDUser}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <TextField
            inputProps={{ maxLength: 255, readOnly: !isEdit || isApproverUser || isSSDUser }}
            label="Local No."
            name="VisLocalNo"
            onChange={onChangeTxt}
            value={visitor.VisLocalNo || ''}
            variant="standard"
            className={classes.textField}
            helperText={errorFields.VisLocalNo}
            disabled={!isEdit || isApproverUser || isSSDUser}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <div className={classes.datelabel}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={visitor.RequireParking || false}
                  onChange={onChangeTxt}
                  name="RequireParking"
                  color="primary"
                  disabled={!isEdit || isApproverUser || isSSDUser}
                />
              }
              label="Request for Parking"
            />
          </div>
        </Paper>
      </Grid>

      {checkVisibility('approverField', visitor, isEdit, isEncoder, isReceptionist, isApproverUser, isWalkinApproverUser, isSSDUser) && (
        <Grid item xs={12} sm={12}>
          <Paper variant="outlined" className={classes.paper}>
            <FormControl className={classes.textField} error={Boolean(errorFields.ApproverId && errorFields.ApproverId.length > 0)}>
              <InputLabel id="approversLabel">
                {isEncoder ? 'Forward for Approval *' : 'Forward for Confirmation *'}
              </InputLabel>
              <Select
                labelId="approversLabel"
                id="approver"
                value={visitor.ApproverId || ''}
                onChange={onChangeCbo}
                name="ApproverId"
                disabled={!isEdit || isApproverUser || isSSDUser}
              >
                {(isEncoder ? approverList : walkinApprovers).map((item) => (
                  <MenuItem key={item.NameId} value={item.NameId}>
                    {item.Name.Title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errorFields.ApproverId}</FormHelperText>
            </FormControl>
          </Paper>
        </Grid>
      )}
    </>
  );
};

export default VisitorInformationSection;
