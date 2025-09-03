import * as React from 'react';
import { useState } from 'react';
import MaterialTable from "material-table";
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { IVisitorCount, IVisitorDetailExtended } from '../interfaces/IViewVisitors';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { 
  IconButton, 
  Collapse, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow,
  Typography,
  Paper
} from '@material-ui/core';
import { customDateRender } from '../utils/helper';
import SharePointService from '../services/SharePointService';

// Styles for the collapsible section
const useRowStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        borderBottom: 'unset',
      },
    },
    detailsTable: {
      marginBottom: theme.spacing(2),
    },
    detailsHeader: {
      backgroundColor: '#f5f5f5',
      fontWeight: 'bold',
    },
    collapseContainer: {
      padding: theme.spacing(2),
      backgroundColor: '#fafafa',
    },
    noDataMessage: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    }
  }),
);

interface IVisitorCountTableProps {
  data: IVisitorCount[];
  onViewAction?: (event: any, rowData: any) => void;
  title?: string;
  fromDate: Date;
  toDate: Date;
}

// Row component with collapsible details
const Row: React.FC<{ row: IVisitorCount, fromDate: Date, toDate: Date }> = (props) => {
  const { row, fromDate, toDate } = props;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailsData, setDetailsData] = useState<IVisitorDetailExtended[]>([]);
  const classes = useRowStyles();

  const handleRowClick = async () => {
    // Toggle the open state
    setOpen(!open);

    // If opening and no details data loaded yet, fetch the data
    if (!open && (!row.detailsData || row.detailsData.length === 0)) {
      setLoading(true);
      try {
        const details = await SharePointService.getVisitorDetailedInfo(
          row.FirstName,
          row.LastName,
          fromDate,
          toDate
        );
        setDetailsData(details);
        // Update the row's detailsData for future reference
        row.detailsData = details;
      } catch (error) {
        console.error("Error fetching visitor details:", error);
      } finally {
        setLoading(false);
      }
    } else if (row.detailsData && row.detailsData.length > 0) {
      // Use cached data if available
      setDetailsData(row.detailsData);
    }
  };

  return (
    <React.Fragment>
      {/* Main row */}
      <TableRow className={classes.root}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={handleRowClick}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.LastName}</TableCell>
        <TableCell>{row.FirstName}</TableCell>
        <TableCell align="left">{row.VisitCount}</TableCell>
        {/* <TableCell>{row.CompanyName}</TableCell> */}
        {/* <TableCell>{row.VisitCount}</TableCell> */}
      </TableRow>

      {/* Collapsible details section */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box className={classes.collapseContainer}>
              <Typography variant="h6" gutterBottom component="div">
                Visitor Details
              </Typography>
              
              {loading ? (
                <Typography className={classes.noDataMessage}>Loading details...</Typography>
              ) : detailsData.length > 0 ? (
                <Table size="small" className={classes.detailsTable}>
                  <TableHead>
                    <TableRow>
                      <TableCell className={classes.detailsHeader}>Last Name</TableCell>
                      <TableCell className={classes.detailsHeader}>First Name</TableCell>
                      <TableCell className={classes.detailsHeader}>Date From</TableCell>
                      <TableCell className={classes.detailsHeader}>Date To</TableCell>
                      <TableCell className={classes.detailsHeader}>Company Name</TableCell>
                      <TableCell className={classes.detailsHeader}>Status</TableCell>
                      <TableCell className={classes.detailsHeader}>Contact No.</TableCell>
                      <TableCell className={classes.detailsHeader}>Created By</TableCell>
                      <TableCell className={classes.detailsHeader}>Department</TableCell>
                      <TableCell className={classes.detailsHeader}>Arrival</TableCell>
                      <TableCell className={classes.detailsHeader}>Visit</TableCell>
                      <TableCell className={classes.detailsHeader}>Building</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detailsData.map((detail) => (
                      <TableRow key={detail.ID}>
                        <TableCell>{detail.Title}</TableCell>
                        <TableCell>{detail.FirstName}</TableCell>
                        <TableCell>{detail.DateFrom ? new Date(detail.DateFrom).toLocaleString() : ''}</TableCell>
                        <TableCell>{detail.DateTo ? new Date(detail.DateTo).toLocaleString() : ''}</TableCell>
                        <TableCell>{detail.CompanyName}</TableCell>
                        <TableCell>{detail.Status ? detail.Status.Title : ''}</TableCell>
                        <TableCell>{detail.VisContactNo}</TableCell>
                        <TableCell>{detail.CreatedBy}</TableCell>
                        <TableCell>{detail.Dept ? detail.Dept.Title : ''}</TableCell>
                        <TableCell>{detail.DateTimeArrival ? new Date(detail.DateTimeArrival).toLocaleString() : ''}</TableCell>
                        <TableCell>{detail.DateTimeVisit ? new Date(detail.DateTimeVisit).toLocaleString() : ''}</TableCell>
                        <TableCell>{detail.Bldg}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography className={classes.noDataMessage}>No details found for this visitor</Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const VisitorCountTable: React.FC<IVisitorCountTableProps> = (props) => {
  const { data, title = "Visitor Entry Count", fromDate, toDate } = props;

  return (
    <Paper>
      <MaterialTable
        title={title}
        columns={[
          {
            title: '', // Expand/collapse column
            field: 'expand',
            width: 50,
            sorting: false,
            filtering: false,
          },
          { 
            title: "Visitor's Last Name", 
            field: 'LastName' 
          },
          { 
            title: "Visitor's First Name", 
            field: 'FirstName' 
          },
/*           { 
            title: "Company Name", 
            field: 'CompanyName' 
          }, */
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
          search: false,
          grouping: true,
          selection: false,
          sorting: true,
          headerStyle: {
            backgroundColor: '#f5f5f5',
            fontWeight: 'bold'
          },
          // Disable default row click to prevent conflicts with our custom Row component
          rowStyle: { cursor: 'default' }
        }}
        components={{
          Row: (props) => <Row {...props} row={props.data} fromDate={fromDate} toDate={toDate} />
        }}
      />
    </Paper>
  );
};

export default VisitorCountTable;
