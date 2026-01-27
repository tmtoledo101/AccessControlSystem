import * as React from 'react';
import { useState } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { DropzoneArea } from 'material-ui-dropzone';
import Typography from '@material-ui/core/Typography';

import HeaderSection from './HeaderSection';
import { IVisitor } from '../../models/IVisitor';
import { IFormErrors } from '../../models/IFormErrors';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(1),
      borderColor: 'transparent',
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
      maxWidth: 210,
    },
    attachmentNote: {
      color: theme.palette.error.main,
      fontSize: '0.85rem',
      textAlign: 'center',
      marginTop: theme.spacing(1),
    },
    dropzoneRoot: {
      minHeight: 120,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
    dropzoneText: {
      marginBottom: theme.spacing(1),
    },
    dropzoneIcon: {
      marginTop: 0,
      marginBottom: theme.spacing(1),
    },
    subjectForApprovalRed: {
      color: theme.palette.error.main,
    },
  }),
);

export interface IVisitorInformationSectionProps {
  visitor: IVisitor;
  errors: IFormErrors;
  externalType: string;
  purposeList: any[];
  deptList: any[];
  bldgList: any[];
  contactList: any[];
  visitorTypeList: any[]; // from SP list "VisitorType"
  onChange: (name: string, value: any) => void;
  onContactSearch: (searchText: string) => void;
  onContactSelect: (contact: any) => void;
  onDateChange: (date: Date, name: string) => void;
  onFilesChange: (files: File[]) => void;
}

