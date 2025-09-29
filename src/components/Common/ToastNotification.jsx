import React, { useEffect } from 'react';

const ToastNotification = ({ message, isVisible, onHide, duration = 1500 }) => {
  useEffect(() => {
    if (isVisible && message) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, message, onHide, duration]);

  if (!message) return null;

  return (
    <div className={`toast ${isVisible ? 'show' : ''}`}>
      {message}
    </div>
  );
};

export default ToastNotification;