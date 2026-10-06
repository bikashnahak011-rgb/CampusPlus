import { Building2, GraduationCap, UtensilsCrossed, Wallet } from 'lucide-react'
import notebook3d from '../assets/3d-academic/notebook.png'
import pencil3d from '../assets/3d-academic/pencil.png'
import bulb3d from '../assets/3d-academic/bulb.png'

const HERO_ICONS = {
  student: GraduationCap,
  main_administrator: Building2,
  hostel_management: Building2,
  mess_manager: UtensilsCrossed,
  faculty: GraduationCap,
  account_examination: Wallet,
}

export default function DashboardHero({ audience = 'student', eyebrow, title, subtitle }) {
  const Icon = HERO_ICONS[audience] || Building2

  return (
    <section className={`dashboard-hero dashboard-hero--${audience}`} aria-label={title}>
      <div className="dashboard-hero-copy">
        <p className="dashboard-hero-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="dashboard-hero-subtitle">{subtitle}</p>
      </div>
      <div className="dashboard-hero-art" aria-hidden="true">
        <div className="dashboard-hero-orbit dashboard-hero-orbit--one" />
        <div className="dashboard-hero-orbit dashboard-hero-orbit--two" />
        <svg className="dashboard-student-character" viewBox="0 0 230 260" fill="none">
          <defs>
            <linearGradient id="character-skin" x1="79" y1="60" x2="148" y2="153" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFD9B5" />
              <stop offset=".58" stopColor="#F2B98E" />
              <stop offset="1" stopColor="#D99170" />
            </linearGradient>
            <linearGradient id="character-hair" x1="75" y1="27" x2="172" y2="113" gradientUnits="userSpaceOnUse">
              <stop stopColor="#715044" />
              <stop offset=".5" stopColor="#49352F" />
              <stop offset="1" stopColor="#2D2527" />
            </linearGradient>
            <linearGradient id="character-sweater" x1="58" y1="170" x2="174" y2="264" gradientUnits="userSpaceOnUse">
              <stop stopColor="#C9A9F1" />
              <stop offset=".55" stopColor="#9974D2" />
              <stop offset="1" stopColor="#7655B1" />
            </linearGradient>
            <linearGradient id="character-book" x1="151" y1="173" x2="191" y2="220" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFDFD" />
              <stop offset="1" stopColor="#F2DCEB" />
            </linearGradient>
            <filter id="character-shadow" x="14" y="9" width="210" height="252" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="9" stdDeviation="7" floodColor="#60488D" floodOpacity=".2" />
            </filter>
          </defs>
          <ellipse cx="117" cy="245" rx="72" ry="9" fill="#7156A6" fillOpacity=".14" />
          <g filter="url(#character-shadow)">
            <path d="M51 243c2-35 18-58 48-69l17-6 16 4c35 7 53 32 57 71H51Z" fill="url(#character-sweater)" />
            <path d="M98 165h39v31c-5 11-12 17-20 17s-15-6-19-17v-31Z" fill="url(#character-skin)" />
            <path d="M84 79c0-34 17-54 42-54 28 0 47 20 47 56v41c0 34-21 55-47 55s-42-22-42-54V79Z" fill="url(#character-skin)" />
            <path d="M81 105c-9-8-10-22-4-31 4-7 9-9 15-8 1-24 15-43 39-43 26 0 47 19 48 47 8 2 12 8 12 16 0 9-5 17-13 21-2-10-5-18-11-23-10 9-26 13-42 11-12-1-22-6-30-13-4 9-8 17-14 26Z" fill="url(#character-hair)" />
            <path d="M93 79c4-21 18-33 37-34 14 0 26 6 34 18-4-24-20-39-41-39-22 0-37 17-39 39l9 16Z" fill="#8A6553" fillOpacity=".56" />
            <path d="M97 105c3-5 8-8 14-8 5 0 9 2 12 6" stroke="#593D36" strokeWidth="4" strokeLinecap="round" />
            <path d="M139 103c3-4 7-6 12-6 5 0 9 2 12 6" stroke="#593D36" strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="111" cy="118" rx="5" ry="7" fill="#2D2931" />
            <ellipse cx="151" cy="118" rx="5" ry="7" fill="#2D2931" />
            <circle cx="113" cy="116" r="1.6" fill="white" />
            <circle cx="153" cy="116" r="1.6" fill="white" />
            <ellipse cx="98" cy="133" rx="9" ry="5" fill="#E9898D" fillOpacity=".36" />
            <ellipse cx="165" cy="133" rx="9" ry="5" fill="#E9898D" fillOpacity=".36" />
            <path d="M123 141c5 6 13 6 18 0" stroke="#A34E55" strokeWidth="3" strokeLinecap="round" />
            <path d="M104 31c5-12 17-18 29-15 8 2 13 8 13 15-9 8-22 10-35 6" fill="#553C35" />
            <path d="M63 217c3-17 9-29 21-37l20 31-6 33H54l9-27Z" fill="#B996E6" />
            <path d="M169 196c10 4 19 12 25 23l-8 24h-39l7-35 15-12Z" fill="#805FB9" />
            <path d="m156 179 34-4 22 43-34 10-22-49Z" fill="url(#character-book)" />
            <path d="m163 184 23-3 14 30-24 5-13-32Z" fill="#FBF8FF" />
            <path d="m169 193 15-2m-12 8 17-3" stroke="#C1A6DB" strokeWidth="2" strokeLinecap="round" />
            <path d="M72 185c-6 3-9 9-7 15 2 5 7 8 12 7l16-8-11-19-10 5Z" fill="url(#character-skin)" />
            <path d="M179 191c4-5 10-6 14-2l10 9c4 4 3 10-1 13-4 3-9 3-13 0l-10-8" fill="url(#character-skin)" />
          </g>
        </svg>
        <div className="dashboard-hero-icon-tile"><Icon size={28} strokeWidth={1.8} /></div>
        <div className="dashboard-hero-object dashboard-hero-object--notebook">
          <img src={notebook3d} alt="" />
        </div>
        <div className="dashboard-hero-object dashboard-hero-object--pencil">
          <img src={pencil3d} alt="" />
        </div>
        <div className="dashboard-hero-object dashboard-hero-object--bulb">
          <img src={bulb3d} alt="" />
        </div>
        <span className="dashboard-hero-spark dashboard-hero-spark--one">✦</span>
        <span className="dashboard-hero-spark dashboard-hero-spark--two">✧</span>
      </div>
    </section>
  )
}
