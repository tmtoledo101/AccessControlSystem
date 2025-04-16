import * as React from 'react';
import {
    Paper,
    Grid,
    Chip,
    FormControl,
    FormHelperText
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DropzoneArea } from 'material-ui-dropzone';
import AttachFileIcon from '@material-ui/icons/AttachFile';

const useStyles = makeStyles((theme) => ({
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
}));

interface IAttachmentsSectionProps {
    files: File[];
    initFiles: string[];
    isEdit: boolean;
    onFileChange: (files: File[]) => void;
    onFileClick: (filename: string) => void;
}

export const AttachmentsSection: React.FC<IAttachmentsSectionProps> = ({
    files,
    initFiles,
    isEdit,
    onFileChange,
    onFileClick
}) => {
    const classes = useStyles();

    return (
        <Grid item xs={12}>
            <Paper variant="outlined" className={classes.paper}>
                {isEdit ? (
                    <DropzoneArea
                        acceptedFiles={['.docx', '.xlsx', '.xls', 'doc', '.mov', 'image/*', 'video/*', ' application/*']}
                        showFileNames={true}
                        showPreviews={true}
                        maxFileSize={70000000}
                        onChange={onFileChange}
                        filesLimit={10}
                        showPreviewsInDropzone={false}
                        useChipsForPreview
                        previewGridProps={{ container: { spacing: 1, direction: 'row' } }}
                        previewChipProps={{ classes: { root: classes.previewChip } }}
                        previewText="Selected files"
                        dropzoneText="Add an attachment"
                        initialFiles={initFiles}
                    />
                ) : (
                    initFiles.length > 0 && (
                        <div className={classes.rootChip}>
                            {initFiles.map((filename) => (
                                <Chip
                                    key={filename}
                                    icon={<AttachFileIcon />}
                                    label={filename}
                                    onClick={() => onFileClick(filename)}
                                    variant="outlined"
                                />
                            ))}
                        </div>
                    )
                )}
            </Paper>
        </Grid>
    );
};
