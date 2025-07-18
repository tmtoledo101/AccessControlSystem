import * as React from 'react';
import { useState } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(1),
      borderColor: "transparent",
    },
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
  fromDate: Date | null;
  toDate: Date | null;
  onFromDateChange: (date: Date | null) => void;
  onToDateChange: (date: Date | null) => void;
  pickerType: 'date' | 'month';
}

const DateRangeSelector: React.FC<IDateRangeSelectorProps> = (props) => {
  const { fromDate, toDate, onFromDateChange, onToDateChange, pickerType } = props;
  const classes = useStyles();

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      {pickerType === 'date' ? (
        <div className={classes.container}>
          <Paper variant="outlined" className={classes.paper}>
            <DatePicker
              format="MM/dd/yyyy"
              label="From"
              value={fromDate}
              onChange={onFromDateChange}
              name='fromdate'
              InputLabelProps={{ shrink: true }}
              clearable
              inputVariant="standard" // ✓ Changed from "outlined" to "standard"
            />
          </Paper>
          <Paper variant="outlined" className={classes.paper}>
            <DatePicker
              format="MM/dd/yyyy"
              label="To"
              value={toDate}
              onChange={onToDateChange}
              name='todate'
              InputLabelProps={{ shrink: true }}
              clearable
              inputVariant="standard" // ✓ Changed from "outlined" to "standard"
            />
          </Paper>
        </div>
      ) : (
        <div className={classes.singlePickerContainer}>
          <Paper variant="outlined" className={classes.paper}>
            <DatePicker
              views={["year", "month"]}
              format="MMMM yyyy"
              label="Select Month/Year"
              value={fromDate}
              onChange={onFromDateChange}
              name='monthPicker'
              InputLabelProps={{ shrink: true }}
              clearable
              inputVariant="standard" // ✓ Changed from "outlined" to "standard"
            />
          </Paper>
        </div>
      )}
    </MuiPickersUtilsProvider>
  );
};

export default DateRangeSelector;
