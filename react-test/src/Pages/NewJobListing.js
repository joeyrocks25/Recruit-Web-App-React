import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

const NewJobListing = () => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const { user } = useAuth();

  const handlePostJobListing = async () => {
    try {
      if (!user) {
        console.error('User not logged in.');
        return;
      }

      await axios.post('http://127.0.0.1:5001/joblistings', {
        CosmosDBUserID: user.id,
        Title: title,
        Company: company,
        Description: description,
        LikesCount: 0,
        DislikesCount: 0,
      });

      // Clear form fields after successful job posting
      setTitle('');
      setCompany('');
      setDescription('');

      // Show a popup box with a success message
      alert('Job posted successfully!');
    } catch (error) {
      console.error('Error posting job listing:', error);
      // Show a popup box with an error message
      alert(error.response ? error.response.data.message : 'An error occurred while posting the job listing.');
    }
  };

  const containerStyle = {
    maxWidth: '400px',
    margin: '20px auto', // Adjusted top margin to move the form down
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  };

  const labelStyle = {
    fontWeight: 'bold',
    marginBottom: '8px',
    display: 'block',
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    boxSizing: 'border-box',
  };

  const textareaStyle = {
    width: '100%',
    padding: '8px',
    boxSizing: 'border-box',
    minHeight: '100px', // Set a minimum height for the textarea
  };

  const buttonStyle = {
    backgroundColor: '#4caf50',
    color: 'white',
    padding: '10px',
    border: 'none',
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: 'center' }}>Welcome to Job Posting Page</h1>
      <form style={{ display: 'grid', gap: '10px' }}>
        <label htmlFor="title" style={labelStyle}>Job Title:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />

        <label htmlFor="company" style={labelStyle}>Company:</label>
        <input
          type="text"
          id="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          style={inputStyle}
        />

        <label htmlFor="description" style={labelStyle}>Job Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={textareaStyle}
        />

        <button
          type="button"
          onClick={handlePostJobListing}
          style={buttonStyle}
        >
          Post Job Listing
        </button>
      </form>
    </div>
  );
};

export default NewJobListing;
