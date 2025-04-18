import * as React from 'react';
import { Grid, Container, Typography } from '@material-ui/core';
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

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Container>
                    <Typography variant="h6" color="error">
                        Something went wrong. Please try refreshing the page.
                    </Typography>
                </Container>
            );
        }

        return this.props.children;
    }
}

export const DisplayVisitor: React.FC<IDisplayVisitorProps> = (props) => {
    const classes = useStyles();
    // Memoize spService to prevent unnecessary re-initialization
    const spService = React.useMemo(() => SharePointService.getInstance(), []);
    
    const [state, setState] = React.useState<IDisplayVisitorState>(() => ({
        ...initialState,
        isEdit: true // Enable edit mode by default
    }));

    const determineUserRoles = async (currentUser: any, userGroups: any[]): Promise<{
        isEncoder: boolean;
        isReceptionist: boolean;
        isApproverUser: boolean;
        isSSDUser: boolean;
        isWalkinApproverUser: boolean;
    }> => {
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
    

    const loadInitialData = async (itemId: number, sourceURL: string): Promise<void> => {
        try {
            // Get current user and check roles
            const currentUser = await spService.getCurrentUser();
            const userGroups = await spService.getCurrentUserGroups();
            const userRoles = await determineUserRoles(currentUser, userGroups);

            // Get visitor data
            const visitor = await spService.getVisitorById(itemId);
            if (!visitor) {
                throw new Error('Visitor not found');
            }

            console.log('Fetched visitor:', visitor);
            console.log('ExternalType:', visitor.ExternalType);
            console.log('Purpose:', visitor.Purpose);
            console.log('Bldg:', visitor.Bldg);

            // Use Title field directly as the reference number
            const refNo = visitor.Title;
            console.log('Using Title as refNo:', refNo);

            // Get all data in parallel
            console.log('Fetching reference data...');
            const [
                visitorFiles,
                visitorDetails,
                purposeList,
                buildingList,
                departmentList,
                gateList,
                idList,
                ssdUsers,
                colorList
            ] = await Promise.all([
                spService.getVisitorFiles(itemId),
                spService.getVisitorDetails(itemId),
                spService.getPurposeList(),
                spService.getBuildingList(),
                spService.getDepartmentList(),
                spService.getGateList(),
                spService.getIDList(),
                spService.getSSDUsers(),
                spService.getColorList()
            ]);

            // Get visitor details files
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

            console.log('Purpose List:', purposeList.map(p => ({ id: p.Id, title: p.Title })));
            console.log('Building List:', buildingList.map(b => ({ id: b.Id, title: b.Title })));
            console.log('Current visitor values:', {
                externalType: visitor.ExternalType,
                purpose: visitor.Purpose,
                building: visitor.Bldg
            });

            // Initialize state with loaded data
            setState(prev => {
                console.log('Setting state with refNo:', refNo);
                // Find department from list and ensure both ID and Title are set
                const dept = departmentList.find(d => d.ID === visitor.DeptId);
                const inputFields = {
                    ...visitor,
                    DeptId: (dept && dept.ID) ? dept.ID : visitor.DeptId,
                    Dept: dept ? { Title: dept.Title } : visitor.Dept,
                    Files: [],
                    initFiles: visitorFiles.map(f => f.Name),
                    origFiles: visitorFiles
                };
                console.log('Setting inputFields:', inputFields);
                console.log('Department data:', {
                    deptId: inputFields.DeptId,
                    dept: inputFields.Dept,
                    departmentList: departmentList.map(d => ({
                        id: d.ID,
                        title: d.Title
                    }))
                });
                return {
                    ...prev,
                    _itemId: itemId,
                    _sourceURL: sourceURL,
                    _refno: refNo,
                    ...userRoles,
                    inputFields,
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
                };
            });

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

        } catch (error) {
            console.error('Error loading initial data:', error);
            throw error; // Re-throw to be caught by initializeComponent
        }
    };


    const initializeComponent = async (): Promise<void> => {
        try {
            setState(prev => ({ ...prev, isProgress: true }));
            
            if (!props.siteUrl || !props.siteRelativeUrl) {
                throw new Error('Site URL or relative URL is missing');
            }
            
            spService.initialize(props.siteUrl, props.siteRelativeUrl);

            // Temporarily hardcode itemId to 4 for testing
            const itemId = 4;
            // Get URL parameters and initialize data
           /* const itemId = parseInt(getUrlParameter('pid'));
            if (isNaN(itemId)) {
                throw new Error('Invalid visitor ID in URL parameters');
            }*/

            const sourceURL = document.referrer;
            await loadInitialData(itemId, sourceURL);

        } catch (error) {
            console.error('Error initializing component:', error);
            setState(prev => ({
                ...prev,
                dialogMessage: error instanceof Error ? error.message : 'An error occurred while loading the form. Please try again later.',
                isEdit: false // Disable editing when there's an error
            }));
        } finally {
            setState(prev => ({ ...prev, isProgress: false }));
        }
    };

    React.useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                await initializeComponent();
            } catch (error) {
                if (mounted) {
                    console.error('Failed to initialize component:', error);
                }
            }
        };

        init();
        
        // Cleanup function
        return () => {
            mounted = false;
        };
    }, [props.siteUrl, props.siteRelativeUrl, spService]); // Add all dependencies



    
   
    
    const getUserType = React.useCallback((): string => {
        const { isEncoder, isReceptionist, isApproverUser, isSSDUser, isWalkinApproverUser } = state;
        if (isEncoder) return 'encoder';
        if (isReceptionist) return 'receptionist';
        if (isApproverUser) return 'approver';
        if (isSSDUser) return 'ssd';
        if (isWalkinApproverUser) return 'walkinApprover';
        return '';
    }, [state.isEncoder, state.isReceptionist, state.isApproverUser, state.isSSDUser, state.isWalkinApproverUser]);

    

    const validateInputs = React.useCallback((name: string, value: any): void => {
        const { inputFields, errorFields } = state;
        const newErrors = validateVisitorFields(
            { ...inputFields, [name]: value },
            getRequiredFields(getUserType(), inputFields.StatusId),
            state.sAction
        );
        setState(prev => ({ ...prev, errorFields: newErrors }));
    }, [getUserType, state.inputFields, state.sAction]);

    // Event Handlers
    const handleInputChange = React.useCallback((name: string, value: any): void => {
        console.log('handleInputChange:', { name, value });
        if (name === 'Purpose' || name === 'Bldg' || name === 'ExternalType' || name === 'DeptId' || name === 'Dept') {
            console.log('Dropdown value changed:', {
                field: name,
                newValue: value,
                currentValue: state.inputFields[name],
                currentDept: state.inputFields.Dept,
                purposeList: state.purposeList,
                bldgList: state.bldgList,
                deptList: state.deptList.map(d => ({
                    id: d.ID,
                    title: d.Title
                }))
            });
        }
        setState(prev => {
            const newInputFields = { ...prev.inputFields };
            
            // Handle special case for department updates
            if (name === 'DeptId' && value) {
                // Find the department and update both DeptId and Dept
                const dept = state.deptList.find(d => d.ID === value);
                if (dept) {
                    newInputFields.DeptId = value;
                    newInputFields.Dept = { Title: dept.Title };

                    // Load approvers asynchronously
                    const loadApprovers = async () => {
                        try {
                            const approvers = newInputFields.ExternalType === 'Walk-in'
                                ? await spService.getWalkinApprovers(value)
                                : await spService.getApprovers(value);
                            
                            setState(prev => ({
                                ...prev,
                                approverList: approvers,
                                WalkinApprovers: approvers
                            }));
                        } catch (error) {
                            console.error('Error loading approvers:', error);
                        }
                    };
                    loadApprovers();

                    // Return updated state with cleared approvers
                    return {
                        ...prev,
                        inputFields: newInputFields,
                        approverList: [],
                        WalkinApprovers: []
                    };
                }
            } else if (name === 'Dept') {
                // Update Dept object directly
                newInputFields.Dept = value;
            } else {
                // Handle all other fields normally
                newInputFields[name] = value;
            }

            // Return updated state
            return {
                ...prev,
                inputFields: newInputFields
            };
        });
        validateInputs(name, value);
    }, [validateInputs, state.inputFields, state.purposeList, state.bldgList]);

    const validateVisitorDetailsInputs = React.useCallback((details: any, name: string, value: any): boolean => {
        const { isReceptionist, inputFields } = state;
        const updatedDetails = { ...details, [name]: value };
        const newErrors = validateVisitorDetails(
            updatedDetails,
            isReceptionist,
            inputFields.StatusId
        );
        setState(prev => ({ ...prev, errorDetails: newErrors }));
        
        // Return true if there are no errors
        return Object.values(newErrors).every(error => !error);
    }, [state.isReceptionist, state.inputFields.StatusId]);

    const handleVisitorDetailsChange = React.useCallback((name: string, value: any): void => {
        setState(prev => {
            const updatedDetails = { ...prev.visitorDetails, [name]: value };
            validateVisitorDetailsInputs(updatedDetails, name, value);
            return {
                ...prev,
                visitorDetails: updatedDetails
            };
        });
    }, [validateVisitorDetailsInputs]);

    const handleDeletedFiles = React.useCallback((files: File[]): void => {
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
    }, [state.inputFields.origFiles, state.deleteFiles]);

    const handleFileChange = React.useCallback((files: File[]): void => {
        setState(prev => ({
            ...prev,
            inputFields: { ...prev.inputFields, Files: files }
        }));
        handleDeletedFiles(files);
    }, [handleDeletedFiles]);

    const handleDeletedVisitorDetailsFiles = React.useCallback((files: File[]): void => {
        setState(prev => {
            const newDeleteFilesDetails = [...prev.deleteFilesDetails];
            prev.visitorDetails.origFiles.forEach(origFile => {
                const fileExists = files.some(file => file.name === origFile.Name);
                if (!fileExists) {
                    const deleteRecord = { Id: prev._itemIdDetails, Filename: origFile.Name };
                    if (!newDeleteFilesDetails.some(df => 
                        df.Id === deleteRecord.Id && df.Filename === deleteRecord.Filename
                    )) {
                        newDeleteFilesDetails.push(deleteRecord);
                    }
                }
            });
            return {
                ...prev,
                deleteFilesDetails: newDeleteFilesDetails
            };
        });
    }, [state.visitorDetails.origFiles, state._itemIdDetails]);

    const handleVisitorDetailsFileChange = React.useCallback((files: File[]): void => {
        setState(prev => {
            const updatedDetails = { ...prev.visitorDetails, Files: files };
            return {
                ...prev,
                visitorDetails: updatedDetails
            };
        });
        handleDeletedVisitorDetailsFiles(files);
    }, [handleDeletedVisitorDetailsFiles]);

    
    

    const handleSave = React.useCallback(async (): Promise<void> => {
        try {
            setState(prev => ({ ...prev, isProgress: true }));
            console.log('Saving visitor data:', {
                ExternalType: state.inputFields.ExternalType,
                Purpose: state.inputFields.Purpose,
                Bldg: state.inputFields.Bldg,
                purposeList: state.purposeList,
                bldgList: state.bldgList
            });
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
    }, [spService, state, props.siteUrl]);
    
    
  

   

    

    // Render Methods
    return (
        <ErrorBoundary>
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
                        refNo={state._refno}
                        onInputChange={handleInputChange}
                        onContactSelect={React.useCallback((e, value) => {
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
                        }, [validateInputs])}
                        onContactSearch={React.useCallback(async (value) => {
                            if (value.length > 2) {
                                const contacts = await spService.getContacts(value);
                                setState(prev => ({ ...prev, contactList: contacts }));
                            } else {
                                setState(prev => ({ ...prev, contactList: [] }));
                            }
                        }, [spService])}
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
                        onFileClick={React.useCallback((filename) => {
                            const url = `${props.siteUrl}/VisitorsLib/${state._itemId}/${filename}`;
                            window.open(url, '_blank');
                        }, [props.siteUrl, state._itemId])}
                    />

                    {/* Visitor Details Table */}
                    <VisitorDetailsTable
                        data={state.visitorDetailsList}
                        isEdit={state.isEdit}
                        isReceptionist={state.isReceptionist}
                        hidePrint={state.isHidePrint}
                        onView={React.useCallback((rowData) => {
                            setState(prev => ({
                                ...prev,
                                _idx: prev.visitorDetailsList.indexOf(rowData),
                                _itemIdDetails: rowData.ID,
                                visitorDetails: rowData,
                                visitorDetailsMode: 'edit',
                                openDialogFab: true
                            }));
                        }, [])}
                        onDelete={React.useCallback((rowData) => {
                            const idx = state.visitorDetailsList.indexOf(rowData);
                            setState(prev => ({
                                ...prev,
                                visitorDetailsList: prev.visitorDetailsList.filter((_, i) => i !== idx),
                                errorFields: {
                                    ...prev.errorFields,
                                    Details: prev.visitorDetailsList.length === 1 ? "Visitor Details are required. Please add visitor names." : ""
                                }
                            }));
                        }, [state.visitorDetailsList])}
                        onPrint={React.useCallback((rowData) => {
                            setState(prev => ({
                                ...prev,
                                _idx: prev.visitorDetailsList.indexOf(rowData),
                                _itemIdDetails: rowData.ID,
                                visitorDetails: rowData,
                                openDialogIDFab: true
                            }));
                        }, [])}
                        onAdd={React.useCallback(() => {
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
                        }, [])}
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
                        onCancel={React.useCallback(() => {
                            setState(prev => ({
                                ...prev,
                                dialogMessage: "Do you want to discard changes and exit?",
                                openDialog: true
                            }));
                        }, [])}
                        onSave={handleSave}
                        onSubmit={React.useCallback(() => {
                            setState(prev => ({
                                ...prev,
                                sAction: 'submit',
                                dialogMessage: "Do you want to submit this form?",
                                openDialog: true
                            }));
                        }, [])}
                        onApprove={React.useCallback(() => {
                            setState(prev => ({
                                ...prev,
                                sAction: 'approve',
                                dialogMessage: "Do you want to approve this request?",
                                openDialog: true
                            }));
                        }, [])}
                        onDeny={React.useCallback(() => {
                            setState(prev => ({
                                ...prev,
                                sAction: 'deny',
                                dialogMessage: "Do you want to deny this request?",
                                openDialog: true
                            }));
                        }, [])}
                        onMarkComplete={React.useCallback(() => {
                            setState(prev => ({
                                ...prev,
                                sAction: 'markcomplete',
                                dialogMessage: "Do you want to complete this request?",
                                openDialog: true
                            }));
                        }, [])}
                        onClose={React.useCallback(() => {
                            window.open(props.siteUrl + '/SitePages/ViewVisitorappge.aspx', "_self");
                        }, [props.siteUrl])}
                    />
                </Grid>
            </Container>

            {/* Dialogs */}
            <ConfirmationDialog
                open={state.openDialog}
                title="Confirmation"
                message={state.dialogMessage}
                onClose={React.useCallback((confirmed) => {
                    if (confirmed) {
                        if (state.dialogMessage.includes('discard')) {
                            window.location.href = state._sourceURL || props.siteUrl;
                        } else {
                            handleSave();
                        }
                    }
                    setState(prev => ({ ...prev, openDialog: false }));
                }, [handleSave, state.dialogMessage, state._sourceURL, props.siteUrl])}
            />

            <VisitorDetailsDialog
                open={state.openDialogFab}
                data={state.visitorDetails}
                errors={state.errorDetails}
                isEdit={state.isEdit}
                IDList={state.IDList}
                GateList={state.GateList}
                onClose={React.useCallback(() => setState(prev => ({ ...prev, openDialogFab: false })), [])}
                onSave={React.useCallback(() => {
                    if (validateVisitorDetailsInputs(state.visitorDetails, '', '')) {
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
                }, [validateVisitorDetailsInputs, state.visitorDetails, state.visitorDetailsMode, state._idx])}
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
                onClose={React.useCallback(() => setState(prev => ({ ...prev, openDialogIDFab: false })), [])}
                onColorChange={React.useCallback((value) => {
                    const selectedColor = state.colorList.find(c => c.Title === value);
                    setState(prev => ({
                        ...prev,
                        colorValue: (selectedColor && selectedColor.ColorCode) || 'Green',
                        inputFields: {
                            ...prev.inputFields,
                            colorAccess: value
                        }
                    }));
                }, [state.colorList])}
            />

            {/* Loading and Notifications */}
            <LoadingBackdrop open={state.isProgress} />

            <Notification
                open={state.isSavingDone}
                message="Data has been saved successfully."
                type="success"
                onClose={React.useCallback(() => setState(prev => ({ ...prev, isSavingDone: false })), [])}
            />
            </div>
        </ErrorBoundary>
    );
};
