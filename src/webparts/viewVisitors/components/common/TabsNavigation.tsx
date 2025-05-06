import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { ITabItem } from '../interfaces/IViewVisitors';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(1),
      borderColor: "transparent",
    },
    tabbar: {
      textTransform: "none",
    }
  }),
);

interface ITabsNavigationProps {
  tabs: string[];
  value: number;
  onChange: (event: React.ChangeEvent<{}>, newValue: number) => void;
}

const TabsNavigation: React.FC<ITabsNavigationProps> = (props) => {
  const { tabs, value, onChange } = props;
  const classes = useStyles();

  return (
    <Paper square className={classes.paper}>
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          indicatorColor="primary"
          textColor="primary"
          onChange={onChange}
          aria-label="tabs example"
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((item, index) => (
            <Tab key={index} label={item} className={classes.tabbar} />
          ))}
        </Tabs>
      </AppBar>
    </Paper>
  );
};

export default TabsNavigation;
