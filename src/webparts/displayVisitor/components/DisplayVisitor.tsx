import * as React from 'react';
import { Grid, Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { IDisplayVisitorProps } from './IDisplayVisitorProps';
import { IDisplayVisitorState, initialState } from '../interfaces/IDisplayVisitorState';
import { SharePointService } from '../services/SharePointService';
import { validateVisitorFields, validateVisitorDetails } from '../utils/validation';
import { getUrlParameter, getRequiredFields, checkAccessControl } from '../utils/helpers';
import {
    ActionButtons,
    ApprovalSection,
    AttachmentsSection,
    BasicInformation,
    ConfirmationDialog,
    LoadingBackdrop,
    Notification,
    PrintPreviewDialog,
    VisitorDetailsDialog,
    VisitorDetailsTable,
    VisitorInformation
} from './common';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        fontFamily: '"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif'
    }
}));

export const DisplayVisitor: React.FC<IDisplayVisitorProps> = (props) => {
    const classes = useStyles();
    const [state, setState] = React.useState<IDisplayVisitorState>(initialState);
    const spService = SharePointService.getInstance();

    React.useEffect(() => {
        initializeComponent();
    }, []);

    const initializeComponent = async () => {
        try {
            setState(prev => ({ ...prev, isProgress: true }));
            spService.initialize(props.siteUrl, props.siteRelativeUrl);

            // Get URL parameters and initialize data
            const itemId = parseInt(getUrlParameter('pid'));
            const sourceURL = document.referrer;
            await loadInitialData(itemId, sourceURL);

        } catch (error) {
            console.error('Error initializing component:', error);
            setState(prev => ({
                ...prev,
                dialogMessage: 'An error occurred while loading the form. Please try again later.'
            }));
        } finally {
            setState(prev => ({ ...prev, isProgress: false }));
        }
    };

    const loadInitialData = async (itemId: number, sourceURL: string) => {
        // Get current user and check roles
        const currentUser = await spService.getCurrentUser();
        const userGroups = await spService.getCurrentUserGroups();
        const userRoles = await determineUserRoles(currentUser, userGroups);

        // Get visitor data
        const visitor = await spService.getVisitorById(itemId);
        const visitorFiles = await spService.getVisitorFiles(itemId);
        const visitorDetails = await spService.getVisitorDetails(itemId);
        const visitorDetailsWithFiles = await Promise.all(
            visitorDetails.map(async detail => {
                const files = await spService.getVisitorDetailsFiles(detail.ID);
                return {
                    ...detail,
                    Files: [],
                    initFiles: files.map(f => f.Name),
                    origFiles: files
                };
            })
        );

        // Get reference data
        const [
            purposeList,
            buildingList,
            departmentList,
            gateList,
            idList,
            ssdUsers,
            colorList
        ] = await Promise.all([
            spService.getPurposeList(),
            spService.getBuildingList(),
            spService.getDepartmentList(),
            spService.getGateList(),
            spService.getIDList(),
            spService.getSSDUsers(),
            spService.getColorList()
        ]);

        // Initialize state with loaded data
        setState(prev => ({
            ...prev,
            _itemId: itemId,
            _sourceURL: sourceURL,
            ...userRoles,
            inputFields: {
                ...visitor,
                Files: [],
                initFiles: visitorFiles.map(f => f.Name),
                origFiles: visitorFiles
            },
            visitorDetailsList: visitorDetailsWithFiles,
            _origVisitorDetailsList: visitorDetailsWithFiles,
            purposeList,
            bldgList: buildingList,
            deptList: departmentList,
            GateList: gateList,
            IDList: idList,
            SSDUsers: ssdUsers,
            colorList,
            modifiedDate: visitor.Modified,
            isHidePrint: !(userRoles.isReceptionist && (visitor.StatusId === 4 || visitor.StatusId === 9))
        }));

        // Load approvers if needed
        if (visitor.DeptId) {
            const approvers = visitor.ExternalType === 'Walk-in'
                ? await spService.getWalkinApprovers(visitor.DeptId)
                : await spService.getApprovers(visitor.DeptId);
            setState(prev => ({
                ...prev,
                approverList: approvers.filter(a => a.NameId !== currentUser.Id),
                WalkinApprovers: approvers
            }));
        }

        // Load contacts if needed
        if (visitor.EmpNo) {
            const contacts = await spService.getContacts(visitor.EmpNo);
            setState(prev => ({ ...prev, contactList: contacts }));
        }
    };

    const determineUserRoles = async (currentUser: any, userGroups: any[]) => {
        const roles = {
            isEncoder: false,
            isReceptionist: false,
            isApproverUser: false,
            isSSDUser: false,
            isWalkinApproverUser: false
        };

        // Check user groups
        userGroups.forEach(group => {
            if (group.LoginName === 'Receptionist') roles.isReceptionist = true;
            if (group.LoginName === 'SSD') roles.isSSDUser = true;
        });

        // Check user per department
        const usersPerDept = await spService.getUsersPerDept(currentUser.Id);
        if (usersPerDept.length > 0) {
            roles.isEncoder = true;
        }

        return roles;
    };

    // Event Handlers
    const handleInputChange = (name: string, value: any) => {
        setState(prev => ({
            ...prev,
            inputFields: { ...prev.inputFields, [name]: value }
        }));
        validateInputs(name, value);
    };

    const handleVisitorDetailsChange = (name: string, value: any) => {
        setState(prev => ({
            ...prev,
            visitorDetails: { ...prev.visitorDetails, [name]: value }
        }));
        validateVisitorDetailsInputs(name, value);
    };

    const handleFileChange = (files: File[]) => {
        setState(prev => ({
            ...prev,
            inputFields: { ...prev.inputFields, Files: files }
        }));
        handleDeletedFiles(files);
    };

    const handleVisitorDetailsFileChange = (files: File[]) => {
        setState(prev => ({
            ...prev,
            visitorDetails: { ...prev.visitorDetails, Files: files }
        }));
        handleDeletedVisitorDetailsFiles(files);
    };

    const handleDeletedFiles = (files: File[]) => {
        const { inputFields, deleteFiles } = state;
        inputFields.origFiles.forEach(origFile => {
            const fileExists = files.some(file => file.name === origFile.Name);
            if (!fileExists && !deleteFiles.some(df => df.Name === origFile.Name)) {
                setState(prev => ({
                    ...prev,
                    deleteFiles: [...prev.deleteFiles, origFile]
                }));
            }
        });
    };

    const handleDeletedVisitorDetailsFiles = (files: File[]) => {
        const { visitorDetails, deleteFilesDetails, _itemIdDetails } = state;
        visitorDetails.origFiles.forEach(origFile => {
            const fileExists = files.some(file => file.name === origFile.Name);
            if (!fileExists) {
                const deleteRecord = { Id: _itemIdDetails, Filename: origFile.Name };
                if (!deleteFilesDetails.some(df => 
                    df.Id === deleteRecord.Id && df.Filename === deleteRecord.Filename
                )) {
                    setState(prev => ({
                        ...prev,
                        deleteFilesDetails: [...prev.deleteFilesDetails, deleteRecord]
                    }));
                }
            }
        });
    };

    const handleSave = async () => {
        setState(prev => ({ ...prev, isProgress: true }));
        try {
            await spService.saveVisitor(state);
            setState(prev => ({ 
                ...prev, 
                isSavingDone: true,
                dialogMessage: 'Data has been saved successfully.'
            }));
            setTimeout(() => {
                window.location.href = state._sourceURL || props.siteUrl;
            }, 2000);
        } catch (error) {
            console.error('Error saving visitor:', error);
            setState(prev => ({
                ...prev,
                dialogMessage: 'An error occurred while saving. Please try again.'
            }));
        } finally {
            setState(prev => ({ ...prev, isProgress: false }));
        }
    };

    const validateInputs = (name: string, value: any) => {
        const { inputFields, errorFields } = state;
        const newErrors = validateVisitorFields(
            { ...inputFields, [name]: value },
            getRequiredFields(getUserType(), inputFields.StatusId),
            state.sAction
        );
        setState(prev => ({ ...prev, errorFields: newErrors }));
    };

    const validateVisitorDetailsInputs = (name: string, value: any): boolean => {
        const { visitorDetails, errorDetails, isReceptionist, inputFields } = state;
        const newErrors = validateVisitorDetails(
            { ...visitorDetails, [name]: value },
            isReceptionist,
            inputFields.StatusId
        );
        setState(prev => ({ ...prev, errorDetails: newErrors }));
        
        // Return true if there are no errors
        return Object.values(newErrors).every(error => !error);
    };

    const getUserType = (): string => {
        const { isEncoder, isReceptionist, isApproverUser, isSSDUser, isWalkinApproverUser } = state;
        if (isEncoder) return 'encoder';
        if (isReceptionist) return 'receptionist';
        if (isApproverUser) return 'approver';
        if (isSSDUser) return 'ssd';
        if (isWalkinApproverUser) return 'walkinApprover';
        return '';
    };

    // Render Methods
    return (
        <div className={classes.root}>
            <Container>
                <Grid container spacing={1}>
                    {/* Basic Information Section */}
                    <BasicInformation
                        data={state.inputFields}
                        errors={state.errorFields}
                        isEdit={state.isEdit}
                        purposeList={state.purposeList}
                        deptList={state.deptList}
                        bldgList={state.bldgList}
                        contactList={state.contactList}
                        onInputChange={handleInputChange}
                        onContactSelect={(e, value) => {
                            if (value) {
                                setState(prev => ({
                                    ...prev,
                                    inputFields: {
                                        ...prev.inputFields,
                                        EmpNo: value.EmpNo,
                                        DirectNo: value.DirectNo,
                                        LocalNo: value.LocalNo,
                                        Position: value.Position,
                                        ContactName: value.Name
                                    }
                                }));
                                validateInputs('EmpNo', value.EmpNo);
                            } else {
                                setState(prev => ({
                                    ...prev,
                                    inputFields: {
                                        ...prev.inputFields,
                                        EmpNo: '',
                                        DirectNo: '',
                                        LocalNo: '',
                                        Position: '',
                                        ContactName: ''
                                    },
                                    contactList: []
                                }));
                                validateInputs('EmpNo', '');
                            }
                        }}
                        onContactSearch={async (value) => {
                            if (value.length > 2) {
                                const contacts = await spService.getContacts(value);
                                setState(prev => ({ ...prev, contactList: contacts }));
                            } else {
                                setState(prev => ({ ...prev, contactList: [] }));
                            }
                        }}
                    />

                    {/* Visitor Information Section */}
                    <VisitorInformation
                        data={state.inputFields}
                        errors={state.errorFields}
                        isEdit={state.isEdit}
                        onInputChange={handleInputChange}
                    />

                    {/* Attachments Section */}
                    <AttachmentsSection
                        files={state.inputFields.Files}
                        initFiles={state.inputFields.initFiles}
                        isEdit={state.isEdit}
                        onFileChange={handleFileChange}
                        onFileClick={(filename) => {
                            const url = `${props.siteUrl}/VisitorsLib/${state._itemId}/${filename}`;
                            window.open(url, '_blank');
                        }}
                    />

                    {/* Visitor Details Table */}
                    <VisitorDetailsTable
                        data={state.visitorDetailsList}
                        isEdit={state.isEdit}
                        isReceptionist={state.isReceptionist}
                        hidePrint={state.isHidePrint}
                        onView={(rowData) => {
                            setState(prev => ({
                                ...prev,
                                _idx: prev.visitorDetailsList.indexOf(rowData),
                                _itemIdDetails: rowData.ID,
                                visitorDetails: rowData,
                                visitorDetailsMode: 'edit',
                                openDialogFab: true
                            }));
                        }}
                        onDelete={(rowData) => {
                            const idx = state.visitorDetailsList.indexOf(rowData);
                            setState(prev => ({
                                ...prev,
                                visitorDetailsList: prev.visitorDetailsList.filter((_, i) => i !== idx),
                                errorFields: {
                                    ...prev.errorFields,
                                    Details: prev.visitorDetailsList.length === 1 ? "Visitor Details are required. Please add visitor names." : ""
                                }
                            }));
                        }}
                        onPrint={(rowData) => {
                            setState(prev => ({
                                ...prev,
                                _idx: prev.visitorDetailsList.indexOf(rowData),
                                _itemIdDetails: rowData.ID,
                                visitorDetails: rowData,
                                openDialogIDFab: true
                            }));
                        }}
                        onAdd={() => {
                            setState(prev => ({
                                ...prev,
                                visitorDetailsMode: 'add',
                                visitorDetails: {
                                    ...prev.visitorDetails,
                                    ID: null,
                                    Title: '',
                                    Car: prev.inputFields.RequireParking,
                                    AccessCard: '',
                                    Color: '',
                                    DriverName: '',
                                    GateNo: '',
                                    IDPresented: '',
                                    ParentId: null,
                                    PlateNo: '',
                                    TypeofVehicle: '',
                                    Files: [],
                                    initFiles: [],
                                    origFiles: []
                                },
                                openDialogFab: true
                            }));
                        }}
                    />

                    {/* Approval Section */}
                    <ApprovalSection
                        data={state.inputFields}
                        errors={state.errorFields}
                        isEdit={state.isEdit}
                        approverList={state.approverList}
                        walkinApproverList={state.WalkinApprovers}
                        onInputChange={handleInputChange}
                    />

                    {/* Action Buttons */}
                    <ActionButtons
                        isEdit={state.isEdit}
                        isEncoder={state.isEncoder}
                        isReceptionist={state.isReceptionist}
                        isApprover={state.isApproverUser}
                        isWalkinApprover={state.isWalkinApproverUser}
                        isSSDUser={state.isSSDUser}
                        statusId={state.inputFields.StatusId}
                        onCancel={() => {
                            setState(prev => ({
                                ...prev,
                                dialogMessage: "Do you want to discard changes and exit?",
                                openDialog: true
                            }));
                        }}
                        onSave={handleSave}
                        onSubmit={() => {
                            setState(prev => ({
                                ...prev,
                                sAction: 'submit',
                                dialogMessage: "Do you want to submit this form?",
                                openDialog: true
                            }));
                        }}
                        onApprove={() => {
                            setState(prev => ({
                                ...prev,
                                sAction: 'approve',
                                dialogMessage: "Do you want to approve this request?",
                                openDialog: true
                            }));
                        }}
                        onDeny={() => {
                            setState(prev => ({
                                ...prev,
                                sAction: 'deny',
                                dialogMessage: "Do you want to deny this request?",
                                openDialog: true
                            }));
                        }}
                        onMarkComplete={() => {
                            setState(prev => ({
                                ...prev,
                                sAction: 'markcomplete',
                                dialogMessage: "Do you want to complete this request?",
                                openDialog: true
                            }));
                        }}
                        onClose={() => {
                            window.open(props.siteUrl + '/SitePages/ViewVisitorappge.aspx', "_self");
                        }}
                    />
                </Grid>
            </Container>

            {/* Dialogs */}
            <ConfirmationDialog
                open={state.openDialog}
                title="Confirmation"
                message={state.dialogMessage}
                onClose={(confirmed) => {
                    if (confirmed) {
                        if (state.dialogMessage.includes('discard')) {
                            window.location.href = state._sourceURL || props.siteUrl;
                        } else {
                            handleSave();
                        }
                    }
                    setState(prev => ({ ...prev, openDialog: false }));
                }}
            />

            <VisitorDetailsDialog
                open={state.openDialogFab}
                data={state.visitorDetails}
                errors={state.errorDetails}
                isEdit={state.isEdit}
                IDList={state.IDList}
                GateList={state.GateList}
                onClose={() => setState(prev => ({ ...prev, openDialogFab: false }))}
                onSave={() => {
                    if (validateVisitorDetailsInputs('', '')) {
                        if (state.visitorDetailsMode === 'add') {
                            setState(prev => ({
                                ...prev,
                                visitorDetailsList: [...prev.visitorDetailsList, prev.visitorDetails],
                                openDialogFab: false,
                                errorFields: {
                                    ...prev.errorFields,
                                    Details: ''
                                }
                            }));
                        } else {
                            setState(prev => ({
                                ...prev,
                                visitorDetailsList: prev.visitorDetailsList.map((item, idx) => 
                                    idx === prev._idx ? prev.visitorDetails : item
                                ),
                                openDialogFab: false
                            }));
                        }
                    }
                }}
                onInputChange={handleVisitorDetailsChange}
                onFileChange={handleVisitorDetailsFileChange}
            />

            <PrintPreviewDialog
                open={state.openDialogIDFab}
                siteUrl={props.siteUrl}
                visitorData={state.inputFields}
                visitorDetails={state.visitorDetails}
                colorList={state.colorList}
                colorValue={state.colorValue}
                onClose={() => setState(prev => ({ ...prev, openDialogIDFab: false }))}
                onColorChange={(value) => {
                    const selectedColor = state.colorList.find(c => c.Title === value);
                    setState(prev => ({
                        ...prev,
                        colorValue: (selectedColor && selectedColor.ColorCode) || 'Green',
                        inputFields: {
                            ...prev.inputFields,
                            colorAccess: value
                        }
                    }));
                }}
            />

            {/* Loading and Notifications */}
            <LoadingBackdrop open={state.isProgress} />

            <Notification
                open={state.isSavingDone}
                message="Data has been saved successfully."
                type="success"
                onClose={() => setState(prev => ({ ...prev, isSavingDone: false }))}
            />
        </div>
    );
};
