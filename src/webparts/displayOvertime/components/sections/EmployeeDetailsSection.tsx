import * as React from 'react';
import { Grid, Paper, Box, Tooltip, Fab, Typography } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import VisibilityIcon from '@material-ui/icons/Visibility';
import DeleteIcon from '@material-ui/icons/Delete';
import MaterialTable from 'material-table';
import moment from 'moment';
import { IUserPermissions } from '../../utils/permissionUtils';
import { IEmployeeDetails } from '../../models/IEmployeeDetails';
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
      fontSize: "1rem"
    },
    errorText: {
      color: theme.palette.error.main,
      marginLeft: theme.spacing(1)
    }
  }),
);

interface IEmployeeDetailsSectionProps {
  /**
   * Employee details list
   */
  employeeDetails: IEmployeeDetails[];
  
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
   * The department ID
   */
  departmentId: number;
  
  /**
   * The department name
   */
  departmentName: string;
  
  /**
   * Details validation error
   */
  detailsError: string;
  
  /**
   * Add button click handler
   */
  onAddClick: (deptId: number, deptName: string) => void;
  
  /**
   * View button click handler
   */
  onViewClick: (detail: IEmployeeDetails, index: number) => void;
  
  /**
   * Delete button click handler
   */
  onDeleteClick: (index: number) => void;
}

/**
 * Employee Details Section component
 */
export const EmployeeDetailsSection: React.FC<IEmployeeDetailsSectionProps> = ({
  employeeDetails,
  permissions,
  statusId,
  isEditMode,
  departmentId,
  departmentName,
  detailsError,
  onAddClick,
  onViewClick,
  onDeleteClick
}) => {
  const classes = useStyles();
  
  /**
   * Checks if the add button should be visible
   */
  const shouldShowAddButton = (): boolean => {
    return isEditMode && (permissions.isEncoder || permissions.isReceptionist);
  };
  
  /**
   * Checks if the employee details table should be editable
   */
  const isTableEditable = (): boolean => {
    return isEditMode && (permissions.isEncoder || permissions.isReceptionist);
  };
  
  /**
   * Checks if the employee details table should be view-only
   */
  const isTableViewOnly = (): boolean => {
    return (!isEditMode && employeeDetails.length > 0) || 
           (isEditMode && employeeDetails.length > 0 && (permissions.isSSDUser || permissions.isApproverUser));
  };
  
  /**
   * Handles add button click
   */
  const handleAddClick = () => {
    onAddClick(departmentId, departmentName);
  };
  
  /**
   * Handles view button click
   */
  const handleViewClick = (detail: IEmployeeDetails, index: number) => {
    onViewClick(detail, index);
  };
  
  /**
   * Handles delete button click
   */
  const handleDeleteClick = (index: number) => {
    onDeleteClick(index);
  };
  
  return (
    <>
      <Grid item xs={12}>
        <Paper variant="outlined" className={classes.paper}>
          <Box className={classes.title}>
            Employee Details
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper variant="outlined" className={classes.paper}>
          {shouldShowAddButton() && (
            <Box component="div" style={{ display: 'inline' }} className={classes.floatingbutton}>
              <Tooltip title="Add Employee">
                <Fab id="addFab" size="medium" color="primary" onClick={handleAddClick}>
                  <AddIcon />
                </Fab>
              </Tooltip>
            </Box>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper variant="outlined" className={classes.paper}>
          {(isTableEditable() || isTableViewOnly()) && (
            <MaterialTable
              title="Employees"
              columns={[
                { title: 'Name', field: 'Title' },
                {
                  title: 'Time From', 
                  field: 'TimeFrom', 
                  type: 'datetime',
                  render: rowData => (
                    <span>{moment(rowData.TimeFrom).format("MM/DD/yyyy HH:mm")}</span>
                  )
                },
                {
                  title: 'Time To', 
                  field: 'TimeTo', 
                  type: 'datetime',
                  render: rowData => (
                    <span>{moment(rowData.TimeTo).format("MM/DD/yyyy HH:mm")}</span>
                  )
                }
              ]}
              data={employeeDetails}
              options={{
                filtering: false,
                paging: false,
                search: false,
                grouping: false,
                selection: false
              }}
              actions={
                isTableEditable() 
                  ? [
                      {
                        icon: () => <VisibilityIcon />,
                        tooltip: 'View',
                        onClick: (event, rowData) => {
                          handleViewClick(rowData as IEmployeeDetails, employeeDetails.indexOf(rowData as IEmployeeDetails));
                        }
                      },
                      {
                        icon: () => <DeleteIcon />,
                        tooltip: 'Delete',
                        onClick: (event, rowData) => {
                          handleDeleteClick(employeeDetails.indexOf(rowData as IEmployeeDetails));
                        }
                      }
                    ]
                  : [
                      {
                        icon: () => <VisibilityIcon />,
                        tooltip: 'View',
                        onClick: (event, rowData) => {
                          handleViewClick(rowData as IEmployeeDetails, employeeDetails.indexOf(rowData as IEmployeeDetails));
                        }
                      }
                    ]
              }
            />
          )}
          
          {detailsError && (
            <Typography className={classes.errorText}>
              {detailsError}
            </Typography>
          )}
        </Paper>
      </Grid>
    </>
  );
};
