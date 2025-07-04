import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

/**
 * Header section props
 */
export interface IHeaderSectionProps {
  /**
   * Title
   */
  title: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(1),
      borderColor: 'transparent',
    },
  }),
);

/**
 * Header section component
 * @param props Component props
 * @returns Header section component
 */
export const HeaderSection: React.FC<IHeaderSectionProps> = (props) => {
  const { title } = props;
  const classes = useStyles();

  return (
    <Grid item xs={12}>
      <Paper variant="outlined" className={classes.paper}>
        <Box style={{ fontSize: '1.5rem' }}>
          {title}
        </Box>
      </Paper>
    </Grid>
  );
};
