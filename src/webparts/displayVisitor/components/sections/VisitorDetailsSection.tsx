import * as React from 'react';
import { IVisitor, IFormError } from '../../models/IVisitor';
import { IVisitorDetails } from '../../models/IVisitorDetails';
import VisitorDetailsTable from '../tables/VisitorDetailsTable';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Tooltip from '@material-ui/core/Tooltip';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(1),
      borderColor: "transparent",
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 300,
    },
    floatingbutton: {
      padding: theme.spacing(1),
      borderColor: "transparent",
    },
  }),
);

export interface IVisitorDetailsSectionProps {
  /**
   * Visitor data
   */
  visitor: IVisitor;
  
  /**
   * Error fields
   */
  errorFields: IFormError;
  
  /**
   * Whether the form is in edit mode
   */
  isEdit: boolean;
  
  /**
   * Whether the current user is an encoder
   */
  isEncoder: boolean;
  
  /**
   * Whether the current user is a receptionist
   */
  isReceptionist: boolean;
  
  /**
   * Visitor details list
   */
  visitorDetailsList: IVisitorDetails[];
  
  /**
   * Whether to hide the print button
   */
  isHidePrint: boolean;
  
  /**
   * Callback when the add button is clicked
   */
  onAddClick: () => void;
  
  /**
   * Callback when an action is performed on a visitor details row
   * @param action Action to perform
   * @param rowData Row data
   */
  onVisitorDetailsAction: (action: string, rowData: IVisitorDetails) => void;
}

/**
 * Visitor details section component
 * @param props Component properties
 * @returns JSX element
 */
const VisitorDetailsSection: React.FC<IVisitorDetailsSectionProps> = (props) => {
  const {
    visitor,
    errorFields,
    isEdit,
    isEncoder,
    isReceptionist,
    visitorDetailsList,
    isHidePrint,
    onAddClick,
    onVisitorDetailsAction
  } = props;
  
  const classes = useStyles();
  
  /**
   * Checks if a field should be visible based on user role and form state
   * @param element Element name
   * @returns Whether the element should be visible
   */
  const checkVisibility = (element: string): boolean => {
    const forEncoder = isEncoder && (visitor.StatusId === 1 || visitor.StatusId === 2);
    const forReceptionist = isReceptionist && (visitor.StatusId === 1 || visitor.StatusId === 2);
    const forReceptionistCompletion = isReceptionist && (visitor.StatusId === 4 || visitor.StatusId === 9);
    
    switch (element) {
      case 'addfabdetail':
        return isEdit && (forReceptionist || forEncoder);
      case 'visitordetailsedit':
        return isEdit && visitorDetailsList.length > 0 && (forReceptionist || forEncoder);
      case 'visitordetailsdisp':
        return (!isEdit && visitorDetailsList.length > 0) || 
               (isEdit && visitorDetailsList.length > 0 && (!forEncoder && !forReceptionist));
      default:
        return false;
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
          {checkVisibility('addfabdetail') && (
            <Box component="div" style={{ display: 'inline' }} className={classes.floatingbutton}>
              <Tooltip title="Visitor Details">
                <Fab id='addFab' size="medium" color="primary" onClick={onAddClick}>
                  <AddIcon />
                </Fab>
              </Tooltip>
            </Box>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper variant="outlined" className={classes.paper}>
          {(checkVisibility('visitordetailsedit') || checkVisibility('visitordetailsdisp')) && (
            <VisitorDetailsTable
              visitorDetailsList={visitorDetailsList}
              isEdit={isEdit}
              isHidePrint={isHidePrint}
              onAction={onVisitorDetailsAction}
            />
          )}
          
          <FormControl className={classes.textField} error={!!errorFields.Details}>
            <FormHelperText>{errorFields.Details}</FormHelperText>
          </FormControl>
        </Paper>
      </Grid>
    </>
  );
};

export default VisitorDetailsSection;
