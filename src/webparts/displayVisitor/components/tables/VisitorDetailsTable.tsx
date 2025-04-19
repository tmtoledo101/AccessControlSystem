import * as React from 'react';
import { IVisitorDetails } from '../../models/IVisitorDetails';
import MaterialTable from 'material-table';
import VisibilityIcon from '@material-ui/icons/Visibility';
import DeleteIcon from '@material-ui/icons/Delete';
import PrintIcon from '@material-ui/icons/Print';

export interface IVisitorDetailsTableProps {
  /**
   * Visitor details list
   */
  visitorDetailsList: IVisitorDetails[];
  
  /**
   * Whether the form is in edit mode
   */
  isEdit: boolean;
  
  /**
   * Whether the print button is hidden
   */
  isHidePrint: boolean;
  
  /**
   * Callback when an action is performed on a visitor details row
   * @param action Action to perform
   * @param rowData Row data
   */
  onAction: (action: string, rowData: IVisitorDetails) => void;
}

/**
 * Visitor details table component
 * @param props Component properties
 * @returns JSX element
 */
const VisitorDetailsTable: React.FC<IVisitorDetailsTableProps> = (props) => {
  const { visitorDetailsList, isEdit, isHidePrint, onAction } = props;
  
  return (
    <MaterialTable
      title="Visitors"
      columns={[
        { title: 'Name', field: 'Title' },
        { title: 'Access Card', field: 'AccessCard' },
        {
          title: 'Car',
          field: 'Car',
          render: rowData => <span>{rowData.Car ? 'With' : 'Without'}</span>
        },
        { title: 'Plate No.', field: 'PlateNo' },
        { title: 'Type of Vehicle', field: 'TypeofVehicle' },
        { title: "Driver's Name", field: 'DriverName' },
        { title: 'Gate', field: 'GateNo' },
        { title: 'ID Presented', field: 'IDPresented' },
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
          onClick: (event, rowData) => onAction('view', rowData as IVisitorDetails),
        },
        {
          icon: () => <DeleteIcon />,
          tooltip: 'Delete',
          onClick: (event, rowData) => onAction('delete', rowData as IVisitorDetails),
          hidden: !isEdit
        },
        {
          icon: () => <PrintIcon />,
          tooltip: 'Print Preview',
          onClick: (event, rowData) => onAction('print', rowData as IVisitorDetails),
          hidden: isHidePrint
        },
      ]}
    />
  );
};

export default VisitorDetailsTable;
