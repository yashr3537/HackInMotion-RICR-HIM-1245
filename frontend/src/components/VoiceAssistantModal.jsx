<<<<<<< HEAD
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
=======
import { AlertCircle, Loader2, Mic, MicOff, Send, Sparkles, Volume2, VolumeX, X } from 'lucide-react'

const STATUS_LABELS = {
  idle: 'Ready to listen',
  listening: 'Listening...',
  processing: 'Processing...',
  response: 'Response ready',
  speaking: 'AirGuard is speaking...',
}

export default function VoiceAssistantModal({
  onClose,
  onStartListening,
  onStopListening,
  onSubmitText,
  onStopSpeaking,
  status,
  transcript,
  responseText,
  errorMessage,
  isSupported,
  assistantLanguage,
  onLanguageChange,
  isListening,
  isSpeaking,
}) {
  const statusText = errorMessage || STATUS_LABELS[status] || 'Ready to listen'
  const languageOptions = [
    { value: 'en-IN', label: 'English (India)' },
    { value: 'hi-IN', label: 'Hindi (India)' },
  ]

  const handleSubmit = (event) => {
    event.preventDefault()
    const input = event.currentTarget.question.value.trim()

    if (!input) {
      return
    }

    onSubmitText(input)
    event.currentTarget.reset()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-forest-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-50 text-forest-700">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-900">Ask AirGuard</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700"
            aria-label="Close assistant"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 bg-ink-50 px-3 py-2">
            <div className="flex items-center gap-2 text-sm text-ink-600">
              {status === 'listening' ? <Mic size={16} className="text-forest-600" /> : status === 'speaking' ? <Volume2 size={16} className="text-forest-600" /> : <Sparkles size={16} className="text-forest-600" />}
              <span className="font-medium">{statusText}</span>
            </div>

            {isSpeaking && (
              <button
                type="button"
                onClick={onStopSpeaking}
                className="rounded-full border border-forest-200 bg-forest-50 px-2.5 py-1 text-[11px] font-semibold text-forest-800"
              >
                Stop Voice
              </button>
            )}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={isListening ? onStopListening : onStartListening}
              className={`flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-200 ${
                isListening
                  ? 'border-red-200 bg-red-50 text-red-600 shadow-[0_0_0_8px_rgba(239,68,68,0.07)]'
                  : 'border-forest-200 bg-forest-50 text-forest-700 hover:border-forest-300 hover:bg-forest-100'
              } ${!isSupported ? 'cursor-not-allowed opacity-60' : ''}`}
              disabled={!isSupported}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? <MicOff size={28} /> : <Mic size={28} />}
            </button>
          </div>

          {!isSupported && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              “Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.”
            </div>
          )}

          {errorMessage && isSupported && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="rounded-xl border border-ink-100 bg-ink-50 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">Live transcript</p>
            <p className="min-h-[44px] text-sm text-ink-700">
              {transcript || 'Your spoken question will appear here.'}
            </p>
          </div>

          {responseText && (
            <div className="rounded-xl border border-forest-100 bg-forest-50 p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-forest-700">AirGuard response</p>
              <p className="text-sm leading-6 text-ink-700">{responseText}</p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-ink-100 bg-white p-2.5">
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">Assistant language</label>
              <select
                value={assistantLanguage}
                onChange={(event) => onLanguageChange(event.target.value)}
                className="w-full rounded-lg border border-ink-200 bg-white px-2.5 py-2 text-sm text-ink-700 outline-none focus:border-forest-400"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-ink-100 bg-white p-2.5">
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">Voice response</label>
              <div className="flex h-[42px] items-center justify-between rounded-lg border border-ink-200 bg-ink-50 px-2.5 text-sm text-ink-700">
                {isSpeaking ? <Volume2 size={14} /> : <VolumeX size={14} />}
                <span>{isSpeaking ? 'Speaking' : 'Off'}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">Or type your question</label>
            <div className="flex gap-2">
              <input
                name="question"
                type="text"
                placeholder="Ask about AQI, alerts, jogging, or your area"
                className="min-w-0 flex-1 rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-800 outline-none placeholder:text-ink-400 focus:border-forest-400"
              />

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-forest-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-700"
              >
                <Send size={14} />
                Ask
              </button>
            </div>
          </form>

          {status === 'processing' && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              <Loader2 size={14} className="animate-spin" />
              Processing your request...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
>>>>>>> 29f5be1dd6ae768a7dc3697c773f03081eafe998
