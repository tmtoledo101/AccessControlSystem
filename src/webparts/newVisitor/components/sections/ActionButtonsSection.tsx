import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import SendIcon from '@material-ui/icons/Send';

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
  onSave: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

/**
 * Action buttons section component
 * @param props Component props
 * @returns Action buttons section component
 */
const ActionButtonsSection: React.FC<IActionButtonsSectionProps> = (props) => {
  const { onSave, onSubmit, onCancel } = props;
  const classes = useStyles();

  return (
    <ButtonGroup>
      <Button 
        className={classes.paperbutton} 
        startIcon={<CancelIcon />} 
        variant="contained" 
        color="secondary" 
        onClick={onCancel}
      >
        Close
      </Button>
      <Button 
        name="savedraft" 
        className={classes.paperbutton} 
        startIcon={<SaveIcon />} 
        variant="contained" 
        color="default" 
        onClick={onSave}
      >
        Save
      </Button>
      <Button 
        name="submit" 
        className={classes.paperbutton} 
        endIcon={<SendIcon />} 
        variant="contained" 
        color="primary" 
        onClick={onSubmit}
      >
        Submit
      </Button>
    </ButtonGroup>
  );
};

export default ActionButtonsSection;
