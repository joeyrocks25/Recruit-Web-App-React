import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../styles/EditDetails.css';

const EditDetails = () => {
  const { user, isLoggedIn } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [setUserData] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = user.id;

        // URI for our logic app (GET)
        const apiUrl = `https://prod-04.uksouth.logic.azure.com:443/workflows/eee57e98e2974fe78e4576d5b2662762/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=nw56HtR2sYXhX_wdTuaH8gcnmBkMOYRyWF6bZQu_9_s&userId=${userId}`;

        // Get request that goes through logic apps to Retrieve our profile metadata from CosmosDB
        // and also to retrieve our profile photo from azure blobs
        const response = await fetch(apiUrl);
        const contentType = response.headers.get('Content-Type');

        if (contentType && contentType.includes('application/json')) {
          const userData = await response.json();
          setUserData(userData.value[0]);
          setImageSrc(userData.value[0].$content);
        } else {
          const imageBlob = await response.blob();
          const imageUrl = URL.createObjectURL(imageBlob);
          setImageSrc(imageUrl);
        }
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    };

    if (isLoggedIn && user) {
      setUsername(user.username);
      setEmail(user.email);
      fetchUserData();
    }
  }, [isLoggedIn, user]);

  const handleUpdateDetails = async () => {
    try {
      const userId = user.id;

      // Uri for our logic up (PUT)
      const apiUrl = `https://prod-20.uksouth.logic.azure.com:443/workflows/0e23308e2b0b4e77b26e5a3d61d4769d/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=zNcqjD5P-WAV1RaFEAjgKGGV4ItXZMxrMq_edIxJSYU&id=${userId}&username=${username}&email=${email}&password=${password}`;

      // PUT request that goes through logic apps to Retrieve our profile metadata from CosmosDB
      // then updates CosmosDB and Azure blobs with our changes
      // note: you can't append in CosmosDB, so we send metadata through with request and essentially create new
      const response = await fetch(apiUrl, { method: 'PUT' });

      if (response.ok) {
        console.log('User details updated successfully');
        alert('User details updated successfully!');
      } else {
        console.log('Non-JSON response:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating user details:', error.message);
      alert(error.response ? error.response.data.message : 'An error occurred while updating user details.');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation === 'DELETE') {
      try {
        const userId = user.id;

        // URI for our logic app (DELETE)
        const apiUrl = `https://prod-31.uksouth.logic.azure.com:443/workflows/5b88b393a3834cb086b4823bb0ba9ffd/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=nVQJA1E9yVXaJKTuJ8k9ziV3hS0xHy6E9DMwPhqmPpI&id=${userId}&filepath=${user.filepath}`;

        // DELETE request that goes through logic apps to Retrieve and delete our profile metadata from CosmosDB
        // and also to retrieve and delete our profile photo from azure blobs
        const response = await fetch(apiUrl, { method: 'DELETE' });

        if (response.ok) {
          console.log('User account deleted successfully');
          alert('User account deleted successfully!');
  
          navigate('/');
        } else {
          console.log('Non-JSON response:', response.statusText);
        }
      } catch (error) {
        console.error('Error deleting user account:', error.message);
        alert(error.response ? error.response.data.message : 'An error occurred while deleting user account.');
      }
    } else {
      console.error('Delete confirmation does not match. Account not deleted.');
      alert('Delete confirmation does not match. Account not deleted.');
    }
  };

  return (
    <div className="container">
      <h1 className="header">Edit Your Details</h1>
      {isLoggedIn ? (
        <form>
          <div className="image-container">
            {imageSrc && (
              <img
                src={imageSrc}
                alt="Profile Photo"
                className="profile-image"
              />
            )}
          </div>

          <label htmlFor="username" className="label">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
          />

          <label htmlFor="email" className="label">Email:</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />

          <label htmlFor="password" className="label">New Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />

          <div className="button-container">
            <button type="button" onClick={handleUpdateDetails} className="button">
              Update Details
            </button>

            <div style={{ flex: 1, marginLeft: '10px' }}>
              <label htmlFor="deleteConfirmation" className="label">Type 'DELETE' to confirm:</label>
              <input
                type="text"
                id="deleteConfirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="input"
              />
              <button type="button" onClick={handleDeleteAccount} className="delete-button">
                Delete Account
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="message">Please log in to view and update your details.</p>
      )}
    </div>
  );
};

export default EditDetails;