const VisitorInformationSection: React.FC<IVisitorInformationSectionProps> = (props) => {
  const {
    visitor,
    errors,
    externalType,
    purposeList,
    deptList,
    bldgList,
    contactList,
    visitorTypeList,
    onChange,
    onContactSearch,
    onContactSelect,
    onDateChange,
    onFilesChange,
  } = props;

  const classes = useStyles();
  const [isAC1Open, setAC1Open] = useState(false);

  const getBldgArrayFromVisitor = (): string[] => {
    const raw = (visitor as any).Bldg;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      return raw
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const setBldgArrayToVisitor = (arr: string[]) => {
    const cleaned = (arr || [])
      .map((s) => (s || '').trim())
      .filter(Boolean);
    onChange('Bldg', cleaned.join('; '));
  };

  const handleBldgMultiChange = (e: React.ChangeEvent<{ name?: string; value: any }>) => {
    const value = e.target.value;

    const arr: string[] = Array.isArray(value)
      ? value
      : typeof value === 'string'
        ? value
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    setBldgArrayToVisitor(arr);
  };

  const handleRemoveBldgChip = (chipValue: string) => {
    const current = getBldgArrayFromVisitor();
    const next = current.filter((x) => x !== chipValue);
    setBldgArrayToVisitor(next);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;

    if (name === 'RequireParking') {
      onChange(name, e.target.checked);
    } else {
      onChange(name, value);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: any }>) => {
    const name = e.target.name as string;
    const value = e.target.value;

    onChange(name, value);

    if (name === 'VisitorType' && value !== 'Others') {
      onChange('OtherVisitorType', '');
    }
  };

  const handleContactSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 2) {
      onContactSearch(e.target.value);
    } else if (e.target.value.length < 3) {
      onContactSearch('');
    }
  };

  const bldgSelectedArray = getBldgArrayFromVisitor();

  const getVisitorTypeSortNumber = (item: any): number => {
    const raw =
      item && (item.VisID || item.visID || item.VisId || item.visId || item.SortOrder || item.Order);
    const n = Number(raw);
    return isNaN(n) ? 0 : n;
  };

  const sortedVisitorTypeList = (visitorTypeList || []).slice().sort((a: any, b: any) => {
    return getVisitorTypeSortNumber(a) - getVisitorTypeSortNumber(b);
  });

  const getVisitorTypeKey = (item: any, index: number): string | number => {
    if (!item) return index;
    return item.Id || item.ID || item.VisID || item.Title || index;
  };

  const getVisitorTypeTitle = (item: any): string => {
    if (!item) return '';
    return item.Title ? String(item.Title) : '';
  };

  const selectedVisitorType = (visitor as any).VisitorType || '';
  const otherVisitorTypeValue = (visitor as any).OtherVisitorType || '';

  const dedupedVisitorTypeList = (sortedVisitorTypeList || [])
    .filter((item: any) => {
      const title = getVisitorTypeTitle(item).trim();
      return !!title;
    })
    .filter((item: any, idx: number, arr: any[]) => {
      const t = getVisitorTypeTitle(item).trim().toLowerCase();
      return idx === arr.findIndex((x: any) => getVisitorTypeTitle(x).trim().toLowerCase() === t);
    });

  return (
    <>
      <HeaderSection title="New Visitor" />

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
            External Type
          </Box>
          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
            {externalType}
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField} error={Boolean((errors as any).Purpose)}>
            <InputLabel id="purposeLabel">Purpose *</InputLabel>
            <Select
              labelId="purposeLabel"
              id="Purpose"
              value={(visitor as any).Purpose || ''}
              onChange={handleSelectChange}
              name="Purpose"
            >
              {(purposeList || []).map((item: any) => (
                <MenuItem key={item.Title} value={item.Title}>
                  {item.Title}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{(errors as any).Purpose}</FormHelperText>
          </FormControl>

          {(visitor as any).Purpose === 'Others' && (
            <TextField
              inputProps={{ maxLength: 255 }}
              error={Boolean((errors as any).PurposeOthers)}
              required
              label="Others"
              name="PurposeOthers"
              onChange={handleTextChange}
              value={(visitor as any).PurposeOthers || ''}
              variant="standard"
              className={classes.textField}
              helperText={(errors as any).PurposeOthers}
            />
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField} error={Boolean((errors as any).DeptId)}>
            <InputLabel id="deptLabel">Department to Visit *</InputLabel>
            <Select
              labelId="deptLabel"
              id="DeptId"
              value={(visitor as any).DeptId || ''}
              onChange={handleSelectChange}
              name="DeptId"
            >
              {(deptList || []).map((item: any) => (
                <MenuItem key={item.Id} value={item.Id}>
                  {item.Title}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{(errors as any).DeptId}</FormHelperText>
          </FormControl>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField} error={Boolean((errors as any).Bldg)}>
            <InputLabel id="bldgLabel">Building *</InputLabel>
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
                    <Chip
                      key={b}
                      label={b}
                      onDelete={() => handleRemoveBldgChip(b)}
                      style={{ marginRight: 6, marginTop: 6 }}
                    />
                  ))}
                </div>
              )}
            >
              {(bldgList || []).map((item: any) => (
                <MenuItem key={item.Title} value={item.Title}>
                  {item.Title}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{(errors as any).Bldg}</FormHelperText>
          </FormControl>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <TextField
            inputProps={{ maxLength: 255 }}
            error={Boolean((errors as any).RoomNo)}
            required
            label="Room No."
            name="RoomNo"
            onChange={handleTextChange}
            value={(visitor as any).RoomNo || ''}
            variant="standard"
            className={classes.textField}
            helperText={(errors as any).RoomNo}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField} error={Boolean((errors as any).EmpNo)}>
            <Autocomplete
              freeSolo={true}
              id="Contact"
              style={{ width: 300 }}
              open={isAC1Open}
              onChange={(event, value) => onContactSelect(value)}
              onOpen={() => setAC1Open(true)}
              onClose={() => setAC1Open(false)}
              getOptionSelected={(option, value) => option.EmpNo === value.EmpNo}
              getOptionLabel={(option) => (option && option.Name ? option.Name : '')}
              options={contactList || []}
              renderInput={(params) => (
                <TextField
                  {...params}
                  onChange={handleContactSearch}
                  label="Contact Person"
                  variant="standard"
                  error={Boolean((errors as any).EmpNo)}
                  helperText={(errors as any).EmpNo}
                />
              )}
            />
          </FormControl>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
            Position
          </Box>
          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
            {(visitor as any).Position}
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
            Direct No.
          </Box>
          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
            {(visitor as any).DirectNo}
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={12}>
        <Paper variant="outlined" className={classes.paper}>
          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
            Local No.
          </Box>
          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
            {(visitor as any).LocalNo}
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField} error={Boolean((errors as any).DateTimeVisit)}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DateTimePicker
                error={Boolean((errors as any).DateTimeVisit)}
                disablePast
                format="MM/dd/yyyy HH:mm"
                label="Date and Time of Visit From"
                value={(visitor as any).DateTimeVisit}
                onChange={(date) => onDateChange(date as Date, 'DateTimeVisit')}
                InputProps={{ className: classes.dateField }}
              />
            </MuiPickersUtilsProvider>
            <FormHelperText>{(errors as any).DateTimeVisit}</FormHelperText>
          </FormControl>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField} error={Boolean((errors as any).DateTimeArrival)}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DateTimePicker
                error={Boolean((errors as any).DateTimeArrival)}
                disablePast
                format="MM/dd/yyyy HH:mm"
                label="Date and Time of Visit To"
                value={(visitor as any).DateTimeArrival}
                onChange={(date) => onDateChange(date as Date, 'DateTimeArrival')}
                InputProps={{ className: classes.dateField }}
              />
            </MuiPickersUtilsProvider>
            <FormHelperText>{(errors as any).DateTimeArrival}</FormHelperText>
          </FormControl>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={12}>
        <Paper variant="outlined" className={classes.paper}>
          <DropzoneArea
            acceptedFiles={['.docx', '.xlsx', '.xls', 'doc', '.mov', 'image/*', 'video/*', ' application/*']}
            showFileNames={true}
            showPreviews={true}
            maxFileSize={70000000}
            onChange={onFilesChange}
            filesLimit={10}
            showPreviewsInDropzone={false}
            useChipsForPreview
            previewGridProps={{ container: { spacing: 1, direction: 'row' } }}
            previewChipProps={{ classes: { root: classes.previewChip } }}
            classes={{
              root: classes.dropzoneRoot,
              text: classes.dropzoneText,
              icon: classes.dropzoneIcon,
            }}
            dropzoneText="Add an attachment"
          />
          <Typography variant="caption" className={classes.attachmentNote}>
            Please do not attach visitor's details here
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper variant="outlined" className={classes.paper}>
          <Box style={{ fontSize: '1rem' }}>Visitor Details</Box>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField}>
            <InputLabel id="visitor-type-label">Visitor Type</InputLabel>
            <Select
              labelId="visitor-type-label"
              id="VisitorType"
              value={selectedVisitorType}
              onChange={handleSelectChange}
              name="VisitorType"
            >
              {dedupedVisitorTypeList.map((item: any, idx: number) => {
                const title = getVisitorTypeTitle(item);
                return (
                  <MenuItem key={getVisitorTypeKey(item, idx)} value={title}>
                    {title}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {selectedVisitorType === 'Others' && (
            <TextField
              inputProps={{ maxLength: 255 }}
              required
              label="Specify Visitor Type"
              name="OtherVisitorType"
              onChange={handleTextChange}
              value={otherVisitorTypeValue}
              variant="standard"
              className={classes.textField}
              helperText={(errors as any).OtherVisitorType}
              error={Boolean((errors as any).OtherVisitorType)}
            />
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <TextField
            inputProps={{ maxLength: 255 }}
            error={Boolean((errors as any).CompanyName)}
            required
            label="Company Name"
            name="CompanyName"
            onChange={handleTextChange}
            value={(visitor as any).CompanyName || ''}
            variant="standard"
            className={classes.textField}
            helperText={(errors as any).CompanyName}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <TextField
            multiline
            error={Boolean((errors as any).Address)}
            required
            label="Address"
            name="Address"
            onChange={handleTextChange}
            value={(visitor as any).Address || ''}
            variant="standard"
            className={classes.textField}
            helperText={(errors as any).Address}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <TextField
            inputProps={{ maxLength: 255 }}
            error={Boolean((errors as any).VisContactNo)}
            required
            label="Contact No."
            name="VisContactNo"
            onChange={handleTextChange}
            value={(visitor as any).VisContactNo || ''}
            variant="standard"
            className={classes.textField}
            helperText={(errors as any).VisContactNo}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <TextField
            inputProps={{ maxLength: 255 }}
            label="Local No."
            name="VisLocalNo"
            onChange={handleTextChange}
            value={(visitor as any).VisLocalNo || ''}
            variant="standard"
            className={classes.textField}
            helperText={(errors as any).VisLocalNo}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <div className={classes.datelabel}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean((visitor as any).RequireParking)}
                  onChange={handleTextChange}
                  name="RequireParking"
                  color="primary"
                />
              }
              label="Request for Parking"
            />
            <Typography
              variant="caption"
              className={classes.subjectForApprovalRed}
              style={{ display: 'block', marginLeft: 35 }}
            >
              (Subject for Approval)
            </Typography>
          </div>
        </Paper>
      </Grid>
    </>
  );
};

export default VisitorInformationSection;