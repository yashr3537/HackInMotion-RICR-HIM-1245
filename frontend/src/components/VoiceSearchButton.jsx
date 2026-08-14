import React from 'react';
import '../styles/VoiceSearchButton.css';

const VoiceSearchButton = ({ onClick }) => {
  return (
    <button 
      className="voice-search-button" 
      onClick={onClick}
      title="Open Voice Assistant"
      aria-label="Voice Assistant"
    >
      🎤
    </button>
  );
};

export default VoiceSearchButton;
