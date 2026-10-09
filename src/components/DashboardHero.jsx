import { Building2, GraduationCap, UtensilsCrossed, Wallet } from 'lucide-react'
import notebook3d from '../assets/3d-academic/notebook.png'
import pencil3d from '../assets/3d-academic/pencil.png'
import bulb3d from '../assets/3d-academic/bulb.png'
import studentArtwork from '../assets/college-student-hero.png'
import adminArtwork from '../assets/admin-character.png'

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
        <img
          className={audience === 'student' ? 'dashboard-student-image' : 'dashboard-admin-image'}
          src={audience === 'student' ? studentArtwork : adminArtwork}
          alt=""
        />
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
