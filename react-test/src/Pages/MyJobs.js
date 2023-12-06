// MyJobs.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import Modal from '../styles/Modal';
import JobApplicationsModal from '../styles/JobApplicationsModal'; // Replace with the correct path

const MyJobs = () => {
  const { user, isLoggedIn } = useAuth();
  const [jobListings, setJobListings] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [userApplications, setUserApplications] = useState([]);
  const [likesDislikesModalOpen, setLikesDislikesModalOpen] = useState(false);
  const [applicantsModalOpen, setApplicantsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState([]);

  const fetchJobListings = async () => {
    try {
      if (!user) {
        console.error('User is null');
        return;
      }

      const response = await axios.get(`http://127.0.0.1:5001/joblistings?CosmosDBUserID=${user.id}`);
      const jobListingsWithFeedback = await Promise.all(
        response.data.map(async (job) => {
          const feedbackResponse = await axios.get(`http://127.0.0.1:5001/jobfeedback?JobID=${job.ID}`);
          job.LikesCount = feedbackResponse.data.filter((feedback) => feedback.IsLiked).length;
          job.DislikesCount = feedbackResponse.data.filter((feedback) => !feedback.IsLiked).length;
          return job;
        })
      );

      setJobListings(jobListingsWithFeedback);
    } catch (error) {
      console.error('Error fetching job listings:', error.message);
    }
  };

  const fetchUserApplications = async (jobId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5001/jobapplications?JobID=${jobId}`);
      const users = await Promise.all(
        response.data.map(async (application) => {
          const userResponse = await axios.get(`http://127.0.0.1:5000/api/users/${application.CosmosDBUserID}`);
          return { ...userResponse.data, JobApplicationID: application.JobApplicationID };
        })
      );

      setUserApplications(users);
    } catch (error) {
      console.error('Error fetching user applications:', error.message);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchJobListings();
    }
  }, [isLoggedIn, user]);

  const handleJobClick = (job) => {
    if (selectedJob === job) {
      setSelectedJob(null);
      setShowFullDescription(false);
    } else {
      setSelectedJob(job);
      setShowFullDescription(true);
    }
  };

  const handleShowLikesDislikes = async (job) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5001/jobfeedback?JobID=${job.ID}`);
      const likedUsers = [];
      const dislikedUsers = [];

      for (const feedback of response.data) {
        const userResponse = await axios.get(`http://127.0.0.1:5000/api/users/${feedback.CosmosDBUserID}`);
        const username = userResponse.data.username;

        if (feedback.IsLiked) {
          likedUsers.push(username);
        } else {
          dislikedUsers.push(username);
        }
      }

      setLikes(likedUsers);
      setDislikes(dislikedUsers);
      setModalTitle(job.Title);
      setLikesDislikesModalOpen(true);

      // Close full description when modal is opened
      setShowFullDescription(false);
    } catch (error) {
      console.error('Error fetching likes/dislikes:', error.message);
    }
  };

  const handleShowApplicants = async (job) => {
    try {
      await fetchUserApplications(job.ID);
      setModalTitle(job.Title);
      setApplicantsModalOpen(true);

      // Close full description when modal is opened
      setShowFullDescription(false);
    } catch (error) {
      console.error('Error fetching user applications:', error.message);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await axios.delete(`http://127.0.0.1:5001/joblistings/${jobId}`);
      fetchJobListings();
    } catch (error) {
      console.error('Error deleting job listing:', error.message);
    }
  };

  return (
    <div>
      <h1>You have posted the following job listings:</h1>
      <style>
        {`
          .job-listings {
            display: flex;
            flex-wrap: wrap;
          }

          .job-box {
            border: 1px solid #ccc;
            margin: 10px;
            padding: 15px;
            cursor: pointer;
            width: 200px;
          }

          .job-box.selected {
            border-color: #007bff;
          }

          .job-title {
            font-size: 1.2rem;
            margin-bottom: 10px;
          }

          .job-company {
            color: #555;
            margin-bottom: 8px;
          }

          .job-description-preview {
            margin-bottom: 15px;
          }

          .job-details {
            margin-top: 10px;
          }

          .job-likes-dislikes {
            display: flex;
            justify-content: space-between;
            cursor: pointer;
            color: #007bff;
          }

          .job-likes,
          .job-dislikes {
            font-size: 0.9rem;
          }

          .job-applicants {
            font-size: 0.9rem;
            cursor: pointer;
          }

          .see-more {
            cursor: pointer;
            color: #007bff;
            text-decoration: underline;
          }

          /* Modal styles */
          .modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border: 1px solid #ccc;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            max-width: 400px;
            width: 100%;
          }

          .modal-title {
            font-size: 1.2rem;
            margin-bottom: 10px;
          }

          .user-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .user-item {
            padding: 8px;
            margin-bottom: 8px;
            border: 1px solid #ccc;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .thumbs-up {
            color: #28a745;
          }

          .thumbs-down {
            color: #dc3545;
          }
        `}
      </style>
      {isLoggedIn ? (
        <div>
          {jobListings.length > 0 ? (
            <div className="job-listings">
              {jobListings.map((job) => (
                <div key={job.ID} className={`job-box ${selectedJob === job ? 'selected' : ''}`} onClick={() => handleJobClick(job)}>
                  <h2 className="job-title">{job.Title}</h2>
                  <p className="job-company">{job.Company}</p>
                  {showFullDescription && selectedJob === job ? (
                    <div className="job-details">
                      <p className="job-description">{job.Description}</p>
                    </div>
                  ) : (
                    <p className="see-more" onClick={() => setShowFullDescription(true)}>
                      View full Job Description...
                    </p>
                  )}
                  <div className="job-likes-dislikes">
                    <div className="job-likes" onClick={() => handleShowLikesDislikes(job)}>
                      👍 {job.LikesCount}
                    </div>
                    <div className="job-dislikes" onClick={() => handleShowLikesDislikes(job)}>
                      👎 {job.DislikesCount}
                    </div>
                    <div className="job-applicants" onClick={() => handleShowApplicants(job)}>
                      Who's applied?
                    </div>
                  </div>
                  <button onClick={() => handleDeleteJob(job.ID)}>Delete</button>
                </div>
              ))}
            </div>
          ) : (
            <p>No job listings found.</p>
          )}
        </div>
      ) : (
        <p>Please log in to view your job listings.</p>
      )}
      {likesDislikesModalOpen && (
        <Modal
          isOpen={likesDislikesModalOpen}
          onClose={() => setLikesDislikesModalOpen(false)}
          title={modalTitle}
          likes={likes}
          dislikes={dislikes}
        />
      )}
      {applicantsModalOpen && (
        <JobApplicationsModal
          isOpen={applicantsModalOpen}
          onClose={() => setApplicantsModalOpen(false)}
          title={modalTitle}
          userApplications={userApplications}
        />
      )}
    </div>
  );
};

export default MyJobs;
