import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import '../styles/Home.css';

const Home = () => {

  // variables
  const [allJobListings, setAllJobListings] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [likedJobs, setLikedJobs] = useState([]);
  const [dislikedJobs, setDislikedJobs] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAllJobListings = async () => {
      try {
        // get all job listings from SQL database
        // goes to RecruitAppBackendSQLDB
        const response = await axios.get('http://127.0.0.1:5001/joblistings');
        setAllJobListings(response.data);
      } catch (error) {
        console.error('Error fetching all job listings:', error.message);
      }
    };

    fetchAllJobListings();
  }, []);

  const handleJobClick = (job) => {
    if (selectedJob === job) {
      setSelectedJob(null);
      setShowFullDescription(false);
    } else {
      setSelectedJob(job);
      setShowFullDescription(true);
    }
  };

  const handleApply = async (job, event) => {
    try {
      event.stopPropagation();

      const cosmosDBUserId = user.id;
      const jobId = job.ID;
      
      // Post an application to SQL database
      // requires userid and jobid
      // goes to RecruitAppBackendSQLDB
      if (cosmosDBUserId && jobId) {
        const response = await axios.post('http://127.0.0.1:5001/jobapplications', {
          JobID: jobId,
          CosmosDBUserID: cosmosDBUserId,
        });

        if (response.data.message) {
          alert(response.data.message);
        }
      } else {
        console.error('Cosmos DB user ID or Job ID not found.');
      }
    } catch (error) {
      console.error('Error applying to job:', error.message);

      if (error.response && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert('An error occurred while applying to the job. Please try again.');
      }
    }
  };

  const handleLike = async (job, event) => {
    event.stopPropagation();

    const jobId = job.ID;

    if (!likedJobs.includes(jobId) && !dislikedJobs.includes(jobId)) {
      try {

        // updates job listings by job id for SQL database
        // goes to RecruitAppBackendSQLDB
        const response = await axios.put(`http://127.0.0.1:5001/joblistings/${jobId}`, {
          LikesCount: job.LikesCount + 1,
        });

        // Post feedback in response to likes to SQL database
        // requires userid and jobid
        // goes to RecruitAppBackendSQLDB
        await axios.post('http://127.0.0.1:5001/jobfeedback', {
          JobID: jobId,
          CosmosDBUserID: user.id,
          IsLiked: true,
          CreatedAt: new Date().toISOString(),
        });

        setLikedJobs([...likedJobs, jobId]);
        setAllJobListings(allJobListings.map((j) => (j.ID === jobId ? { ...j, LikesCount: j.LikesCount + 1 } : j)));
      } catch (error) {
        console.error('Error liking job:', error.message);
      }
    } else {
      console.log('Job already liked or disliked:', jobId);
    }
  };

  const handleDislike = async (job, event) => {
    event.stopPropagation();

    const jobId = job.ID;

    if (!dislikedJobs.includes(jobId) && !likedJobs.includes(jobId)) {
      try {

        // UPDATES job listings by job id for SQL database
        // goes to RecruitAppBackendSQLDB
        const response = await axios.put(`http://127.0.0.1:5001/joblistings/${jobId}`, {
          DislikesCount: job.DislikesCount + 1,
        });

        // Post feedback in response to dislikes to SQL database
        // requires userid and jobid
        // goes to RecruitAppBackendSQLDB
        await axios.post('http://127.0.0.1:5001/jobfeedback', {
          JobID: jobId,
          CosmosDBUserID: user.id,
          IsLiked: false,
          CreatedAt: new Date().toISOString(),
        });

        setDislikedJobs([...dislikedJobs, jobId]);
        setAllJobListings(allJobListings.map((j) => (j.ID === jobId ? { ...j, DislikesCount: j.DislikesCount + 1 } : j)));
      } catch (error) {
        console.error('Error disliking job:', error.message);
      }
    } else {
      console.log('Job already disliked or liked:', jobId);
    }
  };

  return (
    <div>
      <h1 style={{ marginLeft: '15px' }}>Featured Jobs:</h1>
      <div className="job-listings">
        {allJobListings.length > 0 ? (
          allJobListings.map((job) => (
            <div key={job.id} className={`job-box ${selectedJob === job ? 'selected' : ''}`} onClick={() => handleJobClick(job)}>
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
                <div className="job-likes" onClick={(event) => handleLike(job, event)}>
                  👍 {job.LikesCount}
                </div>
                <div className="job-dislikes" onClick={(event) => handleDislike(job, event)}>
                  👎 {job.DislikesCount}
                </div>
              </div>
              <button className="apply-button" onClick={(event) => handleApply(job, event)}>
                Apply
              </button>
            </div>
          ))
        ) : (
          <p>No job listings found.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
