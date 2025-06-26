import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import { DropzoneArea } from 'material-ui-dropzone';

import { IOvertimeRequest } from '../../models/IOvertimeRequest';
import { checkComponentVisibility } from '../../helpers/uiHelpers';
import { FileService } from '../../services/FileService';

export interface IFileAttachmentSectionProps {
  overtimeRequest: IOvertimeRequest;
  isEdit: boolean;
  userRoles: {
    isEncoder: boolean;
    isReceptionist: boolean;
    isApproverUser: boolean;
    isSSDUser: boolean;
    isWalkinApproverUser: boolean;
  };
  fileService: FileService;
  onFilesChange: (files: File[]) => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(1),
      borderColor: "transparent",
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

/**
 * File attachment section component
 * @param props Component properties
 * @returns JSX element
 */
const FileAttachmentSection: React.FC<IFileAttachmentSectionProps> = (props) => {
  const classes = useStyles();
  const { overtimeRequest, isEdit, userRoles, fileService, onFilesChange } = props;
  
  const handleFileClick = (fileName: string) => {
    fileService.handleFileClick(overtimeRequest.ID, fileName);
  };
  
  return (
    <Grid item xs={12} sm={12}>
      <Paper variant="outlined" className={classes.paper}>
        {checkComponentVisibility('fileAttachmentEdit', isEdit, userRoles, { statusId: overtimeRequest.StatusId }) && (
          <DropzoneArea
            acceptedFiles={['.docx', '.xlsx', '.xls', '.doc', '.mov', 'image/*', 'video/*', 'application/*']}
            showFileNames={true}
            showPreviews={true}
            maxFileSize={70000000}
            onChange={onFilesChange}
            filesLimit={10}
            showPreviewsInDropzone={false}
            useChipsForPreview
            previewGridProps={{ container: { spacing: 1, direction: 'row' } }}
            previewChipProps={{ classes: { root: classes.previewChip } }}
            previewText="Selected files"
            dropzoneText="Add an attachment"
            initialFiles={overtimeRequest.initFiles}
          />
        )}
        
        {checkComponentVisibility('fileAttachmentDisplay', isEdit, userRoles, { statusId: overtimeRequest.StatusId }) && (
          <div className={classes.rootChip}>
            {overtimeRequest.initFiles && overtimeRequest.initFiles.map((fileName) => (
              <Chip
                key={fileName}
                icon={<AttachFileIcon />}
                label={fileName}
                onClick={() => handleFileClick(fileName)}
                variant="outlined"
              />
            ))}
          </div>
        )}
      </Paper>
    </Grid>
  );
};

export default FileAttachmentSection;
