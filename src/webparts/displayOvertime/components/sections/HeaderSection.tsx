import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Fab from '@material-ui/core/Fab';
import EditIcon from '@material-ui/icons/Edit';

import { IOvertimeRequest } from '../../models/IOvertimeRequest';
import { checkComponentVisibility } from '../../helpers/uiHelpers';

export interface IHeaderSectionProps {
  overtimeRequest: IOvertimeRequest;
  isEdit: boolean;
  userRoles: {
    isEncoder: boolean;
    isReceptionist: boolean;
    isApproverUser: boolean;
    isSSDUser: boolean;
    isWalkinApproverUser: boolean;
  };
  onEditClick: () => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      fontFamily: '"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif'
    },
    paper: {
      padding: theme.spacing(1),
      borderColor: "transparent",
    },
    floatingbutton: {
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
  }),
);

/**
 * Header section component
 * @param props Component properties
 * @returns JSX element
 */
const HeaderSection: React.FC<IHeaderSectionProps> = (props) => {
  const classes = useStyles();
  const { overtimeRequest, isEdit, userRoles, onEditClick } = props;
  
  return (
    <>
      <Grid item xs={12}>
        <Paper variant="outlined" className={classes.paper}>
          <Box style={{ fontSize: "1.5rem" }}>
            Display Overtime / Overstay
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {checkComponentVisibility('editIcon', isEdit, userRoles, { statusId: overtimeRequest.StatusId }) && (
            <Box component="div" style={{ display: 'inline' }} className={classes.floatingbutton}>
              <Tooltip title="Edit">
                <Fab id="editFab" size="medium" color="primary" onClick={onEditClick}>
                  <EditIcon />
                </Fab>
              </Tooltip>
            </Box>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {overtimeRequest.Title && (
            <>
              <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                Reference No.
              </Box>
              <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                {overtimeRequest.Title}
              </Box>
            </>
          )}
        </Paper>
      </Grid>
    </>
  );
};

export default HeaderSection;
