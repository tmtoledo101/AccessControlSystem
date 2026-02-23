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
    paper: { padding: theme.spacing(1), borderColor: "transparent" },
    textField: { marginLeft: theme.spacing(1), marginRight: theme.spacing(1), width: 300 },
    dateField: { width: 300 },
    datelabel: { marginLeft: theme.spacing(1), marginRight: theme.spacing(1) },
    labeltop: { marginLeft: theme.spacing(1), marginRight: theme.spacing(1), fontSize: '12px', color: '#0000008A' },
    labelbottom: { marginLeft: theme.spacing(1), marginRight: theme.spacing(1), fontSize: '18px' },
    previewChip: { minWidth: 160, maxWidth: 210 },
    rootChip: { display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap', '& > *': { margin: theme.spacing(0.5) } },
  })
);

interface IVisitorInformationSectionProps {
  visitor: IVisitor;
  errorFields: IFormError;
  isEdit: boolean;
  isEncoder: boolean;
  isReceptionist: boolean;
  isApproverUser?: boolean;
  isSSDUser?: boolean;
  purposeList: any[];
  deptList: any[];
  bldgList: any[];
  contactList: any[];
  isAC1Open: boolean;
  siteUrl: string;
  itemId: number;
  onChangeTxt: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeCbo: (e: React.ChangeEvent<{ name?: string; value: any }>) => void;
  onDateTimeVisitChange: (e: Date, name: string) => void;
  onACSelectedValue: (event: React.ChangeEvent<{}>, value: any) => void;
  onFindUser: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onACOpen: () => void;
  onACClose: () => void;
  onChangeDropZone: (files: any[]) => void;
  onChipClick: (e: React.MouseEvent, row: any, ctrl: string) => void;
}

const DisplayField: React.FC<{ label: string; value: any; classes: any }> = ({ label, value, classes }) => (
  <>
    <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>{label}</Box>
    <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>{value}</Box>
  </>
);

/**
 * Helpers for Building multi-select stored as a single line of text: "A; B; C"
 */
const splitBldgText = (bldgText: string): string[] => {
  if (!bldgText) return [];
  return bldgText.split(';').map(s => s.trim()).filter(Boolean);
};

const getBldgArrayFromVisitor = (raw: any): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') return splitBldgText(raw);
  return [];
};

