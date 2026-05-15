import * as React from 'react';
import { IVisitorDetails, IVisitorDetailsError } from '../../models/IVisitorDetails';
import { SharePointService } from '../../services/SharePointService';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import { DropzoneArea } from 'material-ui-dropzone';

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
    datelabel: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    labeltop: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      fontSize: '12px',
      color: '#0000008A',
    },
    labelbottom: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      fontSize: '18px',
    },
    previewChip: {
      minWidth: 160,
      maxWidth: 210
    },
    rootChip: {
      display: 'flex',
      justifyContent: 'flex-start',
      flexWrap: 'wrap',
      '& > *': {
        margin: theme.spacing(0.5),
      },
    },
  }),
);

const RECEPTIONIST_V2_GROUP = "Receptionist";

export interface IVisitorDetailsDialogProps {
  open: boolean;
  visitorDetails: IVisitorDetails;
  errorDetails: IVisitorDetailsError;
  isEdit: boolean;
  idList: any[];
  gateList: any[];
  isApproverUser?: boolean;
  isSSDUser?: boolean;

  // ✅ NEW: parent visitor’s building (from Visitors list)
  parentBldg: string;

  // ✅ service instance from parent
  spService: SharePointService;

  onClose: (confirmed: boolean) => void;
  onChangeTxt: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeCbo: (e: React.ChangeEvent<{ name?: string; value: any }>) => void;
  onChangeDropZone: (files: any[]) => void;
  onChipClick: (e: React.MouseEvent, row: any, ctrl: string) => void;
}

