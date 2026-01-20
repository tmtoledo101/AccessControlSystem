import * as React from 'react';
import { useState } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import VisibilityIcon from '@material-ui/icons/Visibility';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import MaterialTable from "material-table";
import { IVisitorDetails } from '../../models/IVisitorDetails';
import VisitorDetailsDialog from '../dialogs/VisitorDetailsDialog';

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
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 300,
    },
  }),
);

/**
 * Visitor details section props
 */
export interface IVisitorDetailsSectionProps {
  visitorDetailsList: IVisitorDetails[];
  requireParking: boolean;
  detailsError: string;
  visitorType: string; // Add visitorType prop to receive the selected value from parent
  onAddVisitor: (visitorDetails: IVisitorDetails) => void;
  onEditVisitor: (visitorDetails: IVisitorDetails, index: number) => void;
  onDeleteVisitor: (index: number) => void;
}

/**
 * Visitor details section component
 * @param props Component props
 * @returns Visitor details section component
 */
const VisitorDetailsSection: React.FC<IVisitorDetailsSectionProps> = (props) => {
  const { 
    visitorDetailsList, 
    requireParking, 
    detailsError, 
    visitorType, // Extract visitorType from props
    onAddVisitor, 
    onEditVisitor, 
    onDeleteVisitor 
  } = props;
  const classes = useStyles();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedVisitorDetails, setSelectedVisitorDetails] = useState<IVisitorDetails>({
    Title: '',
    FirstName: '',
    Car: requireParking,
    Color: '',
    PlateNo: '',
    TypeofVehicle: '',
    DriverLastName: '',
    DriverFirstName: '',
    IDPresented: '',
    GateNo: '',
    ParentId: null,
    AccessCard: '',
    Files: [],
    VisitorType: visitorType // Use the visitorType from props
  });
  const [selectedIndex, setSelectedIndex] = useState(-1);

  /**
   * Handles add button click
   */
  const handleAddClick = () => {
    setDialogMode('add');
    setSelectedVisitorDetails({
      Title: '',
      FirstName: '',
      Car: requireParking,
      Color: '',
      PlateNo: '',
      TypeofVehicle: '',
      DriverLastName: '',
      DriverFirstName: '',
      IDPresented: '',
      GateNo: '',
      ParentId: null,
      AccessCard: '',
      Files: [],
      VisitorType: visitorType // Use the visitorType from props
    });
    setDialogOpen(true);
  };

  /**
   * Handles view action
   * @param action Action
   * @param rowData Row data
   */
  const handleViewAction = (action: string, rowData: IVisitorDetails) => {
    const index = visitorDetailsList.indexOf(rowData);
    
    if (action === 'view') {
      setDialogMode('edit');
      setSelectedVisitorDetails(rowData);
      setSelectedIndex(index);
      setDialogOpen(true);
    } else if (action === 'delete') {
      onDeleteVisitor(index);
    }
  };

  /**
   * Handles dialog close
   * @param confirmed Whether the action was confirmed
   * @param visitorDetails Visitor details
   */
  const handleDialogClose = (confirmed: boolean, visitorDetails?: IVisitorDetails) => {
    setDialogOpen(false);
    
    if (confirmed && visitorDetails) {
      if (dialogMode === 'add') {
        onAddVisitor(visitorDetails);
      } else {
        onEditVisitor(visitorDetails, selectedIndex);
      }
    }
  };

  return (
    <>
      <Grid item xs={12}>
        <Paper variant="outlined" className={classes.paper}>
          <Box style={{ fontSize: "1rem" }}>
            Visitor Details
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper variant="outlined" className={classes.paper}>
          <Box component="div" style={{ display: 'inline' }} className={classes.floatingbutton}>
            <Tooltip title="Add Visitor Details">
              <Fab id="addFab" size="medium" color="primary" onClick={handleAddClick}>
                <AddIcon />
              </Fab>
            </Tooltip>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper variant="outlined" className={classes.paper}>
          {visitorDetailsList.length > 0 && (
            <div>
              <MaterialTable
                title="Visitors"
                columns={[
                  { title: 'Last Name', field: 'Title' },
                  { title: 'First Name', field: 'FirstName' },
                  { title: 'Visitor Type', field: 'VisitorType' },
                  {
                    //title: 'Car',
                    title: 'With Car?', 
                    field: "Car",
                    //render: rowData => <span>{rowData.Car ? 'With' : 'Without'}</span>
                    render: rowData => <span>{rowData.Car ? 'Yes' : 'No'}</span>
                  },
                  { title: 'Plate No.', field: 'PlateNo' },
                  { title: 'Type of Vehicle', field: "TypeofVehicle" },
                  { title: "Driver's Last Name", field: "DriverLastName" },
                  { title: "Driver's First Name", field: "DriverFirstName" },
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
                    onClick: (event, rowData) => { 
                      handleViewAction('view', rowData as IVisitorDetails); 
                    },
                  },
                  {
                    icon: 'delete',
                    tooltip: 'Delete',
                    onClick: (event, rowData) => { 
                      handleViewAction('delete', rowData as IVisitorDetails); 
                    }
                  },
                ]}
              />
            </div>
          )}
          
          <FormControl className={classes.textField} error={Boolean(detailsError)}>
            <FormHelperText>{detailsError}</FormHelperText>
          </FormControl>
        </Paper>
      </Grid>
      
      <VisitorDetailsDialog
        open={dialogOpen}
        mode={dialogMode}
        visitorDetails={selectedVisitorDetails}
        requireParking={requireParking}
        onClose={handleDialogClose}
      />
    </>
  );
};

export default VisitorDetailsSection;
