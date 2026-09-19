/** NexCampus education mark. */
export default function AppLogo({ size = 32, showText = false, className = '' }) {
  const s = size

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={s} height={s} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <linearGradient id="nexcampus-logo-figure" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#123b82"/>
          <stop offset="100%" stopColor="#0b2b68"/>
        </linearGradient>
        <rect width="512" height="512" rx="112" fill="#f8fafc"/>
        <rect x="2" y="2" width="508" height="508" rx="110" fill="none" stroke="#e2e8f0" strokeWidth="4"/>
        <circle cx="256" cy="205" r="47" fill="url(#nexcampus-logo-figure)"/>
        <path d="M228 158L256 96L284 158Z" fill="#111827"/>
        <path d="M180 142L256 105L332 142L256 179Z" fill="#111827"/>
        <path d="M332 142V205" stroke="#111827" strokeWidth="8" strokeLinecap="round"/>
        <path d="M332 204C332 215 324 224 315 224C306 224 298 215 298 204" fill="#dc2626"/>
        <path d="M214 250C174 269 143 307 124 354C112 384 126 412 152 430C177 447 204 457 228 468C199 429 177 393 172 356C170 343 180 339 194 347L272 393C300 410 331 416 359 407C385 399 404 381 417 357C367 380 328 369 294 344L246 308C274 298 306 287 340 267C372 248 397 227 418 196C371 208 331 226 294 245C266 259 245 261 214 250Z" fill="url(#nexcampus-logo-figure)"/>
        <path d="M177 289C205 267 224 257 247 252" fill="none" stroke="#f8fafc" strokeWidth="12" strokeLinecap="round" opacity="0.9"/>
      </svg>

      {showText && (
        <span style={{ fontSize: s * 0.56, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>
          <span style={{ color: '#6d28d9' }}>Nex</span>
          <span style={{ color: '#c026d3' }}>Campus</span>
        </span>
      )}
    </div>
  )
}
