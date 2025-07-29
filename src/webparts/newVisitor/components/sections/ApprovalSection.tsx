import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(1),
      borderColor: "transparent",
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 300,
    },
  }),
);

/**
 * Approval section props
 */
export interface IApprovalSectionProps {
  isEncoder: boolean;
  isReceptionist: boolean;
  approverList: any[];
  walkinApproverList: any[];
  approverId: number;
  error: string;
  onChange: (name: string, value: any) => void;
}

/**
 * Approval section component
 * @param props Component props
 * @returns Approval section component
 */
const ApprovalSection: React.FC<IApprovalSectionProps> = (props) => {
  const { 
    isEncoder, 
    isReceptionist, 
    approverList, 
    walkinApproverList, 
    approverId, 
    error, 
    onChange 
  } = props;
  const classes = useStyles();

  /**
   * Handles select change
   * @param e Event
   */
  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: any }>) => {
    const { name, value } = e.target;
    onChange(name, value);
};


  if (!isEncoder && !isReceptionist) {
    return null;
  }

  return (
    <Paper variant="outlined" className={classes.paper}>
      {isEncoder && (
        <FormControl className={classes.textField} error={Boolean(error)}>
          <InputLabel id="approversLabel">Forward for Approval *</InputLabel>
          <Select
            labelId="approversLabel"
            id="ApproverId"
            value={approverId || ''}
            onChange={handleSelectChange}
            name="ApproverId"
          >
            {approverList.map((item) => (
              <MenuItem key={item.NameId} value={item.NameId}>
                {item.Name.Title}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{error}</FormHelperText>
        </FormControl>
      )}

      {isReceptionist && (
        <FormControl className={classes.textField} error={Boolean(error)}>
          <InputLabel id="approversLabel">Forward for Confirmation *</InputLabel>
          <Select
            labelId="approversLabel"
            id="ApproverId"
            value={approverId || ''}
            onChange={handleSelectChange}
            name="ApproverId"
          >
            {walkinApproverList.map((item) => (
              <MenuItem key={item.NameId} value={item.NameId}>
                {item.Name.Title}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{error}</FormHelperText>
        </FormControl>
      )}
    </Paper>
  );
};

export default ApprovalSection;
