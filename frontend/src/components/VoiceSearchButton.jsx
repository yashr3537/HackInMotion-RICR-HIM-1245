<<<<<<< HEAD
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
=======
import { Mic } from 'lucide-react'

export default function VoiceSearchButton({ onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title="Ask AirGuard"
      aria-label="Ask AirGuard"
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-forest-200 bg-forest-50 text-forest-700 transition-all duration-200 hover:border-forest-300 hover:bg-forest-100 hover:text-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Mic size={15} />
    </button>
  )
}
>>>>>>> 29f5be1dd6ae768a7dc3697c773f03081eafe998
