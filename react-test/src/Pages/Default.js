// src/Pages/Default.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Default.css'; // Import the CSS file

const Default = () => {
  return (
    <div className="default-container">
      <header>
        <h1>Welcome to RecruiterRRRRRRRR</h1>
        <nav>
          <ul>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        </nav>
      </header>
      <main>
        <section>
          <h2>About Recruiter</h2>
          <p>
            Recruiter is a platform for sharing and exploring media content. Sign in to start your journey!
          </p>
        </section>
      </main>
      <footer>
        <p>Terms of Service | Privacy Policy | Contact Us</p>
        <ul>
          <li><a href="https://twitter.com/Recruiter" target="_blank" rel="noopener noreferrer">Twitter</a></li>
          <li><a href="https://facebook.com/Recruiter" target="_blank" rel="noopener noreferrer">Facebook</a></li>
          <li><a href="https://instagram.com/Recruiter" target="_blank" rel="noopener noreferrer">Instagram</a></li>
        </ul>
      </footer>
    </div>
  );
};

export default Default;
