import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';

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
    }
  }),
);

interface ISearchBoxProps {
  searchText: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
}

const SearchBox: React.FC<ISearchBoxProps> = (props) => {
  const { searchText, onSearchChange, label = "Input Visitor's Name" } = props;
  const classes = useStyles();

  return (
    <Paper variant="outlined" className={classes.paper}>
      <TextField
        inputProps={{ maxLength: 255 }}
        label={label}
        name="Title"
        onChange={onSearchChange}
        value={searchText}
        variant="standard"
        className={classes.textField}
      />
    </Paper>
  );
};

export default SearchBox;
