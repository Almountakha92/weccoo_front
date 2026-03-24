const envVideoUrl = typeof import.meta !== 'undefined' ? import.meta.env.VITE_LANDING_VIDEO_URL : undefined

export const landingMedia = {
  videoUrl: String(envVideoUrl || '/videos/weccoo-landing.mp4'),
  posterUrl: '/images/solidarite.jpg',
} as const
