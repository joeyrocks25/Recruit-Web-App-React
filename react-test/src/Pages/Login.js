// Login.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/login';
import { useAuth } from '../hooks/useAuth';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
      console.log('Logging in...');
      const token = await loginUser(username, password);
      console.log('Login successful. Received token:', token);
      
      login(token);
      console.log('User authenticated. Redirecting to Home...');
      navigate('/Home');
    } catch (error) {
      console.error('Error during login:', error);
      // Handle login error (show an error message, etc.)
    }
  };

  return (
    <div className="login-container">
      <header>
        <h2>Login</h2>
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          <label>
            Username:
            <input type="text" name="username" />
          </label>
          <br />
          <label>
            Password:
            <input type="password" name="password" />
          </label>
          <br />
          <button type="submit">Login</button>
        </form>
      </main>
      <footer>
        <p>© 2023 Recruiter. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;
