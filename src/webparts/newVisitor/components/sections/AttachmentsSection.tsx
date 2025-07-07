import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { DropzoneArea } from 'material-ui-dropzone';
import { IVisitor } from '../../models/IVisitor';

// Define styles
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
  }),
);

/**
 * Attachments section props
 */
export interface IAttachmentsSectionProps {
  visitor: IVisitor;
  isEdit: boolean;
  isApproverUser: boolean;
  isSSDUser: boolean;
  onChangeDropZone: (files: File[]) => void;
  onChipClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, row: string, ctrl: string) => void;
}

/**
 * Attachments section component
 * @param props Component props
 * @returns JSX element
 */
const AttachmentsSection: React.FC<IAttachmentsSectionProps> = (props) => {
  const {
    visitor,
    isEdit,
    isApproverUser,
    isSSDUser,
    onChangeDropZone,
    onChipClick
  } = props;

  const classes = useStyles();

  return (
    <Paper variant="outlined" className={classes.paper}>
      {isEdit && !isApproverUser && !isSSDUser ? (
        <DropzoneArea
          acceptedFiles={['.docx', '.xlsx', '.xls', '.doc', '.mov', 'image/*', 'video/*', 'application/*']}
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
          dropzoneText="Add an attachment"
          initialFiles={visitor.Files}
        />
      ) : visitor.initFiles && visitor.initFiles.length > 0 ? (
        <div>
          <h4>Files:</h4>
          {visitor.initFiles.map((file, index) => (
            <div
              key={index}
              onClick={(e) => onChipClick(e, file.Name, 'visitor')}
              style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline', marginBottom: '5px' }}
            >
              {file.Name}
            </div>
          ))}
        </div>
      ) : (
        <div>No files attached</div>
      )}
    </Paper>
  );
};

export default AttachmentsSection;
