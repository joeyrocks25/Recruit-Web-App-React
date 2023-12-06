// Navbar.js
import React from 'react';
import { Link, useMatch, useResolvedPath } from 'react-router-dom';
import '../styles/Navbar.css'; // Import your CSS file for styling

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="site-title">
        Recruiter
      </Link>
      <ul className="nav-links">
        <CustomLink to="/Home">Home</CustomLink>
        <CustomLink to="/UserProfile">User Profile</CustomLink>
      </ul>
    </nav>
  );
}

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <li className={`nav-item ${isActive ? 'active' : ''}`}>
      <Link to={resolvedPath.pathname} {...props}>
        {children}
      </Link>
    </li>
  );
}
