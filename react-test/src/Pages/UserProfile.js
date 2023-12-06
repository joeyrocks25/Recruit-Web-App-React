import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/UserProfile.css';

const UserProfile = () => {
  const { user } = useAuth();
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    const fetchUserProfileImage = async () => {
      try {

        // Retrieve our user and display their profile photo
        // requires userid
        // goes to CosmosDB and Azure blobs
        const userId = user.id;
        const apiUrl = `https://prod-04.uksouth.logic.azure.com:443/workflows/eee57e98e2974fe78e4576d5b2662762/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=nw56HtR2sYXhX_wdTuaH8gcnmBkMOYRyWF6bZQu_9_s&userId=${userId}`;
        
        // Initiate both requests simultaneously
        const [response] = await Promise.all([
          fetch(apiUrl),
          fetch(apiUrl, { method: 'HEAD' }) // HEAD request for image metadata
        ]);

        const contentType = response.headers.get('Content-Type');

        if (contentType && contentType.includes('application/json')) {
          const userData = await response.json();
          setImageSrc(userData.value[0].$content);
        } else {
          const imageBlob = await response.blob();
          const imageUrl = URL.createObjectURL(imageBlob);
          setImageSrc(imageUrl);
        }
      } catch (error) {
        console.error('Error fetching user profile image', error);
      }
    };

    if (user) {
      fetchUserProfileImage();
    }
  }, [user]);

  return (
    <div className="user-profile-container" style={{ margin: '20px auto 0' }}>
      <h1>Welcome to User Profile Page</h1>
      {user && (
        <>
          <div className="profile-image-container" style={{ height: '150px' }}>
            {imageSrc && <img src={imageSrc} alt="Profile" />}
          </div>
          <div className="profile-links">
            <Link to="/MyResume">Add Resume</Link>
            <Link to="/DisplayResume">Display Resume</Link>
            <Link to="/NewJobListing">Post Job Listing</Link>
            <Link to="/EditDetails">Edit Details</Link>
            <Link to="/MyJobListings">My Job Listings</Link>
          </div>
          <button onClick={() => console.log('Logout button clicked. User:', user)}>Logout</button>
        </>
      )}
    </div>
  );
};

export default UserProfile;
