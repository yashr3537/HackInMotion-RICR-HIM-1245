import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Shield,
  FileText,
  User,
  Mail,
  Phone,
  Video,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Check,
} from 'lucide-react'

import { useAuth } from '../auth'
import { useLanguage } from '../i18n/index.jsx'
import { getPollutionReportById, getReportStatusHistory } from '../services/pollutionReportService'

const STATUS_STEPS = ['pending', 'under_review', 'in_progress', 'resolved']

const SEVERITY_BADGES = {
  low: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  medium: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  high: 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  critical: 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
}

export default function ReportDetails() {
  const { reportId } = useParams()
  const { currentUser } = useAuth()
  const { t } = useLanguage()

  const [report, setReport] = useState(null)
  const [statusHistory, setStatusHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadData() {
      if (!reportId || !currentUser?.id) return

      try {
        setLoading(true)
        setError(null)
        const data = await getPollutionReportById(reportId, currentUser.id)
        if (!data) {
          setError('Report not found or access unauthorized.')
        } else {
          setReport(data)
          const history = await getReportStatusHistory(data.report_id)
          setStatusHistory(history)
        }
      } catch (err) {
        console.error('Error loading report details:', err)
        setError(err.message || 'Failed to load report details.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [reportId, currentUser?.id])

  if (loading) {
    return (
      <div className="page-enter max-w-4xl mx-auto py-12 px-4 text-center space-y-3">
        <Loader2 size={32} className="animate-spin text-forest-600 mx-auto" />
        <p className="text-sm font-medium text-ink-500">Loading report details...</p>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="page-enter max-w-2xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="p-4 rounded-full bg-red-100 dark:bg-red-950 text-red-600 w-16 h-16 flex items-center justify-center mx-auto">
          <AlertCircle size={32} />
        </div>
        <h2 className="font-display text-xl font-bold text-ink-900">
          {error || 'Report Not Found'}
        </h2>
        <Link
          to="/my-reports"
          className="btn-premium inline-flex items-center gap-2 rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white"
        >
          <ArrowLeft size={16} />
          {t('reportDetails.backBtn')}
        </Link>
      </div>
    )
  }

  // Calculate timeline active index
  let currentStepIdx = STATUS_STEPS.indexOf(report.status)
  if (currentStepIdx === -1 && report.status === 'rejected') {
    currentStepIdx = -1 // Rejected state
  }

  const severityClass = SEVERITY_BADGES[report.severity] || SEVERITY_BADGES.medium

  return (
    <div className="page-enter max-w-4xl mx-auto py-6 px-4 sm:px-6 pb-16 space-y-8">
      {/* Back Button & Header */}
      <div>
        <Link
          to="/my-reports"
          className="inline-flex items-center gap-2 text-xs font-medium text-ink-500 hover:text-forest-700 mb-4 transition-colors"
        >
          <ArrowLeft size={14} />
          {t('reportDetails.backBtn')}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface rounded-2xl border border-ink-100 dark:border-ink-800/80 p-5 sm:p-7 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-sm font-bold text-forest-700 dark:text-forest-400 bg-forest-50 dark:bg-forest-950 px-3 py-1 rounded-md border border-forest-200 dark:border-forest-800">
                {report.report_id}
              </span>
              <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold border ${severityClass}`}>
                {t(`report.sev_${report.severity}`) || report.severity}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">
              {t(`report.cat_${report.issue_category}`) || report.issue_category}
            </h1>
            <p className="text-xs text-ink-500 mt-1 flex items-center gap-1.5">
              <MapPin size={13} className="text-forest-600" />
              {report.city || 'Detected Location'}
              {report.region ? `, ${report.region}` : ''}
              {report.country ? `, ${report.country}` : ''}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-ink-500 space-y-1 font-mono">
            <div>
              <span className="text-ink-400">{t('reportDetails.submittedOn')}: </span>
              <span className="font-semibold text-ink-900">
                {new Date(report.report_date || report.created_at).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-ink-400">{t('reportDetails.updatedOn')}: </span>
              <span className="font-semibold text-ink-900">
                {new Date(report.updated_at || report.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Progress Stepper */}
      <section className="bg-surface rounded-2xl border border-ink-100 dark:border-ink-800/80 p-6 shadow-sm space-y-6">
        <h2 className="font-display font-semibold text-base text-ink-900 flex items-center gap-2">
          <Clock size={16} className="text-forest-600" />
          {t('reportDetails.timelineHeading')}
        </h2>

        {report.status === 'rejected' ? (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-3">
            <AlertTriangle size={18} />
            <span>This report was reviewed and marked as Rejected.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
            {STATUS_STEPS.map((stepKey, idx) => {
              const isCompleted = currentStepIdx > idx
              const isCurrent = currentStepIdx === idx

              return (
                <div
                  key={stepKey}
                  className={`p-3.5 rounded-xl border text-center space-y-1.5 transition-all ${
                    isCurrent
                      ? 'border-forest-500 bg-forest-50 dark:bg-forest-950 text-forest-900 dark:text-forest-200 shadow-sm ring-2 ring-forest-500/20'
                      : isCompleted
                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400'
                        : 'border-ink-200 bg-canvas text-ink-400 opacity-60'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full mx-auto flex items-center justify-center text-xs font-bold font-mono">
                    {isCompleted ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : isCurrent ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-forest-600 animate-pulse" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <div className="text-xs font-semibold">
                    {t(`status.${stepKey}`)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Description & Health Impact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-2 bg-surface rounded-2xl border border-ink-100 dark:border-ink-800/80 p-6 shadow-sm space-y-4">
          <h2 className="font-display font-semibold text-base text-ink-900 border-b border-ink-100 pb-3">
            {t('report.descriptionLabel')}
          </h2>
          <p className="text-sm text-ink-800 dark:text-ink-200 leading-relaxed whitespace-pre-line">
            {report.description}
          </p>

          {/* Health Impact Tags */}
          {Array.isArray(report.health_problems) && report.health_problems.length > 0 && (
            <div className="pt-4 border-t border-ink-100 space-y-2">
              <span className="text-xs font-semibold text-ink-500 block">
                {t('report.healthImpactLabel')}:
              </span>
              <div className="flex flex-wrap gap-2">
                {report.health_problems.map((hpKey) => (
                  <span
                    key={hpKey}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                  >
                    {t(`report.hp_${hpKey}`) || hpKey}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Location Details & Coordinates */}
        <section className="bg-surface rounded-2xl border border-ink-100 dark:border-ink-800/80 p-6 shadow-sm space-y-4">
          <h2 className="font-display font-semibold text-base text-ink-900 border-b border-ink-100 pb-3 flex items-center gap-2">
            <MapPin size={16} className="text-forest-600" />
            {t('reportDetails.locationDetails')}
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-ink-400 block">{t('report.cityLabel')}:</span>
              <span className="font-semibold text-ink-900 text-sm">
                {report.city || 'N/A'}
              </span>
            </div>

            {report.region && (
              <div>
                <span className="text-ink-400 block">{t('report.regionLabel')}:</span>
                <span className="font-medium text-ink-800">{report.region}</span>
              </div>
            )}

            {report.address && (
              <div>
                <span className="text-ink-400 block">{t('report.addressLabel')}:</span>
                <span className="font-medium text-ink-800">{report.address}</span>
              </div>
            )}

            {(report.latitude || report.longitude) && (
              <div>
                <span className="text-ink-400 block">{t('reportDetails.coordinates')}:</span>
                <span className="font-mono text-ink-800">
                  {report.latitude?.toFixed(6)}, {report.longitude?.toFixed(6)}
                </span>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Photo & Video Evidence */}
      <section className="bg-surface rounded-2xl border border-ink-100 dark:border-ink-800/80 p-6 shadow-sm space-y-4">
        <h2 className="font-display font-semibold text-base text-ink-900 border-b border-ink-100 pb-3 flex items-center gap-2">
          <ImageIcon size={16} className="text-forest-600" />
          {t('reportDetails.evidenceHeading')}
        </h2>

        {!report.image_path && !report.video_path ? (
          <p className="text-xs text-ink-400 py-4 text-center">
            {t('reportDetails.noEvidence')}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Photo Evidence */}
            {report.image_path && (
              <div className="space-y-2">
                <span className="text-xs font-medium text-ink-500 flex items-center gap-1.5">
                  <ImageIcon size={14} /> Photo Evidence
                </span>
                <div className="rounded-xl border border-ink-200 overflow-hidden bg-canvas aspect-video">
                  <img
                    src={report.image_path}
                    alt="Pollution Report Evidence"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            )}

            {/* Video Evidence */}
            {report.video_path && (
              <div className="space-y-2">
                <span className="text-xs font-medium text-ink-500 flex items-center gap-1.5">
                  <Video size={14} /> Video Evidence
                </span>
                <div className="rounded-xl border border-ink-200 overflow-hidden bg-canvas aspect-video">
                  <video
                    src={report.video_path}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Contact Details / Anonymity Status */}
      <section className="bg-surface rounded-2xl border border-ink-100 dark:border-ink-800/80 p-6 shadow-sm space-y-4">
        <h2 className="font-display font-semibold text-base text-ink-900 border-b border-ink-100 pb-3 flex items-center gap-2">
          <User size={16} className="text-forest-600" />
          {t('reportDetails.contactInfo')}
        </h2>

        {report.is_anonymous ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-forest-50 dark:bg-forest-950/40 border border-forest-200 dark:border-forest-800 text-forest-800 dark:text-forest-300 text-xs font-semibold">
            <Shield size={18} className="text-forest-600 shrink-0" />
            <span>{t('reportDetails.anonymousUser')}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <User size={14} className="text-ink-400 shrink-0" />
              <div>
                <span className="text-ink-400 block">Name:</span>
                <span className="font-semibold text-ink-900">{report.contact_name || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Mail size={14} className="text-ink-400 shrink-0" />
              <div>
                <span className="text-ink-400 block">Email:</span>
                <span className="font-semibold text-ink-900">{report.contact_email || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Phone size={14} className="text-ink-400 shrink-0" />
              <div>
                <span className="text-ink-400 block">Phone:</span>
                <span className="font-semibold text-ink-900">{report.contact_phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
