import * as React from 'react';
import { Grid, Paper, Box, Tooltip, Fab } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import { IUserPermissions } from '../../utils/permissionUtils';
import { STATUS } from '../../constants/status';

// Styles
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(1),
      borderColor: "transparent",
    },
    floatingbutton: {
      padding: theme.spacing(1),
      borderColor: "transparent",
    },
    title: {
      fontSize: "1.5rem"
    },
    refNo: {
      display: 'block',
      margin: '4px',
      fontSize: '18px',
      fontWeight: 500
    }
  }),
);

interface IHeaderSectionProps {
  /**
   * The request title (reference number)
   */
  title: string;
  
  /**
   * User permissions
   */
  permissions: IUserPermissions;
  
  /**
   * The request status ID
   */
  statusId: number;
  
  /**
   * Whether the form is in edit mode
   */
  isEditMode: boolean;
  
  /**
   * Edit button click handler
   */
  onEditClick: () => void;
}

/**
 * Header Section component
 */
export const HeaderSection: React.FC<IHeaderSectionProps> = ({
  title,
  permissions,
  statusId,
  isEditMode,
  onEditClick
}) => {
  const classes = useStyles();
  
  /**
   * Checks if the edit button should be visible
   */
  const shouldShowEditButton = (): boolean => {
    if (isEditMode) {
      return false;
    }
    
    if (permissions.isEncoder && (statusId === STATUS.DRAFT || statusId === STATUS.PENDING_DEPT_APPROVAL)) {
      return true;
    }
    
    if (permissions.isApproverUser && statusId === STATUS.PENDING_DEPT_APPROVAL) {
      return true;
    }
    
    if (permissions.isSSDUser && statusId === STATUS.PENDING_SSD_APPROVAL) {
      return true;
    }
    
    return false;
  };
  
  return (
    <>
      <Grid item xs={12}>
        <Paper variant="outlined" className={classes.paper}>
          <Box className={classes.title}>
            Display Overtime / Overstay
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" className={classes.paper}>
          {shouldShowEditButton() && (
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
          {title && (
            <Box component="span" className={classes.refNo}>
              Reference No.: {title}
            </Box>
          )}
        </Paper>
      </Grid>
    </>
  );
};
