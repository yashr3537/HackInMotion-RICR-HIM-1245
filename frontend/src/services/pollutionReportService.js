import { supabase } from '../lib/supabaseClient'

/**
 * Generate a unique report ID in format: AQI-YYYY-XXXXXX
 * (Collision-safe random 6 digit sequence)
 */
export function generateReportId() {
  const year = new Date().getFullYear()
  const randomNum = Math.floor(100000 + Math.random() * 900000)
  return `AQI-${year}-${randomNum}`
}

/**
 * Upload file to Supabase Storage bucket 'pollution-report-evidence'
 * Path: pollution-reports/{userId}/{reportId}/{filename}
 */
export async function uploadEvidenceFile(file, userId, reportId, type = 'image') {
  if (!file) return null

  try {
    const fileExt = file.name.split('.').pop()
    const sanitizedFileName = `${type}_${Date.now()}.${fileExt}`
    const filePath = `pollution-reports/${userId}/${reportId}/${sanitizedFileName}`

    const { data, error } = await supabase.storage
      .from('pollution-report-evidence')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (error) {
      console.warn(`Supabase Storage upload warning (${type}):`, error)
      return null
    }

    const { data: publicUrlData } = supabase.storage
      .from('pollution-report-evidence')
      .getPublicUrl(filePath)

    return publicUrlData?.publicUrl || filePath
  } catch (err) {
    console.error(`Error uploading ${type}:`, err)
    return null
  }
}

/**
 * Create a new pollution report in Supabase
 */
export async function createPollutionReport(reportData, user) {
  const reportId = generateReportId()
  const userId = user?.id

  if (!userId) {
    throw new Error('User must be authenticated to submit a report.')
  }

  let imagePath = null
  let videoPath = null

  if (reportData.imageFile) {
    imagePath = await uploadEvidenceFile(reportData.imageFile, userId, reportId, 'image')
  }

  if (reportData.videoFile) {
    videoPath = await uploadEvidenceFile(reportData.videoFile, userId, reportId, 'video')
  }

  const payload = {
    report_id: reportId,
    user_id: userId,
    city: reportData.city || null,
    region: reportData.region || null,
    country: reportData.country || null,
    address: reportData.address || null,
    latitude: reportData.latitude !== undefined && reportData.latitude !== null && reportData.latitude !== '' ? Number(reportData.latitude) : null,
    longitude: reportData.longitude !== undefined && reportData.longitude !== null && reportData.longitude !== '' ? Number(reportData.longitude) : null,
    issue_category: reportData.issueCategory,
    severity: reportData.severity,
    description: String(reportData.description || '').trim(),
    health_problems: Array.isArray(reportData.healthProblems) ? reportData.healthProblems : [],
    image_path: imagePath,
    video_path: videoPath,
    report_date: reportData.reportDate ? new Date(reportData.reportDate).toISOString() : new Date().toISOString(),
    contact_name: reportData.isAnonymous ? null : (reportData.contactName || null),
    contact_email: reportData.isAnonymous ? null : (reportData.contactEmail || null),
    contact_phone: reportData.isAnonymous ? null : (reportData.contactPhone || null),
    is_anonymous: Boolean(reportData.isAnonymous),
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('pollution_reports')
    .insert([payload])
    .select()
    .single()

  if (error) {
    console.error('Supabase report insert error:', error)
    throw new Error(error.message || 'Failed to save pollution report to database.')
  }

  return data
}

/**
 * Fetch reports for the current user
 */
export async function getUserPollutionReports(userId) {
  if (!userId) return []

  const { data, error } = await supabase
    .from('pollution_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user reports:', error)
    throw new Error(error.message)
  }

  return data || []
}

/**
 * Fetch a single report by report_id or id
 */
export async function getPollutionReportById(reportId, userId) {
  if (!reportId) return null

  let query = supabase.from('pollution_reports').select('*')
  
  if (reportId.includes('-')) {
    query = query.eq('report_id', reportId)
  } else {
    query = query.eq('id', reportId)
  }

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    console.error('Error fetching report details:', error)
    throw new Error(error.message)
  }

  return data
}

/**
 * Fetch status history for a report
 */
export async function getReportStatusHistory(reportId) {
  if (!reportId) return []

  const { data, error } = await supabase
    .from('pollution_report_status_history')
    .select('*')
    .eq('report_id', reportId)
    .order('created_at', { ascending: true })

  if (error) {
    console.warn('Error fetching status history:', error)
    return []
  }

  return data || []
}
