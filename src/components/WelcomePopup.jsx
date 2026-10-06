import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import rolandLogo from '../assets/roland-logo.png'

const STORAGE_KEY = 'campusplus_welcome_seen'

export default function WelcomePopup() {
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const checkedUserKey = useRef('')

  useEffect(() => {
    if (!user || user.role !== 'student') {
      setVisible(false)
      return
    }

    const userKey = `${STORAGE_KEY}:${user.id || user.email}`
    if (checkedUserKey.current === userKey) return
    checkedUserKey.current = userKey

    let welcomeSeen = false
    try {
      welcomeSeen = localStorage.getItem(userKey) === '1'
    } catch {
      try {
        welcomeSeen = sessionStorage.getItem(userKey) === '1'
      } catch {
        welcomeSeen = false
      }
    }

    if (welcomeSeen) {
      setVisible(false)
      return
    }

    try {
      localStorage.setItem(userKey, '1')
    } catch {
      try {
        sessionStorage.setItem(userKey, '1')
      } catch {
        // checkedUserKey still prevents repeats while this layout remains mounted.
      }
    }
    setVisible(true)
  }, [user])

  const handleContinue = () => {
    setClosing(true)
    setTimeout(() => {
      setVisible(false)
      setClosing(false)
      window.dispatchEvent(new Event('campusplus-welcome-dismissed'))
    }, 380)
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,10,40,0.72)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(160deg,#ffffff 0%,#f5f0ff 60%,#ede8ff 100%)',
          border: '1px solid rgba(139,92,246,0.18)',
          animation: closing ? 'welcomeOut 380ms cubic-bezier(0.4,0,1,1) both' : 'welcomeIn 420ms cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* top accent bar */}
        <div style={{ height: 5, background: 'linear-gradient(90deg,#6500f5,#a855f7,#ec4899)' }} />

        <div className="flex flex-col items-center px-8 pt-8 pb-7 text-center gap-4">

          {/* college logo */}
          <div
            className="flex items-center justify-center rounded-full shadow-lg"
            style={{
              width: 90, height: 110,
              background: '#fff',
              border: '3px solid rgba(139,92,246,0.2)',
              boxShadow: '0 8px 32px rgba(101,0,245,0.18)',
              overflow: 'hidden',
              padding: 4,
            }}
          >
            <img
              src={rolandLogo}
              alt="Roland Institute of Technology logo"
              width="100"
              height="100"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              style={{ width: 'auto', height: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* college name */}
          <div>
            <p
              className="text-xs font-bold tracking-widest uppercase mb-1"
              style={{ color: '#8b5cf6' }}
            >
              Welcome to
            </p>
            <h1
              className="font-extrabold leading-tight"
              style={{ fontSize: '1.15rem', color: '#1e1040', letterSpacing: '-0.01em' }}
            >
              Roland Institute of Technology
            </h1>
            <p className="text-xs mt-1" style={{ color: '#7c6fa0' }}>
              Berhampur, (GM) Odisha
            </p>
          </div>

          {/* divider */}
          <div style={{ width: '100%', height: 1, background: 'rgba(139,92,246,0.12)' }} />

          {/* greeting */}
          <div>
            <p className="font-semibold" style={{ color: '#2d1b69', fontSize: '0.95rem' }}>
              Hello, {user?.name?.split(' ')[0]} 👋
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: '#6b5f8a' }}>
              Your campus portal is ready. Stay on top of attendance, notices, results and more.
            </p>
          </div>

          {/* continue button */}
          <button
            onClick={handleContinue}
            className="w-full font-bold text-white rounded-2xl"
            style={{
              minHeight: 48,
              background: 'linear-gradient(135deg,#6500f5,#7d20ff 55%,#c238ff)',
              border: 0,
              fontSize: '0.95rem',
              boxShadow: '0 10px 24px rgba(101,0,245,0.28)',
              cursor: 'pointer',
              transition: 'filter 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.08)'}
            onMouseLeave={e => e.currentTarget.style.filter = ''}
          >
            Continue to Dashboard →
          </button>

        </div>

        <style>{`
          @keyframes welcomeIn {
            from { opacity: 0; transform: scale(0.88) translateY(24px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes welcomeOut {
            from { opacity: 1; transform: scale(1) translateY(0); }
            to   { opacity: 0; transform: scale(0.92) translateY(16px); }
          }
        `}</style>
      </div>
    </div>
  )
}
