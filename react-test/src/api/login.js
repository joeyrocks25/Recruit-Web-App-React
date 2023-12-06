// login.js

const BASE_URL = 'http://localhost:5000/api';

export const loginUser = async (username, password) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    console.log('Login response data:', data); // Log the data
    return data.token;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

