import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(1),
      borderColor: "transparent",
    }
  }),
);

interface IHeaderSectionProps {
  title: string;
}

const HeaderSection: React.FC<IHeaderSectionProps> = (props) => {
  const { title } = props;
  const classes = useStyles();

  return (
    <Paper variant="outlined" className={classes.paper}>
      <Box style={{ fontSize: "1.5rem" }}>
        {title}
      </Box>
    </Paper>
  );
};

export default HeaderSection;