const VisitorDetailsDialog: React.FC<IVisitorDetailsDialogProps> = (props) => {
  const {
    open,
    visitorDetails,
    errorDetails,
    isEdit,
    idList,
    gateList,
    isApproverUser,
    isSSDUser,
    spService,
    parentBldg,
    onClose,
    onChangeTxt,
    onChangeCbo,
    onChangeDropZone,
    onChipClick
  } = props;

  const classes = useStyles();
  const [fullWidth] = React.useState(true);
  const [maxWidth] = React.useState<DialogProps['maxWidth']>('md');

  const [accessCardLookup, setAccessCardLookup] = React.useState<{
    [key: number]: { title: string; buildings: string[] };
  }>({});

  const [canEditAccessCard, setCanEditAccessCard] = React.useState<boolean>(false);

  React.useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const lookup = await spService.getAccessCardOptions();
        if (mounted) setAccessCardLookup(lookup);

        const groups = await spService.getCurrentUserGroups();
        const isReceptionistV2 = (groups || []).some((g: any) => {
          const name = (g && (g.LoginName || g.Title || g.Name))
            ? String(g.LoginName || g.Title || g.Name)
            : "";
          return name === RECEPTIONIST_V2_GROUP;
        });

        const me = await spService.getCurrentUser();
        const userPerDept = await spService.getUsersPerDept(me.Id);
        const isEncoder = Array.isArray(userPerDept) && userPerDept.length > 0;

        if (mounted) setCanEditAccessCard(isReceptionistV2 || isEncoder);

        // quick sanity logs (remove later)
        console.log("parentBldg:", parentBldg);
        console.log("accessCardLookup keys:", Object.keys(lookup || {}).length);
      } catch (e) {
        console.error("AccessCards init failed:", e);
        if (mounted) {
          setCanEditAccessCard(false);
          setAccessCardLookup({});
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [spService, parentBldg]);

  const getSelectedBuildings = (): string[] => {
    const bldgRaw = String(parentBldg || "");
    return bldgRaw
      .split(/[,;/]+/)
      .map((b) => b.trim().toLowerCase())
      .filter(Boolean);
  };

  const isAllBuildings = (selectedBuildings: string[]) => {
    const joined = selectedBuildings.join(" ");
    return joined.includes("all building") || joined.includes("all buildings");
  };

  const checkVisibility = (element: string): boolean => {
    const isViewOnly = isApproverUser || isSSDUser;

    switch (element) {
      case 'cedit':
        return isEdit && !isViewOnly;
      case 'cdisp':
        return !isEdit || isViewOnly;
      case 'detailscaredit':
        return isEdit && !isViewOnly;
      case 'detailsidpresentededit':
        return isEdit && !isViewOnly;
      case 'detailsidpresenteddisp':
        return (!isEdit || isViewOnly) && !!visitorDetails.IDPresented;

      case 'detailsaccesscardedit':
        return isEdit && !isViewOnly && canEditAccessCard;

      case 'detailsaccesscarddisp':
        return (!isEdit || isViewOnly || !canEditAccessCard) && !!(visitorDetails as any).AccessCards;

      case 'dropzone2edit':
        return isEdit && !isViewOnly;
      case 'dropzone2disp':
        return (!isEdit || isViewOnly) && visitorDetails.initFiles && visitorDetails.initFiles.length > 0;
      default:
        return false;
    }
  };

  return (
    <Dialog
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      open={open}
      onClose={() => onClose(false)}
      aria-labelledby="visitor-details-dialog-title"
    >
      <DialogTitle id="visitor-details-dialog-title">Visitor Details</DialogTitle>
      <DialogContent>
        <form noValidate autoComplete="off">
          <div style={{ padding: '0px' }}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                  {checkVisibility('cedit') && (
                    <TextField
                      inputProps={{ maxLength: 255 }}
                      error={!!errorDetails.Title}
                      required
                      label="Visitor's Last Name"
                      name="Title"
                      onChange={onChangeTxt}
                      value={visitorDetails.Title || ""}
                      variant="standard"
                      className={classes.textField}
                      helperText={errorDetails.Title}
                    />
                  )}

                  {checkVisibility('cedit') && (
                    <TextField
                      inputProps={{ maxLength: 255 }}
                      error={!!errorDetails.FirstName}
                      required
                      label="Visitor's First Name"
                      name="FirstName"
                      onChange={onChangeTxt}
                      value={visitorDetails.FirstName || ""}
                      variant="standard"
                      className={classes.textField}
                      helperText={errorDetails.FirstName}
                    />
                  )}

                  {checkVisibility('cdisp') && (
                    <>
                      <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                        Visitor's Name
                      </Box>
                      <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                        {visitorDetails.Title}
                      </Box>
                    </>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                  <div className={classes.datelabel}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!visitorDetails.Car}
                          onChange={onChangeTxt}
                          name="Car"
                          color="primary"
                          disabled={!checkVisibility('detailscaredit')}
                        />
                      }
                      label="With Vehicle?"
                    />
                  </div>
                </Paper>
              </Grid>

              {visitorDetails.Car && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" className={classes.paper}>
                      {checkVisibility('cedit') && (
                        <TextField
                          inputProps={{ maxLength: 255 }}
                          error={!!errorDetails.Color}
                          required
                          label="Color"
                          name="Color"
                          onChange={onChangeTxt}
                          value={visitorDetails.Color || ""}
                          variant="standard"
                          className={classes.textField}
                          helperText={errorDetails.Color}
                        />
                      )}

                      {checkVisibility('cdisp') && (
                        <>
                          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                            Color
                          </Box>
                          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                            {visitorDetails.Color}
                          </Box>
                        </>
                      )}
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" className={classes.paper}>
                      {checkVisibility('cedit') && (
                        <TextField
                          inputProps={{ maxLength: 255 }}
                          error={!!errorDetails.PlateNo}
                          required
                          label="Plate No."
                          name="PlateNo"
                          onChange={onChangeTxt}
                          value={visitorDetails.PlateNo || ""}
                          variant="standard"
                          className={classes.textField}
                          helperText={errorDetails.PlateNo}
                        />
                      )}

                      {checkVisibility('cdisp') && (
                        <>
                          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                            Plate No.
                          </Box>
                          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                            {visitorDetails.PlateNo}
                          </Box>
                        </>
                      )}
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" className={classes.paper}>
                      {checkVisibility('cedit') && (
                        <TextField
                          inputProps={{ maxLength: 255 }}
                          error={!!errorDetails.DriverName}
                          required
                          label="Driver's Name"
                          name="DriverName"
                          onChange={onChangeTxt}
                          value={visitorDetails.DriverName || ""}
                          variant="standard"
                          className={classes.textField}
                          helperText={errorDetails.DriverName}
                        />
                      )}

                      {checkVisibility('cdisp') && (
                        <>
                          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                            Driver's Name
                          </Box>
                          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                            {visitorDetails.DriverName}
                          </Box>
                        </>
                      )}
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" className={classes.paper}>
                      {checkVisibility('cedit') && (
                        <TextField
                          inputProps={{ maxLength: 255 }}
                          label="Type of Vehicle"
                          name="TypeofVehicle"
                          onChange={onChangeTxt}
                          value={visitorDetails.TypeofVehicle || ""}
                          variant="standard"
                          className={classes.textField}
                        />
                      )}

                      {checkVisibility('cdisp') && (
                        <>
                          <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                            Type of Vehicle
                          </Box>
                          <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                            {visitorDetails.TypeofVehicle}
                          </Box>
                        </>
                      )}
                    </Paper>
                  </Grid>
                </>
              )}

              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                  {checkVisibility('detailsidpresentededit') && (
                    <FormControl className={classes.textField} error={!!errorDetails.IDPresented}>
                      <InputLabel id="idPresentedLabel">ID Presented</InputLabel>
                      <Select
                        labelId="idPresentedLabel"
                        id="idPresented"
                        value={visitorDetails.IDPresented || ""}
                        onChange={onChangeCbo as any}
                        name="IDPresented"
                      >
                        {idList.map((item) => (
                          <MenuItem key={item.Title} value={item.Title}>
                            {item.Title}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{errorDetails.IDPresented}</FormHelperText>
                    </FormControl>
                  )}

                  {checkVisibility('detailsidpresenteddisp') && (
                    <>
                      <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                        ID Presented
                      </Box>
                      <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                        {visitorDetails.IDPresented}
                      </Box>
                    </>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                  {checkVisibility('detailsaccesscardedit') && (
                    <FormControl className={classes.textField}>
                      <InputLabel id="accessCardLabel">Access Card</InputLabel>
                      <Select
                        labelId="accessCardLabel"
                        id="AccessCardsId"
                        value={
                          (visitorDetails as any).AccessCardsId !== undefined &&
                          (visitorDetails as any).AccessCardsId !== null
                            ? (visitorDetails as any).AccessCardsId
                            : ""
                        }
                        onChange={onChangeCbo as any}
                        name="AccessCardsId"
                      >
                        <MenuItem value="">
                          -- Select Access Card --
                        </MenuItem>

                        {(() => {
                          const selectedBuildings = getSelectedBuildings();
                          const allowAll = isAllBuildings(selectedBuildings);

                          return Object.entries(accessCardLookup)
                            .filter(([_, val]) => {
                              if (allowAll) return true;
                              if (selectedBuildings.length === 0) return false;
                              return val.buildings.some((accessCardBldg) =>
                                selectedBuildings.includes(String(accessCardBldg).toLowerCase())
                              );
                            })
                            .map(([id, val]) => (
                              <MenuItem key={id} value={Number(id)}>
                                {val.title}
                              </MenuItem>
                            ));
                        })()}
                      </Select>
                    </FormControl>
                  )}

                  {checkVisibility('detailsaccesscarddisp') && (
                    <>
                      <Box component="span" style={{ display: 'block', margin: '4px' }} className={classes.labeltop}>
                        Access Card
                      </Box>
                      <Box component="span" style={{ display: 'block', fontWeight: 500, margin: '4px' }} className={classes.labelbottom}>
                        {String((visitorDetails as any).AccessCards || "")}
                      </Box>
                    </>
                  )}
                </Paper>
              </Grid>

              {/* ✅ FIXED PLACEMENT: Access Card No. is now inside Grid item + Paper */}
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" className={classes.paper}>
                  {checkVisibility("cedit") && (
                    <TextField
                      inputProps={{ maxLength: 255 }}
                      label="Access Card No."
                      name="AccessCardNo"
                      onChange={onChangeTxt}
                      value={(visitorDetails as any).AccessCardNo || ""}
                      variant="standard"
                      className={classes.textField}
                    />
                  )}

                  {checkVisibility("cdisp") && (
                    <>
                      <Box component="span" style={{ display: "block", margin: "4px" }} className={classes.labeltop}>
                        Access Card No.
                      </Box>
                      <Box component="span" style={{ display: "block", fontWeight: 500, margin: "4px" }} className={classes.labelbottom}>
                        {(visitorDetails as any).AccessCardNo || ""}
                      </Box>
                    </>
                  )}
                </Paper>
              </Grid>

              {!(isApproverUser || isSSDUser) && (
                <Grid item xs={12}>
                  <Paper variant="outlined" className={classes.paper}>
                    {checkVisibility('dropzone2edit') && (
                      <DropzoneArea
                        acceptedFiles={['image/*']}
                        showFileNames={true}
                        showPreviews={true}
                        maxFileSize={70000000}
                        onChange={onChangeDropZone}
                        filesLimit={10}
                        showPreviewsInDropzone={false}
                        useChipsForPreview
                        previewGridProps={{ container: { spacing: 1, direction: 'row' } }}
                        previewChipProps={{ classes: { root: classes.previewChip } }}
                        previewText="Selected files"
                        dropzoneText="Add a picture"
                        initialFiles={visitorDetails.initFiles || []}
                      />
                    )}

                    {checkVisibility('dropzone2disp') && (
                      <div className={classes.rootChip}>
                        {(visitorDetails.initFiles || []).map((row) => (
                          <Chip
                            key={row}
                            icon={<AttachFileIcon />}
                            label={row}
                            onClick={(e) => onChipClick(e, row, 'visitorDetails')}
                            variant="outlined"
                          />
                        ))}
                      </div>
                    )}

                    <FormControl error>
                      <FormHelperText>{errorDetails.Files}</FormHelperText>
                    </FormControl>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </div>
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose(false)} color="default">
          Cancel
        </Button>
        <Button onClick={() => onClose(true)} color="primary" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VisitorDetailsDialog;