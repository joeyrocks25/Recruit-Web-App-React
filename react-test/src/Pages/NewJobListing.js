import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import '../styles/NewJobListing.css';

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

      // Post a new Job to SQL database
      // requires userid
      // goes to RecruitAppBackendSQLDB
      await axios.post('http://127.0.0.1:5001/joblistings', {
        CosmosDBUserID: user.id,
        Title: title,
        Company: company,
        Description: description,
        LikesCount: 0,
        DislikesCount: 0,
      });

      setTitle('');
      setCompany('');
      setDescription('');

      alert('Job posted successfully!');
    } catch (error) {
      console.error('Error posting job listing:', error);
      alert(error.response ? error.response.data.message : 'An error occurred while posting the job listing.');
    }
  };

  return (
    <div className="container">
      <h1 className="title">Welcome to Job Posting Page</h1>
      <form className="form">
        <label htmlFor="title" className="label">Job Title:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
        />

        <label htmlFor="company" className="label">Company:</label>
        <input
          type="text"
          id="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="input"
        />

        <label htmlFor="description" className="label">Job Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea"
        />

        <button
          type="button"
          onClick={handlePostJobListing}
          className="button"
        >
          Post Job Listing
        </button>
      </form>
    </div>
  );
};

export default NewJobListing;
