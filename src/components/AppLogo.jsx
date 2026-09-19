/** NexCampus education mark. */
export default function AppLogo({ size = 32, showText = false, lightText = false, className = '' }) {
  const s = size

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={s} height={s} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }} aria-label="NexCampus logo" role="img">
        <defs>
          <linearGradient id="nexcampus-brand-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7600ff" />
            <stop offset="1" stopColor="#5800df" />
          </linearGradient>
          <linearGradient id="nexcampus-brand-leaf" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#8f8bf0" />
            <stop offset="1" stopColor="#c0bcff" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" rx="112" fill="url(#nexcampus-brand-bg)" />
        <path d="M70 145C70 119 91 99 117 99H171C231 99 269 139 269 198V411C269 424 254 432 244 423C213 396 178 379 130 376C94 374 70 349 70 316V145Z" fill="#fff" />
        <path d="M289 222C313 188 350 166 389 163C417 161 442 183 442 212V324C442 349 424 370 398 375C351 383 316 398 282 424C272 432 257 424 257 411V290C257 265 268 242 289 222Z" fill="#fff" />
        <path d="M273 271C265 211 275 150 309 103C347 51 397 39 438 45C443 87 433 138 397 180C368 214 326 234 273 271Z" fill="url(#nexcampus-brand-leaf)" />
      </svg>

      {showText && (
        <span style={{ fontSize: s * 0.56, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>
          <span style={{ color: lightText ? '#ffffff' : '#6500f5' }}>Nex</span>
          <span style={{ color: lightText ? '#e9d5ff' : '#c238ff' }}>Campus</span>
        </span>
      )}
    </div>
  )
}
