import * as React from 'react';
import MaterialTable from "material-table";
import VisibilityIcon from '@material-ui/icons/Visibility';
import { IVisitorDetail } from '../interfaces/IViewVisitors';
import { customDateRender } from '../utils/helper';
import SharePointService from '../services/SharePointService'; // <-- make sure this exists

interface IVisitorDetailsTableProps {
  data: IVisitorDetail[];
  onViewAction: (event: any, rowData: any) => void;
  title?: string;
}

const VisitorDetailsTable: React.FC<IVisitorDetailsTableProps> = (props) => {
  const { data, onViewAction, title = "Visitors" } = props;

  const accessCardOptions = [
    "Visitor's Pass - Gate 3",
    "Visitor's Pass - Gate 6",
    "Visitor's Pass - Backdoor",
    "Visitor's Pass - Gate 5"
  ];

  return (
    <MaterialTable
      title={title}
      columns={[
        { title: 'Request Date', field: "RequestDate", type: 'date', editable: 'never',
          defaultSort: 'desc',
          render: (value, renderType) => customDateRender(value, renderType, 'RequestDate', 'MM/DD/yyyy')
        },
        { title: 'Dept. to Visit', field: "Dept.Title", editable: 'never' },
        { title: 'Reference No.', field: 'RefNo', editable: 'never' },
        { title: 'Visit From', field: "DateFrom", type: 'date', editable: 'never',
          render: (value, renderType) => customDateRender(value, renderType, 'DateFrom', 'MM/DD/yyyy HH:mm:ss')
        },
        { title: 'Visit To', field: "DateTo", type: 'date', editable: 'never',
          render: (value, renderType) => customDateRender(value, renderType, 'DateTo', 'MM/DD/yyyy HH:mm:ss')
        },
        { title: "Visitor's Last Name", field: 'Title', editable: 'never' },
        { title: "Visitor's First Name", field: 'FirstName', editable: 'never' },
        { title: "Company Name", field: 'CompanyName', editable: 'never' },
        { title: 'With Car', field: "Car", editable: 'never',
          render: rowData => <span>{rowData.Car ? 'Yes' : 'No'}</span>
        },
        { title: "Building", field: "Bldg", editable: 'never' },

        // ✅ ONLY ACCESS CARD IS EDITABLE
        { 
          title: "Access Card",
          field: 'AccessCard',
          lookup: {
            "Visitor's Pass - Gate 3": "Visitor's Pass - Gate 3",
            "Visitor's Pass - Gate 6": "Visitor's Pass - Gate 6",
            "Visitor's Pass - Backdoor": "Visitor's Pass - Backdoor",
            "Visitor's Pass - Gate 5": "Visitor's Pass - Gate 5"
          }
        },

        { title: 'Status', field: "Status.Title", editable: 'never' },
      ]}
      data={data}
      options={{
        filtering: true,
        pageSize: 5,
        pageSizeOptions: [5, 10, data.length],
        search: false,
        grouping: true,
        selection: false
      }}
      editable={{
        onRowUpdate: async (newData, oldData) => {
          // ✅ Only AccessCard changed, so update only that field
          try {
            await SharePointService.updateAccessCard(oldData.ID, newData.AccessCard);
          } catch (e) {
            console.error("Access Card update failed:", e);
          }
        }
      }}
      actions={[
        {
          icon: () => <VisibilityIcon />,
          tooltip: 'View Record',
          onClick: onViewAction
        }
      ]}
    />
  );
};

export default VisitorDetailsTable;