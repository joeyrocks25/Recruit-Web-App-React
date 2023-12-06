import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const MediaUpload = () => {
  const [acceptedFiles, setAcceptedFiles] = useState([]);

  // Callback to handle when files are dropped
  const onDrop = useCallback((files) => {
    // Handle the uploaded files
    console.log('Accepted Files:', files);
    setAcceptedFiles(files);
    // You can perform additional actions like uploading to a server or storing in state
  }, []);

  // Initialize the dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Log when the component renders
  console.log('MediaUpload Component Rendered');

  return (
    <div>
      <h1>Welcome to Media Upload Pageeeee</h1>
      {/* Dropzone area */}
      <div {...getRootProps()} style={dropzoneStyle}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>
      {/* Display the accepted files */}
      {acceptedFiles.length > 0 && (
        <div>
          <h2>Accepted Files:</h2>
          <ul>
            {acceptedFiles.map((file) => (
              <li key={file.name}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Styling for the dropzone area
const dropzoneStyle = {
  border: '2px dashed #cccccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
  margin: '20px 0',
};

export default MediaUpload;
