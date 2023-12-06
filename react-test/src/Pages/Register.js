import React, { useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';

// RegisterForm Component: Handles user registration
const RegisterForm = () => {
  const navigate = useNavigate();

  // State variables
  const [formData, setFormData] = useState({
    id: '',
    CreatedAt: '',
    filelocation: 'local',
    filename: '',
    filepath: '/path/to/file',
    username: '',
    email: '',
    password: '',
    profilePhoto: null,
  });

  const [file, setFile] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // Open the modal
  const openModal = () => setModalIsOpen(true);
  // Close the modal and redirect to the login page
  const closeModal = () => {
    setModalIsOpen(false);
    navigate('/login');
  };

  // Handle input change
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    setFormData({
      ...formData,
      filename: selectedFile ? selectedFile.name : '',
      profilePhoto: selectedFile,
    });

    setFile(selectedFile);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    if (file) {
      data.append('file', file);
    }

    try {
      // Send registration data to the server
      // post request to logic app
      // post to user cosmosdb + blobs
      const response = await axios.post(
        'https://prod-05.uksouth.logic.azure.com:443/workflows/5e4c364ae4644ee49c285f8aa5a819c5/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=rhsJCcaNO7LNYR1kgYUSbgop1XpTbfbAG3hpgR0azvQ',
        data
      );

      console.log('Successful Response:', response);

      // Open the success modal
      openModal();
    } catch (error) {
      console.error('Error sending data:', error);

      if (error.response) {
        console.error('Response Data:', error.response.data);
        console.error('Response Status:', error.response.status);
        console.error('Response Headers:', error.response.headers);
      } else if (error.request) {
        console.error('No Response Received:', error.request);
      } else {
        console.error('Error Setting Up Request:', error.message);
      }
    }
  };

  // Styling for the container
  const containerStyle = {
    maxWidth: '400px',
    margin: '20px auto', // Adjusted top margin to move the form down
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  };

  // JSX for the RegisterForm component
  return (
    <div style={containerStyle}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input type="text" name="username" value={formData.username} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Password:
          <input type="password" name="password" value={formData.password} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Email:
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Profile Photo:
          <input type="file" name="file" onChange={handleFileChange} />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>

      {/* Success modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Registration Success"
        style={{
          content: {
            width: '300px', // Set the width as per your requirement
            height: '200px',
            margin: 'auto',
          },
        }}
      >
        <h2>Registration Successful!</h2>
        <p>You've successfully registered. Redirecting to the login page...</p>
        <button onClick={closeModal}>Continue</button>
      </Modal>
    </div>
  );
};

// Export the RegisterForm component
export default RegisterForm;
