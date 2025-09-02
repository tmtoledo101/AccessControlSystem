import * as React from 'react';
import MaterialTable from "material-table";
//import VisibilityIcon from '@material-ui/icons/Visibility';
import { IVisitorCount } from '../interfaces/IViewVisitors';

interface IVisitorCountTableProps {
  data: IVisitorCount[];
  onViewAction?: (event: any, rowData: any) => void;
  title?: string;
}

const VisitorCountTable: React.FC<IVisitorCountTableProps> = (props) => {
  const { data, onViewAction, title = "Visitor Entry Count" } = props;

  return (
    <MaterialTable
      title={title}
      columns={[
        { 
          title: "Visitor's Last Name", 
          field: 'LastName' 
        },
        { 
          title: "Visitor's First Name", 
          field: 'FirstName' 
        },
        { 
          title: "Company Name", 
          field: 'CompanyName' 
        },
        { 
          title: 'Visit Count', 
          field: 'VisitCount',
          type: 'numeric'
        }
      ]}
      data={data}
        options={{
        filtering: true,
        pageSize: 10,
        pageSizeOptions: [5, 10, 20, data.length],
        search: false,   // ✅ hides the search bar
        grouping: true,
        selection: false,
        sorting: true,
        headerStyle: {
            backgroundColor: '#f5f5f5',
            fontWeight: 'bold'
        }
        }}
/*       actions={onViewAction ? [
        {
          icon: () => <VisibilityIcon />,
          tooltip: 'View Details',
          onClick: onViewAction
        },
      ] : []} */
    />
  );
};

export default VisitorCountTable;