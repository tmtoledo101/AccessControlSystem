import * as React from 'react';
import MaterialTable from "material-table";
import VisibilityIcon from '@material-ui/icons/Visibility';
import { IVisitor } from '../interfaces/IViewVisitors';
import { customDateRender } from '../utils/helper';

interface IVisitorRequestsTableProps {
  data: IVisitor[];
  onViewAction: (event: any, rowData: any) => void;
  title?: string;
}

const VisitorRequestsTable: React.FC<IVisitorRequestsTableProps> = (props) => {
  const { data, onViewAction, title = "Visitor Requests" } = props;

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
          field: 'Title' 
        },
        { 
          title: 'Employee to be Visited', 
          field: 'ContactName' 
        },
        {
          title: 'Visit From', 
          field: "DateTimeVisit", 
          type: 'date',
          render: (value, renderType) => customDateRender(value, renderType, 'DateTimeVisit', 'MM/DD/yyyy HH:mm:ss')
        },
        {
          title: 'Visit To', 
          field: "DateTimeArrival", 
          type: 'date',
          render: (value, renderType) => customDateRender(value, renderType, 'DateTimeArrival', 'MM/DD/yyyy HH:mm:ss')
        },
        { 
          title: 'Purpose', 
          field: 'Purpose' 
        },
        { 
          title: 'Status', 
          field: "Status.Title" 
        },
        {
          title: 'Request for parking', 
          field: "RequireParking",
          render: rowData => <span>{rowData.RequireParking ? 'Yes' : 'No'}</span>
        },
        { 
          title: "Visitor's Company ", 
          field: "CompanyName" 
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

export default VisitorRequestsTable;
