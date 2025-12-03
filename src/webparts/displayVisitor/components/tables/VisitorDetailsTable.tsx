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
   * Whether the current user is an SSD user
   */
  isSSDUser?: boolean;
  
  /**
   * Whether the current user is a department approver
   */
  isApproverUser?: boolean;
  
  /**
   * Whether the current user is a walk-in approver
   */
  isWalkinApproverUser?: boolean;
  
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
  const { 
    visitorDetailsList, 
    isEdit, 
    isHidePrint, 
    isSSDUser, 
    isApproverUser, 
    isWalkinApproverUser, 
    onAction 
  } = props;

  // Helpful debug
  console.log("VisitorDetailsTable roles:", {
    isSSDUser,
    isApproverUser,
    isWalkinApproverUser,
    isEdit,
    isHidePrint
  });
  
  // Check if user is an approver or SSD user (these users should not see print button)
  const isViewOnlyUser = !!(isSSDUser || isApproverUser || isWalkinApproverUser);
  
  // Define columns array
  const columns: any[] = [
    { title: 'Last Name', field: 'Title' },
    { title: 'First Name', field: 'FirstName' },
    { title: 'Access Card', field: 'AccessCard' },
    {
      title: 'Car',
      field: 'Car',
      render: (rowData: IVisitorDetails) => <span>{rowData.Car ? 'With' : 'Without'}</span>
    },
    { title: 'Plate No.', field: 'PlateNo' },
    { title: 'Type of Vehicle', field: 'TypeofVehicle' },
    { title: "Driver's Last Name", field: 'DriverLastName' },
    { title: "Driver's First Name", field: 'DriverFirstName' },
    { title: 'Gate', field: 'GateNo' },
    { title: 'ID Presented', field: 'IDPresented' },
  ];
  
  // Add SSD Approve column if user is an SSD user
  if (isSSDUser) {
    columns.push({
      title: 'SSD Approve?',
      field: 'SSDApprove',
      render: (rowData: IVisitorDetails) => (
        <input 
          type="checkbox" 
          checked={rowData.SSDApprove === 'Yes'} 
          disabled={!isEdit}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue: 'Yes' | 'No' = e.target.checked ? 'Yes' : 'No';
            const updatedRowData: IVisitorDetails = { ...rowData, SSDApprove: newValue };
            onAction('updateSSDApprove', updatedRowData);
          }}
        />
      )
    });
  }
  
  // Add Parking Request column if user is an Approver
  if (isApproverUser) {
    columns.push({
      title: 'Parking Request?',
      field: 'ParkingRequest',
      render: (rowData: IVisitorDetails) => (
        <input 
          type="checkbox" 
          checked={rowData.ParkingRequest === 'Yes'} 
          disabled={!isEdit}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue: 'Yes' | 'No' = e.target.checked ? 'Yes' : 'No';
            const updatedRowData: IVisitorDetails = { ...rowData, ParkingRequest: newValue };
            onAction('updateParkingRequest', updatedRowData);
          }}
        />
      )
    });
  }
  
  return (
    <MaterialTable
      title="Visitors"
      columns={columns}
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
          hidden: isHidePrint || isViewOnlyUser
        },
      ]}
    />
  );
};

export default VisitorDetailsTable;
