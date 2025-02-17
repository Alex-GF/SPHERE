import { useState, useCallback } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, IconButton, Button } from '@mui/material';
import { styled } from '@mui/system';
import { FaUpload } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { MdDeleteForever } from 'react-icons/md';
import { error, grey, primary } from '../../theme/palette';
import customAlert from '../../utils/custom-alert';

const UploadBox = styled(Paper)({
  padding: '10px',
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: 'white',
  border: '2px dashed #ccc',
  '&:hover': {
    backgroundColor: '#f0f0f0',
  },
});

export default function FileUpload({onSubmit, submitButtonText, submitButtonWidth}: {onSubmit: (file: File) => void, submitButtonText?: string, submitButtonWidth?: number}) {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (
      uploadedFile &&
      (uploadedFile.name.endsWith('.yaml') || uploadedFile.name.endsWith('.yml'))
    ) {
      setFile(uploadedFile);
    } else {
      customAlert('Please upload a file with a .yaml or .yml extension');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/x-yaml': ['.yaml', '.yml'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleDelete = () => {
    setFile(null);
  };

  const handleSubmit = () => {
    // set editor's value with the contents of the file as a string

    onSubmit(file as File);
    handleDelete();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
      <Box sx={{ width: "100%", margin: 'auto', mt: 2, mb: 2 }}>
        <UploadBox
          {...getRootProps()}
          sx={{ opacity: file ? 0.5 : 1, pointerEvents: file ? 'none' : 'auto' }}
          role="button"
          tabIndex={0}
        >
          <input {...getInputProps()} type="file" style={{ display: 'none' }} />
          <FaUpload
            style={{ fontSize: 48, marginBottom: '16px', display: 'block', margin: '0 auto' }}
          />
          <Typography variant="h6" gutterBottom>
            {isDragActive
              ? 'Drop the Pricing2Yaml file here'
              : 'Drag and drop a Pricing2Yaml file here'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            or click to select a file
          </Typography>
        </UploadBox>

        {file && (
          <List>
            <ListItem
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={handleDelete}>
                  <MdDeleteForever fill={error.dark} />
                </IconButton>
              }
            >
              <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(2)} KB`} />
            </ListItem>
          </List>
        )}
      </Box>
      <Button onClick={handleSubmit} sx={{
        backgroundColor: primary[700],
        color: grey[100],
        fontWeight: 'bold',
        fontSize: 16,
        px: 5,
        py: 2,
        mt: 5,
        borderRadius: 3,
        width: submitButtonWidth ?? '100%',
      }}>
        {submitButtonText ?? 'Submit file'}
      </Button>
    </Box>
  );
}
