// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Default from './Pages/Default';
import Login from './Pages/Login';
import Home from './Pages/Home';
import MediaUpload from './Pages/MediaUpload';
import UserProfile from './Pages/UserProfile';
import Navbar from './routes/Navbar';
import Register from './Pages/Register';
import MyResume from './Pages/MyResume'; // Import MyResume component
import NewJobListing from './Pages/NewJobListing';
import DisplayResume from './Pages/DisplayResume';
import { useAuth } from './hooks/useAuth';
import EditDetails from './Pages/EditDetails';
import MyJobs from './Pages/MyJobs'

const App = () => {
  console.log('Rendering App component.');

  const { isLoggedIn } = useAuth();

  const renderProtectedRoute = (element) => {
    console.log('Checking authentication status...');
    return isLoggedIn ? element : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Default />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/Home"
          element={renderProtectedRoute(<><Navbar /><Home /></>)}
        />
        <Route
          path="/MediaUpload"
          element={renderProtectedRoute(<><Navbar /><MediaUpload /></>)}
        />
        <Route
          path="/UserProfile"
          element={renderProtectedRoute(<><Navbar /><UserProfile /></>)}
        />
        <Route
          path="/DisplayResume"
          element={renderProtectedRoute(<><Navbar /><DisplayResume /></>)}
        />
        <Route
          path="/MyResume"
          element={renderProtectedRoute(<><Navbar /><MyResume /></>)}
        />
        <Route
          path="/NewJobListing"
          element={renderProtectedRoute(<><Navbar /><NewJobListing /></>)}
        />
        <Route
          path="/EditDetails"
          element={renderProtectedRoute(<><Navbar /><EditDetails /></>)}
        />
        <Route
          path="/MyJobListings"
          element={renderProtectedRoute(<><Navbar /><MyJobs /></>)}
        />
      </Routes>
    </Router>
  );
};

export default App;
