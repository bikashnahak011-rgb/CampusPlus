import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpenCheck,
  CalendarDays,
  Check,
  ClipboardCheck,
  GraduationCap,
  Sparkles,
} from 'lucide-react'

const slides = [
  {
    eyebrow: 'YOUR CAMPUS, CONNECTED',
    title: 'Campus life,\nin one place.',
    description: 'Keep your classes, attendance, and campus services close at hand.',
    accent: 'violet',
  },
  {
    eyebrow: 'A LITTLE MORE IN CONTROL',
    title: 'Know what is next.',
    description: 'Get timely updates and follow every request from sent to solved.',
    accent: 'violet',
  },
]

function CampusArtwork({ step }) {
  const isUpdatesSlide = step === 1

  return (
    <div className={`mobile-intro-art mobile-intro-art-${step}`} aria-hidden="true">
      <div className="mobile-intro-art-orbit" />
      <div className="mobile-intro-float mobile-intro-float-top">
        {isUpdatesSlide ? <Bell size={21} /> : <CalendarDays size={21} />}
      </div>
      <div className="mobile-intro-float mobile-intro-float-bottom">
        {isUpdatesSlide ? <ClipboardCheck size={21} /> : <BookOpenCheck size={21} />}
      </div>

      <div className="mobile-intro-preview">
        <div className="mobile-intro-preview-top">
          <div className="mobile-intro-preview-brand"><GraduationCap size={16} /></div>
          <div>
            <span>{isUpdatesSlide ? 'CAMPUS UPDATES' : 'YOUR OVERVIEW'}</span>
            <strong>{isUpdatesSlide ? 'All caught up' : 'Good morning'}</strong>
          </div>
          <Sparkles className="mobile-intro-preview-sparkle" size={17} />
        </div>

        {isUpdatesSlide ? (
          <>
            <div className="mobile-intro-update-row">
              <span className="mobile-intro-row-icon purple"><Bell size={16} /></span>
              <span><strong>New campus notice</strong><small>Library hours updated</small></span>
              <span className="mobile-intro-unread" />
            </div>
            <div className="mobile-intro-update-row">
              <span className="mobile-intro-row-icon green"><Check size={16} /></span>
              <span><strong>Request resolved</strong><small>Hostel maintenance</small></span>
            </div>
          </>
        ) : (
          <>
            <div className="mobile-intro-attendance">
              <div><small>ATTENDANCE</small><strong>92%</strong></div>
              <div className="mobile-intro-progress"><span /></div>
            </div>
            <div className="mobile-intro-class-row">
              <span className="mobile-intro-row-icon blue"><CalendarDays size={16} /></span>
              <span><strong>Next class</strong><small>Data Structures · 10:30</small></span>
              <ArrowRight size={15} />
            </div>
          </>
        )}
      </div>

      <div className="mobile-intro-art-caption">
        <span className="mobile-intro-caption-dot" />
        {isUpdatesSlide ? 'Updates that find you' : 'Everything in sync'}
      </div>
    </div>
  )
}

export default function MobileOnboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const slide = slides[step]

  const continueToLogin = () => onComplete()

  return (
    <main className={`mobile-intro-screen mobile-intro-${slide.accent}`}>
      <header className="mobile-intro-header">
        <div className="mobile-intro-wordmark">
          <span className="mobile-intro-logo"><GraduationCap size={20} /></span>
          <span>NexCampus</span>
        </div>
        <button type="button" className="mobile-intro-skip" onClick={continueToLogin}>Skip</button>
      </header>

      <section className="mobile-intro-content" aria-live="polite">
        <CampusArtwork step={step} />
        <div className="mobile-intro-copy">
          <p className="mobile-intro-eyebrow">{slide.eyebrow}</p>
          <h1>{slide.title.split('\n').map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</h1>
          <p className="mobile-intro-description">{slide.description}</p>
        </div>
      </section>

      <footer className="mobile-intro-footer">
        <div className="mobile-intro-footer-top">
          {step > 0 ? (
            <button type="button" className="mobile-intro-back" onClick={() => setStep(0)} aria-label="Previous introduction screen">
              <ArrowLeft size={18} />
            </button>
          ) : <span className="mobile-intro-back-spacer" />}
          <div className="mobile-intro-dots" aria-label={`Screen ${step + 1} of 2`}>
            {slides.map((item, index) => (
              <span key={item.eyebrow} className={index === step ? 'active' : ''} />
            ))}
          </div>
          <span className="mobile-intro-step-count">0{step + 1} / 02</span>
        </div>
        <button type="button" className="mobile-intro-next" onClick={step === slides.length - 1 ? continueToLogin : () => setStep(step + 1)}>
          <span>{step === slides.length - 1 ? 'Get started' : 'Next'}</span>
          <ArrowRight size={18} />
        </button>
      </footer>
    </main>
  )
}