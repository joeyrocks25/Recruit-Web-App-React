import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';


const DisplayResume = () => {
  const { user } = useAuth(); 
  const userId = user ? user.id : '';

  // uri for our function for cosmosdb and azure blobs
  const functionUriGetFiles = 'https://functionappuserresumes.azurewebsites.net/api/HttpTriggerGetResume?code=3xBINMjx9M_ybw4gII-HTDCL5ejk46kuzkfwebsa1gMpAzFu5xSR0w==';


  const [files, setFiles] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [fetchTranscriptOnDemand, setFetchTranscriptOnDemand] = useState(false);


  useEffect(() => {
    const fetchFiles = async () => {
      try {

        // Get our PDF, MP4 and MOV file from azure blobs and meta data from CosmosDB
        // requires userid 
        // goes to Function that then goes to CosmosDB and Azure blobs
        const response = await fetch(`${functionUriGetFiles}&userId=${userId}`);
        if (!response.ok) {
          throw new Error(`Error fetching files: ${response.statusText}`);
        }

        const data = await response.json();
        setFiles(data.files);
      } catch (error) {
        console.error('Error fetching files:', error.message);
      } finally {
        setLoadingFiles(false);
      }
    };

    const fetchTranscript = async () => {
      try {
        setLoadingTranscript(true);

        // Advanced feature - Gets audio/mov file from azure blobs, sends mov to speechtotext endpoint
        // converts speech to text and then returns a transcript
        // requires userid and bool
        const response = await fetch(`${functionUriGetFiles}&userId=${userId}&gettranscript=true`);
        if (!response.ok) {
          throw new Error(`Error fetching transcript: ${response.statusText}`);
        }

        const data = await response.json();

        const transcriptText = data.transcript?.DisplayText || '';
        setTranscript(transcriptText);

      } catch (error) {
        console.error('Error fetching transcript:', error.message);
      } finally {
        setLoadingTranscript(false); 
      }
    };

    if (fetchTranscriptOnDemand) {
      fetchTranscript();
      setFetchTranscriptOnDemand(false);
    }

    fetchFiles();
  }, [userId, functionUriGetFiles, functionUriGetFiles, fetchTranscriptOnDemand]);

  function getFileType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'audio':
        return 'audio/mov';
      case 'video':
        return 'video/mp4';
      default:
        return 'Unknown File Type';
    }
  }

  function getDisplayName(file) {
    const extension = file.fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'My Resume (PDF)';
      case 'audio':
        return 'My Aspirations (Audio/MOV)';
      case 'video':
        return 'My Personal Video (Video/MP4)';
      default:
        return 'Unknown File Type';
    }
  }

  const pdfFiles = files.filter((file) => getFileType(file.fileName) === 'application/pdf');
  const videoFiles = files.filter((file) => getFileType(file.fileName) === 'video/mp4');
  const audioFiles = files.filter((file) => getFileType(file.fileName) === 'audio/mov');

  const orderedFiles = pdfFiles.concat(videoFiles, audioFiles);

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto 0', position: 'relative' }}>
      {loadingFiles && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <FaSpinner size={40} className="loading-icon" />
        </div>
      )}

      {orderedFiles.length === 0 && !loadingFiles && !loadingTranscript && <p>No files available.</p>}

      {orderedFiles.map((file, index) => (
        <div key={index} style={{ border: '2px solid #ccc', borderRadius: '8px', marginBottom: '20px', padding: '20px', position: 'relative' }}>
          <h2 style={{ marginBottom: '10px' }}>{getDisplayName(file)}</h2>

          {file.fileType === 'audio/mov' && (
            <div>
              {!loadingTranscript && transcript && (
                <div style={{ marginBottom: '10px' }}>
                  <h2>Transcript</h2>
                  <p>{transcript}</p>
                </div>
              )}

              <div style={{ marginBottom: '10px' }}>
                <audio controls>
                  <source src={`data:${getFileType(file.fileName)};base64,${file.content}`} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>

              {!loadingTranscript && !transcript && (
                <button onClick={() => setFetchTranscriptOnDemand(true)}>Fetch Transcript</button>
              )}

              {fetchTranscriptOnDemand && loadingTranscript && (
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <FaSpinner size={20} className="loading-icon" />
                  <p>Loading transcript...</p>
                </div>
              )}
            </div>
          )}

          {file.fileType !== 'audio/mov' && (
            // Display other file types
            <iframe
              title={`File-${index}`}
              src={`data:${getFileType(file.fileName)};base64,${file.content}`}
              width="100%"
              height="500px"
              style={{ border: 'none' }}
              allow="autoplay"
            />
          )}
        </div>
      ))}

      {loadingTranscript && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <FaSpinner size={40} className="loading-icon" />
          <p>Loading transcript...</p>
        </div>
      )}
    </div>
  );
};

export default DisplayResume;
