import * as React from 'react';
import { Grid, Paper, Chip } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { DropzoneArea } from 'material-ui-dropzone';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import { IUserPermissions } from '../../utils/permissionUtils';

// Styles
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
    }
  }),
);

interface IAttachmentsSectionProps {
  /**
   * The files
   */
  files: any[];
  
  /**
   * The initial files
   */
  initFiles: string[];
  
  /**
   * User permissions
   */
  permissions: IUserPermissions;
  
  /**
   * The request status ID
   */
  statusId: number;
  
  /**
   * Whether the form is in edit mode
   */
  isEditMode: boolean;
  
  /**
   * The site URL
   */
  siteUrl: string;
  
  /**
   * The item ID
   */
  itemId: number;
  
  /**
   * File change handler
   */
  handleChangeDropZone: (files: any[]) => void;
  
  /**
   * File click handler
   */
  handleChipClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, fileName: string) => void;
}

/**
 * Attachments Section component
 */
export const AttachmentsSection: React.FC<IAttachmentsSectionProps> = ({
  files,
  initFiles,
  permissions,
  statusId,
  isEditMode,
  siteUrl,
  itemId,
  handleChangeDropZone,
  handleChipClick
}) => {
  const classes = useStyles();
  
  /**
   * Checks if the dropzone should be visible
   */
  const shouldShowDropzone = (): boolean => {
    return isEditMode && (permissions.isEncoder || permissions.isReceptionist);
  };
  
  /**
   * Checks if the file chips should be visible
   */
  const shouldShowFileChips = (): boolean => {
    return !isEditMode || !shouldShowDropzone();
  };
  
  return (
    <Grid item xs={12} sm={12}>
      <Paper variant="outlined" className={classes.paper}>
        {shouldShowDropzone() && (
          <DropzoneArea
            acceptedFiles={['.docx', '.xlsx', '.xls', '.doc', '.mov', 'image/*', 'video/*', 'application/*']}
            showFileNames={true}
            showPreviews={true}
            maxFileSize={70000000}
            onChange={handleChangeDropZone}
            filesLimit={10}
            showPreviewsInDropzone={false}
            useChipsForPreview
            previewGridProps={{ container: { spacing: 1, direction: 'row' } }}
            previewChipProps={{ classes: { root: classes.previewChip } }}
            previewText="Selected files"
            dropzoneText="Add an attachment"
            initialFiles={initFiles}
          />
        )}
        
        {shouldShowFileChips() && initFiles.length > 0 && (
          <div className={classes.rootChip}>
            {initFiles.map((fileName) => (
              <Chip
                key={fileName}
                icon={<AttachFileIcon />}
                label={fileName}
                onClick={(e) => handleChipClick(e, fileName)}
                variant="outlined"
              />
            ))}
          </div>
        )}
      </Paper>
    </Grid>
  );
};
