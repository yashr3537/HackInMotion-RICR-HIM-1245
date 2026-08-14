import { useEffect, useState } from 'react'

import useVoiceAssistant from '../hooks/useVoiceAssistant'
import VoiceAssistantModal from './VoiceAssistantModal'

export default function VoiceAssistant({ open = false, onClose, onTranscript }) {
  const assistant = useVoiceAssistant({ autoSpeak: false })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    assistant.setTranscriptCallback(onTranscript || null)
  }, [assistant, onTranscript])

  useEffect(() => {
    setMounted(open)
  }, [open])

  if (!mounted || !open) {
    return null
  }

  const handleLanguageChange = (nextLanguage) => {
    assistant.setAssistantLanguage(nextLanguage)
    localStorage.setItem('airguard-voice-language', nextLanguage)
  }

  return (
    <VoiceAssistantModal
      onClose={onClose}
      onStartListening={assistant.startListening}
      onStopListening={assistant.stopListening}
      onStopSpeaking={assistant.stopSpeaking}
      onSubmitText={assistant.handleTextSubmit}
      status={assistant.status}
      transcript={assistant.transcript}
      responseText={assistant.responseText}
      errorMessage={assistant.errorMessage}
      isSupported={assistant.isSupported}
      assistantLanguage={assistant.assistantLanguage}
      onLanguageChange={handleLanguageChange}
      isListening={assistant.isListening}
      isSpeaking={assistant.isSpeaking}
    />
  )
}
