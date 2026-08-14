<<<<<<< HEAD
import { useState, useCallback, useEffect } from 'react';
import { processVoiceCommand } from '../data/voiceCommands';

const useVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const SpeechRecognition =
    typeof window !== 'undefined' && 
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    if (!recognition) return;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.language = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          setTranscript(transcript);
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript) {
        setTranscript(interimTranscript);
      }
    };

    recognition.onerror = (event) => {
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      recognition.abort();
    };
  }, [recognition]);

  const startListening = useCallback(() => {
    if (!recognition) {
      setError('Speech Recognition not supported in your browser');
      return;
    }

    setTranscript('');
    setError('');
    setResult(null);

    try {
      recognition.start();
    } catch (err) {
      console.log('Recognition already running');
    }
  }, [recognition]);

  const stopListening = useCallback(async () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);

    if (transcript) {
      setIsSpeaking(true);
      try {
        const voiceResult = await processVoiceCommand(transcript);
        setResult(voiceResult);
      } catch (err) {
        setError('Could not process your request');
      } finally {
        setIsSpeaking(false);
      }
    }
  }, [recognition, transcript]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setResult(null);
    setError('');
  }, []);

  return {
    isListening,
    transcript,
    result,
    error,
    isSpeaking,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useVoiceAssistant;
=======
import { useCallback, useEffect, useRef, useState } from 'react'

import { getStoredVoiceLanguage, isVoiceSupported, speakText } from '../services/voiceAlert'
import { runVoiceCommand } from '../utils/voiceCommands'

const STATUS = {
  idle: 'idle',
  listening: 'listening',
  processing: 'processing',
  response: 'response',
  speaking: 'speaking',
}

const ERROR_MESSAGES = {
  'no-speech': "I didn't hear anything. Please try again.",
  'not-allowed': 'Microphone access is blocked. Please allow microphone access in your browser settings and try again.',
  'permission-denied': 'Microphone access is blocked. Please allow microphone access in your browser settings and try again.',
  'audio-capture': 'Microphone is unavailable. Please check your microphone and try again.',
  network: 'Voice recognition is temporarily unavailable. Please try again in a moment.',
  'service-not-allowed': 'Voice recognition is temporarily unavailable. Please try again in a moment.',
  aborted: 'Voice recognition was cancelled. Please try again.',
}

export default function useVoiceAssistant({ autoSpeak = false } = {}) {
  const [status, setStatus] = useState(STATUS.idle)
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [responseText, setResponseText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [assistantLanguage, setAssistantLanguage] = useState(getStoredVoiceLanguage())
  const [isSpeaking, setIsSpeaking] = useState(false)

  const recognitionRef = useRef(null)
  const hasValidResultRef = useRef(false)
  const onTranscriptRef = useRef(null)

  const setStatusMessage = useCallback((nextStatus, nextError = '') => {
    setStatus(nextStatus)
    if (nextError) {
      setErrorMessage(nextError)
    }
  }, [])

  const mapRecognitionError = useCallback((eventError) => {
    if (!eventError) return 'Voice recognition is temporarily unavailable. Please try again in a moment.'

    return ERROR_MESSAGES[eventError] || 'Voice recognition is temporarily unavailable. Please try again in a moment.'
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsSupported(false)
      setStatusMessage(STATUS.idle)
      setErrorMessage('Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.')
      return undefined
    }

    setIsSupported(true)
    console.log('Speech recognition supported')

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = assistantLanguage
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      console.log('Recognition started')
      setStatusMessage(STATUS.listening)
      setIsListening(true)
      setErrorMessage('')
      hasValidResultRef.current = false
      setTranscript('')
    }

    recognition.onresult = (event) => {
      const transcriptText = event.results?.[0]?.[0]?.transcript || ''

      if (!transcriptText) {
        return
      }

      const finalTranscript = transcriptText.trim()
      hasValidResultRef.current = true
      setTranscript(finalTranscript)
      console.log('Speech result received:', finalTranscript)
      if (typeof onTranscriptRef.current === 'function') {
        onTranscriptRef.current(finalTranscript)
      }
      setStatusMessage(STATUS.processing)
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setErrorMessage(mapRecognitionError(event.error))
      setStatusMessage(STATUS.idle)
      setIsListening(false)
    }

    recognition.onend = () => {
      console.log('Recognition ended')
      setIsListening(false)

      if (hasValidResultRef.current) {
        setStatusMessage(STATUS.processing)
        return
      }

      setStatusMessage(STATUS.idle)
    }

    recognitionRef.current = recognition

    return () => {
      try {
        recognition.stop()
      } catch (error) {
        console.warn('Speech recognition cleanup warning:', error)
      }
    }
  }, [assistantLanguage, mapRecognitionError, setStatusMessage])

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setErrorMessage('Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.')
      setStatusMessage(STATUS.idle)
      return
    }

    try {
      console.log('Starting recognition...')
      setTranscript('')
      setResponseText('')
      setErrorMessage('')
      hasValidResultRef.current = false
      recognitionRef.current.lang = assistantLanguage
      recognitionRef.current.start()
    } catch (error) {
      console.warn('Recognition start warning:', error)
      setStatusMessage(STATUS.idle)
    }
  }, [assistantLanguage, isSupported, setStatusMessage])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return

    try {
      recognitionRef.current.stop()
      setIsListening(false)
      setStatusMessage(STATUS.idle)
    } catch (error) {
      console.warn('Recognition stop warning:', error)
    }
  }, [setStatusMessage])

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    setIsSpeaking(false)
    setStatusMessage(STATUS.response)
  }, [setStatusMessage])

  const speakAnswer = useCallback(async (textToSpeak) => {
    if (!textToSpeak) {
      return null
    }

    if (!isVoiceSupported()) {
      return { success: false, reason: 'not-supported' }
    }

    setStatusMessage(STATUS.speaking)
    setIsSpeaking(true)

    const result = await speakText(textToSpeak, {
      language: assistantLanguage,
      rate: 0.95,
      pitch: 1,
      volume: 1,
    })

    setIsSpeaking(false)

    if (result?.success !== false) {
      setStatusMessage(STATUS.response)
    }

    return result
  }, [assistantLanguage, setStatusMessage])

  const handleTextSubmit = useCallback(async (text) => {
    const cleanText = String(text || '').trim()

    if (!cleanText) {
      return null
    }

    setTranscript(cleanText)
    if (typeof onTranscriptRef.current === 'function') {
      onTranscriptRef.current(cleanText)
    }
    setErrorMessage('')
    setStatusMessage(STATUS.processing)

    const result = await runVoiceCommand(cleanText, {
      language: assistantLanguage,
    })

    if (!result) {
      setStatusMessage(STATUS.response)
      setResponseText('I could not process that request. Please try again.')
      return { response: 'I could not process that request. Please try again.' }
    }

    setResponseText(result.response)
    setStatusMessage(STATUS.response)

    if (autoSpeak && result.spokenText) {
      await speakAnswer(result.spokenText)
    }

    return result
  }, [assistantLanguage, autoSpeak, setStatusMessage, speakAnswer])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!('speechSynthesis' in window)) {
      return
    }

    const handleVoicesChanged = () => {
      const currentVoiceLanguage = getStoredVoiceLanguage()
      setAssistantLanguage(currentVoiceLanguage)
    }

    window.speechSynthesis.addEventListener?.('voiceschanged', handleVoicesChanged)

    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', handleVoicesChanged)
    }
  }, [])

  return {
    status,
    isSupported,
    isListening,
    isSpeaking,
    transcript,
    responseText,
    errorMessage,
    assistantLanguage,
    setAssistantLanguage,
    setTranscriptCallback: (callback) => {
      onTranscriptRef.current = callback
    },
    startListening,
    stopListening,
    stopSpeaking,
    speakAnswer,
    handleTextSubmit,
  }
}

export { STATUS }
>>>>>>> 29f5be1dd6ae768a7dc3697c773f03081eafe998
