import * as React from 'react';
import MaterialTable from 'material-table';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { customDateRender } from '../utils/helper';

interface IVisitorsTableProps {
  data: any[];
  onViewAction: (event: any, rowData: any) => void;
  title?: string;
}

// Small helpers to avoid optional chaining
const getText = (val: any): string => {
  if (val === null || val === undefined) return '';
  return String(val);
};

const getNested = (obj: any, path: string): any => {
  if (!obj) return undefined;
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length; i++) {
    if (cur === null || cur === undefined) return undefined;
    cur = cur[parts[i]];
  }
  return cur;
};

const VisitorsTable: React.FC<IVisitorsTableProps> = (props) => {
  const { data, onViewAction, title = 'Reports' } = props;

  return (
    <MaterialTable
      title={title}
      columns={[
        { title: 'Reference Number', field: 'Title', editable: 'never' },
        { title: 'Company Name', field: 'CompanyName', editable: 'never' },

        {
          title: 'Request By',
          field: 'RequestBy',
          editable: 'never',
          render: (rowData: any) => {
            // pick whichever exists
            const authorTitle = getNested(rowData, 'Author.Title');
            const approverTitle = getNested(rowData, 'Approver.Title');
            const contactName = rowData && rowData.ContactName ? rowData.ContactName : '';
            return getText(authorTitle || approverTitle || contactName);
          }
        },

        {
          title: 'Department',
          field: 'Dept.Title',
          editable: 'never',
          render: (rowData: any) => getText(getNested(rowData, 'Dept.Title'))
        },

        {
          title: 'Building',
          field: 'Bldg',
          editable: 'never',
          render: (rowData: any) => getText(rowData && rowData.Bldg ? rowData.Bldg : '')
        },

        {
          title: 'Request Date',
          field: 'RequestDate',
          type: 'date',
          defaultSort: 'desc',
          editable: 'never',
          render: (value: any, renderType: any) =>
            customDateRender(value, renderType, 'RequestDate', 'MM/DD/yyyy')
        },

        {
          title: 'Date & Time Visit',
          field: 'DateTimeVisit',
          type: 'datetime',
          editable: 'never',
          render: (value: any, renderType: any) =>
            customDateRender(value, renderType, 'DateTimeVisit', 'MM/DD/yyyy HH:mm:ss')
        },

        {
          title: 'Date & Time Arrival',
          field: 'DateTimeArrival',
          type: 'datetime',
          editable: 'never',
          render: (value: any, renderType: any) =>
            customDateRender(value, renderType, 'DateTimeArrival', 'MM/DD/yyyy HH:mm:ss')
        },

        { title: 'Purpose', field: 'Purpose', editable: 'never' },

        {
          title: 'Status',
          field: 'Status.Title',
          editable: 'never',
          render: (rowData: any) => getText(getNested(rowData, 'Status.Title'))
        },

        {
          title: 'Require Parking',
          field: 'RequireParking',
          editable: 'never',
          render: (rowData: any) => {
            const val = rowData && rowData.RequireParking ? true : false;
            return val ? 'Yes' : 'No';
          }
        },

        {
          title: "Visitor's Last Name",
          field: 'VisitorLastName',
          editable: 'never',
          render: (rowData: any) => getText(rowData && rowData.VisitorLastName ? rowData.VisitorLastName : '')
        },

        {
          title: "Visitor's First Name",
          field: 'VisitorFirstName',
          editable: 'never',
          render: (rowData: any) => getText(rowData && rowData.VisitorFirstName ? rowData.VisitorFirstName : '')
        },

        {
          title: 'Plate No.',
          field: 'VisitorPlateNo',
          editable: 'never',
          render: (rowData: any) => getText(rowData && rowData.VisitorPlateNo ? rowData.VisitorPlateNo : '')
        },

        {
          title: 'Room No.',
          field: 'RoomNo',
          editable: 'never',
          render: (rowData: any) => getText(rowData && rowData.RoomNo ? rowData.RoomNo : '')
        }
      ]}
      data={data || []}
      options={{
        filtering: true,
        pageSize: 5,
        pageSizeOptions: [5, 10, (data || []).length],
        search: false,
        grouping: true,
        selection: false
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

export default VisitorsTable;
