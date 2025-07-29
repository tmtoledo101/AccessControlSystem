import * as React from 'react';
import MaterialTable from "material-table";
import VisibilityIcon from '@material-ui/icons/Visibility';
import moment from 'moment';
import { IOvertimeRequest } from '../interfaces/IViewOvertime';

interface IOvertimeRequestsTableProps {
  data: IOvertimeRequest[];
  onViewAction: (event: any, rowData: any) => void;
  title?: string;
}

function customDateRender(value, renderType, field, format) {
  let dt = null;

  if (renderType === 'row') {
    if (moment(value[field]).isValid()) {
      dt = moment(value[field]).format(format);
    }
    return dt;
  }
  if (renderType === 'group') {
    if (moment(value).isValid()) {
      dt = moment(value).format(format);
    }
    return dt;
  }
}

const OvertimeRequestsTable: React.FC<IOvertimeRequestsTableProps> = (props) => {
  const { data, onViewAction, title = "Requests" } = props;

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
          title: 'Requesting Dept.', 
          field: "Dept.Title" 
        },
        { 
          title: 'Reference No.', 
          field: 'Title' 
        },
        {
          title: 'OT/Overstay From', 
          field: "DateFrom", 
          type: 'date',                        
          render: (value, renderType) => customDateRender(value, renderType, 'DateFrom', 'MM/DD/yyyy')
        },
        {
          title: 'OT/Overstay To', 
          field: "DateTo", 
          type: 'date',                       
          render: (value, renderType) => customDateRender(value, renderType, 'DateTo', 'MM/DD/yyyy')
        },
        { 
          title: 'Purpose', 
          field: 'Purpose' 
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

export default OvertimeRequestsTable;
