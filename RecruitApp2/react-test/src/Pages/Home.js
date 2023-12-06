import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const [allJobListings, setAllJobListings] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [likedJobs, setLikedJobs] = useState([]);
  const [dislikedJobs, setDislikedJobs] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAllJobListings = async () => {
      try {
        // Fetch all job listings
        const response = await axios.get('http://127.0.0.1:5001/joblistings');
        setAllJobListings(response.data);
        console.log("r is:", response.data);
      } catch (error) {
        console.error('Error fetching all job listings:', error.message);
        // Handle errors or display a user-friendly message
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
      // Stop the event propagation to prevent expanding/collapsing
      event.stopPropagation();
  
      const cosmosDBUserId = user.id;
      const jobId = job.ID;
  
      if (cosmosDBUserId && jobId) {
        // Make a POST request to the jobapplications endpoint
        const response = await axios.post('http://127.0.0.1:5001/jobapplications', {
          JobID: jobId,
          CosmosDBUserID: cosmosDBUserId,
        });
  
        console.log('Application successful:', response.data);
  
        // Check for a custom message in the response
        if (response.data.message) {
          alert(response.data.message); // Display a message to the user
        }
  
        // You can handle the response as needed
      } else {
        console.error('Cosmos DB user ID or Job ID not found.');
      }
    } catch (error) {
      console.error('Error applying to job:', error.message);
  
      // Check for a custom message in the error response
      if (error.response && error.response.data.message) {
        alert(error.response.data.message); // Display a message to the user
      } else {
        // Handle errors or display a generic user-friendly message
        alert('An error occurred while applying to the job. Please try again.');
      }
    }
  };
  

  const handleLike = async (job, event) => {
    // Stop the event propagation to prevent expanding/collapsing
    event.stopPropagation();

    const jobId = job.ID;

    if (!likedJobs.includes(jobId) && !dislikedJobs.includes(jobId)) {
      try {
        // Make a PUT request to the joblistings endpoint to update the like count
        const response = await axios.put(`http://127.0.0.1:5001/joblistings/${jobId}`, {
          LikesCount: job.LikesCount + 1,
        });

        // Post job feedback
        await axios.post('http://127.0.0.1:5001/jobfeedback', {
          JobID: jobId,
          CosmosDBUserID: user.id,
          IsLiked: true,
          CreatedAt: new Date().toISOString(),
        });

        // Update the liked jobs list and job listings on the frontend
        setLikedJobs([...likedJobs, jobId]);
        setAllJobListings(allJobListings.map((j) => (j.ID === jobId ? { ...j, LikesCount: j.LikesCount + 1 } : j)));

        console.log('Liked job:', jobId);
        console.log('Updated job listing:', response.data);
      } catch (error) {
        console.error('Error liking job:', error.message);
        // Handle errors or display a user-friendly message
      }
    } else {
      console.log('Job already liked or disliked:', jobId);
    }
  };

  const handleDislike = async (job, event) => {
    // Stop the event propagation to prevent expanding/collapsing
    event.stopPropagation();

    const jobId = job.ID;

    if (!dislikedJobs.includes(jobId) && !likedJobs.includes(jobId)) {
      try {
        // Make a PUT request to the joblistings endpoint to update the dislike count
        const response = await axios.put(`http://127.0.0.1:5001/joblistings/${jobId}`, {
          DislikesCount: job.DislikesCount + 1,
        });

        // Post job feedback
        await axios.post('http://127.0.0.1:5001/jobfeedback', {
          JobID: jobId,
          CosmosDBUserID: user.id,
          IsLiked: false,
          CreatedAt: new Date().toISOString(),
        });

        // Update the disliked jobs list and job listings on the frontend
        setDislikedJobs([...dislikedJobs, jobId]);
        setAllJobListings(allJobListings.map((j) => (j.ID === jobId ? { ...j, DislikesCount: j.DislikesCount + 1 } : j)));

        console.log('Disliked job:', jobId);
        console.log('Updated job listing:', response.data);
      } catch (error) {
        console.error('Error disliking job:', error.message);
        // Handle errors or display a user-friendly message
      }
    } else {
      console.log('Job already disliked or liked:', jobId);
    }
  };

  return (
    <div>
      <h1 style={{ marginLeft: '15px' }}>Featured Jobs:</h1>
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
          .see-more {
            cursor: pointer;
            color: #007bff; /* Set the text color to blue */
            text-decoration: underline;
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
          }

          .job-likes, .job-dislikes {
            font-size: 0.9rem;
          }
        `}
      </style>
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
