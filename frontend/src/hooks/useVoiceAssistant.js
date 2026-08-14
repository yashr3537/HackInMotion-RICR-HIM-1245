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
