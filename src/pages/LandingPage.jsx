import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  ArrowRight,
  CheckCircle,
  MessageSquareWarning,
  ClipboardList,
  Building2,
  UtensilsCrossed,
  FileText,
  Bell,
  Zap,
  Brain,
  Shield,
  Users,
  BarChart3,
  ChevronRight,
  MessageCircle,
  Megaphone,
  BookOpen,
  Phone,
  Wifi,
  Smartphone,
  Info,
  Sparkles,
  Menu,
  X,
} from 'lucide-react'
import AppLogo from '../components/AppLogo'
import Ambient3DBackground from '../components/Ambient3DBackground'

const studentFeatures = [
  { icon: MessageSquareWarning, title: 'Smart Complaints', desc: 'AI-assisted issue reporting that routes the right concern to the correct office instantly.' },
  { icon: ClipboardList, title: 'Attendance Tracking', desc: 'See real-time subject performance and spot low attendance before it becomes a problem.' },
  { icon: Building2, title: 'Hostel Management', desc: 'Track room details, service requests, and hostel updates from one place.' },
  { icon: UtensilsCrossed, title: 'Mess & Feedback', desc: 'Check menus, leave feedback, and keep dining quality transparent for everyone.' },
  { icon: FileText, title: 'Documents', desc: 'Apply for certificates and monitor request progress without long office queues.' },
  { icon: Bell, title: 'Live Notifications', desc: 'Receive updates on approvals, notices, issues, and important campus events in real time.' },
]

const adminFeatures = [
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Understand usage trends, patterns, and campus operations with instant summaries.' },
  { icon: Brain, title: 'AI Insights', desc: 'Spot recurring issues and prioritize high-impact actions using smart suggestions.' },
  { icon: Users, title: 'Student Management', desc: 'Access records, monitor compliance, and coordinate support without scattered tools.' },
  { icon: Megaphone, title: 'Smart Notices', desc: 'Create directed updates for exact student groups, years, departments, or hostels.' },
]

