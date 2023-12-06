import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { v4 as uuidv4 } from 'uuid';

const MyResume = () => {
  const { user } = useAuth();
  const [pdfFile, setPdfFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [popup, setPopup] = useState({ visible: false, message: '' });

  const onDropPdf = useCallback(async (files) => {
    handleDrop(files, 'pdf', setPdfFile);
  }, []);

  const onDropVideo = useCallback(async (files) => {
    handleDrop(files, 'video', setVideoFile);
  }, []);

  const onDropAudio = useCallback(async (files) => {
    handleDrop(files, 'audio', setAudioFile);
  }, []);

  const handleDrop = async (files, fileType, setFileState) => {
    const supportedFile = files.find((file) => getFileType(file) === fileType);

    console.log(`Accepted ${fileType.toUpperCase()} File:`, supportedFile);

    if (supportedFile) {
      setFileState(supportedFile);
    }
  };

  const handleUploadAll = () => {
    const userId = user ? user.id : null;

    if (userId && pdfFile && videoFile && audioFile) {
      uploadFiles(userId, uuidv4(), pdfFile, 'pdf');
      uploadFiles(userId, uuidv4(), videoFile, 'video');
      uploadFiles(userId, uuidv4(), audioFile, 'audio');
    }
  };

  const getFileType = (file) => {
    const extensions = {
      pdf: ['pdf'],
      video: ['mp4', 'mov'],
      audio: ['mp3', 'wav'],
    };

    const extension = file.name.split('.').pop();
    for (const type in extensions) {
      if (extensions[type].includes(extension)) {
        return type;
      }
    }
    return 'unknown';
  };

  const readFileContent = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Content = event.target.result.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  };

  const uploadFiles = async (userId, mediaID, file, fileType) => {
    try {

      // POST our metadata to CosmosDB, along with multimedia to Azure blobs
      // Advanced feature - hits endpoint for content moderator, reviews it and upon success sends to azure blobs
      // requires userid 
      // goes to CosmosDB and Azure blobs
      const response = await axios.post(
        'https://functionappuserresumes.azurewebsites.net/api/HttpTrigger1?code=4yHlqEo_Erqm96LWxMTJCxwYPtIfAwSkT2DWm9PY6trBAzFuf6rb3Q==',
        {
          userId,
          mediaID,
          file: {
            [fileType]: {
              content: await readFileContent(file),
            },
          },
        }
      );

      console.log(`Upload successful for ${fileType.toUpperCase()}:`, response.data);

      setPopup({ visible: true, message: `Upload successful for ${fileType.toUpperCase()}` });
    } catch (error) {
      console.error(`Error uploading ${fileType.toUpperCase()} file:`, error.message);
      setPopup({ visible: true, message: `Error uploading ${fileType.toUpperCase()} file: ${error.message}` });
    }
  };

  const { getRootProps: pdfRootProps, getInputProps: pdfInputProps, isDragActive: isPdfDragActive } = useDropzone({ onDrop: onDropPdf });
  const { getRootProps: videoRootProps, getInputProps: videoInputProps, isDragActive: isVideoDragActive } = useDropzone({ onDrop: onDropVideo });
  const { getRootProps: audioRootProps, getInputProps: audioInputProps, isDragActive: isAudioDragActive } = useDropzone({ onDrop: onDropAudio });

  const dropzoneStyle = {
    border: '2px dashed #cccccc',
    borderRadius: '4px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    margin: '20px 0',
  };

  const handleClosePopup = () => {
    setPopup({ visible: false, message: '' });
  };

  console.log('MyResume Component Rendered');

  return (
    <div>
      <h1>Welcome to Media Upload Page</h1>

      {popup.visible && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', zIndex: 999 }}>
          <p>{popup.message}</p>
          <button onClick={handleClosePopup}>Close</button>
        </div>
      )}

      <div>
        <h2>Upload Your Resume (PDF)</h2>
        <div {...pdfRootProps()} style={dropzoneStyle}>
          <input {...pdfInputProps()} />
          {isPdfDragActive ? (
            <p>Drop the PDF file here ...</p>
          ) : (
            <p>Drag 'n' drop your PDF file here, or click to select a file</p>
          )}
        </div>
        {pdfFile && (
          <div>
            <h3>Accepted PDF File:</h3>
            <p>{pdfFile.name}</p>
          </div>
        )}
      </div>

      <div>
        <h2>Upload Your Personal Video (MP4)</h2>
        <div {...videoRootProps()} style={dropzoneStyle}>
          <input {...videoInputProps()} />
          {isVideoDragActive ? (
            <p>Drop the video file here ...</p>
          ) : (
            <p>Drag 'n' drop your video file here, or click to select a file</p>
          )}
        </div>
        {videoFile && (
          <div>
            <h3>Accepted Video File:</h3>
            <p>{videoFile.name}</p>
          </div>
        )}
      </div>

      <div>
        <h2>Upload Your Aspirations (MP3)</h2>
        <div {...audioRootProps()} style={dropzoneStyle}>
          <input {...audioInputProps()} />
          {isAudioDragActive ? (
            <p>Drop the audio file here ...</p>
          ) : (
            <p>Drag 'n' drop your audio file here, or click to select a file</p>
          )}
        </div>
        {audioFile && (
          <div>
            <h3>Accepted Audio File:</h3>
            <p>{audioFile.name}</p>
          </div>
        )}
      </div>

      <button onClick={handleUploadAll}>Upload All</button>
    </div>
  );
};

export default MyResume;
