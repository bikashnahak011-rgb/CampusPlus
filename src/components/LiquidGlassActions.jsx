import { ArrowUpRight, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function LiquidGlassActions({ actions, columns = 'four', subtitle = 'A few useful campus shortcuts' }) {
  const navigate = useNavigate()
  const gridLayout = columns === 'three' ? 'liquid-actions-grid--three' : 'liquid-actions-grid--four'

  return (
    <section
      aria-label="Quick Actions"
      className="relative isolate overflow-hidden rounded-2xl border border-violet-200/80 p-4 text-gray-900 shadow-[0_18px_44px_rgba(91,55,150,0.12)] sm:p-5"
      style={{ backgroundImage: 'radial-gradient(ellipse at 12% 0%, rgba(196,181,253,0.32), transparent 42%), radial-gradient(ellipse at 100% 100%, rgba(249,168,212,0.18), transparent 38%), linear-gradient(135deg, #ffffff, #f5f0ff 78%)' }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/70" />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-200 bg-white/80 text-violet-700 shadow-[0_4px_14px_rgba(139,92,246,0.12)] backdrop-blur-xl">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Quick Actions</h2>
            <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
        <span className="rounded-full border border-violet-200 bg-white/75 px-2.5 py-1 text-[10px] font-medium text-violet-700 backdrop-blur-lg">
          {actions.length} shortcuts
        </span>
      </div>

      <div className={`relative mt-4 liquid-actions-grid ${gridLayout}`}>
        {actions.map(({ icon: Icon, label, description, to }, index) => (
          <button
            key={label}
            type="button"
            onClick={() => navigate(to)}
            className={`group relative flex min-h-[82px] items-center gap-3 overflow-hidden rounded-xl border p-3 text-left backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${index === 0
              ? 'border-violet-300 bg-violet-50/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_18px_rgba(139,92,246,0.10)] hover:border-violet-400 hover:bg-violet-100/90'
              : 'border-violet-100 bg-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] hover:border-pink-200 hover:bg-pink-50/70'}`}
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border backdrop-blur-lg ${index === 0 ? 'border-violet-200 bg-white/80 text-violet-700 shadow-[0_4px_14px_rgba(139,92,246,0.12)]' : 'border-violet-100 bg-violet-50 text-violet-600 group-hover:border-pink-200 group-hover:bg-pink-50 group-hover:text-pink-600'}`}>
              <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-gray-900 sm:text-sm">{label}</span>
              {description && <span className="mt-1 block truncate text-[10px] text-gray-500 sm:text-xs">{description}</span>}
            </span>
            <ArrowUpRight size={15} className="shrink-0 text-violet-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-pink-500" />
          </button>
        ))}
      </div>
    </section>
  )
}