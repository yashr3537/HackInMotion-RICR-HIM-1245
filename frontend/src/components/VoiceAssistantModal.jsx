import React, { useEffect, useState } from 'react';
import useVoiceAssistant from '../hooks/useVoiceAssistant';
import '../styles/VoiceAssistantModal.css';

const VoiceAssistantModal = ({ isOpen, onClose }) => {
  const {
    isListening,
    transcript,
    result,
    error,
    isSpeaking,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceAssistant();

  const [localTranscript, setLocalTranscript] = useState('');

  useEffect(() => {
    setLocalTranscript(transcript);
  }, [transcript]);

  if (!isOpen) return null;

  return (
    <div className="voice-modal-overlay" onClick={onClose}>
      <div className="voice-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="voice-modal-header">
          <h2 className="voice-modal-title">Voice Assistant</h2>
          <button className="voice-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className="voice-modal-content">
          {/* Microphone Icon & Status */}
          <div className="voice-mic-section">
            <div className={`voice-mic-icon ${isListening ? 'listening' : ''}`}>
              🎙️
            </div>
            <p className="voice-status-text">
              {isListening ? 'Listening...' : isSpeaking ? 'Processing...' : 'Ready'}
            </p>
          </div>

          {/* Transcript Display */}
          {localTranscript && (
            <div className="voice-transcript-box">
              <p className="voice-transcript-label">You said:</p>
              <p className="voice-transcript-text">"{localTranscript}"</p>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="voice-result-box">
              <p className="voice-result-label">Response:</p>
              <div className="voice-result-content">
                {typeof result === 'string' ? (
                  <p>{result}</p>
                ) : (
                  <>
                    {result.title && <h3>{result.title}</h3>}
                    {result.aqi && (
                      <div className="voice-result-aqi">
                        <p><strong>AQI:</strong> {result.aqi}</p>
                        <p><strong>Risk:</strong> {result.risk}</p>
                      </div>
                    )}
                    {result.description && <p>{result.description}</p>}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Example Commands */}
          {!localTranscript && !result && (
            <div className="voice-examples">
              <p className="voice-examples-label">Example commands:</p>
              <ul className="voice-examples-list">
                <li>"What is the AQI in Betul?"</li>
                <li>"Show me air quality in Mumbai"</li>
                <li>"Is the air quality good today?"</li>
              </ul>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="voice-error-box">
              <p className="voice-error-text">{error}</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="voice-modal-controls">
          <button
            className={`voice-control-btn mic-btn ${isListening ? 'active' : ''}`}
            onClick={isListening ? stopListening : startListening}
            disabled={isSpeaking}
          >
            <span className="mic-icon">🎤</span>
            <span className="mic-text">
              {isListening ? 'Stop' : 'Start'}
            </span>
          </button>

          {localTranscript && (
            <button
              className="voice-control-btn clear-btn"
              onClick={resetTranscript}
            >
              <span className="clear-icon">🔄</span>
              <span className="clear-text">Clear</span>
            </button>
          )}

          <button
            className="voice-control-btn close-btn"
            onClick={onClose}
          >
            <span className="close-icon">✕</span>
            <span className="close-text">Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistantModal;
