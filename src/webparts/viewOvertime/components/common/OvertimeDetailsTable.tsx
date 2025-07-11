import * as React from 'react';
import MaterialTable from "material-table";
import VisibilityIcon from '@material-ui/icons/Visibility';
import moment from 'moment';
import { IOvertimeDetail } from '../interfaces/IViewOvertime';

interface IOvertimeDetailsTableProps {
  data: IOvertimeDetail[];
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

const OvertimeDetailsTable: React.FC<IOvertimeDetailsTableProps> = (props) => {
  const { data, onViewAction, title = "Employees" } = props;

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
          field: 'RefNo' 
        },
        {
          title: 'OT/Overstay From', 
          field: "TimeFrom", 
          type: 'date',                        
          render: (value, renderType) => customDateRender(value, renderType, 'TimeFrom', 'MM/DD/yyyy HH:mm:ss')
        },
        {
          title: 'OT/Overstay To', 
          field: "TimeTo", 
          type: 'date',
          render: (value, renderType) => customDateRender(value, renderType, 'TimeTo', 'MM/DD/yyyy HH:mm:ss')
        },
        { 
          title: "Name", 
          field: 'Title' 
        },
        { 
          title: "Personnel Type", 
          field: 'Etype' 
        },
        {
          title: 'Others', 
          field: "OtherSource",
          render: rowData => <span>{rowData.OtherSource ? rowData.OtherSource : null}</span>
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

export default OvertimeDetailsTable;
