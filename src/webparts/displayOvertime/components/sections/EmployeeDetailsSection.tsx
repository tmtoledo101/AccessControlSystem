import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import MaterialTable from 'material-table';
import VisibilityIcon from '@material-ui/icons/Visibility';
import moment from 'moment';

import { IOvertimeRequest, IErrorFields } from '../../models/IOvertimeRequest';
import { IEmployeeDetails, IEmployeeDetailsDialogState } from '../../models/IEmployeeDetails';
import { checkComponentVisibility } from '../../helpers/uiHelpers';
import { formatDateTime } from '../../helpers/dateHelpers';

export interface IEmployeeDetailsSectionProps {
  overtimeRequest: IOvertimeRequest;
  employeeDetailsList: IEmployeeDetails[];
  errorFields: IErrorFields;
  isEdit: boolean;
  userRoles: {
    isEncoder: boolean;
    isReceptionist: boolean;
    isApproverUser: boolean;
    isSSDUser: boolean;
    isWalkinApproverUser: boolean;
  };
  onAddClick: () => void;
  onViewClick: (employeeDetails: IEmployeeDetails, index: number) => void;
  onDeleteClick: (employeeDetails: IEmployeeDetails, index: number) => void;
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
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 300,
    },
  }),
);

/**
 * Employee details section component
 * @param props Component properties
 * @returns JSX element
 */
const EmployeeDetailsSection: React.FC<IEmployeeDetailsSectionProps> = (props) => {
  const classes = useStyles();
  const { 
    overtimeRequest, 
    employeeDetailsList, 
    errorFields, 
    isEdit, 
    userRoles, 
    onAddClick, 
    onViewClick, 
    onDeleteClick 
  } = props;
  
  return (
    <>
      <Grid item xs={12}>
        <Paper variant="outlined" className={classes.paper}>
          <Box style={{ fontSize: "1rem" }}>
            Employee Details
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper variant="outlined" className={classes.paper}>
          {checkComponentVisibility('addEmployeeButton', isEdit, userRoles, { statusId: overtimeRequest.StatusId }) && (
            <Box component="div" style={{ display: 'inline' }} className={classes.floatingbutton}>
              <Tooltip title="Add Employee Details">
                <Fab id="addFab" size="medium" color="primary" onClick={onAddClick}>
                  <AddIcon />
                </Fab>
              </Tooltip>
            </Box>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper variant="outlined" className={classes.paper}>
          {checkComponentVisibility('employeeDetailsEdit', isEdit, userRoles, { 
            statusId: overtimeRequest.StatusId,
            hasEmployeeDetails: employeeDetailsList.length > 0
          }) && (
            <div>
              <MaterialTable
                title="Employees"
                columns={[
                  { title: 'Name', field: 'Title' },
                  { 
                    title: 'Time From', 
                    field: 'TimeFrom', 
                    type: 'date',
                    render: rowData => <span>{formatDateTime(rowData.TimeFrom)}</span>
                  },
                  { 
                    title: 'Time To', 
                    field: 'TimeTo', 
                    type: 'date',
                    render: rowData => <span>{formatDateTime(rowData.TimeTo)}</span>
                  },
                ]}
                data={employeeDetailsList}
                options={{
                  filtering: false,
                  paging: false,
                  search: false,
                  grouping: false,
                  selection: false
                }}
                actions={[
                  {
                    icon: () => <VisibilityIcon />,
                    tooltip: 'View',
                    onClick: (event, rowData) => {
                      onViewClick(rowData as IEmployeeDetails, employeeDetailsList.indexOf(rowData as IEmployeeDetails));
                    },
                  },
                  {
                    icon: 'delete',
                    tooltip: 'Delete',
                    onClick: (event, rowData) => {
                      onDeleteClick(rowData as IEmployeeDetails, employeeDetailsList.indexOf(rowData as IEmployeeDetails));
                    }
                  },
                ]}
              />
            </div>
          )}
          
          {checkComponentVisibility('employeeDetailsDisplay', isEdit, userRoles, { 
            statusId: overtimeRequest.StatusId,
            hasEmployeeDetails: employeeDetailsList.length > 0
          }) && (
            <div>
              <MaterialTable
                title="Employees"
                columns={[
                  { title: 'Name', field: 'Title' },
                  { 
                    title: 'Time From', 
                    field: 'TimeFrom', 
                    type: 'date',
                    render: rowData => <span>{formatDateTime(rowData.TimeFrom)}</span>
                  },
                  { 
                    title: 'Time To', 
                    field: 'TimeTo', 
                    type: 'date',
                    render: rowData => <span>{formatDateTime(rowData.TimeTo)}</span>
                  },
                ]}
                data={employeeDetailsList}
                options={{
                  filtering: false,
                  paging: false,
                  search: false,
                  grouping: false,
                  selection: false
                }}
                actions={[
                  {
                    icon: () => <VisibilityIcon />,
                    tooltip: 'View',
                    onClick: (event, rowData) => {
                      onViewClick(rowData as IEmployeeDetails, employeeDetailsList.indexOf(rowData as IEmployeeDetails));
                    },
                  },
                ]}
              />
            </div>
          )}
          
          <FormControl className={classes.textField} error={!!errorFields.Details}>
            <FormHelperText>{errorFields.Details}</FormHelperText>
          </FormControl>
        </Paper>
      </Grid>
    </>
  );
};

export default EmployeeDetailsSection;
