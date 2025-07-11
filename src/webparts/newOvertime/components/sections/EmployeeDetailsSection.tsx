import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { IOvertimeEmployee } from '../../models/IOvertimeEmployee';
import { formatDateTime } from '../../utils/dateUtils';

/**
 * Employee details section props
 */
export interface IEmployeeDetailsSectionProps {
  /**
   * Employees
   */
  employees: IOvertimeEmployee[];
  
  /**
   * Details error
   */
  detailsError: string;
  
  /**
   * Department ID
   */
  departmentId: number;
  
  /**
   * On add click callback
   */
  onAddClick: () => void;
  
  /**
   * On view click callback
   */
  onViewClick: (employee: IOvertimeEmployee, index: number) => void;
  
  /**
   * On delete click callback
   */
  onDeleteClick: (employee: IOvertimeEmployee, index: number) => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(1),
      borderColor: 'transparent',
    },
    floatingbutton: {
      padding: theme.spacing(1),
      borderColor: 'transparent',
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
 * @param props Component props
 * @returns Employee details section component
 */
export const EmployeeDetailsSection: React.FC<IEmployeeDetailsSectionProps> = (props) => {
  const { employees, detailsError, departmentId, onAddClick, onViewClick, onDeleteClick } = props;
  const classes = useStyles();

  /**
   * Handle fab click
   * @param e Click event
   */
  const handleFabClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.currentTarget.id === 'addFab') {
      if (departmentId) {
        onAddClick();
      } else {
        alert('Please select a department before adding employees!');
      }
    }
  };

  /**
   * Handle action
   * @param action Action
   * @param rowData Row data
   */
  const handleAction = (action: string, rowData: IOvertimeEmployee) => {
    const index = employees.indexOf(rowData);
    
    if (action === 'view') {
      onViewClick(rowData, index);
    } else if (action === 'delete') {
      onDeleteClick(rowData, index);
    }
  };

  return (
    <>
      <Grid item xs={12}>
        <Paper variant="outlined" className={classes.paper}>
          <Box style={{ fontSize: '1rem' }}>
            Employee Details
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper variant="outlined" className={classes.paper}>
          <Box component="div" style={{ display: 'inline' }} className={classes.floatingbutton}>
            <Tooltip title="Add Employee Details">
              <Fab id="addFab" size="medium" color="primary" onClick={handleFabClick}>
                <AddIcon />
              </Fab>
            </Tooltip>
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper variant="outlined" className={classes.paper}>
          {employees.length > 0 && (
            <div>
              <MaterialTable
                title="Employees"
                columns={[
                  { title: 'Name', field: 'Title' },
                  {
                    title: 'Time From',
                    field: 'TimeFrom',
                    type: 'date',
                    render: (rowData) => <span>{formatDateTime(rowData.TimeFrom)}</span>
                  },
                  {
                    title: 'Time To',
                    field: 'TimeTo',
                    type: 'date',
                    render: (rowData) => <span>{formatDateTime(rowData.TimeTo)}</span>
                  }
                ]}
                data={employees}
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
                    onClick: (event, rowData) => handleAction('view', rowData as IOvertimeEmployee)
                  },
                  {
                    icon: 'delete',
                    tooltip: 'Delete',
                    onClick: (event, rowData) => handleAction('delete', rowData as IOvertimeEmployee)
                  }
                ]}
              />
            </div>
          )}
          <FormControl className={classes.textField} error={!!detailsError}>
            <FormHelperText>{detailsError}</FormHelperText>
          </FormControl>
        </Paper>
      </Grid>
    </>
  );
};
