import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import { IVisitor } from '../../models/IVisitor';
import { formatDate } from '../../helpers/dateHelpers';

// Define styles
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(1),
      borderColor: "transparent",
    },
    title: {
      fontSize: "1.5rem",
    },
    label: {
      display: 'block',
      margin: '4px',
      fontSize: '12px',
      color: '#0000008A',
    },
    value: {
      display: 'block',
      fontWeight: 500,
      margin: '4px',
      fontSize: '18px',
    },
  }),
);

/**
 * Header section props
 */
export interface IHeaderSectionProps {
  visitor: IVisitor;
  isEdit: boolean;
  isEncoder: boolean;
  isReceptionist: boolean;
  isApproverUser: boolean;
  isWalkinApproverUser: boolean;
  isSSDUser: boolean;
}

/**
 * Header section component
 * @param props Component props
 * @returns JSX element
 */
const HeaderSection: React.FC<IHeaderSectionProps> = (props) => {
  const {
    visitor,
    isEdit,
    isEncoder,
    isReceptionist,
    isApproverUser,
    isWalkinApproverUser,
    isSSDUser
  } = props;

  const classes = useStyles();

  return (
    <>
      <Paper variant="outlined" className={classes.paper}>
        <Box className={classes.title}>
          {visitor.ID ? 'Visitor Request Details' : 'New Visitor'}
        </Box>
      </Paper>

      {visitor.ID && (
        <>
          <Paper variant="outlined" className={classes.paper}>
            <Box component="span" className={classes.label}>Reference No.</Box>
            <Box component="span" className={classes.value}>{visitor.Title || 'N/A'}</Box>
          </Paper>

          <Paper variant="outlined" className={classes.paper}>
            <Box component="span" className={classes.label}>Status</Box>
            <Box component="span" className={classes.value}>{visitor.Status || 'N/A'}</Box>
          </Paper>

          <Paper variant="outlined" className={classes.paper}>
            <Box component="span" className={classes.label}>Request Date</Box>
            <Box component="span" className={classes.value}>
              {visitor.RequestDate ? formatDate(visitor.RequestDate, 'MM/DD/YYYY') : 'N/A'}
            </Box>
          </Paper>

          <Paper variant="outlined" className={classes.paper}>
            <Box component="span" className={classes.label}>Requester</Box>
            <Box component="span" className={classes.value}>{visitor.Author ? visitor.Author.Title : 'N/A'}</Box>
          </Paper>
        </>
      )}

      <Paper variant="outlined" className={classes.paper}>
        <Box component="span" className={classes.label}>External Type</Box>
        <Box component="span" className={classes.value}>{visitor.ExternalType || 'N/A'}</Box>
      </Paper>
    </>
  );
};

export default HeaderSection;
