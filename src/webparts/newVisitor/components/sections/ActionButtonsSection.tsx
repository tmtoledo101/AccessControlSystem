import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import SaveIcon from '@material-ui/icons/Save';
import SendIcon from '@material-ui/icons/Send';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import { checkVisibility } from '../../helpers/uiHelpers';
import { IVisitor } from '../../models/IVisitor';

// Define styles
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paperbutton: {
      textTransform: "none",
      margin: "5px",
    },
  }),
);

/**
 * Action buttons section props
 */
export interface IActionButtonsSectionProps {
  visitor: IVisitor;
  isEdit: boolean;
  isEncoder: boolean;
  isReceptionist: boolean;
  isApproverUser: boolean;
  isWalkinApproverUser: boolean;
  isSSDUser: boolean;
  onClickSubmit: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, action: string) => void;
  onClickCancel: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

/**
 * Action buttons section component
 * @param props Component props
 * @returns JSX element
 */
const ActionButtonsSection: React.FC<IActionButtonsSectionProps> = (props) => {
  const {
    visitor,
    isEdit,
    isEncoder,
    isReceptionist,
    isApproverUser,
    isWalkinApproverUser,
    isSSDUser,
    onClickSubmit,
    onClickCancel
  } = props;

  const classes = useStyles();

  return (
    <ButtonGroup>
      {checkVisibility('closeButton', visitor, isEdit, isEncoder, isReceptionist, isApproverUser, isWalkinApproverUser, isSSDUser) && (
        <Button
          className={classes.paperbutton}
          startIcon={<CloseIcon />}
          variant="contained"
          color="secondary"
          onClick={onClickCancel}
        >
          Close
        </Button>
      )}

      {checkVisibility('saveButton', visitor, isEdit, isEncoder, isReceptionist, isApproverUser, isWalkinApproverUser, isSSDUser) && (
        <Button
          name="savedraft"
          className={classes.paperbutton}
          startIcon={<SaveIcon />}
          variant="contained"
          color="default"
          onClick={(e) => onClickSubmit(e, 'save')}
        >
          Save
        </Button>
      )}

      {checkVisibility('submitButton', visitor, isEdit, isEncoder, isReceptionist, isApproverUser, isWalkinApproverUser, isSSDUser) && (
        <Button
          name="submit"
          className={classes.paperbutton}
          endIcon={<SendIcon />}
          variant="contained"
          color="primary"
          onClick={(e) => onClickSubmit(e, 'submit')}
        >
          Submit
        </Button>
      )}

      {checkVisibility('approveButton', visitor, isEdit, isEncoder, isReceptionist, isApproverUser, isWalkinApproverUser, isSSDUser) && (
        <Button
          name="approve"
          className={classes.paperbutton}
          startIcon={<CheckIcon />}
          variant="contained"
          color="primary"
          onClick={(e) => onClickSubmit(e, 'approve')}
        >
          Approve
        </Button>
      )}

      {checkVisibility('denyButton', visitor, isEdit, isEncoder, isReceptionist, isApproverUser, isWalkinApproverUser, isSSDUser) && (
        <Button
          name="deny"
          className={classes.paperbutton}
          startIcon={<CloseIcon />}
          variant="contained"
          color="secondary"
          onClick={(e) => onClickSubmit(e, 'deny')}
        >
          Deny
        </Button>
      )}

      {checkVisibility('markCompleteButton', visitor, isEdit, isEncoder, isReceptionist, isApproverUser, isWalkinApproverUser, isSSDUser) && (
        <Button
          name="markcomplete"
          className={classes.paperbutton}
          startIcon={<DoneAllIcon />}
          variant="contained"
          color="primary"
          onClick={(e) => onClickSubmit(e, 'markcomplete')}
        >
          Mark Complete
        </Button>
      )}
    </ButtonGroup>
  );
};

export default ActionButtonsSection;
