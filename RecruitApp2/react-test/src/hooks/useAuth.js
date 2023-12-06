// useAuth.js
import { useState, useEffect } from 'react';

const TOKEN_KEY = 'token';

export const useAuth = () => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if a token is stored in local storage
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('Checking authentication.... Token:', token);
    
    if (token) {
      // Decode the token and set the user information
      const decodedToken = decodeToken(token);
      console.log('Decoded Token:', decodedToken);
      setUser(decodedToken);
      setLoggedIn(true);
    }
  }, []);

  const decodeToken = (token) => {
    // Perform decoding logic here
    // Example: For simplicity, assuming the token is a base64-encoded JSON
    const decodedString = atob(token.split('.')[1]);
    const user = JSON.parse(decodedString);
    console.log('Decoded User:', user);
    return user;
  };

  const login = (token) => {
    // Decode the token and set the user information
    const decodedToken = decodeToken(token);
    console.log('User logged in. Token:', token);
    console.log('Decoded Token:', decodedToken);
    setUser(decodedToken);
    localStorage.setItem(TOKEN_KEY, token);
    setLoggedIn(true);
  };

  const logout = () => {
    console.log('User logged out.');
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setLoggedIn(false);
  };

  return {
    isLoggedIn,
    user,
    login,
    logout,
  };
};
