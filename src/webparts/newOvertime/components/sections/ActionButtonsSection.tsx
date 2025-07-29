import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import SendIcon from '@material-ui/icons/Send';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

/**
 * Action buttons section props
 */
export interface IActionButtonsSectionProps {
  /**
   * On cancel click callback
   */
  onCancelClick: () => void;
  
  /**
   * On save click callback
   */
  onSaveClick: () => void;
  
  /**
   * On submit click callback
   */
  onSubmitClick: () => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paperbutton: {
      textTransform: 'none',
      margin: '5px',
    },
  }),
);

/**
 * Action buttons section component
 * @param props Component props
 * @returns Action buttons section component
 */
export const ActionButtonsSection: React.FC<IActionButtonsSectionProps> = (props) => {
  const { onCancelClick, onSaveClick, onSubmitClick } = props;
  const classes = useStyles();

  return (
    <Grid container justify="flex-end">
      <ButtonGroup>
        <Button
          className={classes.paperbutton}
          startIcon={<CancelIcon />}
          variant="contained"
          color="secondary"
          onClick={onCancelClick}
        >
          Close
        </Button>
        <Button
          name="savedraft"
          className={classes.paperbutton}
          startIcon={<SaveIcon />}
          variant="contained"
          color="default"
          onClick={onSaveClick}
        >
          Save
        </Button>
        <Button
          name="submit"
          className={classes.paperbutton}
          endIcon={<SendIcon />}
          variant="contained"
          color="primary"
          onClick={onSubmitClick}
        >
          Submit
        </Button>
      </ButtonGroup>
    </Grid>
  );
};
