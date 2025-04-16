import * as React from 'react';
import MaterialTable from "material-table";
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Fab, Tooltip, Box } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import PrintIcon from '@material-ui/icons/Print';
import AddIcon from '@material-ui/icons/Add';
import { IVisitorDetails } from '../../interfaces/IVisitorDetails';

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(1),
        borderColor: "transparent",
    },
    floatingbutton: {
        padding: theme.spacing(1),
        borderColor: "transparent",
    }
}));

interface IVisitorDetailsTableProps {
    data: IVisitorDetails[];
    isEdit: boolean;
    isReceptionist: boolean;
    hidePrint: boolean;
    onView: (rowData: IVisitorDetails) => void;
    onDelete: (rowData: IVisitorDetails) => void;
    onPrint: (rowData: IVisitorDetails) => void;
    onAdd: () => void;
}

export const VisitorDetailsTable: React.FC<IVisitorDetailsTableProps> = ({
    data,
    isEdit,
    isReceptionist,
    hidePrint,
    onView,
    onDelete,
    onPrint,
    onAdd
}) => {
    const classes = useStyles();

    return (
        <>
            <Paper variant="outlined" className={classes.paper}>
                {isEdit && (
                    <Box component="div" style={{ display: 'inline' }} className={classes.floatingbutton}>
                        <Tooltip title="Visitor Details">
                            <Fab id='addFab' size="medium" color="primary" onClick={onAdd}>
                                <AddIcon />
                            </Fab>
                        </Tooltip>
                    </Box>
                )}
            </Paper>

            <Paper variant="outlined" className={classes.paper}>
                <MaterialTable
                    title="Visitors"
                    columns={[
                        { title: 'Name', field: 'Title' },
                        { title: 'Access Card', field: 'AccessCard' },
                        {
                            title: 'Car',
                            field: "Car",
                            render: rowData => <span>{rowData.Car ? 'With' : 'Without'}</span>
                        },
                        { title: 'Plate No.', field: 'PlateNo' },
                        { title: 'Type of Vehicle', field: "TypeofVehicle" },
                        { title: "Driver's Name", field: "DriverName" },
                        { title: 'Gate', field: "GateNo" },
                        { title: 'ID Presented', field: "IDPresented" },
                    ]}
                    data={data}
                    options={{
                        filtering: false,
                        paging: false,
                        search: false,
                        grouping: false,
                        selection: false
                    }}
                    actions={[
                        {
                            icon: () => <VisibilityIcon />,
                            tooltip: 'View',
                            onClick: (event, rowData) => onView(rowData as IVisitorDetails)
                        },
                        {
                            icon: 'delete',
                            tooltip: 'Delete',
                            onClick: (event, rowData) => onDelete(rowData as IVisitorDetails),
                            hidden: !isEdit
                        },
                        {
                            icon: () => <PrintIcon />,
                            tooltip: 'Print Preview',
                            onClick: (event, rowData) => onPrint(rowData as IVisitorDetails),
                            hidden: hidePrint || !isReceptionist
                        }
                    ]}
                />
            </Paper>
        </>
    );
};
