import { useState, useEffect, useRef } from 'react'
import {
  Mic,
  MicOff,
  Send,
  X,
  Volume2,
  VolumeX,
  Square,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { processVoiceAssistantQuery } from '../services/voiceAssistantService'
import { speakText, stopVoiceAlert, isVoiceSupported } from '../services/voiceAlert'
import { useAuth } from '../auth'

export default function VoiceAssistantModal({ isOpen, onClose }) {
  const { currentUser } = useAuth()
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Namaste! I am your Environmental Voice Assistant. Ask me about air quality, weather, pollution, risk, saved locations, or outdoor activities (e.g., 'Betul ka AQI?', 'Betul ka weather?', 'Is outdoor running safe?').",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const [sessionContext, setSessionContext] = useState({})
  const recognitionRef = useRef(null)
  const chatBottomRef = useRef(null)

  // Auto scroll chat to bottom when messages update
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isListening, isProcessing, interimTranscript])

  // Initialize SpeechRecognition on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = 'en-IN'

        recognition.onstart = () => {
          setIsListening(true)
          setInterimTranscript('')
          setErrorMessage(null)
        }

        recognition.onresult = (event) => {
          let interim = ''
          let final = ''

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript
            } else {
              interim += event.results[i][0].transcript
            }
          }

          if (interim) {
            setInterimTranscript(interim)
          }

          if (final) {
            setInputText(final)
            handleSendMessage(final)
            setIsListening(false)
            setInterimTranscript('')
          }
        }

        recognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error)
          setIsListening(false)
          setInterimTranscript('')

          if (event.error === 'not-allowed') {
            setErrorMessage('Microphone access denied. Please grant permission in browser settings.')
          } else if (event.error === 'no-speech') {
            setErrorMessage('No speech detected. Please try speaking again.')
          } else if (event.error === 'network') {
            setErrorMessage('Network error during speech recognition.')
          } else {
            setErrorMessage(`Speech recognition error: ${event.error}`)
          }
        }

        recognition.onend = () => {
          setIsListening(false)
          setInterimTranscript('')
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {}
      }
      stopVoiceAlert()
    }
  }, [])

  if (!isOpen) return null

  const handleStartListening = () => {
    setErrorMessage(null)
    stopVoiceAlert()
    setIsSpeaking(false)

    if (!recognitionRef.current) {
      setErrorMessage('Speech recognition is not supported in this browser. Please use text input instead.')
      return
    }

    try {
      recognitionRef.current.start()
    } catch (e) {
      console.warn('Recognition start failed:', e)
      try {
        recognitionRef.current.stop()
        setTimeout(() => recognitionRef.current.start(), 200)
      } catch (err) {
        setErrorMessage('Unable to activate microphone. Please try typing your request.')
      }
    }
  }

  const handleStopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
    }
    setIsListening(false)
    setInterimTranscript('')
  }

  const handleSendMessage = async (textToSend = null) => {
    const rawQuery = textToSend ?? inputText
    const trimmed = String(rawQuery || '').trim()

    if (!trimmed) return

    setInputText('')
    setErrorMessage(null)
    stopVoiceAlert()
    setIsSpeaking(false)

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      time: timeStr,
    }

    setMessages((prev) => [...prev, userMsg])
    setIsProcessing(true)

    try {
      const response = await processVoiceAssistantQuery(trimmed, sessionContext, currentUser?.id)
      
      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        understood: response.understood,
      }

      setMessages((prev) => [...prev, assistantMsg])
      setSessionContext(response.context)

      if (autoSpeak && isVoiceSupported()) {
        setIsSpeaking(true)
        speakText(response.text).then(() => {
          setIsSpeaking(false)
        })
      }
    } catch (err) {
      console.error('Voice assistant query error:', err)
      const errorMsg = {
        id: `assistant-err-${Date.now()}`,
        sender: 'assistant',
        text: "I encountered an issue retrieving real environmental data. Please try again in a moment.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        understood: false,
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStopSpeech = () => {
    stopVoiceAlert()
    setIsSpeaking(false)
  }

  const handleResetChat = () => {
    stopVoiceAlert()
    setIsSpeaking(false)
    setSessionContext({})
    setErrorMessage(null)
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: "Conversation reset! How can I assist you with air quality or weather data?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className="flex flex-col w-full max-w-2xl h-[85vh] max-h-[700px] rounded-2xl border border-forest-700/20 bg-surface shadow-2xl overflow-hidden scale-in"
        role="dialog"
        aria-modal="true"
        aria-label="Voice Assistant"
      >
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-forest-950 text-white border-b border-forest-900">
          <div className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-forest-800 border border-forest-600/30 text-forest-300">
              <Bot size={22} />
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-forest-500" />
                </span>
              )}
            </span>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-semibold text-base sm:text-lg tracking-tight">
                  Voice Assistant
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-forest-500/20 border border-forest-400/30 px-2 py-0.5 text-[10px] font-semibold text-forest-300">
                  <Sparkles size={10} /> Live Data
                </span>
              </div>
              <p className="text-xs text-forest-200/70">
                AirGuard AI • Environmental Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Auto speak toggle */}
            <button
              type="button"
              onClick={() => {
                if (isSpeaking) handleStopSpeech()
                setAutoSpeak(!autoSpeak)
              }}
              className={`p-2 rounded-lg transition-colors ${
                autoSpeak
                  ? 'bg-forest-800 text-forest-200 hover:bg-forest-700'
                  : 'text-forest-400 hover:bg-forest-900 hover:text-forest-200'
              }`}
              title={autoSpeak ? 'Voice Responses ON' : 'Voice Responses OFF'}
            >
              {autoSpeak ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            {/* Stop current speech button */}
            {isSpeaking && (
              <button
                type="button"
                onClick={handleStopSpeech}
                className="p-2 rounded-lg bg-red-900/60 text-red-200 hover:bg-red-800 transition-colors animate-pulse"
                title="Stop Voice Output"
              >
                <Square size={16} />
              </button>
            )}

            {/* Clear session context */}
            <button
              type="button"
              onClick={handleResetChat}
              className="p-2 rounded-lg text-forest-300 hover:bg-forest-900 hover:text-white transition-colors"
              title="Reset Conversation"
            >
              <RotateCcw size={18} />
            </button>

            {/* Close modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-forest-300 hover:bg-forest-900 hover:text-white transition-colors ml-1"
              aria-label="Close Assistant"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ================= CHAT CONVERSATION HISTORY ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-canvas/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-forest-800 text-forest-300 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-forest-700 text-white rounded-br-none'
                    : msg.understood === false
                      ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-ink-800 dark:text-amber-100 rounded-bl-none'
                      : 'bg-surface border border-ink-100 dark:border-ink-800 text-ink-900 dark:text-white rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`mt-1.5 text-[10px] text-right font-medium opacity-70 ${
                    msg.sender === 'user' ? 'text-forest-100' : 'text-ink-400'
                  }`}
                >
                  {msg.time}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-ink-200 dark:bg-ink-700 text-ink-700 dark:text-ink-200 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-forest-800 text-forest-300 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="rounded-2xl rounded-bl-none bg-surface border border-ink-100 px-4 py-3 text-xs font-medium text-ink-600 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-forest-600" />
                Processing live environmental data...
              </div>
            </div>
          )}

          {/* Active Listening Indicator */}
          {isListening && (
            <div className="flex flex-col items-center justify-center py-4 bg-forest-50 dark:bg-forest-950/60 rounded-2xl border border-forest-200 dark:border-forest-800 animate-pulse">
              <div className="relative flex items-center justify-center mb-2">
                <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-forest-400 opacity-75" />
                <div className="w-10 h-10 rounded-full bg-forest-600 text-white flex items-center justify-center relative">
                  <Mic size={20} />
                </div>
              </div>
              <p className="text-xs font-semibold text-forest-800 dark:text-forest-200">Listening to your voice...</p>
              <p className="text-[11px] text-forest-600 dark:text-forest-400 italic mt-1 px-4 text-center">
                {interimTranscript || 'Speak clearly into your microphone...'}
              </p>
              <button
                type="button"
                onClick={handleStopListening}
                className="mt-3 px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                <MicOff size={12} /> Stop Listening
              </button>
            </div>
          )}

          {/* Error Message Box */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-surface border-t border-ink-100 dark:border-ink-800 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400 shrink-0">Try asking:</span>
          {[
            'Betul ka AQI kaisa hai?',
            'Betul ka weather?',
            'Delhi aur Bhopal compare karo',
            'Is outdoor running safe?',
            'Meri saved locations ka status?',
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="shrink-0 px-2.5 py-1 rounded-full border border-forest-200 dark:border-forest-800 bg-forest-50/50 dark:bg-forest-950/40 text-forest-800 dark:text-forest-300 hover:bg-forest-100 dark:hover:bg-forest-900 transition-colors text-[11px]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* ================= CONTROLS & INPUT ================= */}
        <div className="p-3 sm:p-4 bg-surface border-t border-ink-100 dark:border-ink-800">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex items-center gap-2"
          >
            {/* Microphone button */}
            <button
              type="button"
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`p-3 rounded-xl transition-all duration-300 shrink-0 shadow-sm ${
                isListening
                  ? 'bg-red-600 text-white animate-bounce'
                  : 'bg-forest-50 dark:bg-forest-900 text-forest-700 dark:text-forest-300 hover:bg-forest-100 border border-forest-200 dark:border-forest-800'
              }`}
              title={isListening ? 'Stop Listening' : 'Speak via Microphone'}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about AQI, weather, safety (e.g. 'Betul ka AQI?')..."
              className="flex-1 bg-canvas/60 border border-ink-200 dark:border-ink-700 rounded-xl px-4 py-2.5 text-sm text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-forest-500"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="p-3 rounded-xl bg-forest-700 text-white font-semibold hover:bg-forest-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 shadow-sm"
              title="Send Message"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
