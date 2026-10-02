import test from 'node:test'
import assert from 'node:assert/strict'

import {
  extractYouTubeId,
  toYouTubeEmbedUrl,
  sanitizeDashboardVideos,
  DEFAULT_DASHBOARD_VIDEOS,
} from './dashboardVideos.js'

test('extractYouTubeId handles watch URLs and short links', () => {
  assert.equal(extractYouTubeId('https://www.youtube.com/watch?v=ScMzIvxBSi4'), 'ScMzIvxBSi4')
  assert.equal(extractYouTubeId('https://youtu.be/ysz5S6PUM-U'), 'ysz5S6PUM-U')
})

test('sanitizeDashboardVideos keeps only two valid videos', () => {
  const trimmed = sanitizeDashboardVideos([
    { id: 'a', title: 'Campus Fest', url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4' },
    { id: 'b', title: 'Cultural Night', url: 'https://youtu.be/ysz5S6PUM-U' },
    { id: 'c', title: 'Broken', url: 'not a valid url' },
  ])

  assert.equal(trimmed.length, 2)
  assert.equal(trimmed[0].title, 'Campus Fest')
  assert.ok(trimmed.every(video => video.embedUrl.includes('youtube.com/embed/')))
})

test('default dashboard videos are seeded with campus events', () => {
  assert.equal(DEFAULT_DASHBOARD_VIDEOS.length, 2)
  assert.ok(DEFAULT_DASHBOARD_VIDEOS.every(video => video.title))
})
