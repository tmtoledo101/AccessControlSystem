import * as React from 'react';
import { useRef, useState } from 'react';
import MaterialTable, { Column } from 'material-table';
import {
  Box,
  Chip,
  LinearProgress,
  makeStyles,
  Paper,
  Theme,
  Typography,
  createStyles,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';

import SharePointService from '../services/SharePointService';
import { IVisitorCount, IVisitorDetailExtended } from '../interfaces/IViewVisitors';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    rootPaper: {
      overflow: 'hidden',
      borderRadius: 12,
    },
    zebra: {
      '& tbody tr:nth-of-type(even)': {
        backgroundColor: '#fafafa',
      },
    },
    countChip: {
      fontWeight: 700,
      minWidth: 36,
    },
    detailWrap: {
      padding: theme.spacing(2),
      background: '#fcfcfe',
    },
    detailHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing(1),
    },
    detailCard: {
      border: `1px solid ${grey[200]}`,
      borderRadius: 10,
      background: '#fff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      padding: theme.spacing(2),
    },
    smallTable: {
      '& th, & td': {
        paddingTop: theme.spacing(0.75),
        paddingBottom: theme.spacing(0.75),
        fontSize: 13,
        whiteSpace: 'nowrap',
      },
      '& thead th': {
        background: '#f3f4f6',
        fontWeight: 700,
      },
    },
    statusChip: {
      height: 22,
      fontSize: 12,
      fontWeight: 600,
    },
  })
);

// Status color (kept, though the filter will only show "Approved by Dept Head")
const statusColor = (s?: string): 'default' | 'primary' | 'secondary' => {
  const val = (s || '').toLowerCase();
  if (val.indexOf('approved') >= 0) return 'primary';
  if (val.indexOf('rejected') >= 0 || val.indexOf('cancel') >= 0) return 'secondary';
  return 'default';
};

// material-table expects forwardRef component for icons
const DetailPanelIcon = React.forwardRef<SVGSVGElement, any>((props, ref) => {
  return props && props.open
    ? <KeyboardArrowUp ref={ref} {...props} />
    : <KeyboardArrowDown ref={ref} {...props} />;
});

interface VisitorCountTableProps {
  data: IVisitorCount[];
  fromDate: Date;
  toDate: Date;
  title?: string;
}

