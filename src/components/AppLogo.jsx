/**
 * CampusOne Logo Component
 * Usage: <AppLogo size={32} /> or <AppLogo size={48} showText />
 */
export default function AppLogo({ size = 32, showText = false, className = '' }) {
  const s = size
  const r = s * 0.22  // corner radius

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={s} height={s} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <defs>
          <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e40af"/>
            <stop offset="100%" stopColor="#3730a3"/>
          </linearGradient>
          <linearGradient id="logo-cap" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff"/>
            <stop offset="100%" stopColor="#bfdbfe"/>
          </linearGradient>
        </defs>
        {/* Background */}
        <rect width="512" height="512" rx="112" fill="url(#logo-bg)"/>
        <rect x="2" y="2" width="508" height="508" rx="110" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4"/>
        {/* Mortarboard top */}
        <polygon points="256,118 398,188 256,258 114,188" fill="url(#logo-cap)"/>
        <polygon points="256,118 398,188 256,188" fill="rgba(255,255,255,0.12)"/>
        {/* Cap body */}
        <path d="M 152 208 L 152 292 Q 152 332 256 348 Q 360 332 360 292 L 360 208 L 256 258 Z" fill="url(#logo-cap)" opacity="0.95"/>
        <path d="M 152 208 L 256 258 L 256 348 Q 152 332 152 292 Z" fill="rgba(0,0,0,0.08)"/>
        {/* Tassel */}
        <line x1="398" y1="188" x2="398" y2="285" stroke="#93c5fd" strokeWidth="7" strokeLinecap="round"/>
        <circle cx="398" cy="296" r="13" fill="#60a5fa"/>
        <line x1="389" y1="309" x2="384" y2="334" stroke="#93c5fd" strokeWidth="5" strokeLinecap="round"/>
        <line x1="398" y1="309" x2="398" y2="337" stroke="#93c5fd" strokeWidth="5" strokeLinecap="round"/>
        <line x1="407" y1="309" x2="412" y2="334" stroke="#93c5fd" strokeWidth="5" strokeLinecap="round"/>
        {/* C+ text */}
        <text x="256" y="432" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="90" fill="white" textAnchor="middle" letterSpacing="-4" opacity="0.95">C+</text>
        <rect x="196" y="444" width="120" height="6" rx="3" fill="#60a5fa" opacity="0.75"/>
      </svg>

      {showText && (
        <span style={{ fontSize: s * 0.56, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>
          <span style={{ color: '#2563eb' }}>Campus</span>
          <span style={{ color: '#111827' }}>Plus</span>
        </span>
      )}
    </div>
  )
}
