import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import AddIcon from '@material-ui/icons/Add';
import MaterialTable from 'material-table';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { IVisitor, IFormError } from '../../models/IVisitor';
import { IVisitorDetails } from '../../models/IVisitorDetails';
import { checkVisibility } from '../../helpers/uiHelpers';

// Define styles
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(1),
      borderColor: "transparent",
    },
    title: {
      fontSize: "1rem",
    },
    floatingbutton: {
      padding: theme.spacing(1),
      borderColor: "transparent",
    },
  }),
);

/**
 * Visitor details section props
 */
export interface IVisitorDetailsSectionProps {
  visitor: IVisitor;
  errorFields: IFormError;
  visitorDetailsList: IVisitorDetails[];
  isEdit: boolean;
  isEncoder: boolean;
  isReceptionist: boolean;
  isApproverUser: boolean;
  isWalkinApproverUser: boolean;
  isSSDUser: boolean;
  onClickFab: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onViewAction: (event: string, rowData: IVisitorDetails) => void;
}

/**
 * Visitor details section component
 * @param props Component props
 * @returns JSX element
 */
const VisitorDetailsSection: React.FC<IVisitorDetailsSectionProps> = (props) => {
  const {
    visitor,
    errorFields,
    visitorDetailsList,
    isEdit,
    isEncoder,
    isReceptionist,
    isApproverUser,
    isWalkinApproverUser,
    isSSDUser,
    onClickFab,
    onViewAction
  } = props;

  const classes = useStyles();

  return (
    <>
      <Paper variant="outlined" className={classes.paper}>
        <Box className={classes.title}>
          Visitor Details
        </Box>
      </Paper>

      {checkVisibility('addVisitorButton', visitor, isEdit, isEncoder, isReceptionist, isApproverUser, isWalkinApproverUser, isSSDUser) && (
        <Paper variant="outlined" className={classes.paper}>
          <Box component="div" style={{ display: 'inline' }} className={classes.floatingbutton}>
            <Tooltip title="Add Visitor Details">
              <Fab id="addFab" size="medium" color="primary" onClick={onClickFab}>
                <AddIcon />
              </Fab>
            </Tooltip>
          </Box>
        </Paper>
      )}

      <Paper variant="outlined" className={classes.paper}>
        {visitorDetailsList.length > 0 ? (
          <MaterialTable
            title="Visitors"
            columns={[
              { title: 'Name', field: 'Title' },
              {
                title: 'Car', field: 'Car',
                render: rowData => <span>{rowData.Car ? 'With' : 'Without'}</span>
              },
              { title: 'Plate No.', field: 'PlateNo' },
              { title: 'Type of Vehicle', field: 'TypeofVehicle' },
              { title: "Driver's Name", field: 'DriverName' },
            ]}
            data={visitorDetailsList}
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
                onClick: (event, rowData) => { onViewAction('view', rowData as IVisitorDetails); },
              },
              {
                icon: 'delete',
                tooltip: 'Delete',
                onClick: (event, rowData) => { onViewAction('delete', rowData as IVisitorDetails); },
                hidden: !isEdit || isApproverUser || isSSDUser
              },
            ]}
          />
        ) : (
          <Box style={{ padding: 16 }}>
            No visitor details added yet.
            {errorFields.Details && (
              <Box style={{ color: 'red', marginTop: 8 }}>
                {errorFields.Details}
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </>
  );
};

export default VisitorDetailsSection;
