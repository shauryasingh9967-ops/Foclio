// utils/video.js

export const VIDEO_TYPE = {
  YOUTUBE: 'youtube',
  GDRIVE:  'gdrive',
  UNKNOWN: 'unknown',
}

/** Parse YouTube video ID from any YouTube URL format */
export function parseYouTubeId(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    const host = u.hostname.replace('www.', '')
    if (host === 'youtu.be')           return u.pathname.slice(1).split(/[?&#]/)[0] || null
    if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/shorts/')[1]?.split(/[?/#]/)[0] || null
    if (u.pathname.startsWith('/embed/'))  return u.pathname.split('/embed/')[1]?.split(/[?/#]/)[0] || null
    if (u.searchParams.has('v'))           return u.searchParams.get('v')
  } catch {}
  return null
}

/** Parse Google Drive file ID */
export function parseGDriveId(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    if (!u.hostname.includes('drive.google.com')) return null
    const m = u.pathname.match(/\/file\/d\/([^/]+)/)
    return m ? m[1] : u.searchParams.get('id') || null
  } catch { return null }
}

/**
 * Detect video type and return structured data.
 * Returns: { type, id, embedUrl, thumbnailUrl, youtubeUrl, error }
 */
export function detectVideo(rawUrl) {
  const url = (rawUrl || '').trim()
  if (!url) return { type: null, id: null, embedUrl: null, error: null }

  // Validate URL
  try { new URL(url) } catch {
    return { type: VIDEO_TYPE.UNKNOWN, id: null, embedUrl: null, error: 'Invalid URL. Please include https://' }
  }

  // YouTube
  const isYT = /youtu\.?be|youtube-nocookie/.test(url)
  if (isYT) {
    const id = parseYouTubeId(url)
    if (!id) return { type: VIDEO_TYPE.UNKNOWN, id: null, embedUrl: null, error: 'Could not extract YouTube video ID. Check the URL.' }
    return {
      type: VIDEO_TYPE.YOUTUBE,
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&enablejsapi=0&playsinline=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
      youtubeUrl: `https://www.youtube.com/watch?v=${id}`,
      error: null,
    }
  }

  // Google Drive
  if (url.includes('drive.google.com')) {
    const id = parseGDriveId(url)
    if (!id) return { type: VIDEO_TYPE.UNKNOWN, id: null, embedUrl: null, error: 'Could not extract Google Drive file ID.' }
    return {
      type: VIDEO_TYPE.GDRIVE,
      id,
      embedUrl: `https://drive.google.com/file/d/${id}/preview`,
      thumbnailUrl: null,
      youtubeUrl: null,
      error: null,
    }
  }

  return {
    type: VIDEO_TYPE.UNKNOWN, id: null, embedUrl: null,
    error: 'Unsupported source. Paste a YouTube or Google Drive link.',
  }
}

/** Format seconds to MM:SS or H:MM:SS */
export function fmtTime(sec) {
  if (!sec && sec !== 0) return '0:00'
  const s = Math.floor(sec)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
  return `${m}:${String(ss).padStart(2,'0')}`
}

/** Safe clipboard write with textarea fallback */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const el = Object.assign(document.createElement('textarea'), {
        value: text, style: 'position:fixed;opacity:0;top:0;left:0;pointer-events:none',
      })
      document.body.appendChild(el)
      el.focus(); el.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(el)
      return ok
    } catch { return false }
  }
}
