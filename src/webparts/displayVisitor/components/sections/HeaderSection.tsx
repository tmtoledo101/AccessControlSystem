import * as React from 'react';
import { IVisitor } from '../../models/IVisitor';
import { formatDate } from '../../helpers/dateHelpers';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Fab from '@material-ui/core/Fab';
import EditIcon from '@material-ui/icons/Edit';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(1),
      borderColor: "transparent",
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
    floatingbutton: {
      padding: theme.spacing(1),
      borderColor: "transparent",
    },
  }),
);

export interface IHeaderSectionProps {
  /**
   * Visitor data
   */
  visitor: IVisitor;
  
  /**
   * Whether to show the edit button
   */
  showEditButton: boolean;
  
  /**
   * Callback when the edit button is clicked
   */
  onEditClick: () => void;
}

/**
 * Header section component
 * @param props Component properties
 * @returns JSX element
 */
const HeaderSection: React.FC<IHeaderSectionProps> = (props) => {
  const { visitor, showEditButton, onEditClick } = props;
  const classes = useStyles();
  
  return (
    <>
      <Grid item xs={12}>
        <Paper variant="outlined" className={classes.paper}>
          <Box style={{ fontSize: "1.5rem" }}>
            Display Visitor
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {showEditButton && (
            <Box component="div" style={{ display: 'inline' }} className={classes.floatingbutton}>
              <Tooltip title="Edit">
                <Fab id='editFab' size="medium" color="primary" onClick={onEditClick}>
                  <EditIcon />
                </Fab>
              </Tooltip>
            </Box>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {visitor.Title && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Reference No.
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {visitor.Title}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {visitor.RequestDate && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Request Date
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {formatDate(visitor.RequestDate)}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
            External Type
          </Box>
          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
            {visitor.ExternalType}
          </Box>
        </Paper>
      </Grid>
    </>
  );
};

export default HeaderSection;
