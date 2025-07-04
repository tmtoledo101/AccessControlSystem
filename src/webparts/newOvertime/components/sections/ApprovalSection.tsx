import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { IOvertimeForm, IOvertimeFormErrors } from '../../models/IOvertimeForm';

/**
 * Approval section props
 */
export interface IApprovalSectionProps {
  /**
   * Form
   */
  form: IOvertimeForm;
  
  /**
   * Form errors
   */
  errors: IOvertimeFormErrors;
  
  /**
   * Approvers
   */
  approvers: any[];
  
  /**
   * On select change callback
   */
  onSelectChange: (e: React.ChangeEvent<{ name?: string; value: unknown }>) => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(1),
      borderColor: 'transparent',
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 300,
    },
  }),
);

/**
 * Approval section component
 * @param props Component props
 * @returns Approval section component
 */
export const ApprovalSection: React.FC<IApprovalSectionProps> = (props) => {
  const { form, errors, approvers, onSelectChange } = props;
  const classes = useStyles();

  return (
    <Grid item xs={12} sm={12}>
      <Paper variant="outlined" className={classes.paper}>
        <FormControl className={classes.textField} error={!!errors.ApproverId}>
          <InputLabel id="approversLabel">Forward for Approval *</InputLabel>
          <Select
            labelId="approversLabel"
            id="ApproverId"
            value={form.ApproverId || ''}
            onChange={onSelectChange}
            name="ApproverId"
          >
            {approvers.map((item) => (
              <MenuItem key={item.NameId} value={item.NameId}>
                {item.Name.Title}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.ApproverId}</FormHelperText>
        </FormControl>
      </Paper>
    </Grid>
  );
};
