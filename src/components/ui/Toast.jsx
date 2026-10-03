import { useState, createContext, useContext, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, Megaphone, Award, MessageSquareText, FileCheck2, Bell, X } from 'lucide-react'

const ToastCtx = createContext(null)

const CONFIG = {
  success:     { icon: CheckCircle,      bg: 'bg-green-500',  bar: 'bg-green-300' },
  error:       { icon: XCircle,          bg: 'bg-red-500',    bar: 'bg-red-300' },
  warning:     { icon: AlertCircle,      bg: 'bg-yellow-500', bar: 'bg-yellow-300' },
  info:        { icon: Info,             bg: 'bg-blue-500',   bar: 'bg-blue-300' },
  notice:      { icon: Megaphone,        bg: 'bg-orange-500', bar: 'bg-orange-300' },
  exam_result: { icon: Award,            bg: 'bg-purple-600', bar: 'bg-purple-300' },
  message:     { icon: MessageSquareText,bg: 'bg-indigo-500', bar: 'bg-indigo-300' },
  certificate: { icon: FileCheck2,       bg: 'bg-emerald-500',bar: 'bg-emerald-300' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), [])

  const toast = useCallback((title, message, type = 'info', duration = 5000) => {
    const id = Date.now()
    setToasts(p => [{ id, title, message, type }, ...p].slice(0, 5))
    setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-80 pointer-events-none">
        {toasts.map(t => {
          const cfg = CONFIG[t.type] || CONFIG.info
          const Icon = cfg.icon
          return (
            <div key={t.id}
              className="pointer-events-auto flex items-start gap-3 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
              style={{ animation: 'notif-in 0.35s cubic-bezier(.21,1.02,.73,1) both' }}
            >
              <div className={`${cfg.bg} flex items-center justify-center p-3 self-stretch`}>
                <Icon size={20} className="text-white" />
              </div>
              <div className="flex-1 py-3 pr-2 min-w-0">
                {t.title && <p className="text-sm font-semibold text-gray-900 leading-tight">{t.title}</p>}
                {t.message && <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{t.message}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="p-2 mt-1 text-gray-400 hover:text-gray-600 flex-shrink-0">
                <X size={14} />
              </button>
              <div
                className={`absolute bottom-0 left-0 h-0.5 ${cfg.bar}`}
                style={{ animation: `notif-bar 5s linear both`, width: '100%' }}
              />
            </div>
          )
        })}
      </div>
      <style>{`
        @keyframes notif-in {
          from { opacity: 0; transform: translateX(110%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes notif-bar {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
