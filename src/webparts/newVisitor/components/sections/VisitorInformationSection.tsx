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
import Autocomplete from '@material-ui/lab/Autocomplete';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { DropzoneArea } from 'material-ui-dropzone';
import HeaderSection from './HeaderSection';
import { IVisitor } from '../../models/IVisitor';
import { IFormErrors } from '../../models/IFormErrors';

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
  errors: IFormErrors;
  externalType: string;
  purposeList: any[];
  deptList: any[];
  bldgList: any[];
  contactList: any[];
  onChange: (name: string, value: any) => void;
  onContactSearch: (searchText: string) => void;
  onContactSelect: (contact: any) => void;
  onDateChange: (date: Date, name: string) => void;
  onFilesChange: (files: File[]) => void;
}

/**
 * Visitor information section component
 * @param props Component props
 * @returns Visitor information section component
 */
const VisitorInformationSection: React.FC<IVisitorInformationSectionProps> = (props) => {
  const { 
    visitor, 
    errors, 
    externalType, 
    purposeList, 
    deptList, 
    bldgList, 
    contactList,
    onChange, 
    onContactSearch, 
    onContactSelect, 
    onDateChange, 
    onFilesChange 
  } = props;
  const classes = useStyles();
  
  const [isAC1Open, setAC1Open] = useState(false);

  /**
   * Handles text field change
   * @param e Event
   */
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'RequireParking') {
      onChange(name, e.target.checked);
    } else {
      onChange(name, value);
    }
  };

  /**
   * Handles select change
   * @param e Event
   */
  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: any }>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  /**
   * Handles contact search
   * @param e Event
   */
  const handleContactSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 2) {
      onContactSearch(e.target.value);
    } else if (e.target.value.length < 3) {
      onContactSearch('');
    }
  };

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
          <FormControl className={classes.textField} error={Boolean(errors.Purpose)}>
            <InputLabel id="purposeLabel">Purpose *</InputLabel>
            <Select
              labelId="purposeLabel"
              id="Purpose"
              value={visitor.Purpose || ''}
              onChange={handleSelectChange}
              name="Purpose"
            >
              {purposeList.map((item) => (
                <MenuItem key={item.Title} value={item.Title}>
                  {item.Title}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.Purpose}</FormHelperText>
          </FormControl>
          
          {visitor.Purpose === 'Others' && (
            <TextField
              inputProps={{ maxLength: 255 }}
              error={Boolean(errors.PurposeOthers)}
              required
              label="Others"
              name="PurposeOthers"
              onChange={handleTextChange}
              value={visitor.PurposeOthers || ''}
              variant="standard"
              className={classes.textField}
              helperText={errors.PurposeOthers}
            />
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField} error={Boolean(errors.DeptId)}>
            <InputLabel id="deptLabel">Department to Visit *</InputLabel>
            <Select
              labelId="deptLabel"
              id="DeptId"
              value={visitor.DeptId || ''}
              onChange={handleSelectChange}
              name="DeptId"
            >
              {deptList.map((item) => (
                <MenuItem key={item.Id} value={item.Id}>
                  {item.Title}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.DeptId}</FormHelperText>
          </FormControl>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField} error={Boolean(errors.Bldg)}>
            <InputLabel id="bldgLabel">Building</InputLabel>
            <Select
              labelId="bldgLabel"
              id="Bldg"
              value={visitor.Bldg || ''}
              onChange={handleSelectChange}
              name="Bldg"
            >
              {bldgList.map((item) => (
                <MenuItem key={item.Title} value={item.Title}>
                  {item.Title}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.Bldg}</FormHelperText>
          </FormControl>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <TextField
            inputProps={{ maxLength: 255 }}
            error={Boolean(errors.RoomNo)}
            required
            label="Room No."
            name="RoomNo"
            onChange={handleTextChange}
            value={visitor.RoomNo || ''}
            variant="standard"
            className={classes.textField}
            helperText={errors.RoomNo}
          />
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField} error={Boolean(errors.EmpNo)}>
            <Autocomplete
              freeSolo={true}
              id="Contact"
              style={{ width: 300 }}
              open={isAC1Open}
              onChange={(event, value) => onContactSelect(value)}
              onOpen={() => setAC1Open(true)}
              onClose={() => setAC1Open(false)}
              getOptionSelected={(option, value) => option.EmpNo === value.EmpNo}
              getOptionLabel={(option) => option.Name || ''}
              options={contactList}
              renderInput={(params) => (
                <TextField
                  {...params}
                  onChange={handleContactSearch}
                  label="Contact Person"
                  variant="standard"
                  error={Boolean(errors.EmpNo)}
                  helperText={errors.EmpNo}
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
      
      <Grid item xs={12} sm={12}>
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
          <FormControl className={classes.textField} error={Boolean(errors.DateTimeVisit)}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DateTimePicker
                error={Boolean(errors.DateTimeVisit)}
                disablePast
                format="MM/dd/yyyy HH:mm"
                label="Date and Time of Visit From"
                value={visitor.DateTimeVisit}
                onChange={(date) => onDateChange(date as Date, 'DateTimeVisit')}
                InputProps={{ className: classes.dateField }}
              />
            </MuiPickersUtilsProvider>
            <FormHelperText>{errors.DateTimeVisit}</FormHelperText>
          </FormControl>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <FormControl className={classes.textField} error={Boolean(errors.DateTimeArrival)}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DateTimePicker
                error={Boolean(errors.DateTimeArrival)}
                disablePast
                format="MM/dd/yyyy HH:mm"
                label="Date and Time of Visit To"
                value={visitor.DateTimeArrival}
                onChange={(date) => onDateChange(date as Date, 'DateTimeArrival')}
                InputProps={{ className: classes.dateField }}
              />
            </MuiPickersUtilsProvider>
            <FormHelperText>{errors.DateTimeArrival}</FormHelperText>
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
            previewText="Selected files"
            dropzoneText="Add an attachment"
          />
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
            inputProps={{ maxLength: 255 }}
            error={Boolean(errors.CompanyName)}
            required
            label="Company Name"
            name="CompanyName"
            onChange={handleTextChange}
            value={visitor.CompanyName || ''}
            variant="standard"
            className={classes.textField}
            helperText={errors.CompanyName}
          />
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <TextField
            multiline
            error={Boolean(errors.Address)}
            required
            label="Address"
            name="Address"
            onChange={handleTextChange}
            value={visitor.Address || ''}
            variant="standard"
            className={classes.textField}
            helperText={errors.Address}
          />
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <TextField
            inputProps={{ maxLength: 255 }}
            error={Boolean(errors.VisContactNo)}
            required
            label="Contact No."
            name="VisContactNo"
            onChange={handleTextChange}
            value={visitor.VisContactNo || ''}
            variant="standard"
            className={classes.textField}
            helperText={errors.VisContactNo}
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
            value={visitor.VisLocalNo || ''}
            variant="standard"
            className={classes.textField}
            helperText={errors.VisLocalNo}
          />
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <div className={classes.datelabel}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={visitor.RequireParking}
                  onChange={handleTextChange}
                  name="RequireParking"
                  color="primary"
                />
              }
              label="Request for Parking"
            />
          </div>
        </Paper>
      </Grid>
    </>
  );
};

export default VisitorInformationSection;
