import * as React from 'react';
import { useState } from 'react'; // useState is imported but not used, can be removed if not needed for future state
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid'; // Keep Grid, as it's used in the ViewOvertime parent for layout
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(1),
      borderColor: "transparent",
    },
    // Added these new styles from your example
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(2)
    },
    singlePickerContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: theme.spacing(1),
    }
  }),
);

interface IDateRangeSelectorProps {
  fromDate: Date | null; // Changed from 'any' to 'Date | null' for better type safety
  toDate: Date | null;   // Changed from 'any' to 'Date | null' for better type safety
  onFromDateChange: (date: Date | null) => void;
  onToDateChange: (date: Date | null) => void;
  pickerType: 'date' | 'month'; // Added pickerType prop
}

const DateRangeSelector: React.FC<IDateRangeSelectorProps> = (props) => {
  const { fromDate, toDate, onFromDateChange, onToDateChange, pickerType } = props;
  const classes = useStyles();

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      {/* Conditionally render based on pickerType */}
      {pickerType === 'date' ? (
        <> {/* Use a fragment to wrap multiple Grid items */}
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" className={classes.paper}>
              <DatePicker
                format="MM/dd/yyyy"
                label="From"
                value={fromDate}
                onChange={onFromDateChange}
                name='fromdate'
                InputLabelProps={{ shrink: true }} // Added InputLabelProps
                clearable // Added clearable
                inputVariant="standard" // Set inputVariant to "standard"
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" className={classes.paper}>
              <DatePicker
                format="MM/dd/yyyy"
                label="To"
                value={toDate}
                onChange={onToDateChange}
                name='todate'
                InputLabelProps={{ shrink: true }} // Added InputLabelProps
                clearable // Added clearable
                inputVariant="standard" // Set inputVariant to "standard"
              />
            </Paper>
          </Grid>
        </>
      ) : (
        <Grid item xs={12} sm={6}> {/* For 'month' picker, it's a single picker */}
          <div className={classes.singlePickerContainer}>
            <Paper variant="outlined" className={classes.paper}>
              <DatePicker
                views={["year", "month"]} // Specify views for month picker
                format="MMMM yyyy"
                label="Select Month/Year"
                value={fromDate} // For month picker, 'fromDate' usually represents the selected month
                onChange={onFromDateChange} // Use onFromDateChange for the single picker
                name='monthPicker'
                InputLabelProps={{ shrink: true }}
                clearable
                inputVariant="standard"
              />
            </Paper>
          </div>
        </Grid>
      )}
    </MuiPickersUtilsProvider>
  );
};

export default DateRangeSelector;