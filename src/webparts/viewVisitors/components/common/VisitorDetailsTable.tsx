import * as React from 'react';
import MaterialTable from "material-table";
import VisibilityIcon from '@material-ui/icons/Visibility';
import { IVisitorDetail } from '../interfaces/IViewVisitors';
import { customDateRender } from '../utils/helper';
import SharePointService from '../services/SharePointService';

interface IVisitorDetailsTableProps {
  data: IVisitorDetail[];
  onViewAction: (event: any, rowData: any) => void;
  title?: string;
}

const VisitorDetailsTable: React.FC<IVisitorDetailsTableProps> = ({ data, onViewAction, title = "Visitors" }) => {
  const [accessCardLookup, setAccessCardLookup] = React.useState<{
    [key: number]: { title: string; buildings: string[] };
  }>({});

  React.useEffect(() => {
    const loadAccessPassOptions = async () => {
      try {
        const lookup = await SharePointService.getAccessCardOptions();
        setAccessCardLookup(lookup);
      } catch (error) {
        console.error("Failed to load access card options:", error);
      }
    };
    loadAccessPassOptions();
  }, []);

  return (
    <MaterialTable
      title={title}
      columns={[
        {
          title: 'Request Date',
          field: "RequestDate",
          type: 'date',
          editable: 'never',
          defaultSort: 'desc',
          render: (value, renderType) =>
            customDateRender(value, renderType, 'RequestDate', 'MM/DD/yyyy')
        },
        { title: 'Dept. to Visit', field: "Dept.Title", editable: 'never' },
        { title: 'Reference No.', field: 'RefNo', editable: 'never' },
        {
          title: 'Visit From',
          field: "DateFrom",
          type: 'date',
          editable: 'never',
          render: (value, renderType) =>
            customDateRender(value, renderType, 'DateFrom', 'MM/DD/yyyy HH:mm:ss')
        },
        {
          title: 'Visit To',
          field: "DateTo",
          type: 'date',
          editable: 'never',
          render: (value, renderType) =>
            customDateRender(value, renderType, 'DateTo', 'MM/DD/yyyy HH:mm:ss')
        },
        { title: "Visitor's Last Name", field: 'Title', editable: 'never' },
        { title: "Visitor's First Name", field: 'FirstName', editable: 'never' },
        { title: "Company Name", field: 'CompanyName', editable: 'never' },
        {
          title: 'With Car',
          field: "Car",
          editable: 'never',
          render: rowData => <span>{rowData.Car ? 'Yes' : 'No'}</span>
        },
        { title: "Building", field: "Bldg", editable: 'never' },
        {
          title: "Access Card",
          field: "AccessCardId",
          editComponent: props => {
          // Normalize and split the buildings string
          const bldgRaw = props.rowData.Bldg || "";
          const selectedBuildings = bldgRaw
            .split(/[,;/]+/)
            .map(b => b.trim().toLowerCase())
            .filter(Boolean); // avoid empty strings

          // Filter AccessCards that match at least one building
          const filteredOptions = Object.entries(accessCardLookup)
            .filter(([_, val]) =>
              val.buildings.some(
                accessCardBldg => selectedBuildings.includes(accessCardBldg.toLowerCase())
              )
            )
            .map(([id, val]) => (
              <option key={id} value={id}>{val.title}</option>
            ));

          return (
            <select
              value={props.value !== undefined && props.value !== null ? props.value : ''}
              onChange={e => props.onChange(Number(e.target.value))}
            >
              <option value="">-- Select Access Card --</option>
              {filteredOptions}
            </select>
          );
        },
          render: rowData =>
            accessCardLookup[rowData.AccessCardId]
              ? accessCardLookup[rowData.AccessCardId].title
              : ''
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
          try {
            await SharePointService.updateAccessCard(oldData.ID, newData.AccessCardId);
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