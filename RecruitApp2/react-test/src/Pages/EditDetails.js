import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const EditDetails = () => {
  const { user, isLoggedIn } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [userData, setUserData] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = user.id;
        const apiUrl = `https://prod-04.uksouth.logic.azure.com:443/workflows/eee57e98e2974fe78e4576d5b2662762/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=nw56HtR2sYXhX_wdTuaH8gcnmBkMOYRyWF6bZQu_9_s&userId=${userId}`;

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
      const apiUrl = `https://prod-20.uksouth.logic.azure.com:443/workflows/0e23308e2b0b4e77b26e5a3d61d4769d/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=zNcqjD5P-WAV1RaFEAjgKGGV4ItXZMxrMq_edIxJSYU&id=${userId}&username=${username}&email=${email}&password=${password}`;

      const response = await fetch(apiUrl, { method: 'PUT' });

      if (response.ok) {
        console.log('User details updated successfully');
        // Show a popup box with a success message
        alert('User details updated successfully!');
      } else {
        console.log('Non-JSON response:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating user details:', error.message);
      // Show a popup box with an error message
      alert(error.response ? error.response.data.message : 'An error occurred while updating user details.');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation === 'DELETE') {
      try {
        const userId = user.id;
        const apiUrl = `https://prod-31.uksouth.logic.azure.com:443/workflows/5b88b393a3834cb086b4823bb0ba9ffd/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=nVQJA1E9yVXaJKTuJ8k9ziV3hS0xHy6E9DMwPhqmPpI&id=${userId}&filepath=${user.filepath}`;

        const response = await fetch(apiUrl, { method: 'DELETE' });

        if (response.ok) {
          console.log('User account deleted successfully');
          // Show a popup box with a success message
          alert('User account deleted successfully!');
          
          // Navigate to the home route ("/") after successful deletion
          navigate('/');
        } else {
          console.log('Non-JSON response:', response.statusText);
        }
      } catch (error) {
        console.error('Error deleting user account:', error.message);
        // Show a popup box with an error message
        alert(error.response ? error.response.data.message : 'An error occurred while deleting user account.');
      }
    } else {
      console.error('Delete confirmation does not match. Account not deleted.');
      // Show a popup box with an error message
      alert('Delete confirmation does not match. Account not deleted.');
    }
  };

  const containerStyle = {
    maxWidth: '400px',
    height: '650px',
    margin: '20px auto 0', // Adjusted top margin
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    position: 'static', // Ensure static positioning
  };

  const imageContainerStyle = {
    textAlign: 'center',
    marginBottom: '20px',
    height: '150px', // Set a fixed height for the image container
    overflow: 'hidden', // Hide any overflowing content
    position: 'static', // Ensure static positioning
  };

  const imageStyle = {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    position: 'static', // Ensure static positioning
  };

  const labelStyle = {
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '8px',
    display: 'block',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    boxSizing: 'border-box',
    marginBottom: '10px',
  };

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px',
    position: 'static', // Ensure static positioning
  };

  const buttonStyle = {
    flex: 1,
    backgroundColor: '#4caf50',
    color: 'white',
    padding: '10px',
    border: 'none',
    cursor: 'pointer',
    marginRight: '10px',
  };

  const deleteButtonStyle = {
    flex: 1,
    backgroundColor: '#ff0000',
    color: 'white',
    padding: '10px',
    border: 'none',
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Edit Your Details</h1>
      {isLoggedIn ? (
        <form>
          <div style={imageContainerStyle}>
            {imageSrc && (
              <img
                src={imageSrc}
                alt="Profile Photo"
                style={imageStyle}
              />
            )}
          </div>

          <label htmlFor="username" style={labelStyle}>Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
          />

          <label htmlFor="email" style={labelStyle}>Email:</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <label htmlFor="password" style={labelStyle}>New Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          <div style={buttonContainerStyle}>
            <button type="button" onClick={handleUpdateDetails} style={buttonStyle}>
              Update Details
            </button>

            <div style={{ flex: 1, marginLeft: '10px' }}>
              <label htmlFor="deleteConfirmation" style={labelStyle}>Type 'DELETE' to confirm:</label>
              <input
                type="text"
                id="deleteConfirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                style={inputStyle}
              />
              <button type="button" onClick={handleDeleteAccount} style={deleteButtonStyle}>
                Delete Account
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p style={{ textAlign: 'center', color: '#555' }}>Please log in to view and update your details.</p>
      )}
    </div>
  );
};

export default EditDetails;
