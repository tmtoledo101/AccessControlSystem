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
    }
  }),
);

interface IDateRangeSelectorProps {
  fromDate: any;
  toDate: any;
  onFromDateChange: (date: any) => void;
  onToDateChange: (date: any) => void;
}

const DateRangeSelector: React.FC<IDateRangeSelectorProps> = (props) => {
  const { fromDate, toDate, onFromDateChange, onToDateChange } = props;
  const classes = useStyles();

  return (
    <>
      <Paper variant="outlined" className={classes.paper}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <DatePicker
            format="MM/dd/yyyy"
            label="From"
            value={fromDate}
            onChange={onFromDateChange}
            name='fromdate'
          />
        </MuiPickersUtilsProvider>
      </Paper>
      <Paper variant="outlined" className={classes.paper}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <DatePicker
            format="MM/dd/yyyy"
            label="To"
            value={toDate}
            onChange={onToDateChange}
            name='todate'
          />
        </MuiPickersUtilsProvider>
      </Paper>
    </>
  );
};

export default DateRangeSelector;
