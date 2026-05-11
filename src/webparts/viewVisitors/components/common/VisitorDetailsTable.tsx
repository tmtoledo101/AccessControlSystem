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

const RECEPTIONIST_V2_GROUP = "Receptionist";

const VisitorDetailsTable: React.FC<IVisitorDetailsTableProps> = ({ data, onViewAction, title = "Visitors" }) => {
  const [accessCardLookup, setAccessCardLookup] = React.useState<{
    [key: number]: { title: string; buildings: string[] };
  }>({});

  const [canEditAccessCard, setCanEditAccessCard] = React.useState<boolean>(false);

  React.useEffect(() => {
    const init = async () => {
      try {
        // Load access card options
        const lookup = await SharePointService.getAccessCardOptions();
        setAccessCardLookup(lookup);

        // Check group membership
        const groups = await SharePointService.getCurrentUserGroups();
        const isReceptionistV2 = (groups || []).some((g: any) => {
          const name = (g && (g.LoginName || g.Title || g.Name)) ? String(g.LoginName || g.Title || g.Name) : "";
          return name === RECEPTIONIST_V2_GROUP;
        });

        setCanEditAccessCard(isReceptionistV2);
      } catch (error) {
        console.error("Init failed:", error);
        setCanEditAccessCard(false);
      }
    };

    init();
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
          editable: canEditAccessCard ? 'always' : 'never',
          editComponent: props => {
            // Normalize and split the buildings string
            const bldgRaw = props.rowData.Bldg || "";
            const selectedBuildings = bldgRaw
              .split(/[,;/]+/)
              .map(b => b.trim().toLowerCase())
              .filter(Boolean);

            // Filter AccessCards that match at least one building
            const filteredOptions = Object.entries(accessCardLookup)
              .filter(([_, val]) =>
                val.buildings.some(
                  accessCardBldg => selectedBuildings.includes(String(accessCardBldg).toLowerCase())
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
          render: (rowData: any) =>
            accessCardLookup[rowData.AccessCardId]
              ? accessCardLookup[rowData.AccessCardId].title
              : ''
        },
        {
          title: 'Parking Status',
          field: 'ParkingRequest',
          editable: 'never',

          // Optional: makes the column filter show nice labels too
          lookup: {
            true: 'Parking Approved',
            false: 'Parking Disapproved'
          } as any,

          render: (rowData: any) => {
            const v = (rowData as any).ParkingRequest;

            // handle boolean true/false OR "Yes"/"No" OR null
            if (v === true || v === 'Yes') return 'Parking Approved';
            if (v === false || v === 'No') return 'Parking Disapproved';
            return '';
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
      editable={
        canEditAccessCard
          ? {
              onRowUpdate: async (newData: any, oldData: any) => {
                try {
                  if (!oldData) return;
                  await SharePointService.updateAccessCard(oldData.ID, newData.AccessCardId);
                } catch (e) {
                  console.error("Access Card update failed:", e);
                }
              }
            }
          : undefined
      }
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
