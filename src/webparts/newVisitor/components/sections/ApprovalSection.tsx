import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { IVisitor } from '../../models/IVisitor';
import { IFormError } from '../../models/IVisitor';
import { checkVisibility } from '../../helpers/uiHelpers';

// Define styles
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
  visitor: IVisitor;
  errorFields: IFormError;
  isEdit: boolean;
  isEncoder: boolean;
  isReceptionist: boolean;
  isApproverUser: boolean;
  isWalkinApproverUser: boolean;
  isSSDUser: boolean;
  onChangeTxt: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Approval section component
 * @param props Component props
 * @returns JSX element
 */
const ApprovalSection: React.FC<IApprovalSectionProps> = (props) => {
  const {
    visitor,
    errorFields,
    isEdit,
    isEncoder,
    isReceptionist,
    isApproverUser,
    isWalkinApproverUser,
    isSSDUser,
    onChangeTxt
  } = props;

  const classes = useStyles();

  // Only show approval section if needed
  if (!checkVisibility('approverSection', visitor, isEdit, isEncoder, isReceptionist, isApproverUser, isWalkinApproverUser, isSSDUser)) {
    return null;
  }

  return (
    <>
      {checkVisibility('remarks1', visitor, isEdit, isEncoder, isReceptionist, isApproverUser, isWalkinApproverUser, isSSDUser) && (
        <Paper variant="outlined" className={classes.paper}>
          <TextField
            multiline
            rows={4}
            error={Boolean(errorFields.Remarks1 && errorFields.Remarks1.length > 0)}
            label="Remarks"
            name="Remarks1"
            onChange={onChangeTxt}
            value={visitor.Remarks1 || ''}
            variant="outlined"
            className={classes.textField}
            helperText={errorFields.Remarks1}
            disabled={!isEdit}
            fullWidth
          />
        </Paper>
      )}

      {checkVisibility('remarks2', visitor, isEdit, isEncoder, isReceptionist, isApproverUser, isWalkinApproverUser, isSSDUser) && (
        <Paper variant="outlined" className={classes.paper}>
          <TextField
            multiline
            rows={4}
            error={Boolean(errorFields.Remarks2 && errorFields.Remarks2.length > 0)}
            label="Remarks"
            name="Remarks2"
            onChange={onChangeTxt}
            value={visitor.Remarks2 || ''}
            variant="outlined"
            className={classes.textField}
            helperText={errorFields.Remarks2}
            disabled={!isEdit}
            fullWidth
          />
        </Paper>
      )}
    </>
  );
};

export default ApprovalSection;
