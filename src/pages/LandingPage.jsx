import { useNavigate } from 'react-router-dom'
import { GraduationCap, ArrowRight, CheckCircle, MessageSquareWarning, ClipboardList, Building2, UtensilsCrossed, FileText, Bell, Zap, Brain, Shield, Users, BarChart3, ChevronRight, MessageCircle, Megaphone, BookOpen, Phone, Wifi, Smartphone, Info } from 'lucide-react'
import AppLogo from '../components/AppLogo'

export default function LandingPage() {
  const navigate = useNavigate()
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <AppLogo size={32} showText />
          <div className="hidden md:flex items-center gap-15 text-sm text-gray-600">
            <button onClick={() => scrollTo('features')} className="hover:text-blue-600">Features</button>
            <button onClick={() => scrollTo('how-it-works')} className="hover:text-blue-600">How It Works</button>
            <button onClick={() => scrollTo('admin')} className="hover:text-blue-600">For Admins</button>
            <button onClick={() => navigate('/about')} className="hover:text-blue-600 flex items-center gap-1"><Info size={14} /> About</button>
          </div>
          <button onClick={() => navigate('/login')} className="btn-primary text-sm">Get Started <ArrowRight size={16} /></button>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Zap size={14} className="text-yellow-400" /> One Campus. One Platform. Zero Confusion.
          </div>
          <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
            CAMPUS LIFE,<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">DEBUGGED.</span>
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto mb-10">
            Attendance, hostel, mess, complaints, documents and campus communication — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/login')} className="bg-white text-blue-900 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-lg">
              Get Started <ArrowRight size={20} />
            </button>
            <button onClick={() => scrollTo('features')} className="border border-white/30 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-colors text-lg">
              Explore Platform
            </button>
          </div>
          <p className="mt-6 text-blue-300 text-sm">
            Sign in with your institutional email or Google account.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">The Problem</h2>
            <p className="text-gray-500 text-lg">Campus management is scattered across too many places</p>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-8 justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg">
              {[
                { icon: MessageCircle, label: 'WhatsApp Groups', color: 'bg-green-100 text-green-600' },
                { icon: Megaphone, label: 'Notice Boards', color: 'bg-yellow-100 text-yellow-600' },
                { icon: FileText, label: 'Paper Forms', color: 'bg-orange-100 text-orange-600' },
                { icon: BookOpen, label: 'Registers', color: 'bg-red-100 text-red-600' },
                { icon: Phone, label: 'Phone Calls', color: 'bg-purple-100 text-purple-600' },
                { icon: Users, label: 'Office Visits', color: 'bg-pink-100 text-pink-600' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className={`${color} rounded-2xl p-4 flex flex-col items-center gap-2 text-center`}>
                  <Icon size={28} /><span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
            <div className="text-4xl font-black text-gray-300 hidden lg:block">→</div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 text-white text-center shadow-2xl max-w-xs w-full">
          <GraduationCap size={48} className="mx-auto mb-4 text-blue-200" />
              <h3 className="text-2xl font-black mb-2">ONE CAMPUS PLATFORM</h3>
              <p className="text-blue-200 text-sm">Everything in one place, accessible from anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Student Features</h2>
            <p className="text-gray-500 text-lg">Everything a student needs, in one dashboard</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MessageSquareWarning, title: 'Smart Complaints', desc: 'AI-powered complaint routing to the right department instantly.' },
              { icon: ClipboardList, title: 'Attendance Tracking', desc: 'Real-time subject-wise attendance with low-attendance alerts.' },
              { icon: Building2, title: 'Hostel Management', desc: 'Room info, roommates, warden contact, and service requests.' },
              { icon: UtensilsCrossed, title: 'Mess Menu & Feedback', desc: 'Weekly menu, meal ratings, and feedback to improve quality.' },
              { icon: FileText, title: 'Document Requests', desc: 'Request certificates and track status without office visits.' },
              { icon: Bell, title: 'Smart Notifications', desc: 'Real-time updates on all your requests and complaints.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card hover:shadow-md transition-shadow group cursor-default">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                  <Icon size={22} className="text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4"><Brain size={16} /> AI Smart Routing</div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Complaints Routed Automatically</h2>
              <p className="text-gray-500 text-lg mb-6">Students describe their problem in plain language. Our AI identifies the category, priority, and routes it to the right department — instantly.</p>
              {['Auto-categorizes complaint type', 'Detects priority level (High/Medium/Low)', 'Routes to correct department', 'Suggests action for maintenance staff'].map(item => (
                <div key={item} className="flex items-center gap-3 mb-3"><CheckCircle size={18} className="text-green-500 flex-shrink-0" /><span className="text-gray-700">{item}</span></div>
              ))}
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <p className="text-xs text-gray-400 mb-1">Student says:</p>
                <p className="text-gray-700 text-sm italic">"The water pipe is leaking near room 203 and the floor is becoming slippery."</p>
              </div>
              <div className="flex items-center justify-center my-3 text-blue-600 text-sm font-medium gap-2"><Brain size={16} /> AI Analysis</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Category', value: 'Water / Plumbing', color: 'bg-blue-50 text-blue-700' },
                  { label: 'Priority', value: '🔴 High', color: 'bg-red-50 text-red-700' },
                  { label: 'Department', value: 'Hostel Maintenance', color: 'bg-orange-50 text-orange-700' },
                  { label: 'Action', value: 'Send plumbing team', color: 'bg-green-50 text-green-700' },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`${color} rounded-xl p-3`}>
                    <p className="text-xs opacity-70 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="admin" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Administrator Features</h2>
            <p className="text-gray-500 text-lg">Powerful tools for campus administrators</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Comprehensive data on complaints, attendance, and requests.' },
              { icon: Brain, title: 'AI Insights', desc: 'Detect recurring issues and get actionable recommendations.' },
              { icon: Users, title: 'Student Management', desc: 'Manage all student records, hostel assignments, and fees.' },
              { icon: Megaphone, title: 'Smart Notices', desc: 'Target notices to specific departments, years, or hostels.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card hover:shadow-md transition-shadow text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Icon size={22} className="text-indigo-600" /></div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-yellow-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4"><Zap size={16} /> Low-Bandwidth Support</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Works Even on Slow Networks</h2>
              <p className="text-gray-500 text-lg mb-6">CampusPlus includes a Lite Mode that reduces animations, compresses assets, and loads critical data first — perfect for students on limited data plans.</p>
              <div className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-yellow-200 shadow-sm">
                <Zap size={24} className="text-yellow-500" />
                <div><p className="font-semibold text-gray-900">⚡ Lite Mode</p><p className="text-sm text-gray-500">Toggle in Settings for a faster, lighter experience</p></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Smartphone, title: 'Mobile First', desc: 'Optimized for all screen sizes' },
                { icon: Wifi, title: 'Offline Ready', desc: 'Caches important data locally' },
                { icon: Zap, title: 'Fast Loading', desc: 'Minimal network requests' },
                { icon: Shield, title: 'Secure', desc: 'End-to-end data protection' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl p-4 border border-yellow-100 shadow-sm">
                  <Icon size={20} className="text-yellow-600 mb-2" />
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-gray-500 text-xs">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-500 text-lg">From complaint to resolution in minutes</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Student Reports Issue', desc: 'Student describes the problem in plain language.' },
              { num: '02', title: 'AI Analyzes & Routes', desc: 'AI categorizes, prioritizes, and routes to the right department.' },
              { num: '03', title: 'Admin Takes Action', desc: 'Admin assigns staff and updates status in real-time.' },
              { num: '04', title: 'Student Gets Notified', desc: 'Student receives instant notification when resolved.' },
            ].map(({ num, title, desc }, i) => (
              <div key={num} className="relative">
                <div className="card text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-lg font-black">{num}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm">{desc}</p>
                </div>
                {i < 3 && <ChevronRight size={24} className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 text-gray-300 z-10" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-4">CAMPUSPLUS —<br /><span className="text-blue-300">ONE CONNECTED CAMPUS PLATFORM.</span></h2>
          <p className="text-blue-200 text-lg mb-8">Replace four apps, six notice boards, two WhatsApp groups and one register with a single, powerful platform.</p>
          <button onClick={() => navigate('/login')} className="bg-white text-blue-900 font-bold px-10 py-4 rounded-2xl hover:bg-blue-50 transition-colors text-lg flex items-center gap-2 mx-auto">
            Start Now <ArrowRight size={20} />
          </button>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AppLogo size={20} />
            <span className="text-white font-bold">CampusPlus</span>
            <span className="text-gray-500 text-sm">— One Campus. One Platform. Zero Confusion.</span>
          </div>
          <div className="flex items-center gap-20 text-sm">
            <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About</button>
            <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Sign In</button>
            <span>• Developed By CodeCampus for Students</span> 
          </div>
        </div>
      </footer>
    </div>
  )
}
