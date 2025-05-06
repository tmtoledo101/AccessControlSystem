import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paperbutton: {
      textTransform: "none",
      margin: "5px",
    }
  }),
);

interface IActionButtonsProps {
  onClose: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ActionButtons: React.FC<IActionButtonsProps> = (props) => {
  const { onClose } = props;
  const classes = useStyles();

  return (
    <Grid container justify="flex-end">
      <ButtonGroup>
        <Button 
          className={classes.paperbutton} 
          variant="contained" 
          color="default" 
          onClick={onClose}
        >
          Close
        </Button>
      </ButtonGroup>
    </Grid>
  );
};

export default ActionButtons;
