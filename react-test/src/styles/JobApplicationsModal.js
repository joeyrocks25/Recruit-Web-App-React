// JobApplicationsModal.js

import React from 'react';

const JobApplicationsModal = ({ isOpen, onClose, title, userApplications }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{title}</h2>
        <div className="job-applications">
          <h3>Applicants</h3>
          {userApplications.map((applicant) => (
            <div key={applicant.CosmosDBUserID} className="applicant-box">
              <div>
                <strong>{applicant.username}</strong>
              </div>
              <div>{applicant.email}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobApplicationsModal;
