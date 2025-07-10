import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { DropzoneArea } from 'material-ui-dropzone';

/**
 * Attachments section props
 */
export interface IAttachmentsSectionProps {
  /**
   * On files change callback
   */
  onFilesChange: (files: File[]) => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(1),
      borderColor: 'transparent',
    },
    previewChip: {
      minWidth: 160,
      maxWidth: 210
    },
  }),
);

/**
 * Attachments section component
 * @param props Component props
 * @returns Attachments section component
 */
export const AttachmentsSection: React.FC<IAttachmentsSectionProps> = (props) => {
  const { onFilesChange } = props;
  const classes = useStyles();

  /**
   * Handle dropzone change
   * @param files Files
   */
  const handleDropzoneChange = (files: File[]) => {
    onFilesChange(files);
  };

  React.useEffect(() => {
    // Adjust dropzone height
    setTimeout(() => {
      const dropzoneElements = document.getElementsByClassName('MuiDropzoneArea-root');
      if (dropzoneElements && dropzoneElements.length > 0) {
        for (let i = 0; i < dropzoneElements.length; i++) {
          (dropzoneElements[i] as HTMLElement).style.minHeight = '10px';
        }
      }
    }, 10);
  }, []);

  return (
    <Grid item xs={12} sm={12}>
      <Paper variant="outlined" className={classes.paper}>
        <DropzoneArea
          acceptedFiles={['.docx', '.xlsx', '.xls', '.doc', '.mov', 'image/*', 'video/*', 'application/*']}
          showFileNames={true}
          showPreviews={true}
          maxFileSize={70000000}
          onChange={handleDropzoneChange}
          filesLimit={10}
          showPreviewsInDropzone={false}
          useChipsForPreview
          previewGridProps={{ container: { spacing: 1, direction: 'row' } }}
          previewChipProps={{ classes: { root: classes.previewChip } }}
          previewText="Selected files"
          dropzoneText="Add an attachment"
        />
      </Paper>
    </Grid>
  );
};
