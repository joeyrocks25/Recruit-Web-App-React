import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';
 
export const postJobListing = async (user_id, jobData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/job-listings/?user_id=${user_id}`, jobData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getJobListingsByUserId = async (user_id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/job-listings/?user_id=${user_id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
