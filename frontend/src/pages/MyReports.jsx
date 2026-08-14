import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  ChevronRight,
  Loader2,
  Filter,
  RefreshCw,
  Search,
  Shield,
} from 'lucide-react'

import { useAuth } from '../auth'
import { useLanguage } from '../i18n/index.jsx'
import { getUserPollutionReports } from '../services/pollutionReportService'

const SEVERITY_BADGES = {
  low: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  medium:
    'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  high: 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  critical:
    'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
}

const STATUS_BADGES = {
  pending:
    'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  under_review:
    'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  in_progress:
    'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  resolved:
    'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  rejected:
    'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
}

export default function MyReports() {
  const { currentUser } = useAuth()
  const { t } = useLanguage()

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchReports = async () => {
    if (!currentUser?.id) return
    try {
      setLoading(true)
      setError(null)
      const data = await getUserPollutionReports(currentUser.id)
      setReports(data)
    } catch (err) {
      console.error('Error fetching reports:', err)
      setError(err.message || 'Failed to load pollution reports.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [currentUser?.id])

  const filteredReports = reports.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch =
      !q ||
      r.report_id.toLowerCase().includes(q) ||
      (r.city && r.city.toLowerCase().includes(q)) ||
      (r.issue_category && r.issue_category.toLowerCase().includes(q)) ||
      (r.description && r.description.toLowerCase().includes(q))

    return matchesStatus && matchesSearch
  })

  return (
    <div className="page-enter max-w-6xl mx-auto py-6 px-4 sm:px-6 pb-16 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface rounded-2xl border border-ink-100 dark:border-ink-800/80 p-5 sm:p-7 shadow-sm">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-forest-50 dark:bg-forest-950 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest-800 dark:text-forest-300">
            <FileText size={12} />
            {t('myReports.title')}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            {t('myReports.title')}
          </h1>
          <p className="text-sm text-ink-500 mt-1">{t('myReports.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchReports}
            disabled={loading}
            className="btn-premium inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-surface px-3.5 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50 disabled:opacity-50"
            title="Refresh reports"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            to="/report"
            className="btn-premium inline-flex items-center gap-2 rounded-xl bg-forest-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-forest-800"
          >
            <Plus size={16} />
            {t('myReports.reportIssueBtn')}
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface p-4 rounded-xl border border-ink-100 dark:border-ink-800/80">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {['all', 'pending', 'under_review', 'in_progress', 'resolved', 'rejected'].map(
            (stKey) => (
              <button
                key={stKey}
                type="button"
                onClick={() => setStatusFilter(stKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === stKey
                    ? 'bg-forest-800 text-white shadow-xs'
                    : 'text-ink-600 hover:bg-ink-100 dark:hover:bg-ink-800'
                }`}
              >
                {stKey === 'all' ? 'All Reports' : t(`status.${stKey}`)}
              </button>
            )
          )}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID or city..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-ink-200 bg-canvas text-xs font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-surface rounded-2xl border border-ink-100 p-12 text-center text-ink-500 space-y-3">
          <Loader2 size={28} className="animate-spin text-forest-600 mx-auto" />
          <p className="text-sm font-medium">Loading reports from Supabase...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-800 p-6 text-center space-y-3">
          <AlertCircle size={28} className="text-red-600 mx-auto" />
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">{error}</p>
          <button
            type="button"
            onClick={fetchReports}
            className="btn-premium px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white"
          >
            Try Again
          </button>
        </div>
      ) : filteredReports.length === 0 ? (
        /* Empty State */
        <div className="bg-surface rounded-2xl border border-ink-100 dark:border-ink-800/80 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-forest-50 dark:bg-forest-950 text-forest-600 flex items-center justify-center mx-auto">
            <FileText size={32} />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-display font-semibold text-lg text-ink-900">
              {t('myReports.noReports')}
            </h3>
            <p className="text-sm text-ink-500">{t('myReports.noReportsDesc')}</p>
          </div>
          <Link
            to="/report"
            className="btn-premium inline-flex items-center gap-2 rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-forest-800"
          >
            <Plus size={16} />
            {t('myReports.reportIssueBtn')}
          </Link>
        </div>
      ) : (
        /* Reports View: Table on Desktop, Cards on Mobile */
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-surface rounded-2xl border border-ink-100 dark:border-ink-800/80 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-ink-100 dark:border-ink-800 bg-canvas/60 text-ink-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-5">{t('myReports.colId')}</th>
                  <th className="py-3.5 px-4">{t('myReports.colLocation')}</th>
                  <th className="py-3.5 px-4">{t('myReports.colCategory')}</th>
                  <th className="py-3.5 px-4">{t('myReports.colSeverity')}</th>
                  <th className="py-3.5 px-4">{t('myReports.colStatus')}</th>
                  <th className="py-3.5 px-4">{t('myReports.colDate')}</th>
                  <th className="py-3.5 px-5 text-right">{t('myReports.colAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {filteredReports.map((report) => {
                  const severityClass = SEVERITY_BADGES[report.severity] || SEVERITY_BADGES.medium
                  const statusClass = STATUS_BADGES[report.status] || STATUS_BADGES.pending

                  return (
                    <tr
                      key={report.id || report.report_id}
                      className="hover:bg-canvas/50 transition-colors"
                    >
                      <td className="py-4 px-5 font-mono text-xs font-bold text-forest-700 dark:text-forest-400">
                        {report.report_id}
                        {report.is_anonymous && (
                          <span title="Anonymous Report" className="ml-1.5 inline-block">
                            <Shield size={12} className="text-ink-400 inline" />
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-medium text-ink-900">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-forest-600 shrink-0" />
                          <span>{report.city || 'Detected Area'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-ink-700 font-medium">
                        {t(`report.cat_${report.issue_category}`) || report.issue_category}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${severityClass}`}
                        >
                          {t(`report.sev_${report.severity}`) || report.severity}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusClass}`}
                        >
                          <Clock size={12} />
                          {t(`status.${report.status}`) || report.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-ink-500 font-mono">
                        {new Date(report.created_at || report.report_date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          to={`/my-reports/${report.report_id}`}
                          className="btn-premium inline-flex items-center gap-1 text-xs font-semibold text-forest-700 dark:text-forest-400 hover:text-forest-800 px-3 py-1.5 rounded-lg border border-forest-200 dark:border-forest-800 bg-forest-50 dark:bg-forest-950/40"
                        >
                          {t('myReports.viewDetails')}
                          <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="lg:hidden grid grid-cols-1 gap-4">
            {filteredReports.map((report) => {
              const severityClass = SEVERITY_BADGES[report.severity] || SEVERITY_BADGES.medium
              const statusClass = STATUS_BADGES[report.status] || STATUS_BADGES.pending

              return (
                <div
                  key={report.id || report.report_id}
                  className="bg-surface rounded-2xl border border-ink-100 dark:border-ink-800/80 p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-forest-700 dark:text-forest-400 bg-forest-50 dark:bg-forest-950 px-2 py-0.5 rounded border border-forest-200 dark:border-forest-800">
                      {report.report_id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusClass}`}
                    >
                      <Clock size={11} />
                      {t(`status.${report.status}`) || report.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-ink-900 flex items-center gap-1.5">
                      <MapPin size={14} className="text-forest-600 shrink-0" />
                      {report.city || 'Detected Location'}{' '}
                      {report.region ? `, ${report.region}` : ''}
                    </h4>
                    <p className="text-xs text-ink-500 mt-1 line-clamp-2">{report.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-ink-100 text-xs">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${severityClass}`}
                    >
                      {t(`report.sev_${report.severity}`) || report.severity}
                    </span>

                    <span className="text-[11px] text-ink-400 font-mono">
                      {new Date(report.created_at || report.report_date).toLocaleDateString()}
                    </span>

                    <Link
                      to={`/my-reports/${report.report_id}`}
                      className="btn-premium inline-flex items-center gap-1 text-xs font-semibold text-forest-700 dark:text-forest-400"
                    >
                      {t('myReports.viewDetails')}
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