const VisitorCountTable: React.FC<VisitorCountTableProps> = ({
  data,
  fromDate,
  toDate,
  title = 'Visitor Entry Count',
}) => {
  const classes = useStyles();

  // cache details per "Last|First"
  const cacheRef = useRef<{ [k: string]: IVisitorDetailExtended[] }>({});
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const columns: Column<IVisitorCount>[] = [
    {
      title: "Visitor's Last Name",
      field: 'LastName',
      defaultSort: 'asc',
    },
    {
      title: "Visitor's First Name",
      field: 'FirstName',
    },
    {
      title: 'Visit Count',
      field: 'VisitCount',
      type: 'numeric',
      render: (rowData: IVisitorCount) => (
        <Chip
          className={classes.countChip}
          size="small"
          label={rowData.VisitCount}
        />
      ),
      customSort: (a: IVisitorCount, b: IVisitorCount) => {
        const av = a && a.VisitCount ? a.VisitCount : 0;
        const bv = b && b.VisitCount ? b.VisitCount : 0;
        return av - bv;
      },
      filtering: false,
    },
  ];

  return (
    <Paper className={classes.rootPaper}>
      <MaterialTable<IVisitorCount>
        title={title}
        columns={columns}
        data={data}
        options={{
          filtering: true,
          grouping: true,
          pageSize: 10,
          pageSizeOptions: [5, 10, 20, Math.max(25, data.length)],
          search: false,
          padding: 'dense',
          headerStyle: { backgroundColor: '#f7f7f9', fontWeight: 700 },
          rowStyle: () => ({ fontSize: 14 }),
          sorting: true,
          selection: false,
          detailPanelColumnAlignment: 'right',
        }}
        components={{
          Container: (props: any) => <div {...props} className={classes.zebra} />,
        }}
        detailPanel={(rowData: IVisitorCount) => {
          const cacheKey = (rowData.LastName || '') + '|' + (rowData.FirstName || '');
          const rows = cacheRef.current[cacheKey] || [];
          const isLoading = loadingKey === cacheKey;

          //Approved by Dept Head checker
          const approvedRows = rows.filter((d) => {
            const statusTitle = d && d.Status ? d.Status.Title : '';
            return statusTitle && statusTitle.toLowerCase() === 'approved by dept head';
          });

          return (
            <Box className={classes.detailWrap}>
              <Box className={classes.detailHeader}>
                <Typography variant="subtitle1">
                  Visitor Details — {rowData.LastName}, {rowData.FirstName}
                </Typography>
                <Chip size="small" variant="outlined" label={(approvedRows.length + ' record(s)')} />
              </Box>

              {isLoading && <LinearProgress />}

              {!isLoading && approvedRows.length === 0 && (
                <Box className={classes.detailCard}>
                  <Typography align="center" color="textSecondary">
                    No details found for this visitor.
                  </Typography>
                </Box>
              )}

              {!isLoading && approvedRows.length > 0 && (
                <Box className={classes.detailCard}>
                  <Table size="small" className={classes.smallTable}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Last Name</TableCell>
                        <TableCell>First Name</TableCell>
                        <TableCell>Date From</TableCell>
                        <TableCell>Date To</TableCell>
                        <TableCell>Company</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Contact No.</TableCell>
                        <TableCell>Created By</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Arrival</TableCell>
                        <TableCell>Visit</TableCell>
                        <TableCell>Building</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {approvedRows.map((d) => {
                        const statusTitle = d && d.Status ? d.Status.Title : '';
                        const deptTitle = d && d.Dept ? d.Dept.Title : '';
                        return (
                          <TableRow key={d.ID}>
                            <TableCell>{d.Title}</TableCell>
                            <TableCell>{d.FirstName}</TableCell>
                            <TableCell>{d.DateFrom ? new Date(d.DateFrom).toLocaleString() : ''}</TableCell>
                            <TableCell>{d.DateTo ? new Date(d.DateTo).toLocaleString() : ''}</TableCell>
                            <TableCell>{d.CompanyName}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                className={classes.statusChip}
                                color={statusColor(statusTitle)}
                                label={statusTitle || ''}
                              />
                            </TableCell>
                            <TableCell>{d.VisContactNo}</TableCell>
                            <TableCell>{d.CreatedBy}</TableCell>
                            <TableCell>{deptTitle}</TableCell>
                            <TableCell>{d.DateTimeArrival ? new Date(d.DateTimeArrival).toLocaleString() : ''}</TableCell>
                            <TableCell>{d.DateTimeVisit ? new Date(d.DateTimeVisit).toLocaleString() : ''}</TableCell>
                            <TableCell>{d.Bldg}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Box>
          );
        }}
        onRowClick={async (_evt, rowData, togglePanel) => {
          if (togglePanel) togglePanel();
          const r = rowData as IVisitorCount;
          const cacheKey = (r.LastName || '') + '|' + (r.FirstName || '');
          if (!cacheRef.current[cacheKey]) {
            try {
              setLoadingKey(cacheKey);
              const details = await SharePointService.getVisitorDetailedInfo(
                r.FirstName,
                r.LastName,
                fromDate,
                toDate
              );
              cacheRef.current[cacheKey] = details || [];
            } catch (e) {
              // tslint:disable-next-line:no-console
              console.error('Error fetching visitor details:', e);
              cacheRef.current[cacheKey] = [];
            } finally {
              setLoadingKey(null);
            }
          }
        }}
        icons={{
          DetailPanel: DetailPanelIcon,
        }}
      />
    </Paper>
  );
};

export default VisitorCountTable;