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
    {
      title: "Access Card",
      render: (rowData: IVisitorDetails) => {
        const ac: any = (rowData as any).AccessCard;

        if (!ac) return "";

        if (typeof ac === "string") return ac;
        if (ac.Title) return ac.Title;

        return "";
      }
    },
    {
      title: 'With Car?',
      field: 'Car',
      render: rowData => <span>{rowData.Car ? 'Yes' : 'No'}</span>
    },
    { title: 'Plate No.', field: 'PlateNo' },
    { title: 'Type of Vehicle', field: 'TypeofVehicle' },
    { title: "Driver's Last Name", field: 'DriverName' },
    {
      title: 'ID Presented',
      render: (rowData: any) => {
        const idp = rowData.IDPresented;

        if (!idp) return '';

        if (typeof idp === 'string') return idp;

        if (idp.Title) return idp.Title;

        return '';
      }
    }
  ];

// Add SSD Approve column if user is an SSD user
if (isSSDUser) {
  columns.push({
    title: 'Entry Request?',
    field: 'SSDApprove',
    render: (rowData: IVisitorDetails) => {
      const value = rowData.SSDApprove === 'Yes' ? 'Yes' : 'No';

      return (
        <select
          value={value}
          disabled={!isEdit}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const newValue: 'Yes' | 'No' = e.target.value === 'Yes' ? 'Yes' : 'No';

            // If Entry is disapproved, force Parking to disapproved as well
            const updatedRowData: IVisitorDetails = {
              ...rowData,
              SSDApprove: newValue,
              ...(newValue === 'No' ? { ParkingRequest: 'No' as 'Yes' | 'No' } : {})
            };

            // Update Entry
            onAction('updateSSDApprove', updatedRowData);

            // Optional: if your parent logic expects a separate action for parking,
            // also fire the parking update explicitly
            if (newValue === 'No') {
              onAction('updateParkingRequest', updatedRowData);
            }
          }}
          style={{ minWidth: 130 }}
        >
          <option value="Yes">Approved</option>
          <option value="No">Disapproved</option>
        </select>
      );
    }
  });
}

// Parking Request column
if (isSSDUser) {
  columns.push({
    title: 'Parking Request?',
    field: 'ParkingRequest',
    render: (rowData: IVisitorDetails) => {
      const value = rowData.ParkingRequest === 'Yes' ? 'Yes' : 'No';
      const isEntryDisapproved = rowData.SSDApprove === 'No';

      return (
        <select
          value={value}
          disabled={!isEdit || isEntryDisapproved} // disable parking if entry is disapproved
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const newValue: 'Yes' | 'No' = e.target.value === 'Yes' ? 'Yes' : 'No';

            // Guard: even if user somehow changes it, keep it No when Entry is No
            const finalValue: 'Yes' | 'No' = isEntryDisapproved ? 'No' : newValue;

            const updatedRowData: IVisitorDetails = {
              ...rowData,
              ParkingRequest: finalValue
            };

            onAction('updateParkingRequest', updatedRowData);
          }}
          style={{ minWidth: 130 }}
        >
          <option value="Yes">Approved</option>
          <option value="No">Disapproved</option>
        </select>
      );
    }
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