const validateBldgNotMixed = (bldgText: string): string => {
  const selected = splitBldgText(bldgText);

  const hasHO = selected.some(s => s.toUpperCase().startsWith('(HO)'));
  const hasSPC = selected.some(s => {
    const u = s.toUpperCase();
    return u === 'SPC' || u.startsWith('(SPC)');
  });

  if (hasHO && hasSPC) return 'Please select buildings from only one site (HO or SPC).';
  return '';
};

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

  const checkVisibility = (element: string): boolean => {
    const forEncoder = isEncoder && (visitor.StatusId === 1 || visitor.StatusId === 2);
    const forReceptionist = isReceptionist && (visitor.StatusId === 1 || visitor.StatusId === 2);
    switch (element) {
      case 'cedit': return isEdit && (forEncoder || forReceptionist);
      case 'cdisp': return !isEdit || (isEdit && !forEncoder && !forReceptionist);
      // case 'deptedit': return isEdit && ((isEncoder && visitor.StatusId === 1) || forReceptionist);
      // case 'deptdisp': return !isEdit || (isEdit && (visitor.StatusId === 2 || !forEncoder));
      case 'deptedit': {const canEditDept = isEdit && (forEncoder || forReceptionist);return canEditDept;}
      case 'deptdisp': {const canEditDept = isEdit && (forEncoder || forReceptionist);return !canEditDept;}
      default: return false;
    }
  };

  // For multi-select UI value
  const bldgSelectedArray: string[] = React.useMemo(() => {
    return getBldgArrayFromVisitor((visitor as any).Bldg);
  }, [visitor.Bldg]);

  /**
   * Multi-building change:
   * - UI returns string[]
   * - We store as "A; B; C"
   * - Also prevents mixing HO and SPC in the same selection
   */
  const handleBldgMultiChange = (e: React.ChangeEvent<{ name?: string; value: any }>) => {
    const value = e.target.value;

    const arr: string[] = Array.isArray(value)
      ? value
      : typeof value === 'string'
        ? value.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    const joined = arr.join('; ');

    // Block mixed HO + SPC
    const errMsg = validateBldgNotMixed(joined);
    if (errMsg) {
      alert(errMsg);

      // Revert UI by pushing the previous value back to parent
      onChangeCbo({
        target: { name: 'Bldg', value: (visitor as any).Bldg || '' }
      } as any);

      return;
    }

    onChangeCbo({
      target: { name: 'Bldg', value: joined }
    } as any);
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
                  <MenuItem key={item.Title} value={item.Title}>{item.Title}</MenuItem>
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

          {checkVisibility('cdisp') && <DisplayField label="Purpose" value={visitor.Purpose} classes={classes} />}
          {checkVisibility('cdisp') && visitor.PurposeOthers && <DisplayField label="" value={visitor.PurposeOthers} classes={classes} />}
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
                value={visitor.DeptId === null || visitor.DeptId === undefined ? "" : visitor.DeptId}
                onChange={(e) =>
                  onChangeCbo({
                    target: { name: "DeptId", value: Number(e.target.value) },
                  } as any)
                }
                name="DeptId"
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
          {checkVisibility("deptdisp") && (
          <DisplayField
            label="Department to Visit"
            value={
              (visitor.Dept && visitor.Dept.Title) ||
              (((deptList.find((d) => Number(d.Id) === Number(visitor.DeptId)) || {}) as any).Title) ||
              "-"
            }
            classes={classes}
          />
        )}
        </Paper>
      </Grid>

      {/* BUILDING (MULTI-SELECT STORED AS TEXT "A; B; C") */}
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('cedit') && (
            <FormControl className={classes.textField} error={!!errorFields.Bldg}>
              <InputLabel id="bldgLabel">Building</InputLabel>
              <Select
                labelId="bldgLabel"
                id="Bldg"
                name="Bldg"
                multiple
                value={bldgSelectedArray}
                onChange={handleBldgMultiChange}
                renderValue={(selected) => (
                  <div>
                    {(selected as string[]).map((b) => (
                      <Chip key={b} label={b} style={{ marginRight: 6, marginTop: 6 }} />
                    ))}
                  </div>
                )}
              >
                {bldgList.map((item) => (
                  <MenuItem key={item.Title} value={item.Title}>{item.Title}</MenuItem>
                ))}
              </Select>
              <FormHelperText>{errorFields.Bldg}</FormHelperText>
            </FormControl>
          )}

          {checkVisibility('cdisp') && <DisplayField label="Building" value={visitor.Bldg} classes={classes} />}
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('cedit') ? (
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
          ) : (
            <DisplayField label="Room No." value={visitor.RoomNo} classes={classes} />
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('cedit') ? (
            <FormControl className={classes.textField} error={!!errorFields.EmpNo}>
              <Autocomplete
                freeSolo
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
          ) : (
            <DisplayField label="Contact Person" value={visitor.ContactName} classes={classes} />
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}><Paper variant="outlined" className={classes.paper}><DisplayField label="Position" value={visitor.Position} classes={classes} /></Paper></Grid>
      <Grid item xs={12} sm={6}><Paper variant="outlined" className={classes.paper}><DisplayField label="Direct No." value={visitor.DirectNo} classes={classes} /></Paper></Grid>
      <Grid item xs={12} sm={6}><Paper variant="outlined" className={classes.paper}><DisplayField label="Local No." value={visitor.LocalNo} classes={classes} /></Paper></Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('cedit') ? (
            <FormControl className={classes.textField} error={!!errorFields.DateTimeVisit}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DateTimePicker
                  error={!!errorFields.DateTimeVisit}
                  disablePast
                  format="MM/dd/yyyy HH:mm"
                  label="Date and Time of Visit From"
                  value={visitor.DateTimeVisit}
                  onChange={(d) => onDateTimeVisitChange(d as any, 'DateTimeVisit')}
                  InputProps={{ className: classes.dateField }}
                />
              </MuiPickersUtilsProvider>
              <FormHelperText>{errorFields.DateTimeVisit}</FormHelperText>
            </FormControl>
          ) : (
            <DisplayField label="Date and Time of Visit From" value={formatDateTime(visitor.DateTimeVisit)} classes={classes} />
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('cedit') ? (
            <FormControl className={classes.textField} error={!!errorFields.DateTimeArrival}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DateTimePicker
                  error={!!errorFields.DateTimeArrival}
                  disablePast
                  format="MM/dd/yyyy HH:mm"
                  label="Date and Time of Visit To"
                  value={visitor.DateTimeArrival}
                  onChange={(d) => onDateTimeVisitChange(d as any, 'DateTimeArrival')}
                  InputProps={{ className: classes.dateField }}
                />
              </MuiPickersUtilsProvider>
              <FormHelperText>{errorFields.DateTimeArrival}</FormHelperText>
            </FormControl>
          ) : (
            <DisplayField label="Date and Time of Visit To" value={formatDateTime(visitor.DateTimeArrival)} classes={classes} />
          )}
        </Paper>
      </Grid>

      {!(isApproverUser || isSSDUser) && (
        <Grid item xs={12} sm={12}>
          <Paper variant="outlined" className={classes.paper}>
            {checkVisibility('cedit') ? (
              <DropzoneArea
                acceptedFiles={['.docx', '.xlsx', '.xls', 'doc', '.mov', 'image/*', 'video/*', ' application/*']}
                showFileNames
                showPreviews
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
            ) : (
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
          <Box style={{ fontSize: "1rem" }}>Company Information</Box>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('cedit') ? (
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
          ) : (
            <DisplayField label="Company Name" value={visitor.CompanyName} classes={classes} />
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('cedit') ? (
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
          ) : (
            <DisplayField label="Address" value={visitor.Address} classes={classes} />
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('cedit') ? (
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
          ) : (
            <DisplayField label="Contact No." value={visitor.VisContactNo} classes={classes} />
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkVisibility('cedit') ? (
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
          ) : (
            <DisplayField label="Local No." value={visitor.VisLocalNo} classes={classes} />
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
          <DisplayField label="Form Status" value={visitor.Status.Title} classes={classes} />
        </Paper>
      </Grid>
    </>
  );
};

export default VisitorInformationSection;
