import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import Modal from '../styles/Modal';
import JobApplicationsModal from '../styles/JobApplicationsModal'; 
import '../styles/MyJobs.css'; 

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

      // GET job listings associated with logged in user from SQL database
      // Requires userid
      // Goes to RecruitAppBackendSQLDB
      const response = await axios.get(`http://127.0.0.1:5001/joblistings?CosmosDBUserID=${user.id}`);
      const jobListingsWithFeedback = await Promise.all(
        response.data.map(async (job) => {

          // GET job feedback from SQL database to display likes/dislikes associated with job listing
          // Requires job ID
          // Goes to RecruitAppBackendSQLDB
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

      // GET job applications for job id
      // Requires job ID
      // Goes to RecruitAppBackendSQLDB
      const response = await axios.get(`http://127.0.0.1:5001/jobapplications?JobID=${jobId}`);
      const users = await Promise.all(
        response.data.map(async (application) => {
          
          // GET user details from API using CosmosDBUserID
          // Goes to RecruitAppBackend
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
      // GET job feedback for a users posted job  from SQL database
      // Requires job ID
      // Goes to RecruitAppBackendSQLDB
      const response = await axios.get(`http://127.0.0.1:5001/jobfeedback?JobID=${job.ID}`);
      const likedUsers = [];
      const dislikedUsers = [];

      for (const feedback of response.data) {
        
        // GET user details from API using CosmosDBUserID
        // Goes to RecruitAppBackend
        const userResponse = await axios.get(`http://127.0.0.1:5000/api/users/${feedback.CosmosDBUserID}`);
        console.log("4",userResponse.data)
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

      setShowFullDescription(false);
    } catch (error) {
      console.error('Error fetching user applications:', error.message);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      // DELETE users job listing from SQL database
      // Requires job ID
      // Goes to RecruitAppBackendSQLDB
      await axios.delete(`http://127.0.0.1:5001/joblistings/${jobId}`);
      fetchJobListings();
    } catch (error) {
      console.error('Error deleting job listing:', error.message);
    }
  };

  return (
    <div>
      <h1>You have posted the following job listings:</h1>
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
