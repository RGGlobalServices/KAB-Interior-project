import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle',
    warning: 'fa-exclamation-triangle',
  };

  const colors = {
    success: 'toast-success',
    error: 'toast-error',
    info: 'toast-info',
    warning: 'bg-yellow-500 text-white',
  };

  return (
    <div className={`toast ${colors[type]}`}>
      <i className={`fas ${icons[type]} text-xl`}></i>
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 hover:opacity-75 transition-opacity"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Toast;

