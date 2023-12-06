import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const register = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/users/`, formData);
    return response.data;
  } catch (error) {
    throw new Error(`Registration failed: ${error.message}`);
  }
};

const updateUserDetails = async (userId, updatedData) => {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}`, updatedData);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update user details: ${error.message}`);
  }
};

const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
};

export { register, updateUserDetails, deleteUser };
