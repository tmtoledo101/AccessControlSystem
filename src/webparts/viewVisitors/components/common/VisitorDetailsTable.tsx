import * as React from 'react';
import MaterialTable from "material-table";
import VisibilityIcon from '@material-ui/icons/Visibility';
import { IVisitorDetail } from '../interfaces/IViewVisitors';
import { customDateRender } from '../utils/helper';

interface IVisitorDetailsTableProps {
  data: IVisitorDetail[];
  onViewAction: (event: any, rowData: any) => void;
  title?: string;
}

const VisitorDetailsTable: React.FC<IVisitorDetailsTableProps> = (props) => {
  const { data, onViewAction, title = "Visitors" } = props;

  return (
    <MaterialTable
      title={title}
      columns={[
        {
          title: 'Request Date', 
          field: "RequestDate", 
          type: 'date',
          defaultSort: 'desc',
          render: (value, renderType) => customDateRender(value, renderType, 'RequestDate', 'MM/DD/yyyy')
        },
        { 
          title: 'Dept. to Visit', 
          field: "Dept.Title" 
        },
        { 
          title: 'Reference No.', 
          field: 'RefNo' 
        },
        {
          title: 'Visit From', 
          field: "DateFrom", 
          type: 'date',
          render: (value, renderType) => customDateRender(value, renderType, 'DateFrom', 'MM/DD/yyyy HH:mm:ss')
        },
        {
          title: 'Visit To', 
          field: "DateTo", 
          type: 'date',
          render: (value, renderType) => customDateRender(value, renderType, 'DateTo', 'MM/DD/yyyy HH:mm:ss')
        },
        { 
          title: "Visitor's Name", 
          field: 'Title' 
        },
        { 
          title: "Company Name", 
          field: 'CompanyName' 
        },
        {
          title: 'With Car', 
          field: "Car",
          render: rowData => <span>{rowData.Car ? 'Yes' : 'No'}</span>
        },
        { 
          title: "Access Card", 
          field: 'AccessCard' 
        },
        { 
          title: 'Status', 
          field: "Status.Title" 
        },
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
      actions={[
        {
          icon: () => <VisibilityIcon />,
          tooltip: 'View Record',
          onClick: onViewAction
        },
      ]}
    />
  );
};

export default VisitorDetailsTable;