const workflowSteps = [
  { num: '01', title: 'Student reports issue', desc: 'Students share their concern in simple language, without forms or confusion.' },
  { num: '02', title: 'AI directs it smartly', desc: 'The system identifies the category, urgency, and correct department automatically.' },
  { num: '03', title: 'Admin resolves quickly', desc: 'Staff can assign tasks, monitor status, and update the student with clarity.' },
  { num: '04', title: 'Outcome is tracked', desc: 'Students stay informed until every notice, complaint, or request is fully resolved.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="public-page page-shell min-h-screen flex flex-col text-slate-900">
      <Ambient3DBackground variant="public" />
      <div className="hero-orb one" />
      <div className="hero-orb two" />
      <div className="hero-orb three" />

      <nav className="landing-nav sticky top-0 z-50 border-b border-violet-100 bg-white/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <button onClick={() => navigate('/landing')} className="flex items-center gap-3 text-violet-900">
            <AppLogo size={29} showText />
          </button>

          <div className="hidden md:flex items-center gap-7 text-sm text-violet-800">
            <button onClick={() => scrollTo('features')} className="transition-colors duration-200">Features</button>
            <button onClick={() => scrollTo('how-it-works')} className="transition-colors duration-200">How it works</button>
            <button onClick={() => scrollTo('admin')} className="transition-colors duration-200">For admins</button>
            <button onClick={() => navigate('/about')} className="inline-flex items-center gap-1.5 transition-colors duration-200">
              <Info size={14} /> About
            </button>
          </div>

          <div className="landing-nav-actions">
            <button onClick={() => navigate('/login')} className="primary-button text-sm px-4 py-2">
              <span>Get Started</span>
              <ArrowRight size={16} />
            </button>
            <button onClick={() => setMenuOpen(value => !value)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} className="md:hidden rounded-xl p-2 text-violet-900 hover:bg-violet-50">
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-violet-100 bg-white/95 px-4 py-3 shadow-lg">
            {[['features', 'Features'], ['how-it-works', 'How it works'], ['admin', 'For admins']].map(([id, label]) => (
              <button key={id} onClick={() => { scrollTo(id); closeMenu() }} className="block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-violet-900 hover:bg-violet-50">{label}</button>
            ))}
            <button onClick={() => navigate('/about')} className="block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-violet-900 hover:bg-violet-50">About NexCampus</button>
          </div>
        )}
      </nav>

      <main className="flex-1">
        <section className="landing-hero relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 text-violet-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(196,181,253,0.35),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(244,114,182,0.16),_transparent_30%)]" />
          <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-24 lg:py-28">
            <div className="grid items-center gap-16 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="landing-hero-copy animate-fade-in">
                <div className="section-tag bg-white/70 border-violet-200 text-violet-700">
                  <Sparkles size={15} />
                  One campus. One platform. Zero confusion.
                </div>

                <h1 className="mt-7 text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-[-0.06em] text-violet-950">
                  Campus life,
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-500">
                    simplified.
                  </span>
                </h1>

                <p className="max-w-xl mt-6 text-lg text-violet-800 sm:text-xl">
                  Attendance, hostel, mess, complaints, documents, notices, and support — all in a single campus experience designed for students and admins.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button onClick={() => navigate('/login')} className="primary-button shadow-2xl shadow-violet-500/20">
                    Start now
                    <ArrowRight size={18} />
                  </button>
                  <button onClick={() => scrollTo('features')} className="secondary-button public-secondary-button">
                    Explore platform
                  </button>
                </div>

                <div className="mt-8 flex flex-wrap gap-3 text-sm text-violet-700">
                  {['Google sign-in', 'Real-time updates', 'Lite mode ready'].map((item) => (
                    <span key={item} className="stat-pill bg-white/75 border-violet-100 text-violet-700">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="landing-hero-preview relative animate-float">
                <div className="campus-viewport" aria-label="Illustrated 3D university campus preview">
                  <div className="campus-skyline" />
                  <div className="campus-ground">
                    <div className="campus-path campus-path-main" />
                    <div className="campus-path campus-path-side" />
                    <div className="campus-building campus-building-library">
                      <div className="campus-building-roof" />
                      <div className="campus-building-face"><span /><span /><span /><span /><span /><span /></div>
                      <div className="campus-building-label"><GraduationCap size={12} /> Library</div>
                    </div>
                    <div className="campus-building campus-building-hall">
                      <div className="campus-building-roof" />
                      <div className="campus-building-face"><span /><span /><span /><span /></div>
                      <div className="campus-building-label"><Building2 size={12} /> Student Hall</div>
                    </div>
                    <div className="campus-building campus-building-science">
                      <div className="campus-building-roof" />
                      <div className="campus-building-face"><span /><span /><span /><span /></div>
                    </div>
                    <div className="campus-tree campus-tree-one" />
                    <div className="campus-tree campus-tree-two" />
                    <div className="campus-tree campus-tree-three" />
                    <div className="campus-lamp campus-lamp-one" />
                    <div className="campus-lamp campus-lamp-two" />
                    <div className="campus-pin campus-pin-one"><span>01</span></div>
                    <div className="campus-pin campus-pin-two"><span>02</span></div>
                  </div>
                  <div className="campus-viewport-footer">
                    <div><p>Explore your campus</p><span>One connected university experience</span></div>
                    <div className="campus-status"><i /> Live</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mx-auto max-w-3xl">
              <div className="section-tag">The problem</div>
              <h2 className="section-heading mt-5">Campus processes were scattered and slow.</h2>
              <p className="section-subtitle mx-auto">Students and admins were juggling notices, WhatsApp groups, forms, visits, and forgotten follow-ups across disconnected systems.</p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {[
                { icon: MessageCircle, label: 'WhatsApp', tone: 'bg-emerald-50 text-emerald-600' },
                { icon: Megaphone, label: 'Notice board', tone: 'bg-amber-50 text-amber-600' },
                { icon: FileText, label: 'Paper forms', tone: 'bg-orange-50 text-orange-600' },
                { icon: BookOpen, label: 'Registers', tone: 'bg-rose-50 text-rose-600' },
                { icon: Phone, label: 'Calls', tone: 'bg-violet-50 text-violet-600' },
                { icon: Users, label: 'Office visits', tone: 'bg-sky-50 text-sky-600' },
              ].map(({ icon: Icon, label, tone }) => (
                <div key={label} className={`${tone} rounded-[22px] border border-slate-100 p-5 text-center shadow-sm`}>
                  <Icon size={28} className="mx-auto mb-3" />
                  <p className="text-sm font-semibold">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <div className="glass-panel rounded-[28px] px-6 py-5 text-center max-w-xl">
                <GraduationCap className="mx-auto mb-3 text-blue-600" size={42} />
                <h3 className="text-2xl font-black tracking-[-0.04em]">All of it becomes one connected campus platform.</h3>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-gradient-to-b from-slate-50 to-white py-20 sm:py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mx-auto max-w-3xl">
              <div className="section-tag">Student experience</div>
              <h2 className="section-heading mt-5">Everything students need, in one dashboard.</h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {studentFeatures.map(({ icon: Icon, title, desc }, index) => (
                <article key={title} className={`feature-card animate-fade-in stagger-${(index % 6) + 1}`}>
                  <div className="icon-wrap">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold tracking-[-0.03em] text-slate-900">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <div className="section-tag">AI smart routing</div>
                <h2 className="section-heading mt-5">Complaints are identified, prioritized, and routed automatically.</h2>
                <p className="section-subtitle">Students describe the issue in plain language, while the system decodes the category, urgency, and the correct department without manual back-and-forth.</p>

                <div className="mt-8 space-y-4">
                  {[
                    'Auto-classifies complaint types with contextual understanding',
                    'Detects urgency levels for quicker action',
                    'Routes to the right office or maintenance team',
                    'Generates guidance for fast resolution decisions',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 border border-slate-200 p-3">
                      <CheckCircle className="mt-0.5 text-emerald-500" size={18} />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-[30px] p-6">
                <div className="rounded-[24px] bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Student says</p>
                  <p className="mt-3 text-slate-700 italic text-base">“The leakage near room 203 is making the floor slippery and unsafe for everyone.”</p>
                </div>

                <div className="mt-5 flex items-center justify-center gap-2 text-blue-600 font-semibold text-sm">
                  <Brain size={16} /> AI analysis
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Category', value: 'Plumbing', tone: 'bg-blue-50 text-blue-700' },
                    { label: 'Priority', value: 'High', tone: 'bg-red-50 text-red-700' },
                    { label: 'Department', value: 'Hostel Maintenance', tone: 'bg-orange-50 text-orange-700' },
                    { label: 'Action', value: 'Dispatch team', tone: 'bg-emerald-50 text-emerald-700' },
                  ].map(({ label, value, tone }) => (
                    <div key={label} className={`${tone} rounded-2xl p-4`}>
                      <p className="text-[11px] uppercase tracking-[0.2em] opacity-75">{label}</p>
                      <p className="mt-2 text-sm font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="admin" className="bg-gradient-to-br from-violet-100 via-white to-fuchsia-50 py-20 sm:py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mx-auto max-w-3xl text-violet-950">
              <div className="section-tag bg-white/70 border-violet-200 text-violet-700">Admin tools</div>
              <h2 className="section-heading mt-5 text-violet-950">Powerful control for campus administrators.</h2>
              <p className="section-subtitle mx-auto text-violet-800">Keep operations transparent, visible, and actionable with centralized campus management.</p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {adminFeatures.map(({ icon: Icon, title, desc }, index) => (
                <article key={title} className="feature-card bg-white/80 text-violet-950 animate-fade-in stagger-1">
                  <div className="icon-wrap bg-violet-100 text-violet-700">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold tracking-[-0.03em] text-violet-950">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-violet-800">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <div className="section-tag">Low bandwidth mode</div>
                <h2 className="section-heading mt-5">Built to work smoothly even in slower networks.</h2>
                <p className="section-subtitle">Lite Mode keeps the platform fast and responsive with reduced animations and lighter loading, which makes it ideal for students with limited data or slower mobile connections.</p>

                <div className="mt-8 rounded-[24px] border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <Zap className="text-amber-600 mt-1" size={22} />
                    <div>
                      <p className="text-lg font-bold text-slate-900">Lite mode enabled</p>
                      <p className="text-sm text-slate-600">Optimized for speed without sacrificing the essential campus experience.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Smartphone, title: 'Mobile first', desc: 'Responsive across every device' },
                  { icon: Wifi, title: 'Offline support', desc: 'Caches critical information' },
                  { icon: Zap, title: 'Fast loading', desc: 'Optimized assets and minimal overhead' },
                  { icon: Shield, title: 'Secure access', desc: 'Protected campus data flow' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="feature-card p-5">
                    <Icon className="text-emerald-700" size={22} />
                    <p className="mt-4 text-base font-bold text-slate-900">{title}</p>
                    <p className="mt-2 text-sm text-slate-600">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="workflow-section py-20 sm:py-24">
          <div className="relative z-10 max-w-7xl mx-auto px-4">
            <div className="text-center mx-auto max-w-3xl">
              <div className="section-tag">How it works</div>
              <h2 className="section-heading mt-5">From issue to resolution in a few steps.</h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-4">
              {workflowSteps.map(({ num, title, desc }, index) => (
                <div key={num} className="relative">
                  <div className="feature-card h-full text-center">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-500 text-lg font-black text-white shadow-lg shadow-violet-500/25">
                      {num}
                    </div>
                    <h3 className="text-lg font-bold tracking-[-0.02em] text-slate-900">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{desc}</p>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <ChevronRight className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-600 py-20 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-black tracking-[-0.05em] sm:text-5xl">
              NexCampus brings a cleaner, smarter campus experience to life.
            </h2>
            <p className="mt-5 text-lg text-violet-100">Replace scattered tools with one platform that keeps everything visible, actionable, and beautifully organized.</p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={() => navigate('/login')} className="primary-button bg-white text-violet-900">Start now <ArrowRight size={18} /></button>
              <button onClick={() => navigate('/about')} className="secondary-button">Learn more</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white/80 text-violet-800 py-8 border-t border-violet-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AppLogo size={20} />
            <span className="font-bold text-violet-950">NexCampus</span>
            <span className="text-violet-600 text-sm">One campus. One platform. Zero confusion.</span>
          </div>

          <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-5">
            <button onClick={() => navigate('/about')} className="text-left">About</button>
            <button onClick={() => navigate('/login')} className="text-left">Sign in</button>
            <span className="text-violet-500">Developed for smarter campus life.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
