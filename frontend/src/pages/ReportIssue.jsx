import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  MapPin,
  Navigation,
  Upload,
  Video,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Clock,
  UserCheck,
  Shield,
  Loader2,
  ArrowLeft,
  FileText,
  AlertOctagon,
  Sparkles,
} from 'lucide-react'

import { useAuth } from '../auth'
import { useLanguage } from '../i18n/index.jsx'
import { reverseGeocode } from '../services/location/locationApi'
import { createPollutionReport } from '../services/pollutionReportService'

const CATEGORIES = [
  'industrial_smoke',
  'vehicle_pollution',
  'garbage_burning',
  'waste_dump',
  'dust_pollution',
  'construction_dust',
  'chemical_smell',
  'factory_emission',
  'tree_cutting',
  'other',
]

const SEVERITIES = [
  { key: 'low', indicator: '🟢', colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
  { key: 'medium', indicator: '🟡', colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
  { key: 'high', indicator: '🟠', colorClass: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800' },
  { key: 'critical', indicator: '🔴', colorClass: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800' },
]

const HEALTH_PROBLEMS = [
  'breathing_difficulty',
  'allergy',
  'eye_irritation',
  'headache',
  'cough',
  'chest_pain',
  'other',
]

export default function ReportIssue() {
  const { currentUser } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  // Form State
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [detectingGps, setDetectingGps] = useState(false)
  const [gpsError, setGpsError] = useState('')

  const [issueCategory, setIssueCategory] = useState('')
  const [severity, setSeverity] = useState('medium')
  const [description, setDescription] = useState('')
  const [healthProblems, setHealthProblems] = useState([])

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)

  const [reportDate, setReportDate] = useState(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  })

  const [contactName, setContactName] = useState(currentUser?.fullName || currentUser?.name || '')
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '')
  const [contactPhone, setContactPhone] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

  // Submit UI State
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [successReport, setSuccessReport] = useState(null)

  // Auto detect location on load if not set
  useEffect(() => {
    handleDetectLocation()
  }, [])

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGpsError(t('report.gpsUnsupported'))
      return
    }

    setDetectingGps(true)
    setGpsError('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        setLatitude(lat.toFixed(6))
        setLongitude(lon.toFixed(6))

        try {
          const loc = await reverseGeocode(lat, lon)
          if (loc.name) setCity(loc.name)
          if (loc.region) setRegion(loc.region)
        } catch (e) {
          console.error('Geocode error:', e)
        } finally {
          setDetectingGps(false)
        }
      },
      (err) => {
        setDetectingGps(false)
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError(t('report.gpsDenied'))
        } else if (err.code === err.TIMEOUT) {
          setGpsError(t('report.gpsTimeout'))
        } else {
          setGpsError(t('report.gpsDenied'))
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const handleToggleHealthProblem = (key) => {
    setHealthProblems((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    )
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setFormError('Please select a valid image file (JPEG, PNG, WEBP).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setFormError('Image size must be under 10MB.')
      return
    }

    setFormError('')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleRemovePhoto = () => {
    setImageFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
  }

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['video/mp4', 'video/webp', 'video/quicktime', 'video/x-matroska'].includes(file.type)) {
      setFormError('Please select a valid video file (MP4, WEBP, MOV).')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      setFormError('Video size must be under 50MB.')
      return
    }

    setFormError('')
    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
  }

  const handleRemoveVideo = () => {
    setVideoFile(null)
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideoPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    const trimmedDesc = description.trim()

    if (!city.trim() && (!latitude || !longitude)) {
      setFormError('Please provide a location (auto-detect GPS or enter city manually).')
      return
    }

    if (!issueCategory) {
      setFormError('Please select an issue category.')
      return
    }

    if (!severity) {
      setFormError('Please select a severity level.')
      return
    }

    if (trimmedDesc.length < 10) {
      setFormError(t('report.descriptionMinErr'))
      return
    }

    try {
      setSubmitting(true)
      const reportData = {
        city: city.trim(),
        region: region.trim(),
        address: address.trim(),
        latitude,
        longitude,
        issueCategory,
        severity,
        description: trimmedDesc,
        healthProblems,
        imageFile,
        videoFile,
        reportDate,
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        isAnonymous,
      }

      const created = await createPollutionReport(reportData, currentUser)
      setSuccessReport(created)
    } catch (err) {
      console.error('Report submission error:', err)
      setFormError(err.message || 'Failed to submit report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetForm = () => {
    setSuccessReport(null)
    setDescription('')
    setIssueCategory('')
    setSeverity('medium')
    setHealthProblems([])
    handleRemovePhoto()
    handleRemoveVideo()
    setFormError('')
  }

  // =====================================================
  // SUCCESS SCREEN
  // =====================================================
  if (successReport) {
    return (
      <div className="page-enter max-w-3xl mx-auto py-8 px-4 sm:px-6">
        <div className="bg-surface rounded-2xl border border-forest-100 dark:border-forest-900/60 p-6 sm:p-10 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-950/20">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">
              {t('report.successTitle')}
            </h1>
            <p className="text-sm text-ink-500 max-w-md mx-auto">
              {t('report.successSubtitle')}
            </p>
          </div>

          <div className="bg-canvas rounded-xl border border-ink-200/80 p-5 max-w-md mx-auto text-left space-y-3">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <span className="text-xs font-medium text-ink-500 uppercase tracking-wider">
                {t('report.reportIdLabel')}
              </span>
              <span className="font-mono text-base font-bold text-forest-700 dark:text-forest-400 bg-forest-50 dark:bg-forest-950 px-2.5 py-1 rounded-md border border-forest-200 dark:border-forest-800">
                {successReport.report_id}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <span className="text-xs font-medium text-ink-500 uppercase tracking-wider">
                {t('report.statusLabel')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                <Clock size={13} />
                {t(`status.${successReport.status}`)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-ink-600">
              <span>{t('report.locationHeading')}:</span>
              <span className="font-semibold text-ink-900">
                {successReport.city || 'Detected Coordinates'}
                {successReport.region ? `, ${successReport.region}` : ''}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-ink-600">
              <span>{t('report.categoryLabel')}:</span>
              <span className="font-semibold text-ink-900">
                {t(`report.cat_${successReport.issue_category}`) || successReport.issue_category}
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/my-reports"
              className="w-full sm:w-auto btn-premium inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-forest-800"
            >
              <FileText size={16} />
              {t('report.viewMyReportsBtn')}
            </Link>

            <button
              type="button"
              onClick={handleResetForm}
              className="w-full sm:w-auto btn-premium inline-flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-surface px-5 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-50"
            >
              <Sparkles size={16} />
              {t('report.newReportBtn')}
            </button>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto text-xs text-ink-500 hover:text-ink-900 font-medium py-2"
            >
              {t('report.backToDashboardBtn')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // =====================================================
  // MAIN FORM SCREEN
  // =====================================================
  return (
    <div className="page-enter max-w-4xl mx-auto py-6 px-4 sm:px-6 pb-16">
      {/* Top Header */}
      <div className="mb-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-medium text-ink-500 hover:text-forest-700 mb-4 transition-colors"
        >
          <ArrowLeft size={14} />
          {t('common.back')} {t('nav.dashboard')}
        </Link>

        <div className="flex items-center gap-3">
          <span className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertOctagon size={26} />
          </span>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
              {t('report.title')}
            </h1>
            <p className="text-sm text-ink-500 mt-1">
              {t('report.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Global Form Error Notice */}
      {formError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* =====================================================
            SECTION 1: LOCATION
        ====================================================== */}
        <section className="bg-surface rounded-2xl border border-ink-100 dark:border-ink-800/80 p-5 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-ink-100 pb-3">
            <h2 className="font-display font-semibold text-lg text-ink-900 flex items-center gap-2">
              <MapPin size={18} className="text-forest-600" />
              {t('report.locationHeading')}
            </h2>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detectingGps}
              className="btn-premium inline-flex items-center gap-2 rounded-lg border border-forest-200 bg-forest-50 dark:bg-forest-950 px-3 py-1.5 text-xs font-semibold text-forest-800 dark:text-forest-300 hover:bg-forest-100 disabled:opacity-50"
            >
              {detectingGps ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Navigation size={13} />
              )}
              {detectingGps ? t('report.detectingLocation') : t('report.autoDetectBtn')}
            </button>
          </div>

          {gpsError && (
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
              {gpsError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1.5">
                {t('report.cityLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bhopal, MP Nagar, Connaught Place"
                className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-canvas text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1.5">
                {t('report.regionLabel')}
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g. Madhya Pradesh, Maharashtra"
                className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-canvas text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1.5">
              {t('report.addressLabel')}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Near Sector 3 Industrial Gate, Main Road"
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-canvas text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          {(latitude || longitude) && (
            <div className="text-[11px] text-ink-500 font-mono flex items-center gap-3 bg-canvas p-2.5 rounded-lg border border-ink-200/60">
              <span>GPS: {latitude || 'N/A'}, {longitude || 'N/A'}</span>
              <span className="text-emerald-600 font-sans text-[10px] font-semibold uppercase tracking-wider">
                ✓ Detected
              </span>
            </div>
          )}
        </section>

        {/* =====================================================
            SECTION 2: ISSUE CATEGORY & SEVERITY
        ====================================================== */}
        <section className="bg-surface rounded-2xl border border-ink-100 dark:border-ink-800/80 p-5 sm:p-7 shadow-sm space-y-6">
          <div className="border-b border-ink-100 pb-3">
            <h2 className="font-display font-semibold text-lg text-ink-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              {t('report.categoryLabel')} & {t('report.severityLabel')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-2">
                {t('report.categoryLabel')} <span className="text-red-500">*</span>
              </label>
              <select
                value={issueCategory}
                onChange={(e) => setIssueCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-canvas text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
                required
              >
                <option value="" disabled>
                  {t('report.selectCategory')}
                </option>
                {CATEGORIES.map((catKey) => (
                  <option key={catKey} value={catKey}>
                    {t(`report.cat_${catKey}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity Radio Buttons */}
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-2">
                {t('report.severityLabel')} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SEVERITIES.map(({ key, indicator, colorClass }) => (
                  <label
                    key={key}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all text-xs font-semibold ${
                      severity === key
                        ? colorClass + ' ring-2 ring-forest-500 shadow-sm'
                        : 'border-ink-200 bg-canvas text-ink-700 hover:border-forest-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={key}
                      checked={severity === key}
                      onChange={() => setSeverity(key)}
                      className="sr-only"
                    />
                    <span>{indicator}</span>
                    <span>{t(`report.sev_${key}`)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SECTION 3: DESCRIPTION
        ====================================================== */}
        <section className="bg-surface rounded-2xl border border-ink-100 dark:border-ink-800/80 p-5 sm:p-7 shadow-sm space-y-4">
          <div className="border-b border-ink-100 pb-3">
            <h2 className="font-display font-semibold text-lg text-ink-900 flex items-center gap-2">
              <FileText size={18} className="text-forest-600" />
              {t('report.descriptionLabel')} <span className="text-red-500">*</span>
            </h2>
          </div>

          <div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('report.descriptionPlaceholder')}
              maxLength={1000}
              className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-canvas text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-500 leading-relaxed"
              required
            />
            <div className="flex justify-between text-[11px] text-ink-400 mt-1.5">
              <span>Min 10 characters</span>
              <span>{description.trim().length} / 1000</span>
            </div>
          </div>
        </section>

        {/* =====================================================
            SECTION 4: HEALTH IMPACT
        ====================================================== */}
        <section className="bg-surface rounded-2xl border border-ink-100 dark:border-ink-800/80 p-5 sm:p-7 shadow-sm space-y-4">
          <div className="border-b border-ink-100 pb-3">
            <h2 className="font-display font-semibold text-lg text-ink-900">
              {t('report.healthImpactLabel')}
            </h2>
            <p className="text-xs text-ink-400 mt-1">
              {t('report.healthNotice')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {HEALTH_PROBLEMS.map((hpKey) => {
              const isChecked = healthProblems.includes(hpKey)
              return (
                <label
                  key={hpKey}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                    isChecked
                      ? 'border-forest-500 bg-forest-50 dark:bg-forest-950 text-forest-900 dark:text-forest-200 font-semibold'
                      : 'border-ink-200 bg-canvas text-ink-700 hover:border-ink-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleHealthProblem(hpKey)}
                    className="rounded border-ink-300 text-forest-600 focus:ring-forest-500"
                  />
                  <span>{t(`report.hp_${hpKey}`)}</span>
                </label>
              )
            })}
          </div>
        </section>

        {/* =====================================================
            SECTION 5: EVIDENCE UPLOAD (PHOTO & VIDEO)
        ====================================================== */}
        <section className="bg-surface rounded-2xl border border-ink-100 dark:border-ink-800/80 p-5 sm:p-7 shadow-sm space-y-6">
          <div className="border-b border-ink-100 pb-3">
            <h2 className="font-display font-semibold text-lg text-ink-900 flex items-center gap-2">
              <Upload size={18} className="text-forest-600" />
              Evidence Media Upload (Optional)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Photo Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-ink-700">
                {t('report.photoUploadLabel')}
              </label>

              {imagePreview ? (
                <div className="relative rounded-xl border border-ink-200 overflow-hidden bg-canvas aspect-video group">
                  <img
                    src={imagePreview}
                    alt="Evidence Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                    title={t('report.removeFile')}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-ink-200 hover:border-forest-400 bg-canvas cursor-pointer transition-colors text-center">
                  <ImageIcon size={28} className="text-ink-400 mb-2" />
                  <span className="text-xs font-semibold text-forest-700 dark:text-forest-400">
                    {t('report.chooseFile')}
                  </span>
                  <span className="text-[11px] text-ink-400 mt-1">JPEG, PNG, WEBP (Max 10MB)</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="sr-only"
                  />
                </label>
              )}
            </div>

            {/* Video Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-ink-700">
                {t('report.videoUploadLabel')}
              </label>

              {videoPreview ? (
                <div className="relative rounded-xl border border-ink-200 overflow-hidden bg-canvas aspect-video group">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors z-10"
                    title={t('report.removeFile')}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-ink-200 hover:border-forest-400 bg-canvas cursor-pointer transition-colors text-center">
                  <Video size={28} className="text-ink-400 mb-2" />
                  <span className="text-xs font-semibold text-forest-700 dark:text-forest-400">
                    {t('report.chooseFile')}
                  </span>
                  <span className="text-[11px] text-ink-400 mt-1">MP4, WEBP, MOV (Max 50MB)</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webp,video/quicktime"
                    onChange={handleVideoChange}
                    className="sr-only"
                  />
                </label>
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            SECTION 6: DATE/TIME & CONTACT INFORMATION
        ====================================================== */}
        <section className="bg-surface rounded-2xl border border-ink-100 dark:border-ink-800/80 p-5 sm:p-7 shadow-sm space-y-6">
          <div className="border-b border-ink-100 pb-3">
            <h2 className="font-display font-semibold text-lg text-ink-900 flex items-center gap-2">
              <UserCheck size={18} className="text-forest-600" />
              {t('report.contactHeading')} & {t('report.dateTimeLabel')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1.5">
                {t('report.dateTimeLabel')}
              </label>
              <input
                type="datetime-local"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-canvas text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1.5">
                {t('report.contactName')}
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Full Name"
                disabled={isAnonymous}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-canvas text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1.5">
                {t('report.contactEmail')}
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="email@example.com"
                disabled={isAnonymous}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-canvas text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1.5">
                {t('report.contactPhone')}
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 9876543210"
                disabled={isAnonymous}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-canvas text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Anonymous Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 p-4 rounded-xl bg-canvas border border-ink-200/80 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="mt-0.5 rounded border-ink-300 text-forest-600 focus:ring-forest-500"
              />
              <div>
                <span className="block text-xs font-semibold text-ink-900 flex items-center gap-1.5">
                  <Shield size={14} className="text-forest-600" />
                  {t('report.submitAnonymously')}
                </span>
                <span className="block text-[11px] text-ink-500 mt-0.5">
                  {t('report.anonymousNotice')}
                </span>
              </div>
            </label>
          </div>
        </section>

        {/* =====================================================
            SUBMIT ACTION
        ====================================================== */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto text-center px-5 py-3 text-sm font-semibold text-ink-600 hover:text-ink-900"
          >
            {t('common.cancel')}
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto btn-premium inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-forest-800 disabled:opacity-50 min-w-[200px]"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t('report.submittingBtn')}
              </>
            ) : (
              <>
                <AlertTriangle size={16} />
                {t('report.submitBtn')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
