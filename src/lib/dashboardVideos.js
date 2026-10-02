export const DEFAULT_DASHBOARD_VIDEOS = [
  {
    id: 'campus-fest-2024',
    title: 'Campus Fest 2024',
    url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
  },
  {
    id: 'cultural-night-highlights',
    title: 'Cultural Night Highlights',
    url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
  },
]

export const DASHBOARD_VIDEOS_STORAGE_KEY = 'cp_dashboard_videos'

export function extractYouTubeId(url = '') {
  if (!url) return ''

  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace('/', '') || ''
    }
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v')
      if (id) return id
      const embed = parsed.pathname.match(/\/embed\/([^/?]+)/)
      if (embed?.[1]) return embed[1]
    }
  } catch {
    return ''
  }

  const fallback = url.match(/(?:v=|\/)([A-Za-z0-9_-]{11})(?:\?|&|$)/)
  return fallback?.[1] || ''
}

export function toYouTubeEmbedUrl(url = '') {
  const id = extractYouTubeId(url)
  if (!id) return ''
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`
}

export function normalizeDashboardVideo(video = {}) {
  const title = (video.title || 'Campus event').trim() || 'Campus event'
  const url = typeof video.url === 'string' ? video.url.trim() : ''
  const embedUrl = toYouTubeEmbedUrl(url)

  return {
    id: video.id || `video-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    url,
    embedUrl,
  }
}

export function sanitizeDashboardVideos(videos = []) {
  const valid = (videos || [])
    .map(normalizeDashboardVideo)
    .filter(video => video.embedUrl)
    .slice(0, 2)

  return valid
}

export function getStoredDashboardVideos() {
  if (typeof localStorage === 'undefined') {
    return sanitizeDashboardVideos(DEFAULT_DASHBOARD_VIDEOS)
  }

  try {
    const raw = localStorage.getItem(DASHBOARD_VIDEOS_STORAGE_KEY)
    if (!raw) {
      return sanitizeDashboardVideos(DEFAULT_DASHBOARD_VIDEOS)
    }

    const parsed = JSON.parse(raw)
    const sanitized = sanitizeDashboardVideos(Array.isArray(parsed) ? parsed : [])
    return sanitized.length ? sanitized : sanitizeDashboardVideos(DEFAULT_DASHBOARD_VIDEOS)
  } catch {
    return sanitizeDashboardVideos(DEFAULT_DASHBOARD_VIDEOS)
  }
}
