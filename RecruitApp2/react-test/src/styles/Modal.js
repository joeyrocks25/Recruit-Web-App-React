// Modal.js

import React from 'react';

const Modal = ({ isOpen, onClose, title, likes, dislikes }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{title}</h2>
        <div className="likes">
          <h3>Likes</h3>
          {likes.map((user) => (
            <div key={user} className="user-box">
              <span role="img" aria-label="Thumbs Up">👍</span> {user}
            </div>
          ))}
        </div>
        <div className="dislikes">
          <h3>Dislikes</h3>
          {dislikes.map((user) => (
            <div key={user} className="user-box">
              <span role="img" aria-label="Thumbs Down">👎</span> {user}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Modal;
