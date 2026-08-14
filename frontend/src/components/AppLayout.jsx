import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { BellRing, Volume2, X } from 'lucide-react'
import Sidebar from './Sidebar'
import AppHeader from './AppHeader'
import MobileNavigation from './MobileNavigation'

import { supabase } from '../services/supabase/supabaseClient'
import { useAuth } from '../auth'
import { useAlertMonitor } from '../hooks/useAlertMonitor'
import {
  enqueueVoiceAlert,
  isVoiceSupported,
  getStoredVoiceLanguage,
} from '../services/voiceAlert'

export default function AppLayout() {
  const { currentUser } = useAuth()
  const [activeToast, setActiveToast] = useState(null)

  // 1. Background alert monitor for user's saved locations
  useAlertMonitor(currentUser?.id)

  // Auto-hide toast after 7 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => setActiveToast(null), 7000)
      return () => clearTimeout(timer)
    }
  }, [activeToast])

  // 2. Supabase Realtime subscription for instant alert notifications
  useEffect(() => {
    if (!currentUser?.id) return

    const channel = supabase
      .channel(`alerts-realtime-${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: `user_id=eq.${currentUser.id}`,
        },
        async (payload) => {
          const newAlert = payload.new
          if (!newAlert) return

          // Show floating visual toast banner
          setActiveToast({
            id: newAlert.id,
            location: newAlert.location_name,
            aqi: newAlert.aqi,
            severity: newAlert.severity || 'warning',
            message: newAlert.message,
          })

          // Read settings from localStorage
          let settings = {}
          try {
            const raw = localStorage.getItem('airguard-settings')
            if (raw) settings = JSON.parse(raw)
          } catch (e) {}

          const voiceAlertsEnabled = settings.voiceAlerts !== false
          const pushNotificationsEnabled = settings.notifications !== false

          // 3. Trigger voice alert if enabled
          if (voiceAlertsEnabled && isVoiceSupported() && newAlert.location_name && newAlert.aqi) {
            enqueueVoiceAlert({
              location: newAlert.location_name,
              aqi: newAlert.aqi,
              language: getStoredVoiceLanguage(),
            })
          }

          // 4. Trigger browser native push notification if enabled and permitted
          if (
            pushNotificationsEnabled &&
            typeof window !== 'undefined' &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            try {
              new Notification(
                `${newAlert.severity === 'critical' ? '🚨 Critical' : '⚠️ Warning'} Air Alert: ${newAlert.location_name}`,
                {
                  body: newAlert.message || `AQI at ${newAlert.location_name} reached ${newAlert.aqi}`,
                  icon: '/favicon.ico',
                }
              )
            } catch (e) {
              console.warn('Native notification error:', e)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser?.id])

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col relative">
        <AppHeader />

        {/* FLOATING REAL-TIME ALERT TOAST BANNER */}
        {activeToast && (
          <div className="fixed top-20 right-5 z-50 max-w-sm w-full animate-bounce-short">
            <div
              className={`rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all ${
                activeToast.severity === 'critical'
                  ? 'border-rose-300 bg-rose-900/95 text-white'
                  : 'border-amber-300 bg-amber-900/95 text-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                    <BellRing size={18} className="text-white animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {activeToast.location}
                      </span>
                      <span className="rounded-md bg-white/20 px-1.5 py-0.5 font-mono text-[10px] font-bold">
                        AQI {activeToast.aqi}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/90 leading-snug">
                      {activeToast.message}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveToast(null)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[10px] text-white/80">
                <span className="inline-flex items-center gap-1">
                  <Volume2 size={12} />
                  Voice Alert Triggered
                </span>
                <span>Just now</span>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 px-5 sm:px-8 py-6 sm:py-8 pb-24 lg:pb-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <MobileNavigation />
    </div>
  )
}
